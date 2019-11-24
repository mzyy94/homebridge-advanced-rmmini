// eslint-disable-next-line spaced-comment, @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/hap-nodejs/index.d.ts" />
// eslint-disable-next-line spaced-comment, @typescript-eslint/triple-slash-reference
/// <reference path="./homebridge.d.ts" />

import { ERemotePlatform, setHomebridgeProperties } from "./platform";

const PLUGIN_NAME = "homebridge-advanced-rmmini";
const PLATFORM_NAME = "AdvancedRM";

export default (homebridge: Homebridge.Homebridge & Homebridge.API): void => {
  setHomebridgeProperties(homebridge);
  homebridge.registerPlatform(
    PLUGIN_NAME,
    PLATFORM_NAME,
    ERemotePlatform,
    true
  );
};
