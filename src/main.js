#!/usr/bin/env node

import clear from 'clear';
clear();
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import logger from './utils/logger.js';
import parseCommand from './cmd.js';


parseCommand();

