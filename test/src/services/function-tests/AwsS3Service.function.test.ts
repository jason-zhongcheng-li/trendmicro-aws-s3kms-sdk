import { S3FileOptions, AwsS3Service } from './../../../../src/services/AwsS3Service';

import { S3 } from 'aws-sdk';
import * as path from 'path';
import * as assert from 'assert';

import AWS = require('aws-sdk');
import { testConfig } from '../../testConfig';

describe('AwsS3Service functional test', async () => {
  let options: S3FileOptions;
  let instance: AwsS3Service;
  let s3: S3;
  let key: string;
  let bucket: string;

  before(() => {

    bucket = `${process.env.BUCKET}`;

    options = {
      localDir: `${__dirname}/tmp`
    };
    const config: testConfig = {
      accessKeyId: `${process.env.ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
      region: `${process.env.REGION}`
    };

    // Create S3 service object
    s3 = new AWS.S3(config);

    instance = new AwsS3Service(options, s3);
  });


  it('should get objects key', async () => {
    const result = await instance.getAllKeys(bucket);

    assert.strictEqual(result.length > 0, true);

    // set key for getFile function test
    key = result[0];
  });

  it('should get file', async () => {
    const expect = path.join(options.localDir, key);
    const result = await instance.getFile(bucket, key);

    assert.strictEqual(result, expect);
  });
});