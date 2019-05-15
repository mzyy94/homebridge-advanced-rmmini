// eslint-disable-next-line spaced-comment, @typescript-eslint/no-triple-slash-reference
/// <reference path="../../node_modules/hap-nodejs/index.d.ts" />
// eslint-disable-next-line spaced-comment, @typescript-eslint/no-triple-slash-reference
/// <reference path="../homebridge.d.ts" />

export interface AccessoryConfig {
  name: string;
  type: "switch";
}

export class BaseAccessory {
  public static PlatformAccessory: any;

  public static Accessory: HAPNodeJS.Accessory;

  public static Service: HAPNodeJS.Service;

  // @ts-ignore
  public static Characteristic: HAPNodeJS.Characteristic;

  // eslint-disable-line @typescript-eslint/no-unused-vars
  public static UUIDGen: HAPNodeJS.uuid;

  protected log: Function;

  protected accessory: Homebridge.PlatformAccessory;

  public constructor(
    name: string,
    log: Function,
    typeCode?: number,
    service?: HAPNodeJS.PredefinedService,
    accessory?: Homebridge.PlatformAccessory
  ) {
    this.log = log;
    if (accessory) {
      this.accessory = accessory;
    } else if (!!typeCode && !!service) {
      const uuid = BaseAccessory.UUIDGen.generate(name);
      this.accessory = new BaseAccessory.PlatformAccessory(
        name,
        uuid,
        typeCode
      );
      this.accessory.addService(service);
      this.accessory.reachable = true;
      this.accessory.context.name = name;
    }
  }

  public get currentAccessory(): any {
    return this.accessory;
  }
}

export const initializeAccessoryFactory = (
  platformAccessory: any,
  accessory: HAPNodeJS.Accessory,
  service: HAPNodeJS.Service,
  characteristic: HAPNodeJS.Characteristic,
  uuid: HAPNodeJS.uuid
): void => {
  BaseAccessory.PlatformAccessory = platformAccessory;
  BaseAccessory.Accessory = accessory;
  BaseAccessory.Service = service;
  BaseAccessory.Characteristic = characteristic;
  BaseAccessory.UUIDGen = uuid;
};
