import { AccessoryConfig, AccessoryTools } from ".";
import BaseAccessory from "./base";

export default class Switch extends BaseAccessory {
  public constructor(config: AccessoryConfig, log: Function, accessory?: any) {
    super(
      config,
      log,
      AccessoryTools.Accessory.Categories.SWITCH,
      AccessoryTools.Service.Switch,
      accessory
    );

    this.accessory.context.currentState = false;

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
    this.log(
      `${this.accessory.context.name} get state: ${
        this.accessory.context.currentState
      }`
    );
    callback(null, this.accessory.context.currentState);
  }

  private onSetState(state, callback): void {
    this.log(
      `${this.accessory.context.name} set state: ${
        this.accessory.context.currentState
      } => ${state}`
    );
    this.accessory.context.currentState = state;
    callback(null, this.accessory.context.currentState);
  }

  private onIdentify(paired, callback): void {
    this.log(`${this.accessory.context.name} identify requested: ${paired}`);
    callback();
  }
}
