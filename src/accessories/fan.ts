import { Tools } from ".";
import { FanConfig } from "../config";
import Base from "./base";

interface Context {
  state: number;
  active: number;
  direction: number;
  speed: number;
}

export default class Fan extends Base<FanConfig, Context> {
  public constructor(config: FanConfig, log: Function, accessory?: any) {
    super(
      config,
      log,
      Tools.Accessory.Categories.FAN,
      Tools.Service.Fanv2,
      accessory
    );

    if (!accessory) {
      this.context.state = 0;
      this.context.active = 0;
      this.context.direction = 0;
      this.context.speed = 0;
    }

    this.setService();
  }

  private setService(): void {
    const service = this.accessory.getService(Tools.Service.Fanv2);

    service
      .getCharacteristic(Tools.Characteristic.Active)
      .on(
        "get",
        (cb: HAPNodeJS.CharacteristicGetCallback): void => {
          cb(null, this.context.active);
        }
      )
      .on("set", this.onSetPowerState.bind(this));
  }

  private onSetPowerState(
    active: number,
    callback: HAPNodeJS.CharacteristicSetCallback
  ): void {
    if (active === this.context.active) {
      callback();
      return;
    }
    this.log(`${this.name} set active: ${this.context.active} => ${active}`);

    if (active === 1) {
      this.sendData("on");
    } else {
      this.sendData("off");
    }

    this.context.active = active;

    callback();
  }
}
