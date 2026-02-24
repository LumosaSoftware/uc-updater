import { SerialPort } from 'serialport';
import { ShellService } from './shell-service';
const PATH = '/usr/src/app/openocd';

export class Flasher {
  private readonly _settings: UartCommServiceOptions;
  private readonly _uart: SerialPort;

  constructor(path: string, baud: string, connectorId: 1 | 2) {
    this._settings = {
      port: path,
      baud: parseInt(baud),
      connectorId: connectorId,
    };

    this._uart = new SerialPort({
      path: this._settings.port,
      baudRate: this._settings.baud,
    });
  }

  /**
   * Execute the flasher process
   * Reset UC first than program it
   */
  public async execute(resetOnly = false): Promise<void> {
    // Check path and baud
    if (!this._settings.port || !this._settings.baud) {
      console.error(
        `> Invalid path or baud: [${this._settings.port}, ${this._settings.baud}]`
      );
      return Promise.reject(new Error('Invalid path or baud'));
    }

    // Open port
    await this.waitPortOpened();

    // Port open, execute reset
    console.log('> Connected, execute reset');

    const shell = new ShellService();

    // Reset UC
    const reset_cmd = `openocd -f ${PATH}/reset-uc${this._settings.connectorId}.cfg`;
    const reset_response = await shell.execute(reset_cmd).catch((err) => {
      console.error(`> Reset uc-${this._settings.connectorId} error: [${err}]`);
      throw err;
    });
    console.debug(
      `> Reset uc-${this._settings.connectorId}: ${reset_response}`
    );

    if (!resetOnly) {
      // Program UC
      const program_cmd = `openocd -f ${PATH}/program-uc${this._settings.connectorId}.cfg`;
      const program_response = await shell.execute(program_cmd).catch((err) => {
        console.error(
          `> Program uc-${this._settings.connectorId} error: [${err}]`
        );
        throw err;
      });
      console.debug(
        `> program uc-${this._settings.connectorId}: ${program_response}`
      );
    } else {
      console.log(`> Reset only`);
    }
  }

  /**
   * Try to open the serial port
   */
  private waitPortOpened(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._uart
        .on('open', () => {
          console.log(`uart port x open!`);
          this._uart.flush();
          resolve(true);
        })
        .on('error', (error) => {
          console.log(`uart open error: ${error}`);
          reject(new Error(`uart connection error`));
        })
        .on('close', () => {
          console.log(`uart port x closed!`);
        });
    });
  }
}

export interface UartCommServiceOptions {
  port: string;
  baud: number;
  connectorId: 1 | 2;
}
