import * as assert from 'assert';
import { AwsKMSService } from './../../../../src/services/AwsKMSService';
import { AwsS3Service } from './../../../../src/services/AwsS3Service';
import { FileService } from './../../../../src/services/FileService';


describe('FileService functional test', () => {
  let s3Service: AwsS3Service;
  let kmsService: AwsKMSService;
  let instance: FileService;
  const bucket: string = 's3-bucket';
  const fileName: string = 'file-name';
  const keys: string[] = ['object-1', 'object-2'];

  beforeEach(() => {

    s3Service = Object.assign(AwsS3Service.prototype);
    kmsService = Object.assign(AwsKMSService.prototype);

    instance = new FileService(s3Service, kmsService);
  });

  it('Should download all objects', async () => {
    const expect = ['object-1.txt', 'object-2.jpg'];

    s3Service.getAllKeys = async param => {
      assert.strictEqual(param, bucket);
      return ['object-1.txt', 'object-2.jpg'];
    };

    let numCalls = 0;

    s3Service.getFile = async (param1, param2) => {

      assert.strictEqual(param1, bucket);

      numCalls++;

      if (numCalls === 1) {
        assert.strictEqual(param2, expect[0], 'download the first object');
        return 'the-first-object-path';
      } else {
        assert.strictEqual(param2, expect[1], 'download the second object');
        return 'the-second-object-path';
      }
    };

    const result = await instance.downloadAllObjects(bucket);

    assert.deepStrictEqual(result, expect);

  });

  it('Should encrypt a summary file for a list of downloaded files', () => {

    const result = instance.encryptSummaryFile(bucket, keys, fileName);
  });

  it('Should decrypt a summary file for a list of downloaded files', () => {
    const fileName = 'file-name';
    const result = instance.decryptSummaryFile(fileName);
  });
});