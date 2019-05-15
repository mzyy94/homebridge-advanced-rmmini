import BaseAccessory from "./base";
import Switch from "./switch";

export interface AccessoryConfig {
  name: string;
  type: "switch";
}

export const createAccessory = (
  config: AccessoryConfig,
  log: Function,
  accessory?: Homebridge.PlatformAccessory
): BaseAccessory => {
  switch (config.type) {
    case "switch":
      return new Switch(config, log, accessory);
    default:
      throw new TypeError("Invalid type of accessory");
  }
};

/*
declare let PlatformAccessory: any;
declare let Accessory: HAPNodeJS.Accessory;
declare let Service: HAPNodeJS.Service;
declare let Characteristic: HAPNodeJS.Characteristic;
declare let UUIDGen: HAPNodeJS.uuid;
*/

export class AccessoryTools {
  private static platformAccessory: any;

  private static accessory: HAPNodeJS.Accessory;

  private static service: HAPNodeJS.Service;

  private static characteristic: HAPNodeJS.Characteristic;

  private static uuid: HAPNodeJS.uuid;

  public static get PlatformAccessory(): any {
    return AccessoryTools.platformAccessory;
  }

  public static get Accessory(): HAPNodeJS.Accessory {
    return AccessoryTools.accessory;
  }

  public static get Service(): HAPNodeJS.Service {
    return AccessoryTools.service;
  }

  public static get Characteristic(): HAPNodeJS.Characteristic {
    return AccessoryTools.characteristic;
  }

  public static get UUIDGen(): HAPNodeJS.uuid {
    return AccessoryTools.uuid;
  }

  public static initialize = (
    platformAccessory: any,
    accessory: HAPNodeJS.Accessory,
    service: HAPNodeJS.Service,
    characteristic: HAPNodeJS.Characteristic,
    uuid: HAPNodeJS.uuid
  ): void => {
    AccessoryTools.platformAccessory = platformAccessory;
    AccessoryTools.accessory = accessory;
    AccessoryTools.service = service;
    AccessoryTools.characteristic = characteristic;
    AccessoryTools.uuid = uuid;
  };
}
