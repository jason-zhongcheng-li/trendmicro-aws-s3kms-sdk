import { testConfig } from './../testConfig';

import { KMS } from 'aws-sdk';
import { KMSFileOptions } from './../../../src/services/AwsKMSService';
import * as assert from 'assert';
import * as sysPath from 'path';
import * as fs from 'fs';
import AWS = require('aws-sdk');
import { AwsKMSService } from '../../../src/services/AwsKMSService';

describe('AwsKMSService functional', () => {
  let options: KMSFileOptions;
  let kms: KMS;
  let instance: AwsKMSService;
  const fileName = '_path_to_object';

  beforeEach(() => {
    // options = { defaultConfig } as S3FileOptions;
    options = {
      KeyId: `${process.env.KEY_ID}`,
      localDir: `${__dirname}/tmp`
    };
    // console.log('options = ', options);

    const config = {
      accessKeyId: `${process.env.ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
      Bucket: `${process.env.BUCKET}`,
      region: `${process.env.REGION}`
    } as testConfig;

    kms = new AWS.KMS(config) as KMS;
    // console.log(s3);
    instance = new AwsKMSService(options, kms);

  });


  it('should encrypt', async () => {
    setTimeout(() => {
      // console.log('start');
    }, 1000);
    const filePath = sysPath.join(options.localDir, fileName);
    const rawData = fs.readFileSync(filePath);
    const data = await instance.encrypt(rawData);
    const path = sysPath.join(options.localDir, 'encrypt.txt');
    fs.writeFileSync(path, data);

    assert.strictEqual(data.length > 0, true);
  });

  it('should decrypt', async () => {
    setTimeout(() => {
      // console.log('start');
    }, 2000);
    const filePath = sysPath.join(options.localDir, 'encrypt.txt');
    // console.log('filePath = ', filePath);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const result = await instance.decrypt(rawData);

    assert.strictEqual(result, 'abc123');
  });


});