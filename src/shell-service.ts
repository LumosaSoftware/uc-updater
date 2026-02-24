import { exec, ChildProcess } from 'child_process';

export class ShellService {
  private _timer: NodeJS.Timeout | undefined;
  private _runningProcess: ChildProcess | undefined;
  private readonly _timeout: number = 5000;
  private readonly _path = `${__dirname}`;

  /**
   * Execute a shell command and return the response
   * @param command Command to be executed
   * @returns Response of the command
   */
  public execute(command: string): Promise<string> {
    clearTimeout(this._timer);
    console.info(`Executing: ${command}`);
    return this.startChildProcess(command);
  }

  /**
   * creates a child process to execute shell command
   * @param command instruction to be executed
   * @returns stdoud after command execution
   */
  private async startChildProcess(command: string): Promise<string> {
    // Build the promises, one for the child process and one for the timeout
    const processPromise = this.buildChildProcessPromise(command);
    const timeoutPromise = this.buildTimeoutPromise();

    // Execute the promises
    const result = await Promise.race([processPromise, timeoutPromise]);

    this._runningProcess = undefined;
    return result;
  }

  /**
   * Builds a promise for the child process execution
   * @param command Command to be executed
   * @returns stdoud
   */
  private buildChildProcessPromise(command: string) {
    return new Promise<string>((resolve, reject) => {
      this._runningProcess = exec(
        command,
        { cwd: this._path },
        (error, stdout, stderr) => {
          if (error) {
            console.error(
              `context=${this.constructor.name} command=${command}, exception=${JSON.stringify(error)}, folder=${this._path}`
            );
            console.error(
              `context=${this.constructor.name} error_stdout=${stdout}`
            );
            console.error(
              `context=${this.constructor.name} error_stderr=${stderr}`
            );
            reject(error);
          }

          let response = stdout ?? '';
          if (this.pipeStdErrToStdOut() && stderr) {
            response += stderr;
          }
          console.debug(
            `context=${this.constructor.name} command=${command}, response=${response}`
          );
          resolve(response);
        }
      );
    });
  }

  /**
   * Pipes stderr data to the output response of child process execution.
   * When set to true, when receives a stderr will pipe data to stdout and return contents of both
   * @returns
   */
  protected pipeStdErrToStdOut(): boolean {
    return true;
  }

  /**
   * Timeout promise for the child process execution
   */
  private buildTimeoutPromise() {
    return new Promise<string>((resolve, reject) => {
      this._timer = setTimeout(() => {
        this._runningProcess?.kill();
        reject(new Error('AbstractShellCommandHandlerService Timeout!!'));
      }, this._timeout);
    });
  }
}
