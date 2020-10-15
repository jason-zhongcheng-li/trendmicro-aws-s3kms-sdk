import * as assert from 'assert';
import { AwsKMSService } from '../../../../src/services/AwsKMSService';
import { AwsS3Service } from '../../../../src/services/AwsS3Service';
import { TrendMicroFileAction, engryptArgs } from './../../../../src/actions/TrendMicroFileAction';
import { expect } from 'chai';
import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');
import { E_NUMBER_OF_PROCESSES_EXEED, E_S3_NO_OBJECTS_IN_BUCKET } from '../../../../src/messages';

describe('TrendMicroFileAction unit test', () => {
  let s3Service: AwsS3Service;
  let kmsService: AwsKMSService;
  let instance: TrendMicroFileAction;
  const bucket: string = 's3-bucket';
  const fileName: string = 'file-name';
  const keys: string[] = ['object-1', 'object-2'];

  beforeEach(() => {
    // make chai be able to handle promise
    chai.use(chaiAsPromised);

    // mock dependency/property/service to call mocked functions
    s3Service = Object.create(AwsS3Service.prototype);
    kmsService = Object.create(AwsKMSService.prototype);

    instance = new TrendMicroFileAction(s3Service, kmsService);
  });

  it('Should download all objects', async () => {
    const expect = ['object-1.txt', 'object-2.jpg'];

    s3Service.getAllKeys = async param => {
      assert.strictEqual(param, bucket);
      return ['object-1.txt', 'object-2.jpg'];
    };

    // it's used to mark the number of function has been called
    let numCalls = 0;

    s3Service.getFile = async (param1, param2) => {

      assert.strictEqual(param1, bucket);

      numCalls++;

      // function is called in a loop so the arguments will be different
      // it is called twrice only due to the length of keys returned by s3Service.getAllKeys
      if (numCalls === 1) {
        assert.strictEqual(param2, expect[0], 'download the first object');
        return 'the-first-object-path';
      } else if (numCalls === 2) {
        assert.strictEqual(param2, expect[1], 'download the second object');
        return 'the-second-object-path';
      }
    };

    const result = await instance.downloadAllObjects(bucket);

    assert.deepStrictEqual(result, expect, 'should be expected keys');

  });

  it('Should batch encrypt at most 4 summary file in parallel', async () => {
    const buckets = ['bucket-1', 'bucket-2', 'bucket-3', 'bucket-4'];
    const expect = buckets.map(bucket => bucket.concat('-downloaded'));
    const argsArr = buckets.map(bucket => {
      return { bucket } as engryptArgs;
    });

    let numCalls = 0;
    instance.encryptSummaryFile = async (param1, param2, param3) => {
      numCalls++;
      assert.strictEqual(param1, buckets[numCalls - 1]);
      return expect[numCalls - 1];
    };

    const result = await instance.batchEncryptSummaryFiles(argsArr);
    assert.deepStrictEqual(result, expect, 'batch results');
  });

  it('Should reject encrypt more than 4 summary file in parallel', async () => {
    const buckets = ['bucket-1', 'bucket-2', 'bucket-3', 'bucket-4', 'bucket-5'];
    const argsArr = buckets.map(bucket => {
      return { bucket } as engryptArgs;
    });

    assert.rejects(async () => await instance.batchEncryptSummaryFiles(argsArr),
      new RegExp(E_NUMBER_OF_PROCESSES_EXEED));
  });

  it('Should encrypt a summary file for a list of downloaded files', async () => {
    const encryptedData = 'XEppcMp4Qa2VBoovOpHSaR9eMPTqScjaeWaTMjQq/o=';

    instance.downloadAllObjects = async param => {
      assert.strictEqual(param, bucket, 'should get keys from bucket');
      return keys;
    };

    kmsService.encrypt = async param => {
      assert.strictEqual(Buffer.isBuffer(param), true);
      return encryptedData;
    };

    s3Service.writeToFileAsync = async (param1, param2) => {
      assert.strictEqual(param2, encryptedData, 'should be encrypted data');
      return fileName;
    };

    const result = await instance.encryptSummaryFile(bucket, [], fileName);
    assert.deepStrictEqual(result, fileName);
  });

  it('Should decrypt a summary file for a list of downloaded files', async () => {
    const encryptedData = 'XEppcMp4Qa2VBoovOpHSaR9eMPTqScjaeWaTMjQq/o=';
    const expect = 'raw-data';

    s3Service.readFromFileAsync = async param => {
      assert.strictEqual(param, fileName, 'should be the file name');
      return encryptedData;
    };

    kmsService.decrypt = async param => {
      assert.strictEqual(param, encryptedData);
      return expect;
    };

    const result = await instance.decryptSummaryFile(fileName);
    assert.deepStrictEqual(result, expect);
  });

  it('Should handle error for s3Service.getAllKeys()', async () => {
    const expectedError = new Error('getAllKeys() error');

    s3Service.getAllKeys = async param => {
      assert.strictEqual(param, bucket);
      throw expectedError;
    };

    await expect(instance.downloadAllObjects(bucket)).to.eventually.deep.equals([]);
  });

  it('Should handle error for empty keys in the bucket', async () => {

    s3Service.getAllKeys = async param => {
      assert.strictEqual(param, bucket);
      return [];
    };

    assert.rejects(async () => await instance.encryptSummaryFile(bucket),
      new RegExp(E_S3_NO_OBJECTS_IN_BUCKET));
  });
});