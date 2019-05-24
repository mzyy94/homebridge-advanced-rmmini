// @ts-nocheck

import { Tools } from ".";
import { LightConfig } from "../config";
import Base, { Callback } from "./base";

interface Context {
  state: boolean;
  brightness: number;
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
    }

    this.controlledBrightness = this.context.brightness / this.stepping;

    this.setService();
  }

  private setService(): void {
    const service = this.accessory.getService(Tools.Service.Lightbulb);

    service
      .getCharacteristic(Tools.Characteristic.On)
      .on("get", (cb: Callback<boolean>): void => cb(null, this.context.state))
      .on("set", this.onSetPowerState.bind(this));

    if (this.config.code.dimmer && this.config.code.brighter) {
      service
        .getCharacteristic(Tools.Characteristic.Brightness)
        .on(
          "get",
          (cb: Callback<number>): void => cb(null, this.context.brightness)
        )
        .on("set", this.onSetBrightness.bind(this));
    }
  }

  private onSetPowerState(state: boolean, callback: Callback<boolean>): void {
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
        // @ts-ignore
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
    callback: Callback<number>
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
}
