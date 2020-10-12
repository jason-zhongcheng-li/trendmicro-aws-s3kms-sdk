import * as fs from 'fs';
import { DateTime } from 'luxon';
import * as path from 'path';
import { F_OK } from 'constants';
import { Readable } from 'stream';
import { E_LOCALDIR_UNDEFINED, E_LOCALDIR_UNWRITABLE } from '../messages';

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
      const dest: string = path.join(this.options.localDir, fileName);

      // A readable stream to be piped into the destination
      stream
        .pipe(fs.createWriteStream(dest))
        .on('close', () => resolve(dest))
        .on('error', (err: Error) => reject(err));
    });
  }

  // TODO: remove? not in use?
  /**
   * @param  {string[]} array
   * @param  {string} fileName? - optional args
   * @returns {Promise<string>} return local path where summary file is saved
   */
  public async writeArrayToLocalDir(array: string[], fileName?: string): Promise<string> {

    if (!fileName) {
      const nowStr = DateTime.local().toFormat('yyyy-MM-dd_hh-mm-ss');
      fileName = nowStr.concat('_ObjectLists.txt');
    }

    const dest = path.join(this.options.localDir, fileName);
    const writeStream = fs.createWriteStream(dest);

    return new Promise<string>((resolve, reject) => {
      // write each value of the array on the file breaking line
      array.forEach(value => writeStream.write(`${value}\n`));

      // the finish event is emitted when all data has been flushed from the stream
      writeStream.on('finish', () => {
        resolve(dest);
      });

      // handle the errors on the write process
      writeStream.on('error', err => {
        reject(err);
      });

      // close the stream
      writeStream.end();
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
}