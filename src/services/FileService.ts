import { AwsKMSService } from './AwsKMSService';
import { AwsS3Service } from './AwsS3Service';

export class FileService {
  constructor(private s3Service: AwsS3Service, private kmsService: AwsKMSService) {
  }

  public async encryptSummaryFile(bucket: string, fileName?: string): Promise<string> {

    return '';
  }

  public async decryptSummaryFile(fileName: string): Promise<string> {

    return '';
  }

  private async downloadAllObjects(bucket: string): Promise<string[]> {
    const result: string[] = [];

    // Get all keys of objects in the bucket
    const keys = await this.s3Service.getAllKeys(bucket);

    // Download one by one
    keys.map(async key => {
      const destPath = await this.s3Service.getFile(bucket, key);
      if (!!destPath) {
        result.push(key);
      }
    });

    return result;
  }
}