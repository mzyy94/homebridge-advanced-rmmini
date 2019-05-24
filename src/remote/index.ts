import * as Broadlink from "broadlinkjs-rm";
import { FrameConfig } from "../config";
import { AEHA } from "./aeha";

const broadlink: any = new Broadlink();

const pingIntervals: Map<string, NodeJS.Timer> = new Map();

const PING_INTERVAL = 5000;

const initialize = (): void => {
  broadlink.discover();
  // discover every 10 seconds
  setInterval(broadlink.discover.bind(broadlink), 10 * 1000);

  broadlink.on(
    "deviceReady",
    (device): void => {
      const macAddress = device.mac.toString();
      const interval = pingIntervals.get(macAddress);
      if (interval) {
        clearInterval(interval);
      }
      pingIntervals.set(
        macAddress,
        setInterval(device.checkTemperature.bind(device), PING_INTERVAL)
      );
    }
  );
};

initialize();

export default (code: string | FrameConfig): void => {
  let data: Buffer;
  if (typeof code === "string") {
    data = Buffer.from(code, "hex");
  } else {
    const modified = code;
    // TODO: prepareFrameData
    const aeha = new AEHA(modified);
    data = aeha.toSendData();
  }
  const device = Object.values<any>(broadlink.devices)[0];
  if (device) {
    device.sendData(data);
  }
};
