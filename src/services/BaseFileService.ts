import * as fs from 'fs';
import { F_OK } from 'constants';
import { E_TMPDIR_UNDEFINED, E_TMPDIR_UNWRITABLE } from '../messages';

export interface FileOptions {
  tmpDir: string;
}

export class BaseFileService {
  constructor(private options: FileOptions) {
    if (!options.tmpDir) {
      throw new Error(E_TMPDIR_UNDEFINED);
    }

    try {
      fs.accessSync(options.tmpDir, F_OK);
    } catch (e) {
      throw new Error(E_TMPDIR_UNWRITABLE);
    }
  }

  public getTempDir(): string {
    return this.options.tmpDir;
  }

  public async saveToTempDir(txt: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {

    });
  }

  public async cleanUpTempFile(fileName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {

    });
  }


}
