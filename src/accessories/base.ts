import { AccessoryTools } from ".";
import { AccessoryConfig, FrameData } from "../config";
import sendData from "../remote";

export default class BaseAccessory<T extends AccessoryConfig> {
  protected log: Function;

  protected sendData: Function;

  protected accessory: Homebridge.PlatformAccessory;

  protected get name(): string {
    return this.accessory.context.name;
  }

  public constructor(
    config: T,
    log: Function,
    typeCode?: number,
    service?: HAPNodeJS.PredefinedService,
    accessory?: Homebridge.PlatformAccessory
  ) {
    this.log = log;
    this.sendData = (param: string): void => {
      const code: string | FrameData[] = config.code[param];
      sendData(code);
    };

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
