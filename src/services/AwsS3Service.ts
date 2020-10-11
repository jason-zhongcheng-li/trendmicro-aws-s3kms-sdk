import { S3 } from 'aws-sdk';
import { BaseFileService, FileOptions } from './BaseFileService';
import { E_BUCKET_UNDEFINED } from '../messages';
import { ListObjectsV2Request } from 'aws-sdk/clients/s3';


export interface S3FileOptions extends FileOptions {
  endpoint?: string; // s3.eu-west-1.amazonaws.com
  region?: string;
  Bucket: string;
  MaxKeys?: number;
  ACL?: string;
  ServerSideEncryption?: string;
  StorageClass?: string;
  Expires?: number;
}

export class AwsS3Service extends BaseFileService<S3FileOptions> {
  constructor(options: S3FileOptions, private s3: S3) {
    super(options);

    // Validate if Bucket value available
    if (!options.Bucket) {
      throw new Error(E_BUCKET_UNDEFINED);
    }
  }


  /**
   * Get object/file from AWS S3 with object key
   *
   * @param  {string} key - The AWS S3 key to the file
   * @returns {Promise<string>} - The file path to the local file
   */
  public async getFile(key: string): Promise<string> {
    const params: any = {
      Bucket: this.getOptions().Bucket,
      Key: key
    };

    const stream = this.s3.getObject(params).createReadStream();

    // Save downloaded file to local path
    return this.saveToLocalDir(stream, key.replace(/\//g, '_'));
  }


  /**
   * Get all keys from S3 Bucket to download one by one
   *
   * @returns {Promise<string[]>} - All the keys in a S3 bucket
   */
  public async getAllKeys(): Promise<string[]> {
    const keys = [] as string[];
    let IsTruncated = false;
    let NextContinuationToken = '';
    let StartAfter = '';

    while (true) {

      let params: ListObjectsV2Request = {
        Bucket: this.getOptions().Bucket,
        MaxKeys: this.getOptions().MaxKeys
      };

      if (StartAfter) {
        params = { ...params, StartAfter };
      }

      try {
        const res = await this.s3.listObjectsV2(params).promise();
        res.Contents.forEach(item => {
          // add item key to the key array
          keys.push(item.Key);
        });

        // Check if there are more keys in the bucket
        IsTruncated = res.IsTruncated;
        NextContinuationToken = res.NextContinuationToken;

        if (IsTruncated && NextContinuationToken) {
          // If there are more keys, set StartAfter to be last key in current retrieving
          StartAfter = res.Contents.slice(-1)[0].Key;
        } else {
          // Break the loop since there is no more key
          break;
        }
      } catch (error) {
        throw error;
      }
    }
    return keys;
  }
}