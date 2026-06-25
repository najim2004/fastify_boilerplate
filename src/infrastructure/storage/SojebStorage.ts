import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import env from '../../app/env';

export interface IStorage {
  url(key: string): string;
  isExists(key: string): Promise<boolean>;
  get(key: string): Promise<Readable | string | null>;
  put(key: string, value: Buffer | string): Promise<unknown>;
  delete(key: string): Promise<unknown>;
}

export class S3Adapter implements IStorage {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = env.AWS_BUCKET || 'default-bucket';
    this.s3 = new S3Client({
      endpoint: env.AWS_ENDPOINT || undefined,
      region: env.AWS_DEFAULT_REGION || 'us-east-1',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
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
      await this.s3.send(command);
      return true;
    } catch {
      return false;
    }
  }

  async get(key: string): Promise<Readable | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await this.s3.send(command);
      return (response.Body as Readable) || null;
    } catch (error) {
      throw new Error(`Failed to get object ${key}: ${error}`);
    }
  }

  async put(key: string, value: Buffer | string): Promise<unknown> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: value,
    });
    return await this.s3.send(command);
  }

  async delete(key: string): Promise<unknown> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return await this.s3.send(command);
  }
}

export class LocalAdapter implements IStorage {
  private rootUrl: string;
  private publicUrl: string;

  constructor() {
    this.rootUrl = path.join(process.cwd(), 'public/storage');
    this.publicUrl = '/public/storage';
  }

  url(key: string): string {
    return `${env.APP_URL}${this.publicUrl}/${key}`;
  }

  async isExists(key: string): Promise<boolean> {
    try {
      return fsSync.existsSync(path.join(this.rootUrl, key));
    } catch {
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await fs.readFile(path.join(this.rootUrl, key), 'utf8');
    } catch {
      return null;
    }
  }

  async put(key: string, value: Buffer | string): Promise<void> {
    try {
      const filePath = path.join(this.rootUrl, key);
      const dirPath = path.dirname(filePath);
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, value);
    } catch (err) {
      console.error(err);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.rootUrl, key));
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException;
      if (error.code !== 'ENOENT') console.error(err);
    }
  }
}

export class SojebStorage {
  private static activeAdapter: IStorage = new LocalAdapter();

  public static disk(driver: 'local' | 's3'): typeof SojebStorage {
    if (driver === 's3') {
      this.activeAdapter = new S3Adapter();
    } else {
      this.activeAdapter = new LocalAdapter();
    }
    return this;
  }

  public static async put(
    key: string,
    value: Buffer | string,
  ): Promise<unknown> {
    return await this.activeAdapter.put(key, value);
  }

  public static url(key: string): string {
    return this.activeAdapter.url(key);
  }

  public static async isExists(key: string): Promise<boolean> {
    return await this.activeAdapter.isExists(key);
  }

  public static async get(key: string): Promise<Readable | string | null> {
    return await this.activeAdapter.get(key);
  }

  public static async delete(key: string): Promise<unknown> {
    if (await this.activeAdapter.isExists(key)) {
      return await this.activeAdapter.delete(key);
    }
    return false;
  }
}

export default SojebStorage;
