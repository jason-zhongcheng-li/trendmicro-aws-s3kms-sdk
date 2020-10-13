import { S3, Request } from 'aws-sdk';
import * as assert from 'assert';
import * as fs from 'fs';
import { Readable } from 'stream';
import { ListObjectsV2Output } from 'aws-sdk/clients/s3';
import { S3FileOptions, AwsS3Service } from '../../../../src/services/AwsS3Service';
import { E_BUCKET_UNDEFINED } from '../../../../src/messages';
import { CiphertextType } from 'aws-sdk/clients/kms';

describe('AwsS3Service unit test', async () => {
  let options: S3FileOptions;
  let s3: S3;
  let instance: AwsS3Service;
  const key = 'test-data';
  const textContent = 'abc123';
  const bucket = 's3-bucket';
  let CiphertextBlob: CiphertextType;

  beforeEach(async () => {
    options = {
      ACL: 'private',
      ServerSideEncryption: 'AES256',
      StorageClass: 'REDUCED_REDUNDANCY',
      localDir: `${__dirname}/tmp`,
      MaxKeys: 2
    };
    s3 = Object.assign(S3.prototype);
    CiphertextBlob = Object.assign(Buffer.prototype);
    instance = new AwsS3Service(options, s3);
  });

  it('should get a file from AWS bucket', async () => {

    // mock s3.getObject() function and return a mocked callback function named createReadStream()
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

    CiphertextBlob.toString = () => {
      return 'abc123';
    };

    const filePath = await instance.getFile(bucket, key);
    const result = fs.readFileSync(filePath, 'utf-8');

    assert.strictEqual(result, textContent, 'should be the file sent by the dummy stream');

  });

  it('should get all keys in a bucket if any', async () => {
    const expect: string[] = ['test1-file.jpg', 'test2-file.jpg', 'test3-file.jpg'];

    // it's used to mark the number of function has been called
    let numCalls = 0;

    // mock s3.listObjectsV2() function and return a mocked callback function named promise()
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
            { Key: 'test3-file.jpg' }],
          IsTruncated: false,
          NextContinuationToken: ''
        };

        return <Request<any, any>>{
          promise: () => res
        };
      }

    };

    const result = await instance.getAllKeys(bucket);

    assert.deepStrictEqual(result, expect, 'should be all the keys in bucket');

  });
});