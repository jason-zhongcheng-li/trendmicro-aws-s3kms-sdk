import * as assert from 'assert';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import { F_OK } from 'constants';
import { Readable } from 'stream';
import { FileOptions, BaseFileService } from '../../../../src/services/BaseFileService';
import { E_LOCALDIR_UNDEFINED, E_LOCALDIR_UNWRITABLE } from '../../../../src/messages';

describe('BaseFileService functional test', () => {
  let options: FileOptions;
  let instance: BaseFileService<FileOptions>;
  const TEST_FILE = __dirname + '/file.txt';

  beforeEach(() => {
    options = {
      localDir: `${__dirname}/tmp`
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
      instance = new BaseFileService({ localDir: '' });
    }, new RegExp(E_LOCALDIR_UNDEFINED));

    assert.throws(() => {
      instance = new BaseFileService({
        localDir: instance.getTempDir() + '/trash'
      });
    }, new RegExp(E_LOCALDIR_UNWRITABLE));


    fs.mkdirSync(instance.getTempDir() + '/trash');

    assert.doesNotThrow(() => {
      instance = new BaseFileService({
        localDir: instance.getTempDir() + '/trash'
      });
    });
  });

  it('Should save file to temp dir', async () => {
    const expect = `${instance.getTempDir()}/test-file.txt`;

    const stream = new Readable({ objectMode: true });

    stream._read = () => {
      stream.push('abc123');
      stream.push(null);
    };

    const result = await instance.saveToLocalDir(stream, 'test-file.txt');
    assert.doesNotThrow(exists);
    assert.strictEqual(expect, result);
  });

  it('Should clean up a temp file', done => {

    fs.writeFileSync(`${instance.getTempDir()}/test-file.txt`, 'Test content');
    assert.doesNotThrow(exists);

    instance
      .cleanUpLocalFile('test-file.txt')
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