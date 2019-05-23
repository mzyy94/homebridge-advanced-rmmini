import { Frame as F, Pulse as P, BroadlinkData } from "./code";
import { FrameConfig, FrameData, Replacer } from "../config";

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
  private data: Buffer;

  private get gap(): number {
    return this[this.length - 1].width.low;
  }

  public constructor(buffer: Buffer, gap = 239, pulseArray?: Pulse[]) {
    if (pulseArray) {
      super(pulseArray);

      const bitArray: Pulse[][] = [];
      pulseArray.shift();
      while (pulseArray.length > 0) {
        bitArray.push(pulseArray.splice(0, 8));
      }
      bitArray.pop();
      const byteArray = bitArray
        .map(
          (bits): number[] =>
            bits.map(
              ({ width: { high, low } }): number =>
                high === 1 && low === 3 ? 1 : 0
            )
        )
        .map((bits): string => bits.reverse().join(""))
        .map((bits): number => parseInt(bits, 2));
      this.data = Buffer.from(byteArray);
      return;
    }

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
    this.data = buffer;
  }

  public get customerCode(): Buffer {
    const { data } = this;
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
    return this.data.slice(2);
  }

  public toFrameData(): FrameData {
    return {
      data: this.data.toString("hex"),
      gap: this.gap
    };
  }
}

export class AEHA {
  private frames: Frame[];

  private repeat: number;

  public constructor(data: FrameConfig, frames?: Frame[]) {
    this.frames =
      frames ||
      data.frames.map(
        (d): Frame => new Frame(Buffer.from(d.data, "hex"), d.gap)
      );
    this.repeat = data.repeat || 1;
  }

  public toSendData(): Buffer {
    const data = this.frames
      .map((frame): Buffer => frame.flatBuffer)
      .reduce((result, current): Buffer => Buffer.concat([result, current]));
    const { buffer } = new BroadlinkData(data, this.repeat);
    return buffer;
  }

  public toFrameConfig(): FrameConfig {
    const config: FrameConfig = {
      frames: this.frames.map((frame): FrameData => frame.toFrameData())
    };
    if (this.repeat > 1) {
      config.repeat = 1;
    }
    return config;
  }

  public static fromSendData(data: string): AEHA {
    const buffer = Buffer.from(data, "hex");
    const main = buffer.subarray(4, buffer.readUInt8(2) + 4);
    const numArray: number[] = [];
    for (let i = 0; i < main.byteLength; i += 1) {
      const value = main.readUInt8(i);
      if (value > 0) {
        numArray.push(value);
      } else {
        numArray.push(main.readUInt16BE(i + 1));
        i += 2;
      }
    }

    const pulseArray: Pulse[] = numArray.reduce(
      (result: Pulse[], current, i, array): Pulse[] => {
        if (i % 2 === 0) result.push(new Pulse(current, array[i + 1]));
        return result;
      },
      []
    );
    const frames: Frame[] = [];

    while (pulseArray.length > 0) {
      const trailerIndex = pulseArray.findIndex(
        (p: Pulse): boolean => p.width.high === 1 && p.width.low > 4
      );
      frames.push(
        new Frame(Buffer.alloc(0), 0, pulseArray.splice(0, trailerIndex + 1))
      );
    }

    return new AEHA({ frames: [] }, frames);
  }

  public static prepareFrameData(data: FrameData[], value: {}): FrameData[] {
    return data.map(
      (f: FrameData): FrameData => {
        const frame = f;
        if (frame.replacer) {
          frame.replacer.forEach(
            (r: Replacer): void => {
              let v = value[r.name];
              if (!v) return;
              if (r.preprocessor) {
                // eslint-disable-next-line no-new-func
                const processor = new Function(
                  r.name,
                  `return ${r.preprocessor}`
                );
                v = processor(v);
              }
              frame.data = frame.data.replace(
                r.target,
                Buffer.from([v]).toString("hex")
              );
            }
          );
        }
        return frame;
      }
    );
  }
}
