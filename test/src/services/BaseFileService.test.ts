import { BaseFileService, FileOptions } from './../../../src/services/BaseFileService';
import * as assert from 'assert';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import { F_OK } from 'constants';
import { E_TMPDIR_UNDEFINED, E_TMPDIR_UNWRITABLE } from '../../../src/messages';



describe.only('BaseFileService functional test', () => {
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

  it('Should throw if no temp directory is found or readable', () => {

    assert.throws(() => {
      instance = new BaseFileService({ tmpDir: '' });
    }, new RegExp(E_TMPDIR_UNDEFINED));

    assert.throws(() => {
      instance = new BaseFileService({
        tmpDir: instance.getTempDir() + '/trash'
      });
    }, new RegExp(E_TMPDIR_UNWRITABLE));


    fs.mkdirSync(instance.getTempDir() + '/trash');

    assert.doesNotThrow(() => {
      instance = new BaseFileService({
        tmpDir: instance.getTempDir() + '/trash'
      });
    });
  });

  it('Should save file to temp dir', async () => {
    const expect = `${instance.getTempDir()}/test-file.txt`;
    const result = await instance.saveToTempDir('Test content', 'test-file.txt');
    assert.doesNotThrow(exists);
    assert.strictEqual(expect, result);
  });

  it('Should clean up a temp file', done => {

    fs.writeFileSync(`${instance.getTempDir()}/test-file.txt`, 'Test content');
    assert.doesNotThrow(exists);

    instance
      .cleanUpTempFile('test-file.txt')
      .then(() => {
        assert.throws(exists);
        done();
      })
      .catch(done);
  });

  function exists() {
    fs.accessSync(instance.getTempDir() + '/test-file.txt', F_OK);
  }


});