// 2600ac0074380e0f0d100d2c0d2c0d100d2c0d0f0e0f0d100d2c0d0f0e0f0d2c0e0f0d2c0d0f0e2c0d0f0e0f0d2c0d100d0f0e0f0d0f0e2b0e0f0e2b0e2b0e0f0e2b0e0f0d100d0f0e0f0d2c0d100d0f0e2b0e0f0d100d0009a574380e0f0d0f0e2b0e2c0d0f0e2b0e0f0d100d0f0e2b0e0f0d100d2c0d0f0e2c0d0f0e2b0e0f0d100d2c0d0f0e0f0d0f0e0f0e2b0e0f0d2c0d2c0e0f0d2c0d100d0f0e0f0d0f0e2b0e0f0e0f0d2c0d100d0f0e000d05000000000000000000000000

export class Pulse extends Array<number> {
  public get high(): number {
    return this[0];
  }

  public set high(value) {
    this[0] = value;
  }

  public get low(): number {
    return this[1];
  }

  public set low(value) {
    this[1] = value;
  }

  public constructor(high: number, low: number) {
    const [h, l] = new Uint16Array([high, low]);
    super(h, l);
  }
}

export class Frame<T extends Pulse> extends Array<T> {
  public buffer: Buffer;

  public constructor(pulse: T[]) {
    super(...pulse);
    this.buffer = this.flatBuffer;
  }

  public flat(): number[] {
    return this.reduce(
      (result, current): number[] => [...result, ...current],
      []
    );
  }

  public get flatBuffer(): Buffer {
    return Buffer.from(
      this.flat().reduce(
        (result, current): number[] => [
          ...result,
          ...(current > 0xff
            ? // eslint-disable-next-line no-bitwise
              [0x00, current >>> 8, current & 0xff]
            : [current])
        ],
        []
      )
    );
  }
}

export class BroadlinkData {
  private data: ArrayBuffer | SharedArrayBuffer;

  private repeat: number;

  public constructor(
    data: string | Uint8Array | Buffer | Frame<Pulse>,
    repeat?: number
  ) {
    let buf: Buffer | null = null;
    switch (data.constructor.name) {
      case "String":
        buf = Buffer.from(data as string, "hex");
        break;
      case "Uint8Array":
        this.data = (data as Uint8Array).buffer;
        return;
      case "Buffer":
        buf = data as Buffer;
        break;
      case "Frame":
        buf = (data as Frame<Pulse>).buffer;
        break;
      default:
        throw new RangeError("Unknown type");
    }
    this.data = new Uint8Array(buf).buffer;
    this.repeat = repeat && repeat > 1 ? Math.floor(repeat) : 1;
  }

  public get code(): number[] {
    const buffer = Buffer.from(this.data);
    // FIXME: byteLength and trimmedLength are same
    const trimmedLength = buffer.reduceRight(
      (result, current, index): number =>
        current === 0 && index + 1 === result ? result - 1 : result,
      buffer.byteLength
    );
    return [
      0x26,
      this.repeat - 1,
      ...Buffer.from(new Uint16Array([trimmedLength]).buffer),
      ...buffer.values(),
      ...Buffer.alloc(16)
    ];
  }

  public get buffer(): Buffer {
    return Buffer.from(this.code);
  }
}
