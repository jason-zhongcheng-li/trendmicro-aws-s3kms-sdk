import * as assert from 'assert';
import * as fs from 'fs';
import { FileOptions, BaseFileService } from '../../../../src/services/BaseFileService';

describe('BaseFileService unit test', () => {
  let options: FileOptions;
  let instance: BaseFileService;

  beforeEach(() => {
    options = {
      tmpDir: ''
    } as FileOptions;

    instance = new BaseFileService(options);
  });

  it('should throw if no temp directory is found or readable', () => {
    assert.throws(() => {
      instance = new BaseFileService({
        tmpDir: ''
      });
    });


    fs.mkdirSync('');

    assert.doesNotThrow(() => {
      instance = new BaseFileService({
        tmpDir: ''
      });
    });
  });



});