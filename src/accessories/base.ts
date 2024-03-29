import { Tools } from ".";
import { AccessoryConfig, Code, FrameConfig, isFrameConfig } from "../config";
import sendData from "../remote";

export default class Base<T extends AccessoryConfig, C> {
  protected context: C;

  protected log: Function;

  protected accessory: Homebridge.PlatformAccessory;

  protected get name(): string {
    return this.accessory.context.name;
  }

  protected get config(): T {
    return this.accessory.context.config;
  }

  protected async sendData(
    param: string | string[] | FrameConfig,
    repeat = 1
  ): Promise<void> {
    let code: Code | undefined;

    if (isFrameConfig(param)) {
      code = param;
    } else {
      code =
        typeof param === "string"
          ? this.config.code[param]
          : param.reduce(
              (object, key): object => object[key],
              this.config.code
            );
    }

    if (!code) {
      this.log(`${this.name}: Code ${param} not found.`);
      return;
    }

    sendData(code);
    for (let i = 1; i < repeat; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 500));
      sendData(code);
    }
  }

  public constructor(
    config: T,
    log: Function,
    typeCode?: number,
    service?: HAPNodeJS.PredefinedService | HAPNodeJS.Service,
    accessory?: Homebridge.PlatformAccessory
  ) {
    this.log = log;

    if (accessory) {
      this.accessory = accessory;
    } else if (!!typeCode && !!service) {
      const uuid = Tools.UUIDGen.generate(config.name);
      this.accessory = new Tools.PlatformAccessory(config.name, uuid, typeCode);
      this.accessory.addService(service);
      this.accessory.reachable = true;
      this.accessory.context.name = config.name;
    }
    this.accessory.context.config = config;

    this.setupMetadata(config);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (target, prop): any => {
        this.log(`${this.name} get value of ${String(prop)}: ${target[prop]}`);
        return Reflect.get(target, prop);
      }
    });
  }

  private setupMetadata(config: AccessoryConfig): void {
    const service = this.accessory.getService(
      Tools.Service.AccessoryInformation
    );
    service.setCharacteristic(Tools.Characteristic.Name, config.name);

    if (config.manufacturer) {
      service.setCharacteristic(
        Tools.Characteristic.Manufacturer,
        config.manufacturer
      );
    }

    if (config.model) {
      service.setCharacteristic(Tools.Characteristic.Model, config.model);
    }

    if (config.serial_number) {
      service.setCharacteristic(
        Tools.Characteristic.SerialNumber,
        config.serial_number
      );
    }

    if (config.version) {
      service.setCharacteristic(
        Tools.Characteristic.FirmwareRevision,
        config.version
      );
    }
  }

  private onIdentify(paired: number, callback: () => void): void {
    this.log(`${this.name} identify requested: ${paired}`);
    callback();
  }

  public get currentAccessory(): Homebridge.PlatformAccessory {
    return this.accessory;
  }
}
