import * as assert from 'assert';
import * as path from 'path';
import { S3 } from 'aws-sdk';
import { S3FileOptions, AwsS3Service } from '../../../src/services/AwsS3Service';
import { testConfig } from '../../testConfig';


describe('AwsS3Service functional test', async () => {
  let options: S3FileOptions;
  let instance: AwsS3Service;
  let s3: S3;
  let key: string;
  let bucket: string;

  beforeEach(() => {

    bucket = `${process.env.BUCKET}`;

    options = {
      localDir: `${__dirname}/tmp`
    };

    // config AWS options with credentials in .env
    const config: testConfig = {
      accessKeyId: `${process.env.ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
      region: `${process.env.REGION}`
    };

    // Create S3 instance
    s3 = new S3(config);

    instance = new AwsS3Service(options, s3);
  });


  it('should get objects key', async () => {
    const result = await instance.getAllKeys(bucket);

    assert.strictEqual(result.length > 0, true, 'should a list of keys');

    // set key for getFile Functional test
    key = result[0];
  });

  it('should get file', async () => {
    const expect = path.join(options.localDir, key);
    const result = await instance.getFile(bucket, key);

    assert.strictEqual(result, expect, 'should get local full path of downloaded file');
  });
});