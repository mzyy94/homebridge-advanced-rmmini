declare namespace Homebridge {
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
