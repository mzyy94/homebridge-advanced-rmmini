import { Tools } from "..";
import { AirConditionerConfig } from "../../config";
import Base from "../base";

export enum CurrentState {
  INACTIVE = 0,
  IDLE = 1,
  HEATING = 2,
  COOLING = 3
}

export enum TargetState {
  AUTO = 0,
  HEATER = 1,
  COOLER = 2
}

interface Context {
  current: number;
  target: number;
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
      this.context.current = 0;
      this.context.target = 0;
      this.context.active = 0;
      this.context.direction = 0;
      this.context.speed = 0;
      this.context.temperature = 20;
      this.context.cooler = 20;
      this.context.heater = 20;
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
      .on("set", this.setContext("active"));

    const currentHeaterCoolerState = service.getCharacteristic(
      Tools.Characteristic.CurrentHeaterCoolerState
    );

    currentHeaterCoolerState
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.current);
      })
      .on("set", this.setContext("current"));

    service
      .getCharacteristic(Tools.Characteristic.TargetHeaterCoolerState)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.target);
      })
      .on("set", (value: TargetState, callback) => {
        if (this.context.active) {
          switch (value) {
            case TargetState.COOLER:
              currentHeaterCoolerState.updateValue(CurrentState.COOLING);
              break;
            case TargetState.HEATER:
              currentHeaterCoolerState.updateValue(CurrentState.HEATING);
              break;
            default:
              currentHeaterCoolerState.updateValue(
                this.context.temperature < this.config.threshold
                  ? CurrentState.HEATING
                  : CurrentState.COOLING
              );
          }
        } else {
          currentHeaterCoolerState.updateValue(CurrentState.INACTIVE);
        }
        this.setContext("target")(value, callback);
      });

    service
      .getCharacteristic(Tools.Characteristic.CurrentTemperature)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, 20);
      });

    service
      .getCharacteristic(Tools.Characteristic.CoolingThresholdTemperature)
      .setProps({
        maxValue: this.config.cooler?.max as number,
        minValue: this.config.cooler?.min as number,
        minStep: this.config.cooler?.step as number
      } as HAPNodeJS.CharacteristicProps)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.cooler);
      })
      .on("set", this.setContext("cooler"));

    service
      .getCharacteristic(Tools.Characteristic.HeatingThresholdTemperature)
      .setProps({
        maxValue: this.config.heater?.max as number,
        minValue: this.config.heater?.min as number,
        minStep: this.config.heater?.step as number
      } as HAPNodeJS.CharacteristicProps)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.heater);
      })
      .on("set", this.setContext("heater"));

    service
      .getCharacteristic(Tools.Characteristic.SwingMode)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.direction);
      })
      .on("set", this.setContext("direction"));

    service
      .getCharacteristic(Tools.Characteristic.RotationSpeed)
      .setProps({
        maxValue: this.config.speed?.max as number,
        minValue: this.config.speed?.min as number,
        minStep: this.config.speed?.step as number
      } as HAPNodeJS.CharacteristicProps)
      .on("get", (cb: HAPNodeJS.CharacteristicGetCallback): void => {
        cb(null, this.context.speed);
      })
      .on("set", this.setContext("speed"));
  }

  private setContext = (key: keyof Context) => (
    value: number,
    callback: HAPNodeJS.CharacteristicSetCallback
  ): void => {
    if (value === this.context[key]) {
      callback();
      return;
    }
    this.log(`${this.name} set ${key}: ${this.context[key]} => ${value}`);

    this.context[key] = value;

    this.sendAC();
    callback();
  };

  protected sendAC(): void {
    this.log(new Error("Override this sendAC method"));
  }
}
