import * as fs from 'fs';
import { DateTime } from 'luxon';
import * as path from 'path';
import { AwsKMSService } from './AwsKMSService';
import { AwsS3Service } from './AwsS3Service';

export class AwsFileService {
  constructor(private s3Service: AwsS3Service, private kmsService: AwsKMSService) {
  }

  public async encryptSummaryFile(bucket: string, keys?: string[], fileName?: string): Promise<string> {

    if (!keys) {
      keys = await this.downloadAllObjects(bucket);
    }

    if (!fileName) {
      const nowStr = DateTime.local().toFormat('yyyy-MM-dd_hh-mm-ss');
      fileName = nowStr.concat('_ObjectsList.txt');
    }

    const dest = path.join(this.s3Service.getLocalDir(), fileName);

    const bufferData = Buffer.from(keys.join('\n').toString());

    const encryptedData = await this.kmsService.encrypt(bufferData);
    // console.log('encryptedData = ', encryptedData);
    if (!!encryptedData) {
      fs.writeFile(dest, encryptedData, err => {
        if (!!err) {
          console.error('Write file error: ', err);
        }
      });
    }
    return dest;
  }

  public async decryptSummaryFile(fileName: string): Promise<string> {
    const dest = path.join(this.s3Service.getLocalDir(), fileName);

    // let rawData = '';
    // await Promise.resolve(fs.readFile(dest, (err, data) => {
    //   if (!!err) {
    //     console.error(err);
    //   } else {
    //     rawData = data.toString();
    //   }

    // }));
    const data = await new Promise<string>((resolve, reject) => {
      fs.readFile(dest, async (err, data) => {
        if (!!err) {
          console.error('Read file error in decryptSummaryFile()');
          reject(err);
        } else {
          resolve(data.toString());
        }
      });
    });

    // console.log('data in function = ', data);


    const result = await this.kmsService.decrypt(data);
    return result;
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