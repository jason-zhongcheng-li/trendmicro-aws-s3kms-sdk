import { KMS } from 'aws-sdk';
import { DecryptRequest, EncryptRequest } from 'aws-sdk/clients/kms';
import { BaseFileService, FileOptions } from './BaseFileService';

export interface KMSFileOptions extends FileOptions {
  KeyId: string;
}

export class AwsKMSService extends BaseFileService<KMSFileOptions>{

  constructor(options: KMSFileOptions, private kms: KMS) {
    super(options);
  }

  /**
   * Encrypt data with KMS
   *
   * @param  {Buffer} data
   * @returns @returns {Promise<string>}
   */
  public async encrypt(rawData: Buffer): Promise<string> {
    return '';
  }

  /**
   * Decrypt data with KMS
   *
   * @param  {string} encryptData
   * @returns @returns {Promise<string>} return raw data
   */
  public async decrypt(encryptData: string): Promise<string> {
    return '';
  }
}
