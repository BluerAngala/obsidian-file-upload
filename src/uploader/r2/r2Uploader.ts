import ImageUploader from "../imageUploader";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {UploaderUtils} from "../uploaderUtils";
import {applyCdn, encodePathSegments} from "../cdn";
import type {CdnId} from "../cdn";

export default class R2Uploader implements ImageUploader {
  private readonly r2!: S3Client;
  private readonly bucket!: string;
  private readonly endpoint: string;
  private pathTmpl: string;
  private customDomainName: string;
  private readonly cdnId: CdnId;

  constructor(setting: R2Setting) {
    this.r2 = new S3Client({
      credentials: {
        accessKeyId: UploaderUtils.trimCredential(setting.accessKeyId),
        secretAccessKey: UploaderUtils.trimCredential(setting.secretAccessKey),
      },
      endpoint: UploaderUtils.normalizeEndpoint(setting.endpoint),
      region: 'auto', // Cloudflare R2 uses 'auto' region
      forcePathStyle: true, // Needed for Cloudflare R2
    });
    this.bucket = UploaderUtils.trimCredential(setting.bucketName);
    this.endpoint = UploaderUtils.normalizeEndpoint(setting.endpoint);
    this.pathTmpl = setting.path;
    this.customDomainName = setting.customDomainName;
    this.cdnId = setting.cdnId || "r2-native";
  }

  supportsFileType(_extension: string): boolean {
    return true;
  }

  async upload(image: File, fullPath: string): Promise<string> {
    const arrayBuffer = await image.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let path = UploaderUtils.generateName(this.pathTmpl, image.name);
    path = path.replace(/^\/+/, ''); // remove the /
    await this.r2.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      Body: uint8Array,
      ContentType: `image/${image.name.split('.').pop()}`,
    }));
    // Build the canonical S3-style URL so CDN modules that need a full URL
    // (customDomain, CloudFront) can do a clean host swap. R2.dev is the
    // public hostname assigned to the bucket; we keep it as a fallback.
    const storageUrl = this.endpoint
      ? `${this.endpoint}/${this.bucket}/${encodePathSegments(path)}`
      : `https://${this.bucket}.r2.cloudflarestorage.com/${encodePathSegments(path)}`;
    return applyCdn("CLOUDFLARE_R2", storageUrl, this.cdnId, {
      customDomain: this.customDomainName,
    });
  }
}

export interface R2Setting {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucketName: string;
  path: string;
  customDomainName: string;
  cdnId?: string;
}
