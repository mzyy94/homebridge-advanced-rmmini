import Base from "./base";
import {
  AccessoryConfig,
  SwitchConfig,
  LightConfig,
  TVConfig
} from "../config";
import Switch from "./switch";
import Light from "./light";
import TV from "./tv";

export const createAccessory = (
  config: AccessoryConfig,
  log: Function,
  accessory?: Homebridge.PlatformAccessory
): Base<AccessoryConfig, any> => {
  switch (config.type) {
    case "switch":
      return new Switch(config as SwitchConfig, log, accessory);
    case "light":
      return new Light(config as LightConfig, log, accessory);
    case "tv":
      return new TV(config as TVConfig, log, accessory);
    default:
      throw new TypeError("Invalid type of accessory");
  }
};

export class Tools {
  private static platformAccessory: any;

  private static accessory: HAPNodeJS.Accessory;

  private static service: HAPNodeJS.Service;

  private static characteristic: HAPNodeJS.Characteristic;

  private static uuid: HAPNodeJS.uuid;

  public static get PlatformAccessory(): any {
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
    platformAccessory: any,
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
