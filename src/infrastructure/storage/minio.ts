import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import env from '../../app/env';

// MinIO is compatible with S3 API, so we configure a client pointing to the MinIO endpoint
export const minioClient = new S3Client({
  endpoint: env.AWS_ENDPOINT || 'http://localhost:9000',
  region: env.AWS_DEFAULT_REGION || 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || 'minioadmin',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
  },
  forcePathStyle: true, // MinIO requires forcePathStyle to be true
});

export class MinioStorage {
  private bucket: string;

  constructor() {
    this.bucket = env.AWS_BUCKET || 'default-bucket';
  }

  url(key: string): string {
    const endpoint = env.AWS_ENDPOINT || 'http://localhost:9000';
    return `${endpoint}/${this.bucket}/${key}`;
  }

  async isExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await minioClient.send(command);
      return true;
    } catch {
      return false;
    }
  }

  async put(key: string, body: Buffer | string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
    });
    await minioClient.send(command);
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await minioClient.send(command);
  }
}

export const minioStorage = new MinioStorage();
export default minioStorage;
