import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import appConfig from './utils/config.js';
import testMainCmdHandler from './test.js';

async function parseCommand () {
  yargs(hideBin(process.argv))
    .command({
      'command': 'test [url]',
      // 'aliases': ['tst'],
      'desc': 'Test command',
      'builder': (yargs) => {
        yargs
          .positional('url', {
            'desc': 'Apple Music URL',
            'type': 'string'
          })
          .demandOption(['url'])
      },
      'handler': async (argv) => {
        await testMainCmdHandler(argv);
      }
    })
    .scriptName(appConfig.base.appName)
    .usage('$0 <command> [argument] [option]')
    .epilogue(appConfig.base.appCopyrightShort)
    .help()
    .version()
    .demandCommand(1)
    .strict()
    .recommendCommands()
    .parse()
    .argv;
}


export default parseCommand;
