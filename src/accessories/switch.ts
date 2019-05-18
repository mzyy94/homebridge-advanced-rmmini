import { Tools } from ".";
import { SwitchConfig } from "../config";
import Base, { Callback } from "./base";

interface Context {
  currentState: boolean;
}

export default class Switch extends Base<SwitchConfig> implements Context {
  private context: Context;

  public get currentState(): boolean {
    return this.context.currentState;
  }

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
    this.context = this.accessory.context;

    if (!accessory) {
      this.currentState = false;
    }

    this.setService();
  }

  private setService(): void {
    this.accessory
      .getService(Tools.Service.Switch)
      .getCharacteristic(Tools.Characteristic.On)
      .on("get", this.onGetState.bind(this))
      .on("set", this.onSetState.bind(this));

    this.accessory.on("identify", this.onIdentify.bind(this));
  }

  private onGetState(callback: Callback<boolean>): void {
    this.log(`${this.name} get state: ${this.currentState}`);
    callback(null, this.currentState);
  }

  private onSetState(state: boolean, callback: Callback<boolean>): void {
    this.log(`${this.name} set state: ${this.currentState} => ${state}`);
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
