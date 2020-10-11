import * as fs from 'fs';
import * as path from 'path';
import { F_OK } from 'constants';
import { E_TMPDIR_UNDEFINED, E_TMPDIR_UNWRITABLE } from '../messages';
import { Readable } from 'stream';

export interface FileOptions {
  tmpDir: string;
}

export class BaseFileService<O extends FileOptions> {
  constructor(private options: O) {
    if (!options.tmpDir) {
      throw new Error(E_TMPDIR_UNDEFINED);
    }

    try {
      fs.accessSync(options.tmpDir, F_OK);
    } catch (e) {
      throw new Error(E_TMPDIR_UNWRITABLE);
    }
  }

  public getOptions(): O {
    return this.options;
  }

  public getTempDir(): string {
    return this.options.tmpDir;
  }

  public async saveToTempDir(stream: Readable, fileName: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const dest: string = path.join(this.options.tmpDir, fileName);
      stream
        .pipe(fs.createWriteStream(dest))
        .on('close', () => resolve(dest))
        .on('error', (err: Error) => reject(err));
    });
  }

  public async cleanUpTempFile(fileName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const dest: string = path.join(this.options.tmpDir, fileName);

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
