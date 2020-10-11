import { KMSFileOptions } from './../../../src/services/AwsKMSService';
import { KMS } from 'aws-sdk';
import * as assert from 'assert';
import { AwsKMSService } from '../../../src/services/AwsKMSService';
import { E_KMS_KEYID_UNDEFINED } from '../../../src/messages';

describe.only('AwsKMSService unit test', () => {
  let options: KMSFileOptions;
  let kms: KMS;
  let instance: AwsKMSService;

  beforeEach(() => {
    options = {
      KeyId: 'key-id',
      localDir: __dirname + '/tmp'
    } as KMSFileOptions;
    kms = {} as KMS;
    instance = new AwsKMSService(options, kms);

  });

  it('should throw if `options.KeyId` is missing in the constructor', () => {
    assert.throws(() => {
      instance = new AwsKMSService({ KeyId: '', localDir: __dirname + '/tmp' } as KMSFileOptions, kms);
    }, new RegExp(E_KMS_KEYID_UNDEFINED));
  });

  it('should encrypt raw data', async () => {
    const expect: string = '';
    const data: Buffer = Buffer.from('test-data', 'utf-8');

    const result = await instance.encrypt(data);
    assert.strictEqual(result, expect);
  });

  it.skip('should decrypt encrypted data to raw data', async () => {
    const expect: string = '';
    const data: string = 'test-data';

    const result = await instance.decrypt(data);
    assert.strictEqual(result, expect);
  });
});