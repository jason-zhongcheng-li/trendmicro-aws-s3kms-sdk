import { DateTime } from 'luxon';
import { AwsS3Service } from './../services/AwsS3Service';
import { AwsKMSService } from './../services/AwsKMSService';
import { E_NUMBER_OF_PROCESSES_EXEED, E_S3_NO_OBJECTS_IN_BUCKET } from '../messages';

export interface engryptArgs {
  bucket: string;
  keys?: string[];
  fileName?: string;
}

export class TrendMicroFileAction {
  constructor(private s3Service: AwsS3Service, private kmsService: AwsKMSService) {
  }

  /**
   * Control concurrency to keep at most four parallel downloads in progress.
   * @param  {Args[]=[]} argsArr
   */
  public async batchEncryptSummaryFiles(argsArr: engryptArgs[] = []): Promise<string[] | string> {
    if (argsArr.length === 0 || argsArr.length > 4) {
      return Promise.reject(E_NUMBER_OF_PROCESSES_EXEED);
    }
    const arrayFuns = argsArr.map(async args => {
      return await this.encryptSummaryFile(args.bucket, args.keys, args.fileName);
    });
    return Promise.all([...arrayFuns]);
  }

  /**
   * Encrypt plain text of the list of downloaded files to a local file
   *
   * @param  {string} bucket - Bucket on AWS S3
   *
   * @param  {string[]} keys?
   * - An array of the keys of downloaded files, the key is file name in the S3 bucket.
   * This param is optional, if you have got keys to encrypt, this function will not download files from bucket.
   * Otherwise, it will download all files from the bucket before create an summary file with encrypt data.
   *
   * @param  {string} fileName?
   * - It is the name of summary file where you want to save encrypt data of the list of downloaded files
   * This param is optional, if you dont specify the file name, the default format of file name will be yyyy-MM-dd_hh-mm-ss_ObjectsList.txt
   */
  public async encryptSummaryFile(bucket: string, keys: string[] = [], fileName?: string): Promise<string> {

    // Downloaded all objects(files) from bucket if no keys available to encrypt.
    if (!keys || keys.length === 0) {
      keys = await this.downloadAllObjects(bucket);
    }

    if (!keys || keys.length === 0) {
      return Promise.reject(E_S3_NO_OBJECTS_IN_BUCKET);
    }

    // Create default file name if fileName is not specified.
    if (!fileName) {
      const nowStr = DateTime.local().toFormat('yyyy-MM-dd_hh-mm-ss-u');
      fileName = nowStr.concat('_ObjectsList_in_', bucket, '.txt');
    }

    // Convert string of keys with new line to buffer
    const bufferData = Buffer.from(keys.join('\n').toString());

    // Encrypt data
    const encryptedData = await this.kmsService.encrypt(bufferData);

    return await this.s3Service.writeToFileAsync(fileName, encryptedData);
  }

  /**
   * Decrypt content to plain text
   * @param  {string} fileName
   * @returns {Promise<string[]>} - raw data
   */
  public async decryptSummaryFile(fileName: string): Promise<string> {

    // read data from the file to decrypt
    const data = await this.s3Service.readFromFileAsync(fileName);

    return await this.kmsService.decrypt(data);
  }

  /**
   * Download all objects and return all the keys in a S3 bucket
   * @param  {string} bucket
   * @returns {Promise<string[]>} - array of the keys downloaded
   */
  public async downloadAllObjects(bucket: string): Promise<string[]> {
    const result: string[] = [];

    // Get all keys of objects in the bucket
    const keys = await this.s3Service.getAllKeys(bucket)
      .catch(err => {
        return new Promise<string[]>(rej => rej(err));
      });

    // Download one by one
    // use Promise.all() to make sure arry push key after async getFile() function done.
    if (Array.isArray(keys)) {
      await Promise.all(
        keys.map(async key => {
          const destPath = await this.s3Service.getFile(bucket, key);
          if (!!destPath) {
            result.push(key);
          }
        }));
    }
    return result;
  }
}