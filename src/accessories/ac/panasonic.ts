import AirConditioner, { TargetState } from ".";
import { AirConditionerConfig, FrameConfig } from "../../config";

export default class Panasonic extends AirConditioner {
  public constructor(
    c: AirConditionerConfig,
    log: Function,
    accessory?: Homebridge.PlatformAccessory
  ) {
    const config = c;
    config.cooler = config.cooler || {};
    config.cooler.max = config.cooler.max || 30;
    config.cooler.min = config.cooler.min || 16;
    config.cooler.step = config.cooler.step || 1;
    config.heater = config.heater || {};
    config.heater.max = config.heater.max || 30;
    config.heater.min = config.heater.min || 16;
    config.heater.step = config.heater.step || 1;
    config.speed = config.speed || {};
    config.speed.max = 7;
    config.speed.min = 0;
    config.speed.step = 1;

    super(config, log, accessory);
  }

  protected sendAC(): void {
    const {
      target,
      active,
      direction,
      speed,
      cooler,
      heater,
      temperature
    } = this.context;

    const buffer = Buffer.from("0220e004000000800000000660000080000600", "hex");

    let mode = 0;
    switch (target as TargetState) {
      case TargetState.AUTO:
        if (temperature < this.config.threshold) {
          mode = 0x04;
        } else {
          mode = this.config.dry ? 0x02 : 0x03;
        }
        break;
      case TargetState.HEATER:
        mode = 0x04;
        break;
      case TargetState.COOLER:
        mode = this.config.dry ? 0x02 : 0x03;
        break;
      default:
        break;
    }

    buffer.writeUInt8((mode << 4) | active, 5);
    buffer.writeUInt8((mode === 0x04 ? heater : cooler) << 1, 6);
    let quiet = 0;
    let powerfull = 0;
    let windSpeed = 0;
    if (speed === 1) {
      quiet = 1;
      windSpeed = 3;
    } else if (speed === 7) {
      powerfull = 1;
      windSpeed = 6;
    } else if (speed === 6) {
      windSpeed = 0b1010;
    } else {
      windSpeed = 2 + speed;
    }

    buffer.writeUInt8((windSpeed << 4) | (direction ? 0b1111 : 0b0001), 8);
    buffer.writeUInt8((quiet << 5) | powerfull, 13);

    let checksum = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 18; i++) {
      checksum += buffer.readUInt8(i);
      checksum %= 256;
    }
    buffer.writeUInt8(checksum, 18);

    const frameConfig: FrameConfig = {
      frames: [{ data: buffer.toString("hex") }]
    };
    this.sendData(frameConfig);
  }
}
