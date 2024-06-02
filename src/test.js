import readline from 'readline';

import appConfig from './utils/config.js';
import logger from './utils/logger.js';
import adbUtils from './utils/adb.js';

async function mainCmdHandler (argv) {
  // logger.trace('test.js mainCmdHandler initialized');
  await adbUtils.adbInit();
  // const readlineIF = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout
  // });
  
  // readlineIF.question('何かキーを押して続行してください...', () => {
  //   readlineIF.close();
  // });
}

export default mainCmdHandler;
