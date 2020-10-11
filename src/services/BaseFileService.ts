import * as fs from 'fs';
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
  public getTempDir(): string {
    return this.options.localDir;
  }

  /**
   * Save downloaded file to the local path (config in options)
   *
   * @param  {Readable} stream
   * @param  {string} fileName
   * @returns {Promise<string>} return local path where downloaed file saved
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
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}