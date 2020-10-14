import * as fs from 'fs';
import { DateTime } from 'luxon';
import * as path from 'path';
import { F_OK } from 'constants';
import { Readable } from 'stream';
import { E_LOCALDIR_UNDEFINED, E_LOCALDIR_UNWRITABLE, E_FILE_EXIST } from '../messages';

export interface FileOptions {
  localDir: string;
}

export class BaseFileService<O extends FileOptions> {
  constructor(private options: O) {
    if (!options.localDir) {
      throw new Error(E_LOCALDIR_UNDEFINED);
    }

    try {
      fs.accessSync(options.localDir, F_OK);
    } catch (e) {
      throw new Error(E_LOCALDIR_UNWRITABLE);
    }
  }

  /**
   * @returns O
   */
  public getOptions(): O {
    return this.options;
  }

  /**
   * @returns string
   */
  public getLocalDir(): string {
    return this.options.localDir;
  }

  /**
   * Save downloaded file to the local path (config in options)
   *
   * @param  {Readable} stream
   * @param  {string} fileName
   * @returns {Promise<string>} return local path where downloaed file is saved
   */
  public async saveToLocalDir(stream: Readable, fileName: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const dest: string = this.concatFullPath(fileName);

      // A readable stream to be piped into the destination
      stream
        .pipe(fs.createWriteStream(dest))
        .on('close', () => resolve(dest))
        .on('error', (err: Error) => reject(err));
    });
  }


  /**
   * Custom read file async function.
   * Although fs.readFile() is an async function, additional logic is needed to promisify
   *
   * @param  {string} fileName
   * @returns {Promise<string>} return plain data in the file
   */
  public async readFromFileAsync(fileName: string): Promise<string> {

    const dest = this.concatFullPath(fileName);

    return new Promise<string>((resolve, reject) => {
      fs.readFile(dest, async (err, data) => {
        if (!!err) {
          console.error('Read file error in BaseFileService class');
          reject(err);
        } else {
          resolve(data.toString());
        }
      });
    });
  }


  /**
   * Custom write file async function.
   * Although fs.readFile() is an async function, additional logic is needed to promisify
   *
   * @param  {string} fileName
   * @param  {string} data - Data to be written into the file
   * @param  {boolean=true} replace - Should replace existing file or not
   */
  public async writeToFileAsync(fileName: string, data: string, replace: boolean = true): Promise<string> {

    const dest = this.concatFullPath(fileName);

    // If replace is false, we need to check if file with same file name exists or not
    if (!replace) {
      const fileExist = await this.isFileExistAsync(dest)
        .catch(err => {
          // have to handled rejection by rejecting a promise
          return new Promise<boolean>(rej => rej(err));
        });

      // In this case we dont allow to replace existing file
      if (fileExist) {
        return new Promise<string>((resolve, reject) => {
          reject(E_FILE_EXIST);
        });
      }
    }

    return new Promise<string>((resolve, reject) => {
      fs.writeFile(dest, data, err => {
        if (!!err) {
          console.error('Write file error: ', err);
          reject(err);
        } else {
          resolve(fileName);
        }
      });
    });
  }

  /**
   * Clean up local files
   *
   * @param  {string} fileName
   * @returns {Promise<void>}
   */
  public async cleanUpLocalFile(fileName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const dest: string = path.join(this.options.localDir, fileName);

      // delete file in the destination
      fs.unlink(dest, (err: Error) => {
        if (!!err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Validate if file exist in destination
   * @param  {string} path
   */
  private isFileExistAsync(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      fs.exists(path, exists => {
        resolve(exists);
      });
    });
  }

  /**
   * Concatenate full path fo the file we are going to read/write
   * @param  {string} fileName
   */
  private concatFullPath(fileName: string): string {
    return path.join(this.options.localDir, fileName);
  }
}