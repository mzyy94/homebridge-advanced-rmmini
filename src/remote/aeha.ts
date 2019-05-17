import { Frame as F, Pulse as P, BroadlinkData } from "./code";
// https://github.com/mjg59/python-broadlink/blob/master/protocol.md#sending-data
const FREQUENCY = 268.85 / 8192; // GHz

// AEHA pulse burst/space length
const MIN_PULSE_LENGTH = 350;
const MAX_PULSE_LENGTH = 500;
const AVERAGE_PULSE_LENGTH = (MIN_PULSE_LENGTH + MAX_PULSE_LENGTH) / 2;

type PulseLength = number;

export class Pulse extends P {
  public width: {
    high: number;
    low: number;
  };

  public constructor(high: number, low: number) {
    super(high, low);
    this.width = {
      high: Math.round(high / AVERAGE_PULSE_LENGTH / FREQUENCY),
      low: Math.round(low / AVERAGE_PULSE_LENGTH / FREQUENCY)
    };
  }

  public static fromWidth(
    highValue: PulseLength,
    lowValue: PulseLength
  ): Pulse {
    const high = highValue * AVERAGE_PULSE_LENGTH * FREQUENCY;
    const low = lowValue * AVERAGE_PULSE_LENGTH * FREQUENCY;
    return new Pulse(high, low);
  }
}

export class Frame extends F<Pulse> {
  public constructor(buffer: Buffer, gap = 239) {
    const leader = Pulse.fromWidth(8, 4);

    const pulse = [leader];

    [...buffer].forEach(
      (buf): void => {
        for (let i = 0; i < 8; i += 1) {
          // eslint-disable-next-line no-bitwise
          const isHigh = (buf >>> i) & 0x01;
          const p = Pulse.fromWidth(1, isHigh ? 3 : 1);
          pulse.push(p);
        }
      }
    );
    const trailer = Pulse.fromWidth(1, gap);
    pulse.push(trailer);

    super(pulse);
    this.buffer = buffer;
  }

  public get customerCode(): Buffer {
    const data = this.buffer;
    /* eslint-disable no-bitwise */
    let parity = data.readUInt8(2) & 0x0f;
    parity ^= data.readUInt8(0) >> 4;
    parity ^= data.readUInt8(0) & 0x0f;
    parity ^= data.readUInt8(1) >> 4;
    parity ^= data.readUInt8(1) & 0x0f;
    /* eslint-enable no-bitwise */

    if (parity !== 0x00) {
      throw new Error(`Invalid parity`);
    }
    return data.slice(0, 2);
  }

  public get payload(): Buffer {
    const data = this.buffer.slice(2);
    return data;
  }

  public toJSON(space = 2): string {
    return JSON.stringify(
      {
        customerCode: this.customerCode.toString("hex"),
        data: this.buffer.toString("hex")
      },
      null,
      space
    );
  }
}

export interface FrameData {
  data: string;
  gap?: number;
}

export class AEHA {
  private frames: Frame[];

  public constructor(data: FrameData[]) {
    this.frames = data.map(
      (d): Frame => new Frame(Buffer.from(d.data, "hex"), d.gap)
    );
  }

  public toSendData(): Buffer {
    const data = this.frames
      .map((frame): Buffer => frame.flatBuffer)
      .reduce((result, current): Buffer => Buffer.concat([result, current]));
    const { buffer } = new BroadlinkData(data);
    return buffer;
  }
}
