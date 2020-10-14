import * as assert from 'assert';
import { testConfig } from './../../testConfig';
import { KMSFileOptions, AwsKMSService } from './../../../../src/services/AwsKMSService';
import { KMS } from 'aws-sdk';

describe('AwsKMSService function test', () => {
  let options: KMSFileOptions;
  let kms: KMS;
  let instance: AwsKMSService;
  const plainText = 'def456';

  beforeEach(() => {
    options = {
      KeyId: `${process.env.KEY_ID}`
    };

    // config AWS options with credentials in .env
    const config = {
      accessKeyId: `${process.env.ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
      region: `${process.env.REGION}`
    } as testConfig;

    // create KMS instance
    kms = new KMS(config);

    instance = new AwsKMSService(options, kms);
  });


  it('should encrypt and decrypt plain text', async () => {

    // convert string value to buffer
    const buffData = Buffer.from(plainText);

    // encrypt buffer data
    const data = await instance.encrypt(buffData);

    assert.strictEqual(data.length > 0, true, 'should get encrypt data');

    // decrypt data returned by instance.encrypt() function above
    const result = await instance.decrypt(data);

    assert.strictEqual(result, plainText, 'should be plain text');
  });
});