import {
  AccessoryTools,
  createAccessory,
  AccessoryConfig
} from "./accessories";
import BaseAccessory from "./accessories/base";

const PLUGIN_NAME = "eremote-hub";
const PLATFORM_NAME = "eRemote";

export const setHomebridgeProperties = ({
  hap,
  platformAccessory
}: Homebridge.Homebridge): void => {
  AccessoryTools.initialize(
    platformAccessory,
    hap.Accessory,
    hap.Service,
    hap.Characteristic,
    hap.uuid
  );
};

type HomebridgeAccessory = any;

export class ERemotePlatform {
  private log: any;

  private accessories: Map<string, BaseAccessory>;

  private api: any;

  public constructor(log: any, _config: any, api: any) {
    this.log = log;

    this.accessories = new Map();

    this.api = api;
    this.api.on("didFinishLaunching", this.didFinishLaunching.bind(this));
  }

  public configureAccessory(accessory: Homebridge.PlatformAccessory): void {
    const acc = createAccessory(accessory.context.config, this.log, accessory);
    this.accessories.set(accessory.context.name, acc);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public configurationRequestHandler(_context, _request, _callback): void {}

  private addAccessory(config: AccessoryConfig): void {
    const { name } = config;
    this.log(`Adding accessory '${name}'...`);
    if (!this.accessories.has(name)) {
      const acc = createAccessory(config, this.log);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        acc.currentAccessory
      ]);
      this.accessories.set(name, acc);
    }
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public removeAccessory(_accessory: HomebridgeAccessory): void {}

  private didFinishLaunching(): void {
    this.log("didFinishLaunching");
    const sampleAccessory: AccessoryConfig = {
      name: "sample",
      type: "switch"
    };
    this.addAccessory(sampleAccessory);
  }
}
