import fs from 'fs';

const config = JSON.parse(await fs.promises.readFile('config/config.json', 'utf-8'));

export default config;
