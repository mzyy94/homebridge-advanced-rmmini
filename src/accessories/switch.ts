import { Tools } from ".";
import { SwitchConfig } from "../config";
import Base, { Callback } from "./base";

interface Context {
  currentState: boolean;
}

export default class Switch extends Base<SwitchConfig, Context>
  implements Context {
  public set currentState(state) {
    this.context.currentState = state;
  }

  public constructor(config: SwitchConfig, log: Function, accessory?: any) {
    super(
      config,
      log,
      Tools.Accessory.Categories.SWITCH,
      Tools.Service.Switch,
      accessory
    );

    if (!accessory) {
      this.currentState = false;
    }

    this.setService();
  }

  private setService(): void {
    this.accessory
      .getService(Tools.Service.Switch)
      .getCharacteristic(Tools.Characteristic.On)
      .on(
        "get",
        (callback: Callback<boolean>): void =>
          this.getValueWithCallback("currentState", callback)
      )
      .on("set", this.onSetState.bind(this));

    this.accessory.on("identify", this.onIdentify.bind(this));
  }

  private onSetState(state: boolean, callback: Callback<boolean>): void {
    if (state === true) {
      this.sendData("on");
    } else {
      this.sendData("off");
    }

    this.currentState = state;
    callback(null, this.currentState);
  }

  private onIdentify(paired: boolean, callback: () => void): void {
    this.log(`${this.name} identify requested: ${paired}`);
    callback();
  }
}
