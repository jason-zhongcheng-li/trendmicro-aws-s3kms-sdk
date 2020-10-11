import { KMSFileOptions } from './../../../src/services/AwsKMSService';
import { KMS, Request } from 'aws-sdk';
import * as assert from 'assert';
import { AwsKMSService } from '../../../src/services/AwsKMSService';
import { E_KMS_KEYID_UNDEFINED } from '../../../src/messages';
import { CiphertextType, EncryptResponse } from 'aws-sdk/clients/kms';

describe.only('AwsKMSService unit test', () => {
  let options: KMSFileOptions;
  let kms: KMS;
  let instance: AwsKMSService;
  let CiphertextBlob: CiphertextType;

  beforeEach(() => {
    options = {
      KeyId: 'key-id',
      localDir: __dirname + '/tmp'
    } as KMSFileOptions;
    kms = {} as KMS;
    CiphertextBlob = Object.assign(Buffer.prototype);
    instance = new AwsKMSService(options, kms);

  });

  it('should throw if `options.KeyId` is missing in the constructor', () => {
    assert.throws(() => {
      instance = new AwsKMSService({ KeyId: '', localDir: __dirname + '/tmp' } as KMSFileOptions, kms);
    }, new RegExp(E_KMS_KEYID_UNDEFINED));
  });

  it('should encrypt raw data', async () => {
    const expect: string = 'OMgoNDMpVOIuDmMNlvviw9Jk+K1zBTYUYbEA==';
    const data: Buffer = Buffer.from('test-data', 'utf-8');

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

  it.skip('should decrypt encrypted data to raw data', async () => {
    const expect: string = '';
    const data: string = 'test-data';

    const result = await instance.decrypt(data);
    assert.strictEqual(result, expect);
  });
});