// / <reference path="../../node_modules/hap-nodejs/index.d.ts" />

import { BaseAccessory } from "./index";

export default class Switch extends BaseAccessory {
  public constructor(name: string, log: Function, accessory?: any) {
    super(
      name,
      log,
      BaseAccessory.Accessory.Categories.SWITCH,
      BaseAccessory.Service.Switch,
      accessory
    );

    this.accessory.currentState = false;

    this.setService();
  }

  private setService(): void {
    this.accessory
      .getService(BaseAccessory.Service.Switch)
      .getCharacteristic(BaseAccessory.Characteristic.On)
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
