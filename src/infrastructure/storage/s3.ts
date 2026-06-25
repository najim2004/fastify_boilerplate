import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import env from '../../app/env';

export const s3Client = new S3Client({
  endpoint: env.AWS_ENDPOINT || undefined,
  region: env.AWS_DEFAULT_REGION || 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Needed for MinIO and some local stack drivers
});

export class S3Storage {
  private bucket: string;

  constructor() {
    this.bucket = env.AWS_BUCKET || 'default-bucket';
  }

  url(key: string): string {
    if (env.AWS_ENDPOINT) {
      return `${env.AWS_ENDPOINT}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${env.AWS_DEFAULT_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  async isExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await s3Client.send(command);
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
    await s3Client.send(command);
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await s3Client.send(command);
  }
}

export const s3Storage = new S3Storage();
export default s3Storage;
