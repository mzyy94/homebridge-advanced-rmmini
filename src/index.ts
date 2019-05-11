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
