import { Flasher } from './flasher';
import { existsSync } from 'node:fs';

const INTERVAL = 1 << 30;

console.log('### START Updater ###');

// Set correct vars
const UC_1_PATH = process.env.UC1_PATH ?? null;
const UC_2_PATH = process.env.UC2_PATH ?? null;

const UC_1_BAUD = process.env.UC1_BAUD ?? '115200';
const UC_2_BAUD = process.env.UC2_BAUD ?? '115200';

const RESET_ONLY = process.env.RESET_ONLY ?? null;
const reset = RESET_ONLY !== null;

// Create
const flashPromises = [];
const path1 = UC_1_PATH ?? null;
const path2 = UC_2_PATH ?? null;

if (path1 !== null && !existsSync(path1)) {
  console.warn(`> UC_1_PATH: [${UC_1_PATH}] not found`);
  process.exit(0);
}

if (path2 !== null && !existsSync(path2)) {
  console.warn(`> UC_2_PATH: [${UC_2_PATH}] not found`);
  process.exit(0);
}

// Check path and files
if (!existsSync('/firmware-uc/firmware-uc.elf') && !reset) {
  console.warn(`> Firmware not found`);
  process.exit(0);
}

// Execute flasher(s)
if (path1 !== null) {
  console.log(`> UC_1_PATH: [${UC_1_PATH}]`);
  const flasher_uc1 = new Flasher(path1, UC_1_BAUD, 1);
  flashPromises.push(flasher_uc1.execute(reset));
}

if (path2 !== null) {
  console.log(`> UC_2_PATH: [${UC_2_PATH}]`);
  const flasher_uc2 = new Flasher(path2, UC_2_BAUD, 2);
  flashPromises.push(flasher_uc2.execute(reset));
}

// Wait for all promises to finish
Promise.all(flashPromises)
  .then(() => {
    console.log('### Flashing done!.. bye bye ###');
  })
  .catch((err) => {
    console.error('main error:', err);
  })
  .finally(() => {
    // Close the process
    process.exit(0);
  });

// To keep the process running
setInterval(() => {}, INTERVAL);
