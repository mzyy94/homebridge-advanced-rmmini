export interface Replacer {
  name: string;
  target: string;
  preprocessor?: string;
}

export interface FrameConfig {
  repeat?: number;
  frames: FrameData[];
}

export interface FrameData {
  data: string;
  gap?: number;
  replacer?: Replacer[];
}

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-explicit-any
export const isFrameConfig = (arg: any): arg is FrameConfig => {
  return !!arg && typeof arg === "object" && arg.frames !== undefined;
};

export type Code = string | FrameConfig;

export interface CommonConfig {
  name: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  version?: string;

  mode: "raw" | "aeha";
}

export interface Switch {
  type: "switch";
  code: {
    on: Code;
    off: Code;
  };
}

export type SwitchConfig = CommonConfig & Switch;

interface SteppingLight {
  step: number;
  code: {
    warmer?: Code;
    cooler?: Code;
    brighter?: Code;
    dimmer?: Code;
    temperature?: {
      [value: string]: Code;
    };
  };
}

export type Light = SteppingLight & {
  type: "light";
  color?: "white" | "all" | "none";
  mode?: "value" | "step";
  step?: number;
  code: {
    on: Code;
    off: Code;
  };
};

export type LightConfig = CommonConfig & Light;

export type RemoteControls =
  | "rewind"
  | "fast_forward"
  | "next_track"
  | "previous_track"
  | "arrow_up"
  | "arrow_down"
  | "arrow_left"
  | "arrow_right"
  | "select"
  | "back"
  | "exit"
  | "play_pause"
  | "information";

export interface Television {
  type: "tv";
  code: {
    on: Code;
    off: Code;
    channels?: {
      [name: string]: Code;
    };
    controls?: { [name in RemoteControls]: Code };
    volume?: { [name in "increment" | "decrement"]: Code };
  };
}

export type TVConfig = CommonConfig & Television;

export interface Fan {
  type: "fan";
  code: {
    on: Code;
    off: Code;
  };
}

export type FanConfig = CommonConfig & Fan;

export interface AirConditioner {
  type: "ac";
  cooler?: {
    min?: number;
    max?: number;
    step?: number;
  };
  heater?: {
    min?: number;
    max?: number;
    step?: number;
  };
  speed?: {
    min?: number;
    max?: number;
    step?: number;
  };
  dry?: boolean;
  code: {
    on: Code;
    off: Code;
  };
}

export type AirConditionerConfig = CommonConfig & AirConditioner;

export type Accessories = Switch | Light | Television | Fan | AirConditioner;

export type AccessoryConfig = CommonConfig & Accessories;

export type RootConfig = {
  accessories: Array<AccessoryConfig>;
};
