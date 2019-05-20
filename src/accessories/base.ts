import { Tools } from ".";
import { AccessoryConfig, FrameData } from "../config";
import sendData from "../remote";

export default class Base<T extends AccessoryConfig, C> {
  protected context: C;

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
      const uuid = Tools.UUIDGen.generate(config.name);
      this.accessory = new Tools.PlatformAccessory(config.name, uuid, typeCode);
      this.accessory.addService(service);
      this.accessory.reachable = true;
      this.accessory.context.name = config.name;
      this.accessory.context.config = config;
    }

    this.context = new Proxy(this.accessory.context, {
      set: (target, prop, value): boolean => {
        this.log(
          `${this.name} set value of ${String(prop)}: ${
            target[prop]
          } => ${value}`
        );
        return Reflect.set(target, prop, value);
      },
      get: (target, prop): any => {
        this.log(`${this.name} get value of ${String(prop)}: ${target[prop]}`);
        return Reflect.get(target, prop);
      }
    });
  }

  protected getValueWithCallback(
    fieldName: keyof C,
    callback: Callback<C[keyof C]>
  ): void {
    callback(null, this.context[fieldName]);
  }

  public get currentAccessory(): any {
    return this.accessory;
  }
}

export type Callback<T> = (error?: Error | null | undefined, value?: T) => void;
