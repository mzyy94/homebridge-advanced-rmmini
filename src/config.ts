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

export type Code = string | FrameData[];

export interface CommonConfig {
  name: string;
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
    cool?: Code;
    warm?: Code;
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

export type Accessories = Switch | Light;

export type AccessoryConfig = CommonConfig & Accessories;
