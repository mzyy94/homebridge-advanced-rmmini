export interface FrameData {
  data: string;
  gap?: number;
}

export type Code = string | FrameData;

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
