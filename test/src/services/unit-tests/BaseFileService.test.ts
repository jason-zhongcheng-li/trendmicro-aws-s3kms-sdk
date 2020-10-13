import * as assert from 'assert';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import { F_OK } from 'constants';
import { Readable } from 'stream';
import { FileOptions, BaseFileService } from '../../../../src/services/BaseFileService';
import { E_LOCALDIR_UNDEFINED, E_LOCALDIR_UNWRITABLE, E_FILE_EXIST } from '../../../../src/messages';

describe('BaseFileService unit test', () => {
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

    if (fs.existsSync(instance.getLocalDir() + '/trash')) {
      rimraf.sync(instance.getLocalDir() + '/trash');
    }
  });

  it('Should throw if no temp directory is found or readable', () => {

    assert.throws(() => {
      instance = new BaseFileService({ localDir: '' });
    }, new RegExp(E_LOCALDIR_UNDEFINED));

    assert.throws(() => {
      instance = new BaseFileService({
        localDir: instance.getLocalDir() + '/trash'
      });
    }, new RegExp(E_LOCALDIR_UNWRITABLE));


    fs.mkdirSync(instance.getLocalDir() + '/trash');

    assert.doesNotThrow(() => {
      instance = new BaseFileService({
        localDir: instance.getLocalDir() + '/trash'
      });
    });
  });

  it('Should save file to local dir', async () => {
    const expect = `${instance.getLocalDir()}/test-file.txt`;

    const stream = new Readable({ objectMode: true });

    stream._read = () => {
      stream.push('abc123');
      stream.push(null);
    };

    const result = await instance.saveToLocalDir(stream, 'test-file.txt');
    assert.doesNotThrow(() => exists('test-file.txt'));
    assert.strictEqual(expect, result);
  });

  it('Should async write a file', async () => {
    const expect = 'Should async write a file';
    const fileName = 'async_write_file_name.txt';

    const result = await instance.writeToFileAsync(fileName, expect);

    assert.strictEqual(result, fileName);
  });

  it('Should throw error if async write an exist file with no replace', async () => {
    const expect = 'Should async write a file';
    const fileName = 'async_write_file_name.txt';

    assert.rejects(async () => {
      await instance.writeToFileAsync(fileName, expect, false);
    }, new RegExp(E_FILE_EXIST));

  });

  it('Should clean up a temp file', done => {

    // Use a synchronous function for debug/testing only
    fs.writeFileSync(`${instance.getLocalDir()}/test-file.txt`, 'Test content');
    assert.doesNotThrow(() => exists('test-file.txt'));

    instance
      .cleanUpLocalFile('test-file.txt')
      .then(() => {
        assert.throws(() => exists('test-file.txt'));
        done();
      })
      .catch(done);
  });

  function exists(fileName: string) {
    fs.accessSync(instance.getLocalDir().concat('/', fileName), F_OK);
  }


});