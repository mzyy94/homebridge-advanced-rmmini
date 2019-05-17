import { AccessoryTools } from ".";
import { AccessoryConfig } from "../config";
import BaseAccessory from "./base";

export interface SwitchConfig extends AccessoryConfig {
  type: "switch";
  code: {
    on: string;
    off: string;
  };
}

interface Context {
  currentState: boolean;
}

export default class Switch extends BaseAccessory<SwitchConfig>
  implements Context {
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
      AccessoryTools.Accessory.Categories.SWITCH,
      AccessoryTools.Service.Switch,
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
      .getService(AccessoryTools.Service.Switch)
      .getCharacteristic(AccessoryTools.Characteristic.On)
      .on("get", this.onGetState.bind(this))
      .on("set", this.onSetState.bind(this));

    this.accessory.on("identify", this.onIdentify.bind(this));
  }

  private onGetState(callback): void {
    this.log(`${this.name} get state: ${this.currentState}`);
    callback(null, this.currentState);
  }

  private onSetState(state, callback): void {
    this.log(`${this.name} set state: ${this.currentState} => ${state}`);
    if (state === true) {
      this.sendData("on");
    } else {
      this.sendData("off");
    }

    this.currentState = state;
    callback(null, this.currentState);
  }

  private onIdentify(paired, callback): void {
    this.log(`${this.name} identify requested: ${paired}`);
    callback();
  }
}
