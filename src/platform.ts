import { Tools, createAccessory } from "./accessories";
import { RootConfig, AccessoryConfig } from "./config";
import Base from "./accessories/base";

const PLUGIN_NAME = "homebridge-advanced-rmmini";
const PLATFORM_NAME = "AdvancedRM";

export const setHomebridgeProperties = ({
  hap,
  platformAccessory
}: Homebridge.Homebridge): void => {
  Tools.initialize(
    platformAccessory,
    hap.Accessory,
    hap.Service,
    hap.Characteristic,
    hap.uuid
  );
};

export class ERemotePlatform {
  private log: Function;

  private accessories: Map<string, Base<AccessoryConfig, unknown>>;

  private api: Homebridge.API;

  private config: undefined | RootConfig;

  public constructor(
    log: Function,
    config: undefined | RootConfig,
    api: Homebridge.API
  ) {
    this.log = log;
    this.config = config;
    this.accessories = new Map();

    this.api = api;
    this.api.on("didFinishLaunching", this.didFinishLaunching.bind(this));
  }

  public configureAccessory(accessory: Homebridge.PlatformAccessory): void {
    let config: AccessoryConfig | undefined = this.config?.accessories.find(
      (acc: AccessoryConfig): boolean => acc.name === accessory.displayName
    );
    if (config === undefined) {
      this.log(
        `No config of accessory named "${accessory.displayName}" found. This accessory might be removed.`
      );
      config = accessory.context.config as AccessoryConfig;
    }
    const acc = createAccessory(config, this.log, accessory);
    this.accessories.set(accessory.context.name, acc);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public configurationRequestHandler(_context, _request, _callback): void {
    // NOTE: Nothing to do
  }

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

  private removeAccessory(accessory: Base<AccessoryConfig, unknown>): void {
    this.log(
      `Removing accessory ${accessory.currentAccessory.context.name}...`
    );
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
      accessory.currentAccessory
    ]);
  }

  private didFinishLaunching(): void {
    this.log("didFinishLaunching");
    // eslint-disable-next-line no-unused-expressions
    this.config?.accessories.forEach(this.addAccessory.bind(this));

    [...this.accessories.entries()].forEach(([name, accessory]): void => {
      if (!accessory.currentAccessory.reachable) {
        this.removeAccessory(accessory);
        this.accessories.delete(name);
      }
    });

    this.api.updatePlatformAccessories(this.accessories);
  }
}
