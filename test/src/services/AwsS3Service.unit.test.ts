import { S3 } from 'aws-sdk';
import * as assert from 'assert';
import * as fs from 'fs';
import { S3FileOptions, AwsS3Service } from '../../../src/services/AwsS3Service';
import { E_BUCKET_UNDEFINED } from '../../../src/messages';
import { Readable } from 'stream';

describe('AwsS3Service unit test', () => {
  let options: S3FileOptions;
  let s3: S3;
  let instance: AwsS3Service;
  const key = '/path/to/object';

  beforeEach(() => {
    options = {
      Bucket: 'the-bucket',
      ACL: 'private',
      ServerSideEncryption: 'AES256',
      StorageClass: 'REDUCED_REDUNDANCY',
      tmpDir: `${__dirname}/tmp`
    } as S3FileOptions;
    s3 = {} as S3;
    instance = new AwsS3Service(options, s3);

  });

  it('should throw if `options.Bucket` is missing in the constructor', () => {
    assert.throws(() => {
      instance = new AwsS3Service({ tmpDir: __dirname + '/tmp' } as S3FileOptions, s3);
    }, new RegExp(E_BUCKET_UNDEFINED));
  });

  it('should get a file', async () => {

    const filePath = await instance.getFile(key);
    const result = fs.readFileSync(filePath, 'utf-8');
    console.log('result = ', result);

    assert.strictEqual(result, '', 'should be the file sent by the dummy stream');

  });

  it('should get all keys in a bucket', async () => {
    const expect = [] as string[];

    const result = await instance.getAllKeys();
    console.log('result = ', result);

    assert.strictEqual(result, expect, 'should be all the keys in bucket');

  });
});