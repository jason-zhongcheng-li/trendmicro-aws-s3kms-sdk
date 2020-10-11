import { S3 } from 'aws-sdk';
import { BaseFileService, FileOptions } from './BaseFileService';
import { E_BUCKET_UNDEFINED } from '../messages';


export interface S3FileOptions extends FileOptions {
  endpoint?: string; // s3.eu-west-1.amazonaws.com
  region?: string;
  Bucket: string;
  ACL?: string;
  ServerSideEncryption?: string;
  StorageClass?: string;
  Expires?: number;
}

export class AwsS3Service extends BaseFileService {
  constructor(options: S3FileOptions, private s3: S3) {
    super(options);

    if (!options.Bucket) {
      throw new Error(E_BUCKET_UNDEFINED);
    }
  }
}
