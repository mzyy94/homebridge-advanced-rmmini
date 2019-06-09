import { Tools } from ".";
import { TVConfig } from "../config";
import Base from "./base";

enum RemoteKey {
  REWIND = 0,
  FAST_FORWARD = 1,
  NEXT_TRACK = 2,
  PREVIOUS_TRACK = 3,
  ARROW_UP = 4,
  ARROW_DOWN = 5,
  ARROW_LEFT = 6,
  ARROW_RIGHT = 7,
  SELECT = 8,
  BACK = 9,
  EXIT = 10,
  PLAY_PAUSE = 11,
  INFORMATION = 15
}

enum VolumeSelector {
  INCREMENT = 0,
  DECREMENT = 1
}

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
          if (this.context.state === state) {
            return;
          }
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

    if (this.config.code.controls) {
      service
        .getCharacteristic(Tools.Characteristic.RemoteKey)
        .on("set", this.handleRemoteKeyInput.bind(this));

      service.getCharacteristic(Tools.Characteristic.PictureMode).on(
        "set",
        (value: number, callback): void => {
          this.log(`set PictureMode => ${value}`);
          callback();
        }
      );
    }

    if (this.config.code.volume) {
      const speaker = this.setupSpeaker();
      service.addLinkedService(speaker);
    }
  }

  private handleRemoteKeyInput(
    value: RemoteKey,
    callback: HAPNodeJS.CharacteristicSetCallback
  ): void {
    this.log(`set RemoteKey => ${value}`);
    switch (value) {
      case RemoteKey.REWIND:
        this.sendData(["controls", "rewind"]);
        break;
      case RemoteKey.FAST_FORWARD:
        this.sendData(["controls", "fast_forward"]);
        break;
      case RemoteKey.NEXT_TRACK:
        this.sendData(["controls", "next_track"]);
        break;
      case RemoteKey.PREVIOUS_TRACK:
        this.sendData(["controls", "previous_track"]);
        break;
      case RemoteKey.ARROW_UP:
        this.sendData(["controls", "arrow_up"]);
        break;
      case RemoteKey.ARROW_DOWN:
        this.sendData(["controls", "arrow_down"]);
        break;
      case RemoteKey.ARROW_LEFT:
        this.sendData(["controls", "arrow_left"]);
        break;
      case RemoteKey.ARROW_RIGHT:
        this.sendData(["controls", "arrow_right"]);
        break;
      case RemoteKey.SELECT:
        this.sendData(["controls", "select"]);
        break;
      case RemoteKey.BACK:
        this.sendData(["controls", "back"]);
        break;
      case RemoteKey.EXIT:
        this.sendData(["controls", "exit"]);
        break;
      case RemoteKey.PLAY_PAUSE:
        this.sendData(["controls", "play_pause"]);
        break;
      case RemoteKey.INFORMATION:
        this.sendData(["controls", "information"]);
        break;
      default:
        this.log(`Unknown remote key code: ${value}`);
    }
    callback();
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

  private setupSpeaker(): HAPNodeJS.Service {
    const subType = "speaker";
    let speakerService = this.accessory.services.find(
      (service): boolean => service.subtype === subType
    );

    if (!speakerService) {
      speakerService = new Tools.Service.TelevisionSpeaker(subType, subType);

      speakerService
        .setCharacteristic(
          Tools.Characteristic.Active,
          // @ts-ignore
          Tools.Characteristic.Active.ACTIVE
        )
        .setCharacteristic(
          Tools.Characteristic.VolumeControlType,
          // @ts-ignore
          Tools.Characteristic.VolumeControlType.RELATIVE
        );

      this.accessory.addService(speakerService);
    }

    speakerService.getCharacteristic(Tools.Characteristic.VolumeSelector).on(
      "set",
      (value: VolumeSelector, callback): void => {
        switch (value) {
          case VolumeSelector.INCREMENT:
            this.sendData(["volume", "increment"]);
            break;
          case VolumeSelector.DECREMENT:
            this.sendData(["volume", "decrement"]);
            break;
          default:
            this.log(`Unknown volume control: ${value}`);
        }
        callback();
      }
    );

    return speakerService;
  }
}
