import { AwsKMSService } from './AwsKMSService';
import { AwsS3Service } from './AwsS3Service';

export class FileService {
  constructor(private s3Service: AwsS3Service, private kmsService: AwsKMSService) {
  }

  public async encryptSummaryFile(bucket: string, keys: string[], fileName?: string): Promise<string> {


    return '';
  }

  public async decryptSummaryFile(fileName: string): Promise<string> {

    return '';
  }

  /**
   * @param  {string} bucket
   * @returns {Promise<string[]>} - Download all objects and return all the keys in a S3 bucket
   */
  public async downloadAllObjects(bucket: string): Promise<string[]> {
    const result: string[] = [];

    // Get all keys of objects in the bucket
    const keys = await this.s3Service.getAllKeys(bucket);

    // Download one by one
    // use Promise.all() to make sure arry push key after async getFile() function done.
    await Promise.all(
      keys.map(async key => {
        const destPath = await this.s3Service.getFile(bucket, key).catch(err => console.error(err));
        if (!!destPath) {
          result.push(key);
        }
      }));

    return result;
  }
}