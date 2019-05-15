import * as Broadlink from "broadlinkjs-rm";

const broadlink: any = new Broadlink();

const pingIntervals: Map<string, NodeJS.Timer> = new Map();

const PING_INTERVAL = 5000;

const initialize = (): void => {
  broadlink.discover();
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

export default (data: Buffer): void => {
  const device = Object.values<any>(broadlink.devices)[0];
  if (device) {
    device.sendData(data);
  }
};
