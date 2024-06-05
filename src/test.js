import readline from 'readline';

import appConfig from './utils/config.js';
import logger from './utils/logger.js';
import adbUtils from './utils/adb.js';
import urlUtils from './utils/url.js';

async function mainCmdHandler (argv) {
  // logger.trace('test.js mainCmdHandler initialized');
  const adbDevice = await adbUtils.adbInit();
  await adbUtils.injectFrida(adbDevice);
  urlUtils.parseUrl(argv.url);
  const authParams = await adbUtils.getAuthParams(adbDevice);
}

export default mainCmdHandler;
