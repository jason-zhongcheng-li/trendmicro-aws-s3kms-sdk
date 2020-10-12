import * as assert from 'assert';
import { AwsKMSService, KMSFileOptions } from './../../../../src/services/AwsKMSService';
import { AwsS3Service, S3FileOptions } from './../../../../src/services/AwsS3Service';
import { AwsFileService } from './../../../../src/services/AwsFileService';
import { S3, KMS } from 'aws-sdk';
import testConfig from '../../testConfig';


describe('AwsFileService functional test', () => {
  let s3Service: AwsS3Service;
  let kmsService: AwsKMSService;
  let s3Options: S3FileOptions;
  let kmsOptions: KMSFileOptions;
  let s3: S3;
  let kms: KMS;
  let instance: AwsFileService;
  const bucket: string = 's3-bucket';
  const fileName: string = 'file-name';
  const keys: string[] = ['object-1', 'object-2'];

  beforeEach(() => {

    kmsOptions = {
      KeyId: `${process.env.KEY_ID}`
    };

    s3Options = {
      localDir: `${__dirname}/tmp`
    };

    const config: testConfig = {
      accessKeyId: `${process.env.ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
      region: `${process.env.REGION}`
    };

    s3 = new S3(config);
    kms = new KMS(config);
    s3Service = new AwsS3Service(s3Options, s3);
    kmsService = new AwsKMSService(kmsOptions, kms);
    instance = new AwsFileService(s3Service, kmsService);
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

  it('Should encrypt a summary file for a list of downloaded files', async () => {

    const result = await instance.encryptSummaryFile(bucket, keys, fileName);
    // console.log('result in encrypt = ', result);
  });

  it('Should decrypt a summary file for a list of downloaded files', async () => {
    const fileName = 'file-name';
    const result = await instance.decryptSummaryFile(fileName);
    // const keys = ['key-1.txt\n', 'key-3.jpg\n', 'key-2.pdf\n'];
    // console.log(keys.join('').toString());
    // console.log('result in decrypt = ', result);
    assert.deepStrictEqual(result, keys.join('\n'));
  });
});