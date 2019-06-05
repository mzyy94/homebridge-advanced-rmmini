import { Tools } from ".";
import { LightConfig } from "../config";
import Base from "./base";

interface Context {
  state: boolean;
  brightness: number;
  colorTemperature: number;
}

interface TempCodePair {
  code: string;
  diff: number;
}

export default class Light extends Base<LightConfig, Context> {
  private get stepping(): number {
    return 100 / (this.config.step || 10);
  }

  private controlledBrightness: number;

  public constructor(config: LightConfig, log: Function, accessory?: any) {
    super(
      config,
      log,
      Tools.Accessory.Categories.LIGHTBULB,
      Tools.Service.Lightbulb,
      accessory
    );

    if (!accessory) {
      this.context.state = false;
      this.context.brightness = 0;
      this.context.colorTemperature = 0;
    }

    this.controlledBrightness = this.context.brightness / this.stepping;

    this.setService();
  }

  private setService(): void {
    const service = this.accessory.getService(Tools.Service.Lightbulb);

    service
      .getCharacteristic(Tools.Characteristic.On)
      .on(
        "get",
        (cb: HAPNodeJS.CharacteristicGetCallback): void =>
          cb(null, this.context.state)
      )
      .on("set", this.onSetPowerState.bind(this));

    if (this.config.code.dimmer && this.config.code.brighter) {
      service
        .getCharacteristic(Tools.Characteristic.Brightness)
        .on(
          "get",
          (cb: HAPNodeJS.CharacteristicGetCallback): void =>
            cb(null, this.context.brightness)
        )
        .on("set", this.onSetBrightness.bind(this));
    }

    service
      .getCharacteristic(Tools.Characteristic.ColorTemperature)
      .on(
        "get",
        (cb: HAPNodeJS.CharacteristicGetCallback): void =>
          cb(null, this.context.colorTemperature)
      )
      .on("set", this.onSetColorTemperature.bind(this));
  }

  private onSetPowerState(
    state: boolean,
    callback: HAPNodeJS.CharacteristicSetCallback
  ): void {
    if (state === this.context.state) {
      callback();
      return;
    }
    this.log(`${this.name} set state: ${this.context.state} => ${state}`);

    if (state === true) {
      this.sendData("on");
      // Set 100% brightness
      // TODO: Set this part as configurable
      const service = this.accessory.getService(Tools.Service.Lightbulb);

      this.context.brightness = 100;
      this.controlledBrightness = this.context.brightness / this.stepping;

      service.updateCharacteristic(
        Tools.Characteristic.Brightness,
        this.context.brightness
      );
    } else {
      this.sendData("off");
    }

    this.context.state = state;

    callback();
  }

  private async onSetBrightness(
    value: number,
    callback: HAPNodeJS.CharacteristicSetCallback
  ): Promise<void> {
    if (this.context.state === false) {
      this.context.brightness = 0;
      callback();
      return;
    }

    if (this.context.brightness === value) {
      callback();
      return;
    }

    this.log(
      `${this.name} set brightness: ${this.context.brightness} => ${value}`
    );
    this.context.brightness = value;

    const step = this.stepping;
    const targetControlled = Math.ceil(value / step);

    if (this.controlledBrightness !== targetControlled) {
      const diff = targetControlled - this.controlledBrightness;
      if (diff < 0) {
        await this.sendData("dimmer", -diff);
      } else {
        await this.sendData("brighter", diff);
      }
      this.controlledBrightness = targetControlled;
    }

    callback();
  }

  private async onSetColorTemperature(
    value: number,
    callback: HAPNodeJS.CharacteristicSetCallback
  ): Promise<void> {
    if (this.context.colorTemperature === value) {
      callback();
      return;
    }

    if (!this.config.code.temperature) {
      callback();
      return;
    }

    this.log(
      `${this.name} set colorTemperature: ${
        this.context.colorTemperature
      } => ${value}`
    );

    const tempCode = Object.keys(this.config.code.temperature)
      .map(
        (code: string): TempCodePair => ({
          code,
          diff: Math.abs(parseInt(code, 10) - value)
        })
      )
      .sort(
        ({ diff: a }: TempCodePair, { diff: b }: TempCodePair): number => a - b
      )[0];

    await this.sendData(tempCode.code);

    this.context.colorTemperature = value;

    if (!this.context.state) {
      const service = this.accessory.getService(Tools.Service.Lightbulb);

      this.context.state = true;

      service.updateCharacteristic(Tools.Characteristic.On, this.context.state);
    }

    callback();
    return;

    // TODO: Add stepping mode
    // @ts-ignore
    const step = this.stepping; /* eslint-disable-line no-unreachable */

    const targetControlled = Math.ceil(value / step);

    if (this.controlledBrightness !== targetControlled) {
      const diff = targetControlled - this.controlledBrightness;
      if (diff < 0) {
        await this.sendData("dimmer", -diff);
      } else {
        await this.sendData("brighter", diff);
      }
      this.controlledBrightness = targetControlled;
    }

    callback();
  }
}
