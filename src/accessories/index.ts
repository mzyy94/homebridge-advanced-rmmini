import Base from "./base";
import {
  AccessoryConfig,
  SwitchConfig,
  LightConfig,
  TVConfig,
  FanConfig,
  AirConditionerConfig
} from "../config";
import Switch from "./switch";
import Light from "./light";
import TV from "./tv";
import Fan from "./fan";
import AC from "./ac";
import Panasonic from "./ac/panasonic";

export const createAccessory = (
  config: AccessoryConfig,
  log: Function,
  accessory?: Homebridge.PlatformAccessory
): Base<AccessoryConfig, unknown> => {
  switch (config.type) {
    case "switch":
      return new Switch(config as SwitchConfig, log, accessory);
    case "light":
      return new Light(config as LightConfig, log, accessory);
    case "tv":
      return new TV(config as TVConfig, log, accessory);
    case "fan":
      return new Fan(config as FanConfig, log, accessory);
    case "ac": {
      const acConfig = config as AirConditionerConfig;
      if (config.mode === "preset") {
        switch (acConfig.manufacturer) {
          case "Panasonic":
            return new Panasonic(acConfig, log, accessory);
          default:
            break;
        }
      }
      return new AC(acConfig, log, accessory);
    }
    default:
      throw new TypeError("Invalid type of accessory");
  }
};

export class Tools {
  private static platformAccessory: Homebridge.PlatformAccessoryConstructor;

  private static accessory: HAPNodeJS.Accessory;

  private static service: HAPNodeJS.Service;

  private static characteristic: HAPNodeJS.Characteristic;

  private static uuid: HAPNodeJS.uuid;

  public static get PlatformAccessory(): Homebridge.PlatformAccessoryConstructor {
    return Tools.platformAccessory;
  }

  public static get Accessory(): HAPNodeJS.Accessory {
    return Tools.accessory;
  }

  public static get Service(): HAPNodeJS.Service {
    return Tools.service;
  }

  public static get Characteristic(): HAPNodeJS.Characteristic {
    return Tools.characteristic;
  }

  public static get UUIDGen(): HAPNodeJS.uuid {
    return Tools.uuid;
  }

  public static initialize = (
    platformAccessory: Homebridge.PlatformAccessoryConstructor,
    accessory: HAPNodeJS.Accessory,
    service: HAPNodeJS.Service,
    characteristic: HAPNodeJS.Characteristic,
    uuid: HAPNodeJS.uuid
  ): void => {
    Tools.platformAccessory = platformAccessory;
    Tools.accessory = accessory;
    Tools.service = service;
    Tools.characteristic = characteristic;
    Tools.uuid = uuid;
  };
}
