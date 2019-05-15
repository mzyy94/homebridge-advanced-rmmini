declare namespace Homebridge {
  export interface Homebridge {
    hap: HAPNodeJS.HAPNodeJS;
    api: API;
    platformAccessory: PlatformAccessory;
  }

  export class API {
    public version: any;

    public serverVersion: any;

    public user: any;

    public hap: any;

    public hapLegacyTypes: any;

    public platformAccessory: any;

    public accessory(name: any): any;

    public addListener(type: any, listener: any): any;

    public emit(type: any, args: any): any;

    public eventNames(): any;

    public getMaxListeners(): any;

    public listenerCount(type: any): any;

    public listeners(type: any): any;

    public off(type: any, listener: any): any;

    public on(type: any, listener: any): any;

    public once(type: any, listener: any): any;

    public platform(name: any): any;

    public prependListener(type: any, listener: any): any;

    public prependOnceListener(type: any, listener: any): any;

    public publishCameraAccessories(pluginName: any, accessories: any): void;

    public publishExternalAccessories(pluginName: any, accessories: any): void;

    public rawListeners(type: any): any;

    public registerAccessory(
      pluginName: any,
      accessoryName: any,
      constructor: any,
      configurationRequestHandler: any
    ): void;

    public registerPlatform(
      pluginName: any,
      platformName: any,
      constructor: any,
      dynamic: any
    ): void;

    public registerPlatformAccessories(
      pluginName: any,
      platformName: any,
      accessories: any
    ): void;

    public removeAllListeners(type: any, ...args: any[]): any;

    public removeListener(type: any, listener: any): any;

    public setMaxListeners(n: any): any;

    public unregisterPlatformAccessories(
      pluginName: any,
      platformName: any,
      accessories: any
    ): void;

    public updatePlatformAccessories(accessories: any): void;
  }

  export interface PlatformAccessory {
    displayName: string;
    UUID: string;
    category: HAPNodeJS.Accessory.Categories;
    services: HAPNodeJS.Service[];
    reachable: boolean;
    context: any;

    addService: <T = HAPNodeJS.Service | HAPNodeJS.PredefinedService>(
      service: T
    ) => T;
    removeService: (service: HAPNodeJS.Service) => void;
    getService: (
      name: string | HAPNodeJS.PredefinedService
    ) => HAPNodeJS.Service;
    getServiceByUUIDAndSubType: (
      UUID: string,
      subtype: string
    ) => HAPNodeJS.Service;
    updateReachability: (reachable: boolean) => void;
    configureCameraSource: (cameraSource: any) => void;
    on: (
      type: string,
      listener: (paired: boolean, callback: Function) => void
    ) => void;
  }
}
