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
import logger from '../../app/logger';

// ---------------------------------------------------------------------------
// IStorage — common contract for all storage adapters
// ---------------------------------------------------------------------------

export interface IStorage {
  /** Generate a public URL for the given key */
  url(key: string): string;
  /** Check whether an object exists */
  exists(key: string): Promise<boolean>;
  /** Retrieve an object — returns a stream (S3) or string (local) */
  get(key: string): Promise<Readable | string | null>;
  /** Store a file at the given key */
  put(key: string, value: Buffer | string, mimeType?: string): Promise<void>;
  /** Delete a file at the given key */
  delete(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// S3Adapter — works with AWS S3 and any S3-compatible service (MinIO, etc.)
// ---------------------------------------------------------------------------

export class S3Adapter implements IStorage {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = env.AWS_BUCKET ?? 'default-bucket';
    this.s3 = new S3Client({
      endpoint: env.AWS_ENDPOINT || undefined,
      region: env.AWS_DEFAULT_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
      },
      // Required for MinIO and local S3-compatible services
      forcePathStyle: Boolean(env.AWS_ENDPOINT),
    });
  }

  url(key: string): string {
    if (env.AWS_ENDPOINT) {
      return `${env.AWS_ENDPOINT}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${env.AWS_DEFAULT_REGION ?? 'us-east-1'}.amazonaws.com/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async get(key: string): Promise<Readable | null> {
    try {
      const response = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return (response.Body as Readable) ?? null;
    } catch (err) {
      logger.error({ err, key }, 'S3: Failed to get object');
      return null;
    }
  }

  async put(key: string, value: Buffer | string, mimeType?: string): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: value,
        ...(mimeType && { ContentType: mimeType }),
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

// ---------------------------------------------------------------------------
// LocalAdapter — stores files on the local filesystem under public/storage
// ---------------------------------------------------------------------------

export class LocalAdapter implements IStorage {
  private readonly rootPath: string;
  private readonly publicPath: string;

  constructor() {
    this.rootPath = path.join(process.cwd(), 'public', 'storage');
    this.publicPath = '/public/storage';
  }

  url(key: string): string {
    return `${env.APP_URL}${this.publicPath}/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    return fsSync.existsSync(path.join(this.rootPath, key));
  }

  async get(key: string): Promise<string | null> {
    try {
      return await fs.readFile(path.join(this.rootPath, key), 'utf8');
    } catch {
      return null;
    }
  }

  async put(key: string, value: Buffer | string): Promise<void> {
    const filePath = path.join(this.rootPath, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, value);
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.rootPath, key));
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException;
      // Silently ignore "file not found" — treat it as a no-op
      if (error.code !== 'ENOENT') {
        logger.error({ err, key }, 'Local: Failed to delete file');
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Storage facade — simple static API, driver selected per-call
// ---------------------------------------------------------------------------

export type StorageDriver = 'local' | 's3';

/**
 * Fluent storage facade.
 *
 * Usage:
 *   await Storage.disk('s3').put('avatars/user-1.jpg', buffer, 'image/jpeg');
 *   const url = Storage.disk('local').url('avatars/user-1.jpg');
 *   await Storage.disk('s3').delete('avatars/old.jpg');
 */
export class Storage {
  private static resolveAdapter(driver: StorageDriver): IStorage {
    switch (driver) {
      case 's3':
        return new S3Adapter();
      case 'local':
      default:
        return new LocalAdapter();
    }
  }

  static disk(driver: StorageDriver): IStorage {
    return Storage.resolveAdapter(driver);
  }
}

export default Storage;
