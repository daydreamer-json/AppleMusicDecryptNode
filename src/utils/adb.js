import fs from 'fs';
import Adb from '@devicefarmer/adbkit';
import frida from 'frida';
import logger from './logger.js';
import appConfig from './config.js';
import storefrontIds from './storefrontIds.js';
import stringUtils from './stringUtils.js';

async function adbInit () {
  const adbClient = await Adb.Adb.createClient();
  logger.debug('ADB client initialized');
  const adbDeviceLists = await adbClient.listDevices();
  const adbDevice = await adbClient.getDevice(adbDeviceLists[0].id);
  logger.info(`ADB device detected: ${adbDevice.serial}`);
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
  // const adbDeviceSyncTunnel = await adbDevice.syncService();
  // logger.trace('ADB sync connection started');
  // // await adbDeviceSyncTunnel.pushFile()
  // await adbDeviceSyncTunnel.end();
  // logger.trace('ADB sync connection ended');
  return adbDevice;
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

async function getDsid (adbDevice) {
  const dsid = await adbDevice.shell(`sqlite3 /data/data/com.apple.android.music/files/mpl_db/cookies.sqlitedb "select value from cookies where name='X-Dsid';"`).then(Adb.Adb.util.readAll);
  return parseInt(dsid.toString().trim());
}

async function getAccountToken (adbDevice, dsid) {
  const accountToken = await adbDevice.shell(`sqlite3 /data/data/com.apple.android.music/files/mpl_db/cookies.sqlitedb "select value from cookies where name='mz_at_ssl-${dsid}';"`).then(Adb.Adb.util.readAll);
  return accountToken.toString().trim();
}

async function getAccessToken (adbDevice) {
  const accessTokenRawOutput = await adbDevice.shell('cat /data/data/com.apple.android.music/shared_prefs/preferences.xml').then(Adb.Adb.util.readAll);
  return accessTokenRawOutput.toString().match(new RegExp('eyJr[^<]*'))[0].trim();
}

async function getStorefront (adbDevice) {
  const storefrontRawOutput = await adbDevice.shell(`sqlite3 /data/data/com.apple.android.music/files/mpl_db/accounts.sqlitedb "select storeFront from account;"`).then(Adb.Adb.util.readAll);
  return storefrontIds.find((storeObj) => storeObj.storefrontId === parseInt(storefrontRawOutput.toString().trim().split('-')[0])).code.toLowerCase();
}

async function getAuthParams (adbDevice) {
  const retObj = {
    'dsid': null,
    'accountToken': null,
    'accessToken': null,
    'storefront': null
  }
  retObj.dsid = await getDsid(adbDevice);
  logger.trace(`Auth params obtained: dsid = ${stringUtils.abbreviateString(retObj.dsid.toString(), 20)}`);
  retObj.accountToken = await getAccountToken(adbDevice, retObj.dsid);
  logger.trace(`Auth params obtained: accountToken = ${stringUtils.abbreviateString(retObj.accountToken, 8)}`);
  retObj.accessToken = await getAccessToken(adbDevice);
  logger.trace(`Auth params obtained: accessToken = ${stringUtils.abbreviateString(retObj.accessToken, 15)}`);
  retObj.storefront = await getStorefront(adbDevice);
  logger.trace(`Auth params obtained: storefront = ${stringUtils.abbreviateString(retObj.storefront, 10)}`);
  return retObj;
}

export default { adbInit, injectFrida, getAuthParams };
