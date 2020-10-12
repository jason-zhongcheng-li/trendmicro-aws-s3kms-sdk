import { testConfig } from './../../testConfig';
import { KMSFileOptions, AwsKMSService } from './../../../../src/services/AwsKMSService';
import { KMS } from 'aws-sdk';
import * as assert from 'assert';
import * as sysPath from 'path';
import * as fs from 'fs';

describe('AwsKMSService function test', () => {
  let options: KMSFileOptions;
  let kms: KMS;
  let instance: AwsKMSService;
  const fileName = '_path_to_object';
  let localDir: string;

  beforeEach(() => {
    options = {
      KeyId: `${process.env.KEY_ID}`
    };

    localDir = `${__dirname}/tmp`;

    const config = {
      accessKeyId: `${process.env.ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
      region: `${process.env.REGION}`
    } as testConfig;

    kms = new KMS(config) as KMS;

    instance = new AwsKMSService(options, kms);

    // Use a synchronous function for debug/testing only
    fs.writeFileSync(sysPath.join(localDir, fileName), 'def456');

  });


  it('should encrypt', async () => {

    const filePath = sysPath.join(localDir, fileName);
    const rawData = fs.readFileSync(filePath);
    const data = await instance.encrypt(rawData);
    const path = sysPath.join(localDir, 'encrypt.txt');

    // Use a synchronous function for debug/testing only
    fs.writeFileSync(path, data);

    assert.strictEqual(data.length > 0, true);
  });

  it('should decrypt', async () => {

    const filePath = sysPath.join(localDir, 'encrypt.txt');

    // Use a synchronous function for debug/testing only
    const rawData = fs.readFileSync(filePath, 'utf-8');

    const result = await instance.decrypt(rawData);

    assert.strictEqual(result, 'def456');
  });


});