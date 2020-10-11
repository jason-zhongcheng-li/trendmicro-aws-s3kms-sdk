import { BaseFileService, FileOptions } from './../../../src/services/BaseFileService';
import * as assert from 'assert';
import * as fs from 'fs';
import * as rimraf from 'rimraf';

describe('BaseFileService unit test', () => {
  let options: FileOptions;
  let instance: BaseFileService;
  const TEST_FILE = __dirname + '/file.txt';

  beforeEach(() => {
    options = {
      tmpDir: `${__dirname}/tmp`
    } as FileOptions;

    instance = new BaseFileService(options);
  });

  afterEach(() => {
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
    }

    if (fs.existsSync(instance.getTempDir() + '/trash')) {
      rimraf.sync(instance.getTempDir() + '/trash');
    }
  });

  it('should throw if no temp directory is found or readable', () => {
    assert.throws(() => {
      instance = new BaseFileService({
        tmpDir: instance.getTempDir() + '/trash'
      });
    });


    fs.mkdirSync(instance.getTempDir() + '/trash');

    assert.doesNotThrow(() => {
      instance = new BaseFileService({
        tmpDir: instance.getTempDir() + '/trash'
      });
    });
  });



});