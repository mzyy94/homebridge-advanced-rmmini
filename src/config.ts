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

export type Accessories = Switch | Light | Television;

export type AccessoryConfig = CommonConfig & Accessories;
