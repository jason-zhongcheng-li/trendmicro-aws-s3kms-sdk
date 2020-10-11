import { AwsKMSService } from './../../../../src/services/AwsKMSService';
import { AwsS3Service } from './../../../../src/services/AwsS3Service';
import { FileService } from './../../../../src/services/FileService';


describe('BaseFileService functional test', () => {
  let s3Service: AwsS3Service;
  let kmsService: AwsKMSService;
  let instance: FileService;

  beforeEach(() => {

    s3Service = Object.assign(AwsS3Service.prototype);
    kmsService = Object.assign(AwsKMSService.prototype);

    instance = new FileService(s3Service, kmsService);
  });

  it('Should download all objects', () => {

  });

  it('Should encrypt a summary file for a list of downloaded files', () => {
    const bucket = 's3-bucket';
    const fileName = 'file-name';
    const result = instance.encryptSummaryFile(bucket, fileName);
  });

  it('Should decrypt a summary file for a list of downloaded files', () => {
    const fileName = 'file-name';
    const result = instance.decryptSummaryFile(fileName);
  });
});