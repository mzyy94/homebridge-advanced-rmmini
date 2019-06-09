import { Tools } from ".";
import { TVConfig } from "../config";
import Base from "./base";

interface Context {
  state: number;
}

export default class TV extends Base<TVConfig, Context> {
  private channels: string[];

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

    this.channels = [""];

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
        (state: number, callback): void => {
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
      (value: number, callback): void => {
        this.log(`${this.name} set PowerModeSelection:  => ${value}`);
        // TODO: Launch TV Configuration
        callback();
      }
    );

    if (this.config.code.channels) {
      const { channels } = this.config.code;
      const channelNames = Object.keys(channels);
      const displayOrder = Buffer.alloc(channelNames.length * 6 + 2);
      let id = 0;

      channelNames.forEach(
        (channelName): void => {
          displayOrder.writeUInt8(0x01, id * 6);
          displayOrder.writeUInt8(4, id * 6 + 1);
          displayOrder.writeUInt32LE(id + 1, id * 6 + 2);
          const input = this.setupChannelInput(channelName, (id += 1));
          service.addLinkedService(input);
          this.channels.push(channelName);
        }
      );

      service
        .getCharacteristic(Tools.Characteristic.DisplayOrder)
        .updateValue(displayOrder.toString("base64"));

      service
        .setCharacteristic(Tools.Characteristic.ActiveIdentifier, 0)
        .getCharacteristic(Tools.Characteristic.ActiveIdentifier)
        .on(
          "set",
          (value: number, callback): void => {
            this.sendData(["channels", this.channels[value]]);
            service.updateCharacteristic(Tools.Characteristic.Active, 1);
            callback();
          }
        );
    }
  }

  private setupChannelInput(name, id): HAPNodeJS.Service {
    return this.setupInput(
      name,
      id,
      // @ts-ignore
      Tools.Characteristic.InputDeviceType.TV,
      // @ts-ignore
      Tools.Characteristic.InputSourceType.TUNER
    );
  }

  private setupInput(name, id, deviceType, sourceType): HAPNodeJS.Service {
    let inputService = this.accessory.services.find(
      (service): boolean => service.displayName === name
    );

    if (!inputService) {
      inputService = new Tools.Service.InputSource(name, name);

      inputService
        .setCharacteristic(Tools.Characteristic.Name, name)
        .setCharacteristic(Tools.Characteristic.Identifier, id)
        .setCharacteristic(Tools.Characteristic.ConfiguredName, name)
        .setCharacteristic(
          Tools.Characteristic.IsConfigured,
          // @ts-ignore
          Tools.Characteristic.IsConfigured.CONFIGURED
        )
        .setCharacteristic(
          Tools.Characteristic.CurrentVisibilityState,
          // @ts-ignore
          Tools.Characteristic.CurrentVisibilityState.SHOWN
        )
        .setCharacteristic(
          Tools.Characteristic.TargetVisibilityState,
          // @ts-ignore
          Tools.Characteristic.TargetVisibilityState.SHOWN
        )
        .setCharacteristic(Tools.Characteristic.InputDeviceType, deviceType)
        .setCharacteristic(Tools.Characteristic.InputSourceType, sourceType);

      this.accessory.addService(inputService);
    }

    inputService
      .getCharacteristic(Tools.Characteristic.TargetVisibilityState)
      .on(
        "set",
        (value: number, callback): void => {
          // TODO: Add any actions
          this.log(
            `${this.name} set TargetVisibilityState of ${name}: => ${value}`
          );

          if (inputService) {
            inputService
              .getCharacteristic(Tools.Characteristic.CurrentVisibilityState)
              .updateValue(value);
          }
          callback();
        }
      );

    return inputService;
  }
}
