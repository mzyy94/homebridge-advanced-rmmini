import { Tools } from ".";
import { TVConfig } from "../config";
import Base from "./base";

interface Context {
  state: number;
}

export default class TV extends Base<TVConfig, Context> {
  public constructor(config: TVConfig, log: Function, accessory?: any) {
    const Television = new Tools.Service.Television(config.name, config.name);

    super(
      config,
      log,
      Tools.Accessory.Categories.TELEVISION,
      // @ts-ignore
      Television,
      accessory
    );

    if (!accessory) {
      this.context.state = 0;
    }

    this.setService();
  }

  private setService(): void {
    const service = this.accessory.getService(Tools.Service.Television);

    service.setCharacteristic(Tools.Characteristic.ConfiguredName, this.name);

    service.setCharacteristic(
      Tools.Characteristic.SleepDiscoveryMode,
      // @ts-ignore
      Tools.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE
    );

    service
      .getCharacteristic(Tools.Characteristic.Active)
      .on(
        "get",
        (cb: HAPNodeJS.CharacteristicGetCallback<number>): void =>
          cb(null, this.context.state)
      )
      .on(
        "set",
        // @ts-ignore
        (state, callback): void => {
          this.log(
            `${this.name} set Active: ${this.context.state} => ${state}`
          );
          this.sendData(state === 1 ? "on" : "off");
          this.context.state = state;
          callback();
        }
      );

    service.getCharacteristic(Tools.Characteristic.PowerModeSelection).on(
      "set",
      // @ts-ignore
      (value, callback): void => {
        this.log(`${this.name} set PowerModeSelection:  => ${value}`);
        // TODO: Launch TV Configuration
        callback();
      }
    );
  }
}
