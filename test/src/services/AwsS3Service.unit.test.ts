import { S3, Request } from 'aws-sdk';
import * as assert from 'assert';
import * as fs from 'fs';
import { S3FileOptions, AwsS3Service } from '../../../src/services/AwsS3Service';
import { E_BUCKET_UNDEFINED } from '../../../src/messages';
import { Readable } from 'stream';
import { ListObjectsV2Output } from 'aws-sdk/clients/s3';

describe.only('AwsS3Service unit test', async () => {
  let options: S3FileOptions;
  let s3: S3;
  let instance: AwsS3Service;
  const key = '/path/to/object';
  const textContent = 'abc123';

  beforeEach(async () => {
    options = {
      Bucket: 'the-bucket',
      ACL: 'private',
      ServerSideEncryption: 'AES256',
      StorageClass: 'REDUCED_REDUNDANCY',
      localDir: `${__dirname}/tmp`,
      MaxKeys: 2
    } as S3FileOptions;
    s3 = {} as S3;
    instance = new AwsS3Service(options, s3);

  });

  it('should throw if `options.Bucket` is missing in the constructor', async () => {
    assert.throws(() => {
      instance = new AwsS3Service({ localDir: __dirname + '/tmp' } as S3FileOptions, s3);
    }, new RegExp(E_BUCKET_UNDEFINED));
  });

  it('should get a file from AWS bucket', async () => {

    s3.getObject = () => {
      const stream = new Readable({ objectMode: true });

      stream._read = () => {
        stream.push(textContent);
        stream.push(null);
      };

      return <Request<any, any>>{
        createReadStream: () => stream
      };
    };

    const filePath = await instance.getFile(key);
    const result = fs.readFileSync(filePath, 'utf-8');
    // console.log('filePath = ', filePath);
    // console.log('result in S3 = ', result);

    assert.strictEqual(result, textContent, 'should be the file sent by the dummy stream');

  });

  it('should get all keys in a bucket if any', async () => {
    const expect: string[] = ['test1-file.jpg', 'test2-file.jpg', 'test2-file.jpg'];
    let numCalls = 0;
    s3.listObjectsV2 = () => {
      numCalls++;

      if (numCalls === 1) {
        const res: ListObjectsV2Output = {
          Contents: [
            { Key: 'test1-file.jpg' },
            { Key: 'test2-file.jpg' }],
          IsTruncated: true,
          NextContinuationToken: 'next-token'

        };

        return <Request<any, any>>{
          promise: () => res
        };
      } else {
        const res: ListObjectsV2Output = {
          Contents: [
            { Key: 'test2-file.jpg' }],
          IsTruncated: false,
          NextContinuationToken: ''
        };

        return <Request<any, any>>{
          promise: () => res
        };
      }

    };

    const result = await instance.getAllKeys();

    assert.deepStrictEqual(result, expect, 'should be all the keys in bucket');

  });
});