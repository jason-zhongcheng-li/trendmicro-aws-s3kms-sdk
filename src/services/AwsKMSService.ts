import { KMS } from 'aws-sdk';
import { EncryptRequest } from 'aws-sdk/clients/kms';
import { BaseFileService, FileOptions } from './BaseFileService';
import { E_KMS_KEYID_UNDEFINED } from '../messages';

export interface KMSFileOptions extends FileOptions {
  KeyId: string;
}

export class AwsKMSService extends BaseFileService<KMSFileOptions>{

  constructor(options: KMSFileOptions, private kms: KMS) {
    super(options);

    // Validate if KeyId value available
    if (!options.KeyId) {
      throw new Error(E_KMS_KEYID_UNDEFINED);
    }
  }

  /**
   * Encrypt data with KMS
   *
   * @param  {Buffer} data
   * @returns @returns {Promise<string>}
   */
  public async encrypt(rawData: Buffer): Promise<string> {
    const params = {
      KeyId: this.getOptions().KeyId,
      Plaintext: rawData
    } as EncryptRequest;

    const { CiphertextBlob } = await this.kms.encrypt(params).promise();

    // store encrypted data as base64 encoded string
    return CiphertextBlob.toString('base64');
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
