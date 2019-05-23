import test, { ExecutionContext } from "ava";
import { FrameConfig, FrameData } from "../../config";
import { AEHA } from "../aeha";

test(
  "Convert to send data from AEHA frame data",
  (t: ExecutionContext, input: FrameConfig, expected: string): void => {
    const aeha = new AEHA(input);
    t.is(aeha.toSendData().toString("hex"), expected);
  },
  {
    frames: [
      {
        data: "2c52092f26",
        gap: 177
      },
      {
        data: "2c52092f26",
        gap: 239
      }
    ]
  },
  "2600ac006f370d0d0d0d0d290d290d0d0d290d0d0d0d0d0d0d290d0d0d0d0d290d0d0d290d0d0d290d0d0d0d0d290d0d0d0d0d0d0d0d0d290d290d290d290d0d0d290d0d0d0d0d0d0d290d290d0d0d0d0d290d0d0d0d0d0009a46f370d0d0d0d0d290d290d0d0d290d0d0d0d0d0d0d290d0d0d0d0d290d0d0d290d0d0d290d0d0d0d0d290d0d0d0d0d0d0d0d0d290d290d290d290d0d0d290d0d0d0d0d0d0d290d290d0d0d0d0d290d0d0d0d0d000d0500000000000000000000000000000000"
);

test(
  "Convert to AEHA frame data from send data",
  (t: ExecutionContext, input: string, expected: FrameData[]): void => {
    const aeha = AEHA.fromSendData(input);
    t.deepEqual(aeha.toFrameData(), expected);
  },
  "2600ac006f370d0d0d0d0d290d290d0d0d290d0d0d0d0d0d0d290d0d0d0d0d290d0d0d290d0d0d290d0d0d0d0d290d0d0d0d0d0d0d0d0d290d290d290d290d0d0d290d0d0d0d0d0d0d290d290d0d0d0d0d290d0d0d0d0d0009a46f370d0d0d0d0d290d290d0d0d290d0d0d0d0d0d0d290d0d0d0d0d290d0d0d290d0d0d290d0d0d0d0d290d0d0d0d0d0d0d0d0d290d290d290d290d0d0d290d0d0d0d0d0d0d290d290d0d0d0d0d290d0d0d0d0d000d0500000000000000000000000000000000",
  [
    {
      data: "2c52092f26",
      gap: 177
    },
    {
      data: "2c52092f26",
      gap: 239
    }
  ]
);

test(
  "Convert to send data from AEHA frame data with replacer",
  (t: ExecutionContext, input: FrameConfig, expected: string): void => {
    const data = input;
    data.frames = AEHA.prepareFrameData(input.frames, { value: 100 });
    const aeha = new AEHA(data);
    t.is(aeha.toSendData().toString("hex"), expected);
  },
  {
    frames: [
      {
        data: "2c5209VV26",
        gap: 177,
        replacer: [
          {
            name: "value",
            target: "VV",
            preprocessor: "value * 2"
          }
        ]
      },
      {
        data: "2c52092f26",
        gap: 239
      }
    ]
  },
  "2600ac006f370d0d0d0d0d290d290d0d0d290d0d0d0d0d0d0d290d0d0d0d0d290d0d0d290d0d0d290d0d0d0d0d290d0d0d0d0d0d0d0d0d0d0d0d0d0d0d290d0d0d0d0d290d290d0d0d290d290d0d0d0d0d290d0d0d0d0d0009a46f370d0d0d0d0d290d290d0d0d290d0d0d0d0d0d0d290d0d0d0d0d290d0d0d290d0d0d290d0d0d0d0d290d0d0d0d0d0d0d0d0d290d290d290d290d0d0d290d0d0d0d0d0d0d290d290d0d0d0d0d290d0d0d0d0d000d0500000000000000000000000000000000"
);
