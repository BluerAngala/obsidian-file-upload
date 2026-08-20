import ImageUploader from "../imageUploader";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {UploaderUtils} from "../uploaderUtils";
import {applyCdn, encodePathSegments} from "../cdn";
import type {CdnId} from "../cdn";

const EXTENSION_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
};

export default class B2Uploader implements ImageUploader {
  private readonly s3!: S3Client;
  private readonly bucket!: string;
  private readonly endpoint: string;
  private pathTmpl: string;
  private customDomainName: string;
  private readonly cdnId: CdnId;

  constructor(setting: B2Setting) {
    const region = UploaderUtils.trimCredential(setting.region);
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: UploaderUtils.trimCredential(setting.accessKeyId),
        secretAccessKey: UploaderUtils.trimCredential(setting.secretAccessKey),
      },
      endpoint: `https://s3.${region}.backblazeb2.com`,
      region,
      forcePathStyle: true,
    });
    this.bucket = UploaderUtils.trimCredential(setting.bucketName);
    this.endpoint = `https://s3.${region}.backblazeb2.com`;
    this.pathTmpl = setting.path;
    this.customDomainName = setting.customDomainName;
    this.cdnId = setting.cdnId || "s3-native";
  }

  supportsFileType(_extension: string): boolean {
    return true;
  }

  async upload(image: File, fullPath: string): Promise<string> {
    const arrayBuffer = await image.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let path = UploaderUtils.generateName(this.pathTmpl, image.name);
    path = path.replace(/^\/+/, ''); // remove the /
    const ext = image.name.split('.').pop()?.toLowerCase() ?? '';
    const contentType = image.type || EXTENSION_MIME_MAP[ext] || `image/${ext}`;
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      Body: uint8Array,
      ContentType: contentType,
    }));
    // B2 S3-compatible endpoint URL — same path-style layout as AWS S3
    // so we can use the S3 native CDN module.
    const storageUrl = `${this.endpoint}/${this.bucket}/${encodePathSegments(path)}`;
    return applyCdn("BACKBLAZE_B2", storageUrl, this.cdnId, {
      customDomain: this.customDomainName,
    });
  }
}

export interface B2Setting {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  path: string;
  customDomainName: string;
  cdnId?: string;
}
