export interface testConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  ACL?: string;
  ServerSideEncryption?: string;
  StorageClass?: string;
  Expires?: number;
  apiVersion?: string;
}

export default testConfig;