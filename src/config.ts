export interface FrameData {
  data: string;
  gap?: number;
}

export type Code = string | FrameData;

export interface Switch {
  type: "switch";
  code: {
    on: Code;
    off: Code;
  };
}

export type Accessories = Switch;

export type AccessoryConfig = Accessories & {
  name: string;
  mode: "raw" | "aeha";
};
