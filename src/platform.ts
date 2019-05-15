import {
  AccessoryTools,
  createAccessory,
  AccessoryConfig
} from "./accessories";
import BaseAccessory from "./accessories/base";
import { SwitchConfig } from "./accessories/switch";

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

export class ERemotePlatform {
  private log: any;

  private accessories: Map<string, BaseAccessory<AccessoryConfig>>;

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
    } else {
      const acc = this.accessories.get(name);
      if (acc) acc.currentAccessory.updateReachability(true);
    }
  }

  private removeAccessory(accessory: BaseAccessory<AccessoryConfig>): void {
    this.log(
      `Removing accessory ${accessory.currentAccessory.context.name}...`
    );
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
      accessory.currentAccessory
    ]);
  }

  private didFinishLaunching(): void {
    this.log("didFinishLaunching");
    const sampleAccessory: SwitchConfig = {
      name: "sample",
      type: "switch",
      mode: "raw",
      code: {
        on: "000001",
        off: "000000"
      }
    };
    this.addAccessory(sampleAccessory);

    [...this.accessories.values()].forEach(
      (accessory): void => {
        if (!accessory.currentAccessory.reachable)
          this.removeAccessory(accessory);
      }
    );
  }
}
