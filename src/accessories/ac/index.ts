import { Tools } from "../";
import { AirConditionerConfig } from "../../config";
import Base from "../base";

interface Context {
  state: number;
  active: number;
  direction: number;
  speed: number;
  temperature: number;
  cooler: number;
  heater: number;
}

export default class AirConditioner extends Base<
  AirConditionerConfig,
  Context
> {
  public constructor(
    config: AirConditionerConfig,
    log: Function,
    accessory?: Homebridge.PlatformAccessory
  ) {
    super(
      config,
      log,
      Tools.Accessory.Categories.AIR_CONDITIONER,
      Tools.Service.HeaterCooler,
      accessory
    );

    if (!accessory) {
      this.context.state = 0;
      this.context.active = 0;
      this.context.direction = 0;
      this.context.speed = 0;
      this.context.temperature = 20;
      this.context.cooler = 16;
      this.context.heater = 30;
    }

    this.setService();
  }

  private setService(): void {
    const service = this.accessory.getService(Tools.Service.HeaterCooler);

    service
      .getCharacteristic(Tools.Characteristic.Active)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.active);
      })
      .on("set", this.onSetPowerState.bind(this));

    service
      .getCharacteristic(Tools.Characteristic.CurrentHeaterCoolerState)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.state);
      })
      .on(
        "set",
        (state: number, callback: HAPNodeJS.CharacteristicSetCallback) => {
          this.log(
            `CurrentHeaterCoolerState:${state} from ${this.context.state}`
          );
          this.context.state = state;
          callback();
        }
      );

    service
      .getCharacteristic(Tools.Characteristic.TargetHeaterCoolerState)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.state);
      })
      .on(
        "set",
        (state: number, callback: HAPNodeJS.CharacteristicSetCallback) => {
          this.log(
            `TargetHeaterCoolerState:${state} from ${this.context.state}`
          );
          this.context.state = state;
          callback();
        }
      );

    service
      .getCharacteristic(Tools.Characteristic.CurrentTemperature)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, 20);
      });

    service
      .getCharacteristic(Tools.Characteristic.CoolingThresholdTemperature)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.cooler);
      })
      .on(
        "set",
        (cooler: number, callback: HAPNodeJS.CharacteristicSetCallback) => {
          this.log(
            `CoolingThresholdTemperature:${cooler} from ${this.context.cooler}`
          );
          this.context.cooler = cooler;
          callback();
        }
      );

    service
      .getCharacteristic(Tools.Characteristic.HeatingThresholdTemperature)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.heater);
      })
      .on(
        "set",
        (heater: number, callback: HAPNodeJS.CharacteristicSetCallback) => {
          this.log(
            `HeatingThresholdTemperature:${heater} from ${this.context.heater}`
          );
          this.context.heater = heater;
          callback();
        }
      );

    service
      .getCharacteristic(Tools.Characteristic.SwingMode)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.direction);
      })
      .on(
        "set",
        (direction: number, callback: HAPNodeJS.CharacteristicSetCallback) => {
          this.log(`SwingMode:${direction} from ${this.context.direction}`);
          this.context.direction = direction;
          callback();
        }
      );

    service
      .getCharacteristic(Tools.Characteristic.RotationSpeed)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.speed);
      })
      .on(
        "set",
        (speed: number, callback: HAPNodeJS.CharacteristicSetCallback) => {
          this.log(`RotationSpeed:${speed} from ${this.context.speed}`);
          this.context.speed = speed;
          callback();
        }
      );
  }

  private onSetPowerState(
    active: number,
    callback: HAPNodeJS.CharacteristicSetCallback
  ): void {
    if (active === this.context.active) {
      callback();
      return;
    }
    this.log(`${this.name} set active: ${this.context.active} => ${active}`);

    this.context.active = active;

    callback();
  }
}
