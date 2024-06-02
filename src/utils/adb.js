import fs from 'fs';
import Adb from '@devicefarmer/adbkit';
import frida from 'frida';
import logger from './logger.js';
import appConfig from './config.js';

async function adbInit () {
  const adbClient = await Adb.Adb.createClient();
  logger.debug('ADB client initialized');
  const adbDeviceLists = await adbClient.listDevices();
  const adbDevice = await adbClient.getDevice(adbDeviceLists[0].id);
  logger.info(`ADB device detected: ${adbDevice.serial} (${adbDevice.client.host}:${adbDevice.client.port})`);
  try {
    await adbDevice.root();
  } catch (error) {
    if (error.message === 'adbd is already running as root') {
      logger.warn('ADB daemon is already running as root privilege');
    } else {
      throw error;
    }
  }
  await adbDevice.forward(`tcp:${appConfig.devices.agentPort}`, `tcp:${appConfig.devices.agentPort}`);
  logger.debug(`ADB device TCP port ${appConfig.devices.agentPort} has been forwarded`);
  const adbDeviceSyncTunnel = await adbDevice.syncService();
  logger.trace('ADB sync connection started');
  // await adbDeviceSyncTunnel.pushFile()
  await adbDeviceSyncTunnel.end();
  logger.trace('ADB sync connection ended');
  await injectFrida(adbDevice);
}

async function injectFrida (adbDevice) {
  frida.getDeviceManager().addRemoteDevice(adbDevice.serial);
  const fridaDevice = await frida.getDevice(adbDevice.serial);
  logger.debug('Device has been detected by Frida');
  const pid = await fridaDevice.spawn(appConfig.devices.processName);
  logger.debug(`Spawned ${appConfig.devices.processName} (pid: ${pid})`);
  const fridaSession = await fridaDevice.attach(pid);
  logger.trace(`Frida attached to pid ${pid}`);
  const m3u8Script = await fridaSession.createScript(await fs.promises.readFile('fridaSrc/m3u8.js', 'utf-8'));
  const agentScript = await fridaSession.createScript((await fs.promises.readFile('fridaSrc/m3u8.js', 'utf-8')).replace('2147483647', appConfig.devices.agentPort));
  await m3u8Script.load();
  await agentScript.load();
  logger.trace('Frida script loaded');
  await fridaDevice.resume(pid);
  logger.info('Device has been successfully injected by Frida! Happy hacking!');
}

export default {
  adbInit,
};
