import * as Broadlink from "broadlinkjs-rm";

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

export class ERemotePlatform {
  private log: any;

  private accessories: Map<string, BaseAccessory<AccessoryConfig>>;

  private api: any;

  private config: any;

  private broadlink: any;

  private pingIntervals: Map<string, NodeJS.Timer>;

  public constructor(log: any, config: any, api: any) {
    this.log = log;
    this.config = config;
    this.accessories = new Map();

    this.api = api;
    this.api.on("didFinishLaunching", this.didFinishLaunching.bind(this));

    this.pingIntervals = new Map();
    this.broadlink = new Broadlink();
    this.broadlink.discover();

    this.broadlink.on(
      "deviceReady",
      (device): void => {
        this.log(`Discovered ${device.model} (${device.host.address})`);

        const macAddress = device.mac.toString();
        const interval = this.pingIntervals.get(macAddress);
        if (interval) {
          clearInterval(interval);
        }
        this.pingIntervals.set(
          macAddress,
          setInterval(device.checkTemperature.bind(device), 5000)
        );
      }
    );
  }

  public configureAccessory(accessory: Homebridge.PlatformAccessory): void {
    const acc = createAccessory(
      accessory.context.config,
      this.log,
      this.sendData.bind(this),
      accessory
    );
    this.accessories.set(accessory.context.name, acc);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public configurationRequestHandler(_context, _request, _callback): void {}

  private sendData(data: Buffer): void {
    const device = Object.values<any>(this.broadlink.devices)[0];
    if (device) {
      device.sendData(data);
    }
  }

  private addAccessory(config: AccessoryConfig): void {
    const { name } = config;
    this.log(`Adding accessory '${name}'...`);
    if (!this.accessories.has(name)) {
      const acc = createAccessory(config, this.log, this.sendData.bind(this));
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
    this.config.accessories.forEach(this.addAccessory.bind(this));

    [...this.accessories.values()].forEach(
      (accessory): void => {
        if (!accessory.currentAccessory.reachable)
          this.removeAccessory(accessory);
      }
    );
  }
}
