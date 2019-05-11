// eslint-disable-next-line spaced-comment, @typescript-eslint/no-triple-slash-reference
/// <reference path="../../node_modules/hap-nodejs/index.d.ts" />

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

  protected accessory: any;

  public constructor(
    name: string,
    typeCode: number,
    service: HAPNodeJS.PredefinedService,
    log: Function
  ) {
    this.log = log;
    const uuid = BaseAccessory.UUIDGen.generate(name);
    const accessory = new BaseAccessory.PlatformAccessory(name, uuid, typeCode);

    accessory.addService(service, name);
    accessory.reachable = true;
    accessory.context.name = name;
    this.accessory = accessory;
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
