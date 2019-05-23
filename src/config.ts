export interface Replacer {
  name: string;
  target: string;
  preprocessor?: string;
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

export type Accessories = Switch;

export type AccessoryConfig = CommonConfig & Accessories;
