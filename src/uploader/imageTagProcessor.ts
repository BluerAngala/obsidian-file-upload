import {App, Editor, FileSystemAdapter, MarkdownView, normalizePath, Notice} from "obsidian";
import path from "path";
import ImageUploader from "./imageUploader";
import {PublishSettings} from "../publish";
import UploadProgressModal from "../ui/uploadProgressModal";
import {WebImageDownloader} from "./webImageDownloader";
import MermaidProcessor from "./mermaidProcessor";
import ImageStore from "../imageStore";
import {errorMessage} from "./errorUtils";
import Translate from "../i18n/translate";
import {ImageCompressor} from "./features/compression";
import {ExifStripper} from "./features/exifStrip";
import {RenameRules} from "./features/renameRules";
import {SkipRules} from "./features/skipRules";
import {UploadPool} from "./features/uploadQueue";
import {applyPlatform} from "./features/platformFormat";
import {UploadLog} from "./features/uploadLog";
import {resolveConfigFor} from "./features/perFolderOverride";

export const MD_REGEX = /!\[([^\]]*)\]\(([^)]*)\)/g;
export const WIKI_REGEX = /!\[\[([^\]|#]*\.(png|jpg|jpeg|gif|svg|webp|excalidraw|mp4|mov|webm|pdf|avif|apng|bmp|tiff|tif|ico|heic|heif))(#[^\]|]*)?(\|[^\]]*)?\]\]/gi;
export const PROPERTIES_REGEX = /^---[\s\S]+?---\n/;

export function isAlreadyHosted(url: string, settings: PublishSettings): boolean {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        switch (ImageStore.normalizeId(settings.imageStore)) {
            case ImageStore.IMGUR.id:
                return hostname.includes('imgur.com') || hostname.includes('i.imgur.com');
            case ImageStore.GYAZO.id:
                return hostname.includes('gyazo.com') || hostname.includes('i.gyazo.com') || hostname.includes('thumb.gyazo.com');
            case ImageStore.GITHUB.id:
                if (settings.githubSetting?.githubOwner && settings.githubSetting?.repositoryName) {
                    const path = `/${settings.githubSetting.githubOwner}/${settings.githubSetting.repositoryName}/`;
                    return url.includes('github.com') && url.includes(path);
                }
                return hostname.includes('github.com') || hostname.includes('githubusercontent.com');
            case ImageStore.ALIYUN_OSS.id:
                if (settings.ossSetting?.customDomainName) {
                    return hostname.includes(settings.ossSetting.customDomainName);
                }
                return hostname.includes('aliyuncs.com');
            case ImageStore.AWS_S3.id:
                if (settings.awsS3Setting?.customDomainName) {
                    return hostname.includes(settings.awsS3Setting.customDomainName);
                }
                return hostname.includes('amazonaws.com') || hostname.includes('s3');
            case ImageStore.TENCENTCLOUD_COS.id:
                if (settings.cosSetting?.customDomainName) {
                    return hostname.includes(settings.cosSetting.customDomainName);
                }
                return hostname.includes('myqcloud.com');
            case ImageStore.QINIU_KUDO.id:
                if (settings.kodoSetting?.customDomainName) {
                    return hostname.includes(settings.kodoSetting.customDomainName);
                }
                return hostname.includes('qiniudn.com') || hostname.includes('clouddn.com');
            case ImageStore.ImageKit.id:
                return hostname.includes('imagekit.io');
            case ImageStore.CLOUDFLARE_R2.id:
                if (settings.r2Setting?.customDomainName) {
                    return hostname.includes(settings.r2Setting.customDomainName);
                }
                return hostname.includes('r2.dev') || hostname.includes('r2.cloudflarestorage.com');
            default:
                return false;
        }
    } catch {
        return false;
    }
}

interface Image {
    name: string;
    /** Display name after compression / rename rules have been applied. */
    displayName: string;
    path: string;
    url: string;
    source: string;
    isWebImage?: boolean; // Flag to indicate if this is a web image
    /** File size in bytes, for skip-rules + log entries. */
    sizeBytes?: number;
    /** Source markdown after we rewrote the filename (e.g. for renamed files). */
    rewrittenSource?: string;
}

// Return type for resolveImagePath method
interface ResolvedImagePath {
    resolvedPath: string;
    name: string;
}

export const ACTION_PUBLISH: string = "PUBLISH";

export default class ImageTagProcessor {
    private readonly app: App;
    private readonly imageUploader: ImageUploader;
    private settings: PublishSettings;
    private adapter: FileSystemAdapter;
    private progressModal: UploadProgressModal | null = null;
    private readonly useModal: boolean = true; // Set to true to use modal, false to use status bar
    private readonly translate: Translate;

    constructor(app: App, settings: PublishSettings, imageUploader: ImageUploader, useModal: boolean = true, translate: Translate) {
        this.app = app;
        this.adapter = this.app.vault.adapter as FileSystemAdapter;
        this.settings = settings;
        this.imageUploader = imageUploader;
        this.useModal = useModal;
        this.translate = translate;
    }

    public async process(action: string): Promise<void> {
        let value = this.getValue();
        const promises: Promise<Image>[] = [];
        // Convert mermaid code blocks to images if enabled
        let mermaidUrls = new Set<string>();
        if (this.settings.convertMermaid) {
            const mermaidProcessor = new MermaidProcessor(this.imageUploader, this.settings.mermaidScale, this.settings.mermaidTheme, this.translate);
            const result = await mermaidProcessor.process(value);
            value = result.value;
            mermaidUrls = result.generatedUrls;
        }

        const allImages = this.getImageLists(value, mermaidUrls);
        // Filter out images that the user has chosen to skip (regex / size).
        const images: Image[] = [];
        for (const image of allImages) {
            // Resolve per-folder overrides so the skip rules can use the
            // effective path / config for this file. Per-folder store / CDN
            // switching requires a different uploader; for now the skip /
            // platform path are honoured, and the rest of the pipeline uses
            // the active global uploader.
            const config = resolveConfigFor(
                image.path,
                this.settings.perFolderRules,
                this.settings.imageStore,
                this.settings.platformFormat,
            );
            const decision = SkipRules.shouldSkip(
                {
                    url: image.isWebImage ? image.path : undefined,
                    localPath: image.isWebImage ? undefined : image.path,
                    sizeBytes: image.sizeBytes,
                },
                this.settings.skipRules,
            );
            if (decision.shouldSkip) {
                // Mark as skipped in the progress modal + log
                if (this.progressModal) {
                    this.progressModal.updateProgress(image.name, true);
                }
                UploadLog.getInstance().add({
                    timestamp: Date.now(),
                    fileName: image.name,
                    status: "skipped",
                    durationMs: 0,
                    providerId: this.activeProviderId(),
                });
                continue;
            }
            // Stash the resolved config on the image so the per-image
            // platformFormat post-processor can pick it up later.
            (image as Image & { _platformFormat?: string })._platformFormat = config.platformFormat;
            images.push(image);
        }

        const uploader = this.imageUploader;
        const uploadLog = UploadLog.getInstance();

        // Initialize progress display
        if (this.useModal && images.length > 0) {
            this.progressModal = new UploadProgressModal(this.app, this.translate);
            this.progressModal.open();
            this.progressModal.initialize(images);
        }

        // Bounded concurrency — defaults to 3, can be raised to 16 in settings.
        const pool = new UploadPool(this.settings.uploadConcurrency);

        for (const image of images) {
            // Handle web images differently
            if (image.isWebImage) {
                promises.push(pool.run(async (): Promise<Image> => {
                    const started = Date.now();
                    try {
                        // Download the web image
                        const downloadResult = await WebImageDownloader.download(image.path);
                        const originalFile = new File([downloadResult.buffer], downloadResult.filename);

                        // Run preprocessing pipeline (compression / exif / rename)
                        const {file, displayName} = await this.preprocessFile(
                            originalFile,
                            image.name,
                            downloadResult.buffer.byteLength,
                        );

                        const imgUrl = await uploader.upload(file, file.name);
                        image.url = imgUrl;
                        image.displayName = displayName;
                        if (this.progressModal) {
                            this.progressModal.updateProgress(image.name, true);
                        }
                        uploadLog.add({
                            timestamp: started,
                            fileName: displayName,
                            url: imgUrl,
                            status: "success",
                            durationMs: Date.now() - started,
                            providerId: this.activeProviderId(),
                        });
                        return image;
                    } catch (e) {
                        if (this.progressModal) {
                            this.progressModal.updateProgress(image.name, false);
                        }
                        const errorMessageText = this.translate.t("notice.webImageUploadFailed").replace("{path}", image.path).replace("{error}", errorMessage(e));
                        new Notice(errorMessageText, 10000);
                        console.error('Web image upload error:', e);
                        uploadLog.add({
                            timestamp: started,
                            fileName: image.name,
                            error: errorMessage(e),
                            status: "failed",
                            durationMs: Date.now() - started,
                            providerId: this.activeProviderId(),
                        });
                        throw new Error(errorMessageText);
                    }
                }));
                continue;
            }

            // Handle local images
            if (this.app.vault.getAbstractFileByPath(normalizePath(image.path)) == null) {
                new Notice(this.translate.t("notice.cannotLocate").replace("{name}", image.name).replace("{path}", image.path), 10000);
                console.warn(`${normalizePath(image.path)} not exist`);
                if (this.progressModal) {
                    this.progressModal.updateProgress(image.name, false);
                }
                continue;
            }

            const localPath = image.path;
            promises.push(pool.run(async (): Promise<Image> => {
                const started = Date.now();
                try {
                    const buf = await this.adapter.readBinary(localPath);
                    const originalFile = new File([buf], image.name);
                    const {file, displayName} = await this.preprocessFile(
                        originalFile,
                        image.name,
                        buf.byteLength,
                    );

                    const imgUrl = await uploader.upload(file, file.name);
                    image.url = imgUrl;
                    image.displayName = displayName;
                    // Track the rewritten source so the markdown replacement
                    // matches the actual reference text (handles rename
                    // rules that change the basename).
                    if (displayName !== image.name) {
                        image.rewrittenSource = image.source.replace(
                            new RegExp(this.escapeRegExp(image.name), "g"),
                            displayName,
                        );
                    }
                    if (this.progressModal) {
                        this.progressModal.updateProgress(image.name, true);
                    }
                    uploadLog.add({
                        timestamp: started,
                        fileName: displayName,
                        url: imgUrl,
                        status: "success",
                        durationMs: Date.now() - started,
                        providerId: this.activeProviderId(),
                    });
                    return image;
                } catch (e) {
                    if (this.progressModal) {
                        this.progressModal.updateProgress(image.name, false);
                    }
                    const errorMessageText = this.translate.t("notice.uploadFailed").replace("{path}", localPath).replace("{error}", errorMessage(e));
                    new Notice(errorMessageText, 10000);
                    uploadLog.add({
                        timestamp: started,
                        fileName: image.name,
                        error: errorMessage(e),
                        status: "failed",
                        durationMs: Date.now() - started,
                        providerId: this.activeProviderId(),
                    });
                    throw new Error(errorMessageText);
                }
            }));
        }

        if (promises.length === 0) {
            if (this.progressModal) {
                this.progressModal.close();
            }
        }

        let successfulImages: Image[] = [];
        if (promises.length > 0) {
            const results = await Promise.all(promises.map(p => p.catch(e => {
                console.error(e);
                return null;
            })));
            successfulImages = results.filter(img => img !== null) as Image[];

            for (const image of successfulImages) {
                const altText = this.settings.imageAltText ?
                    path.parse(image.displayName || image.name)?.name?.replaceAll("-", " ")?.replaceAll("_", " ") :
                    '';
                const replacementSource = image.rewrittenSource || image.source;
                value = value.replaceAll(replacementSource, `![${altText}](${image.url})`);
            }
        }

        if (this.settings.replaceOriginalDoc) {
            if (successfulImages.length > 0 && this.getEditor()) {
                let docValue = this.getValue();
                let altText;
                for (const image of successfulImages) {
                    altText = this.settings.imageAltText ?
                        path.parse(image.displayName || image.name)?.name?.replaceAll("-", " ")?.replaceAll("_", " ") :
                        '';
                    const replacementSource = image.rewrittenSource || image.source;
                    docValue = docValue.replaceAll(replacementSource, `![${altText}](${image.url})`);
                }
                this.getEditor()?.setValue(docValue);
            }
        } else {
            const webImages = successfulImages.filter(img => img.isWebImage);
            if (webImages.length > 0 && this.getEditor()) {
                let docValue = this.getValue();
                let altText;
                for (const image of webImages) {
                    altText = this.settings.imageAltText ?
                        path.parse(image.displayName || image.name)?.name?.replaceAll("-", " ")?.replaceAll("_", " ") :
                        '';
                    const replacementSource = image.rewrittenSource || image.source;
                    docValue = docValue.replaceAll(replacementSource, `![${altText}](${image.url})`);
                }
                this.getEditor()?.setValue(docValue);
            }
        }

        if (this.settings.ignoreProperties) {
            value = value.replace(PROPERTIES_REGEX, '');
        }

        // Apply platform-format post-processor (微信公众号 / 知乎 / 掘金 / default).
        // If at least one image had a per-folder override that differs from
        // the global platformFormat, we still apply the global setting
        // (the per-folder override's imageStore / CDN are not swapped per
        // file in this build — only the post-processing platformFormat is
        // currently threaded through).
        if (this.settings.platformFormat && this.settings.platformFormat !== "default") {
            value = applyPlatform(value, this.settings.platformFormat);
        }

        switch (action) {
            case ACTION_PUBLISH:
                await navigator.clipboard.writeText(value);
                new Notice(this.translate.t("notice.copiedToClipboard"));
                break;
            default:
                throw new Error("invalid action!");
        }
    }

    /**
     * Pre-upload pipeline: compression → exif-strip → rename.
     * Returns the File to hand to the uploader plus the display name to use
     * in the markdown replacement.
     */
    private async preprocessFile(
        file: File,
        originalName: string,
        sizeBytes: number,
    ): Promise<{ file: File; displayName: string }> {
        let working = file;
        let displayName = originalName;
        const ext = (originalName.split(".").pop() || "").toLowerCase();
        const isImage = working.type.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|bmp|avif|apng|tiff|tif|ico|heic|heif)$/i.test(originalName);

        // 1. Compression (images only)
        if (isImage && this.settings.compression.enabled) {
            try {
                const out = await ImageCompressor.compress(working, this.settings.compression);
                working = new File([out.blob], out.name, { type: out.type });
                displayName = out.name;
            } catch (e) {
                console.warn("preprocessFile: compression failed, using original", e);
            }
        }

        // 2. Exif strip (images only) — also runs after compression so a
        //    fresh re-encode is attempted even when compression is off.
        if (isImage && this.settings.exifStrip.enabled) {
            try {
                const out = await ExifStripper.strip(working, this.settings.exifStrip);
                working = new File([out.blob], out.name, { type: out.type });
            } catch (e) {
                console.warn("preprocessFile: exif strip failed, using previous", e);
            }
        }

        // 3. Rename rules — applies to all file types. Operates on the
        //    *basename only*; the uploader's own path template is used for
        //    the directory portion.
        if (this.settings.renameRules.enabled && this.settings.renameRules.template && this.settings.renameRules.template.trim()) {
            try {
                const newName = RenameRules.apply(
                    this.settings.renameRules.template,
                    displayName,
                    this.settings.renameRules,
                );
                if (newName && newName !== displayName) {
                    working = new File([working], newName, { type: working.type });
                    displayName = newName;
                }
            } catch (e) {
                console.warn("preprocessFile: rename rules failed, using previous name", e);
            }
        }

        // Suppress unused var linting when sizeBytes isn't read directly here
        void sizeBytes;
        void ext;
        return {file: working, displayName};
    }

    /** Returns the active provider id, used for upload-log entries. */
    private activeProviderId(): string {
        try {
            return ImageStore.normalizeId(this.settings.imageStore);
        } catch {
            return "unknown";
        }
    }

    private escapeRegExp(s: string): string {
        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    private getImageLists(value: string, mermaidUrls: Set<string> = new Set()): Image[] {
        const images: Image[] = [];
        
        try {
            const wikiMatches = value.matchAll(WIKI_REGEX);
            for (const match of wikiMatches) {
                this.processMatched(match[1], match[0], images);
            }
            
            const mdMatches = value.matchAll(MD_REGEX);
            for (const match of mdMatches) {
                const imageUrl = match[2];
                
                // Check if it's a web image and if upload web images is enabled
                if (WebImageDownloader.isWebImage(imageUrl)) {
                    if (this.settings.uploadWebImages && !this.isAlreadyHosted(imageUrl) && !mermaidUrls.has(imageUrl)) {
                        // Add as web image to be downloaded and uploaded
                        this.processWebImage(imageUrl, match[0], images);
                    }
                    // Skip if setting is disabled or already hosted
                    continue;
                }
                
                // Skip non-uploadable local files (e.g., .txt, .md) to prevent
                // invalid uploads. Allow common image + video + pdf extensions
                // since the new upload pipeline supports those too.
                const localPath = imageUrl.split('?')[0];
                if (!/\.(png|jpg|jpeg|gif|svg|webp|excalidraw|mp4|mov|webm|pdf|avif|apng|bmp|tiff|tif|ico|heic|heif)$/i.test(localPath)) {
                    continue;
                }

                const decodedName = decodeURI(imageUrl);
                this.processMatched(decodedName, match[0], images);
            }
        } catch (error) {
            console.error("Error processing image lists:", error);
        }
        
        return images;
    }

    private processMatched(path: string, src: string, images: Image[]){
        try {
            const {resolvedPath, name} = this.resolveImagePath(path);
            // check the item with same resolvedPath
            const existingImage = images.find(image => image.path === resolvedPath);
            if (!existingImage) {
                // Pre-fetch the file size so skip-rules and the upload log
                // can use it without an extra read after the fact.
                let sizeBytes: number | undefined;
                try {
                    const af = this.app.vault.getAbstractFileByPath(resolvedPath);
                    if (af && "stat" in af) {
                        sizeBytes = (af as { stat: { size: number } }).stat.size;
                    }
                } catch {
                    sizeBytes = undefined;
                }
                images.push({
                    name,
                    displayName: name,
                    path: resolvedPath,
                    source: src,
                    url: '',
                    sizeBytes,
                });
            }
        } catch (error) {
            console.error(`Failed to process image: ${src}`, error);
        }
    }

    /**
     * Process web image URL
     */
    private processWebImage(url: string, src: string, images: Image[]) {
        try {
            // Extract a friendly name from URL
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const segments = pathname.split('/').filter(s => s.length > 0);
            const name = segments.length > 0 ? segments[segments.length - 1] : `web-image-${Date.now()}`;

            // Check if already in list
            const existingImage = images.find(image => image.path === url);
            if (!existingImage) {
                images.push({
                    name: decodeURIComponent(name),
                    displayName: decodeURIComponent(name),
                    path: url, // Store the URL as path for web images
                    source: src,
                    url: '',
                    isWebImage: true
                });
            }
        } catch (error) {
            console.error(`Failed to process web image: ${url}`, error);
        }
    }

    private isAlreadyHosted(url: string): boolean {
        return isAlreadyHosted(url, this.settings);
    }

    private resolveImagePath(imageName: string): ResolvedImagePath {
        // Obsidian attachment folder options:
        // 1. Vault folder: "/image.png"
        // 2. In the folder specified below: such as "Attachments", then "Attachments/image.png"
        // 3. Same folder as current file: "./image.png"
        // 4. In subfolder under current folder: such as "attachments", then "attachments/image.png"
        const sourcePath = this.app.workspace.getActiveFile()?.path || "";
        const targetFile = this.app.metadataCache.getFirstLinkpathDest(imageName, sourcePath);
        if (targetFile) {
            return {resolvedPath: targetFile.path, name: imageName};
        }
        return {resolvedPath: imageName, name: imageName};

    }

    private getValue(): string {
        const editor = this.getEditor();
        return editor ? editor.getValue() : "";
    }

    private getEditor(): Editor | null {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        return activeView ? activeView.editor : null;
    }
}
