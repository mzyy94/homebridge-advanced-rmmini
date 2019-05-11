let PlatformAccessory: any;
let Accessory: any;
let Service: any;
// @ts-ignore
let Characteristic: any; // eslint-disable-line @typescript-eslint/no-unused-vars
let UUIDGen: any;

const PLUGIN_NAME = "eremote-hub";
const PLATFORM_NAME = "eRemote";

export const setHomebridgeProperties = ({ hap, platformAccessory }): void => {
  PlatformAccessory = platformAccessory;
  /* eslint-disable prefer-destructuring */
  Accessory = hap.Accessory;
  Service = hap.Service;
  Characteristic = hap.Characteristic;
  UUIDGen = hap.uuid;
  /* eslint-enable prefer-destructuring */
};

type Accessory = any;

export class ERemotePlatform {
  private log: any;

  private accessories: Map<string, Accessory>;

  private api: any;

  public constructor(log: any, _config: any, api: any) {
    this.log = log;

    this.accessories = new Map();

    this.api = api;
    this.api.on("didFinishLaunching", this.didFinishLaunching.bind(this));
  }

  public configureAccessory(accessory: Accessory): void {
    this.accessories.set(accessory.context.name, accessory);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public configurationRequestHandler(_context, _request, _callback): void {}

  private addAccessory({ name }): void {
    this.log(`Adding accessory '${name}'...`);
    if (!this.accessories.has(name)) {
      const uuid = UUIDGen.generate(name);
      const accessory = new PlatformAccessory(
        name,
        uuid,
        Accessory.Categories.SWITCH
      );

      accessory.addService(Service.Switch, name);
      accessory.reachable = true;

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory
      ]);
      this.accessories.set(name, accessory);
    }
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public removeAccessory(_accessory: Accessory): void {}

  private didFinishLaunching(): void {
    this.log("didFinishLaunching");
    const sampleAccessory = {
      name: "sample"
    };
    this.addAccessory(sampleAccessory);
  }
}
