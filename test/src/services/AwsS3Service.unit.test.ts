import { S3 } from 'aws-sdk';
import * as assert from 'assert';
import { S3FileOptions, AwsS3Service } from '../../../src/services/AwsS3Service';
import { E_BUCKET_UNDEFINED } from '../../../src/messages';

describe.only('AwsS3Service unit test', () => {
  let options: S3FileOptions;
  let s3: S3;
  let instance: AwsS3Service;
  const key = 'path/to/file';

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
});