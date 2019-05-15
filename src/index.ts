// eslint-disable-next-line spaced-comment, @typescript-eslint/no-triple-slash-reference
/// <reference path="../node_modules/hap-nodejs/index.d.ts" />
// eslint-disable-next-line spaced-comment, @typescript-eslint/no-triple-slash-reference
/// <reference path="./homebridge.d.ts" />

import { ERemotePlatform, setHomebridgeProperties } from "./platform";

const PLUGIN_NAME = "eremote-hub";
const PLATFORM_NAME = "eRemote";

export default (homebridge: any): void => {
  setHomebridgeProperties(homebridge);
  homebridge.registerPlatform(
    PLUGIN_NAME,
    PLATFORM_NAME,
    ERemotePlatform,
    true
  );
};
