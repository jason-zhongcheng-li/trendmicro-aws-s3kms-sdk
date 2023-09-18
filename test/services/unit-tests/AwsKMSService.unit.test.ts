import { KMS, Request } from 'aws-sdk';
import * as assert from 'assert';
import { CiphertextType, EncryptResponse, DecryptResponse } from 'aws-sdk/clients/kms';
import { AwsKMSService, KMSFileOptions } from '../../../src/services/AwsKMSService';
import { E_KMS_KEYID_UNDEFINED } from '../../../src/messages';

describe('AwsKMSService unit test', async () => {
  let options: KMSFileOptions;
  let kms: KMS;
  let instance: AwsKMSService;
  let CiphertextBlob: CiphertextType;
  let Plaintext: string;

  beforeEach(() => {
    options = {
      KeyId: 'key-id',
      localDir: `${__dirname}/tmp`
    } as KMSFileOptions;

    // mock dependency/property/service to call mocked functions
    kms = Object.create(KMS.prototype);
    CiphertextBlob = Object.create(Buffer.prototype);
    Plaintext = Object.create(String.prototype);

    instance = new AwsKMSService(options, kms);
  });

  it('should throw if `options.KeyId` is missing in the constructor', () => {
    assert.throws(() => {
      instance = new AwsKMSService({ KeyId: '', localDir: __dirname + '/tmp' } as KMSFileOptions, kms);
    }, new RegExp(E_KMS_KEYID_UNDEFINED));
  });

  it('should encrypt raw data', async () => {
    const expect: string = 'OMgoNDMpVOIuDmMNlvviw9Jk+K1zBTYUYbEA==';
    const data: Buffer = Buffer.from('test-data', 'base64');

    // mock kms.encrypt function and return a mocked callback function named promise()
    kms.encrypt = () => {
      const res: EncryptResponse = { CiphertextBlob };

      return <Request<any, any>>{
        promise: () => res
      };
    };

    CiphertextBlob.toString = () => {
      return 'OMgoNDMpVOIuDmMNlvviw9Jk+K1zBTYUYbEA==';
    };

    const result = await instance.encrypt(data);
    assert.strictEqual(result, expect);
  });

  it('should decrypt encrypted data to raw data', async () => {
    const expect: string = 'test-data';
    const data: string = 'OMgoNDMpVOIuDmMNlvviw9Jk+K1zBTYUYbEA==';

    // mock kms.decrypt function and return a mocked callback function named promise()
    kms.decrypt = () => {
      const res: DecryptResponse = { Plaintext };

      return <Request<any, any>>{
        promise: () => res
      };
    };

    Plaintext.toString = () => {
      return 'test-data';
    };

    const result = await instance.decrypt(data);
    assert.strictEqual(result, expect);
  });
});