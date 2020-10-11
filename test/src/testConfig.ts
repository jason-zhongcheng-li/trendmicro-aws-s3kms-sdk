export interface testConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  Bucket: string;
  ACL?: string;
  ServerSideEncryption?: string;
  StorageClass?: string;
  Expires?: number;
}

export default testConfig;