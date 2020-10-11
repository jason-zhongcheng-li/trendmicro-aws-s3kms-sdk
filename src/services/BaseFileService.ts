
export interface FileOptions {
  tmpDir: string;
}

export class BaseFileService {
  constructor(private options: FileOptions) {
  }


}
