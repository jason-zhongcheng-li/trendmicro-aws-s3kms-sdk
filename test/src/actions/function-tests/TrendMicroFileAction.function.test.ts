import * as assert from 'assert';
import * as sysPath from 'path';
import * as fs from 'fs';
import { AwsS3Service, S3FileOptions } from './../../../../src/services/AwsS3Service';
import { testConfig } from './../../testConfig';
import { KMSFileOptions, AwsKMSService } from './../../../../src/services/AwsKMSService';
import { KMS, S3 } from 'aws-sdk';
import { TrendMicroFileAction } from '../../../../src/actions/TrendMicroFileAction';

describe('TrendMicroFileAction function test', () => {
  let kmsOptions: KMSFileOptions;
  let kmsService: AwsKMSService;
  let s3Options: S3FileOptions;
  let s3Service: AwsS3Service;
  let instance: TrendMicroFileAction;
  const fileName = '_path_to_object';
  const bucket = `${process.env.BUCKET}`;
  let keys: string[];
  let summaryFileName: string;

  beforeEach(() => {
    kmsOptions = {
      KeyId: `${process.env.KEY_ID}`
    };

    s3Options = {
      localDir: `${__dirname}/tmp`
    };

    // config AWS options with credentials in .env
    const config: testConfig = {
      accessKeyId: `${process.env.ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
      region: `${process.env.REGION}`
    };

    // create kms instance to wire up AwsKMSService
    const kms = new KMS(config) as KMS;
    kmsService = new AwsKMSService(kmsOptions, kms);

    // create s3 instance to wire up AwsS3Service
    const s3 = new S3(config) as S3;
    s3Service = new AwsS3Service(s3Options, s3);

    instance = new TrendMicroFileAction(s3Service, kmsService);

    // Use a synchronous function provided by fs for debug/testing only
    fs.writeFileSync(sysPath.join(s3Options.localDir, fileName), 'def456');

  });


  it('should download all objects and get keys', async () => {
    const result = await instance.downloadAllObjects(bucket);
    assert.strictEqual(result.length > 0, true);

    // assign result (array of the keys) to keys variable to be used in following tests
    keys = result;
  });

  it('should encrypt', async () => {
    const result = await instance.encryptSummaryFile(bucket, keys);

    // assign result to summaryFileName variable to be used in following tests
    summaryFileName = result;
  });

  it('should decrypt', async () => {
    const expected = keys.join('\n');

    const result = await instance.decryptSummaryFile(summaryFileName);

    assert.strictEqual(result, expected);
  });


});