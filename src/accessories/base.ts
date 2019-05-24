import { Tools } from ".";
import { AccessoryConfig, FrameConfig } from "../config";
import sendData from "../remote";

export default class Base<T extends AccessoryConfig, C> {
  protected context: C;

  protected log: Function;

  protected sendData: Function;

  protected accessory: Homebridge.PlatformAccessory;

  protected get name(): string {
    return this.accessory.context.name;
  }

  protected get config(): T {
    return this.accessory.context.config;
  }

  public constructor(
    config: T,
    log: Function,
    typeCode?: number,
    service?: HAPNodeJS.PredefinedService,
    accessory?: Homebridge.PlatformAccessory
  ) {
    this.log = log;
    this.sendData = (param: string, repeat?: number): void => {
      const code: FrameConfig = config.code[param];
      sendData(code, repeat);
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

    this.accessory.on("identify", this.onIdentify.bind(this));

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

  private onIdentify(paired: number, callback: () => void): void {
    this.log(`${this.name} identify requested: ${paired}`);
    callback();
  }

  public get currentAccessory(): any {
    return this.accessory;
  }
}

export type Callback<T = number | string | boolean> = (
  error?: Error | null | undefined,
  value?: T
) => void;
