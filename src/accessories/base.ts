import { AccessoryConfig, AccessoryTools } from ".";

export default class BaseAccessory<T extends AccessoryConfig> {
  protected log: Function;

  protected accessory: Homebridge.PlatformAccessory;

  public constructor(
    config: T,
    log: Function,
    typeCode?: number,
    service?: HAPNodeJS.PredefinedService,
    accessory?: Homebridge.PlatformAccessory
  ) {
    this.log = log;
    if (accessory) {
      this.accessory = accessory;
    } else if (!!typeCode && !!service) {
      const uuid = AccessoryTools.UUIDGen.generate(config.name);
      this.accessory = new AccessoryTools.PlatformAccessory(
        config.name,
        uuid,
        typeCode
      );
      this.accessory.addService(service);
      this.accessory.reachable = true;
      this.accessory.context.name = config.name;
      this.accessory.context.config = config;
    }
  }

  public get currentAccessory(): any {
    return this.accessory;
  }
}
