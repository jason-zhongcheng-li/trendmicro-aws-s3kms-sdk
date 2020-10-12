import { KMS } from 'aws-sdk';
import { EncryptRequest, DecryptRequest } from 'aws-sdk/clients/kms';
import { BaseFileService, FileOptions } from './BaseFileService';
import { E_KMS_KEYID_UNDEFINED } from '../messages';

export interface KMSFileOptions {
  KeyId: string;
}

export class AwsKMSService {

  constructor(private options: KMSFileOptions, private kms: KMS) {

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
  public async encrypt(data: Buffer): Promise<string> {
    const params = {
      KeyId: this.options.KeyId,
      Plaintext: data
    } as EncryptRequest;

    const { CiphertextBlob } = await this.kms.encrypt(params).promise();

    // return encrypted data as base64 encoded string
    return CiphertextBlob.toString('base64');
  }

  /**
   * Decrypt data with KMS
   *
   * @param  {string} data
   * @returns @returns {Promise<string>} return raw data
   */
  public async decrypt(data: string): Promise<string> {
    const params = {
      KeyId: this.options.KeyId,
      CiphertextBlob: Buffer.from(data, 'base64')
    } as DecryptRequest;

    // destructure Plaintext from MS.Types.DecryptResponse
    const { Plaintext } = await this.kms.decrypt(params).promise();

    // return raw data
    return Plaintext.toString();
  }
}
