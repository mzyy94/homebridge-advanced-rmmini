import { Tools } from ".";
import { SwitchConfig } from "../config";
import Base from "./base";

interface Context {
  currentState: boolean;
}

export default class Switch extends Base<SwitchConfig, Context> {
  public constructor(config: SwitchConfig, log: Function, accessory?: any) {
    super(
      config,
      log,
      Tools.Accessory.Categories.SWITCH,
      Tools.Service.Switch,
      accessory
    );

    if (!accessory) {
      this.context.currentState = false;
    }

    this.setService();
  }

  private setService(): void {
    this.accessory
      .getService(Tools.Service.Switch)
      .getCharacteristic(Tools.Characteristic.On)
      .on(
        "get",
        (cb: HAPNodeJS.CharacteristicGetCallback<boolean>): void =>
          cb(null, this.context.currentState)
      )
      .on("set", this.onSetState.bind(this));
  }

  private onSetState(
    state: boolean,
    callback: HAPNodeJS.CharacteristicSetCallback
  ): void {
    if (state === true) {
      this.sendData("on");
    } else {
      this.sendData("off");
    }

    this.context.currentState = state;
    callback();
  }
}
