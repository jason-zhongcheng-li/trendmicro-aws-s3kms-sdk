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

  public getOptions(): O {
    return this.options;
  }

  public getTempDir(): string {
    return this.options.localDir;
  }

  public async saveToLocalDir(stream: Readable, fileName: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const dest: string = path.join(this.options.localDir, fileName);
      stream
        .pipe(fs.createWriteStream(dest))
        .on('close', () => resolve(dest))
        .on('error', (err: Error) => reject(err));
    });
  }

  public async cleanUpLocalFile(fileName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const dest: string = path.join(this.options.localDir, fileName);

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
