import {
    Notice,
    Plugin,
    TFile,
    MarkdownView,
} from "obsidian";

import ImageTagProcessor, {ACTION_PUBLISH} from "./uploader/imageTagProcessor";
import ImageUploader from "./uploader/imageUploader";
import type {ImgurAnonymousSetting} from "./uploader/imgur/imgurAnonymousUploader";
import {IMGUR_PLUGIN_CLIENT_ID} from "./uploader/imgur/constants";
import ImageStore from "./imageStore";
import buildUploader from "./uploader/imageUploaderBuilder";
import {errorMessage} from "./uploader/errorUtils";
import PublishSettingTab from "./ui/publishSettingTab";
import type {OssSetting} from "./uploader/oss/ossUploader";
import type {ImagekitSetting} from "./uploader/imagekit/imagekitUploader";
import type {AwsS3Setting} from "./uploader/s3/awsS3Uploader";
import type {CosSetting} from "./uploader/cos/cosUploader";
import type {KodoSetting} from "./uploader/qiniu/kodoUploader";
import type {GitHubSetting} from "./uploader/github/gitHubUploader";
import type {R2Setting} from "./uploader/r2/r2Uploader";
import type {B2Setting} from "./uploader/b2/b2Uploader";
import type {GyazoSetting} from "./uploader/gyazo/gyazoUploader";
import Translate, {type Language} from "./i18n/translate";
import {DEFAULT_RENAME_OPTIONS, type RenameOptions} from "./uploader/features/renameRules";
import {DEFAULT_COMPRESSION_OPTIONS, type CompressionOptions} from "./uploader/features/compression";
import {DEFAULT_SKIP_RULES_OPTIONS, type SkipRulesOptions} from "./uploader/features/skipRules";
import {DEFAULT_EXIF_OPTIONS, type ExifStripOptions} from "./uploader/features/exifStrip";
import type {PlatformId} from "./uploader/features/platformFormat";

export interface PublishSettings {
    imageAltText: boolean;
    replaceOriginalDoc: boolean;
    ignoreProperties: boolean;
    imageStore: string;
    showProgressModal: boolean;
    uploadWebImages: boolean;
    convertMermaid: boolean;
    mermaidScale: number;
    mermaidTheme: string;
    language: Language;
    // Auto-upload settings
    autoUpload: boolean;
    autoUploadSizeLimit: number; // in MB
    // Tier 1 features
    renameRules: RenameOptions & { template: string };
    compression: CompressionOptions;
    skipRules: SkipRulesOptions;
    // Tier 2 features
    uploadConcurrency: number;       // 1..16
    platformFormat: PlatformId;
    // Tier 3 features
    exifStrip: ExifStripOptions;
    // First-install tracking (empty string = first install)
    installedVersion: string;
    //Imgur Anonymous setting
    imgurAnonymousSetting: ImgurAnonymousSetting;
    gyazoSetting: GyazoSetting;
    ossSetting: OssSetting;
    imagekitSetting: ImagekitSetting;
    awsS3Setting: AwsS3Setting;
    cosSetting: CosSetting;
    kodoSetting: KodoSetting;
    githubSetting: GitHubSetting;
    r2Setting: R2Setting;
    b2Setting: B2Setting;
}

const DEFAULT_SETTINGS: PublishSettings = {
    imageAltText: true,
    replaceOriginalDoc: false,
    ignoreProperties: true,
    imageStore: ImageStore.GITHUB.id,
    showProgressModal: true,
    uploadWebImages: false,
    convertMermaid: false,
    mermaidScale: 2,
    mermaidTheme: "default",
    language: "zh",
    autoUpload: false,
    autoUploadSizeLimit: 30,
    // Tier 1 features
    renameRules: { ...DEFAULT_RENAME_OPTIONS, template: "" },
    compression: { ...DEFAULT_COMPRESSION_OPTIONS },
    skipRules: { ...DEFAULT_SKIP_RULES_OPTIONS },
    // Tier 2 features
    uploadConcurrency: 3,
    platformFormat: "default",
    // Tier 3 features
    exifStrip: { ...DEFAULT_EXIF_OPTIONS },
    installedVersion: "",
    imgurAnonymousSetting: {clientId: IMGUR_PLUGIN_CLIENT_ID},
    gyazoSetting: {
        accessToken: "",
        accessPolicy: "anyone",
        desc: "",
    },
    ossSetting: {
        region: "oss-cn-hangzhou",
        accessKeyId: "",
        accessKeySecret: "",
        bucket: "",
        endpoint: "https://oss-cn-hangzhou.aliyuncs.com/",
        path: "",
        customDomainName: "",
        cdnId: "oss-native",
    },
    imagekitSetting: {
        endpoint: "",
        imagekitID: "",
        privateKey: "",
        publicKey: "",
        folder: "",
    },
    awsS3Setting: {
        accessKeyId: "",
        secretAccessKey: "",
        region: "",
        bucketName: "",
        path: "",
        customDomainName: "",
        cdnId: "s3-native",
    },
    cosSetting: {
        region: "",
        bucket: "",
        secretId: "",
        secretKey: "",
        path: "",
        customDomainName: "",
        cdnId: "cos-native",
    },
    kodoSetting: {
        accessKey: "",
        secretKey: "",
        bucket: "",
        customDomainName: "",
        path: "",
        cdnId: "qiniu-native",
    },
    githubSetting: {
        githubOwner: "",
        repositoryName: "",
        branchName: "main",
        token: "",
        path: "images",
        cdnId: "jsdelivr",
        customDomain: "",
    },
    r2Setting: {
        accessKeyId: "",
        secretAccessKey: "",
        endpoint: "",
        bucketName: "",
        path: "",
        customDomainName: "",
        cdnId: "r2-native",
    },
    b2Setting: {
        accessKeyId: "",
        secretAccessKey: "",
        region: "",
        bucketName: "",
        path: "",
        customDomainName: "",
        cdnId: "s3-native",
    },
};
export default class ObsidianPublish extends Plugin {
    settings: PublishSettings;
    imageTagProcessor: ImageTagProcessor;
    imageUploader: ImageUploader;
    statusBarItem: HTMLElement;
    translate: Translate;
    /** Set by `PublishSettingTab` so welcome / log / etc. can switch tabs. */
    settingTab: PublishSettingTab | null = null;

    async onload() {
        await this.loadSettings();
        this.translate = new Translate(this.settings.language);
        // Create status bar item that will be used if modal is disabled
        this.statusBarItem = this.addStatusBarItem();
        this.setupImageUploader();

        // ── Command: publish page ──
        this.addCommand({
            id: "publish-page",
            name: this.translate.t("command.publishPage"),
            checkCallback: (checking: boolean) => {
                if (!checking) {
                    this.publish()
                }
                return true;
            }
        });

        // ── Ribbon icon ──
        this.addRibbonIcon("upload-cloud", this.translate.t("ribbon.title"), () => {
            // @ts-expect-error - setting API available at runtime
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            this.app.setting.open();
            // @ts-expect-error - openTabById available at runtime
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            this.app.setting.openTabById(this.manifest.id);
        });

        // ── File context menu ──
        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, file) => {
                if (!(file instanceof TFile)) return;
                menu.addItem((item) => {
                    item.setTitle(this.translate.t("contextMenu.uploadFile"))
                        .setIcon("upload-cloud")
                        .onClick(() => {
                            this.uploadSingleFile(file).catch(err => {
                                console.error("obsidian-file-upload: context menu upload failed", err);
                            });
                        });
                });
            })
        );

        // ── Auto-upload on file create ──
        this.registerEvent(
            this.app.vault.on("create", (file) => {
                if (!this.settings.autoUpload) return;
                if (!(file instanceof TFile)) return;
                // Skip if the file is in the plugin directory
                if (file.path.startsWith(this.app.vault.configDir + "/")) return;
                void this.handleAutoUpload(file);
            })
        );

        this.settingTab = new PublishSettingTab(this.app, this);
        this.addSettingTab(this.settingTab);

        // ── First-install: auto-open settings ──
        if (!this.settings.installedVersion) {
            this.app.workspace.onLayoutReady(() => {
                // @ts-expect-error - openTabById is available but not typed
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                this.app.setting.open();
                // @ts-expect-error - openTabById is available but not typed
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                this.app.setting.openTabById(this.manifest.id);
            });
        }
    }

    onunload() {
        // console.log("unloading plugin");
    }

    async loadSettings() {
        const loadedData = (await this.loadData()) as Partial<PublishSettings> | null;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
        this.settings.imageStore = ImageStore.normalizeId(this.settings.imageStore);
        this.settings.gyazoSetting = Object.assign({}, DEFAULT_SETTINGS.gyazoSetting, loadedData?.gyazoSetting);
        // Deep-merge new feature settings so missing fields in old data.json
        // don't fall through to undefined.
        this.settings.renameRules = Object.assign({} as PublishSettings["renameRules"], DEFAULT_SETTINGS.renameRules, loadedData?.renameRules);
        this.settings.compression = Object.assign({} as PublishSettings["compression"], DEFAULT_SETTINGS.compression, loadedData?.compression);
        this.settings.skipRules = Object.assign({} as PublishSettings["skipRules"], DEFAULT_SETTINGS.skipRules, loadedData?.skipRules);
        this.settings.exifStrip = Object.assign({} as PublishSettings["exifStrip"], DEFAULT_SETTINGS.exifStrip, loadedData?.exifStrip);
        this.settings.githubSetting = Object.assign({} as PublishSettings["githubSetting"], DEFAULT_SETTINGS.githubSetting, loadedData?.githubSetting);
        // One-shot migration: existing users who still carry the pre-1.6.8
        // default of "github-raw" (i.e. they never picked a CDN themselves)
        // are switched to "jsdelivr" so out-of-the-box uploads get a fast
        // CDN URL instead of the slow raw.githubusercontent.com host.
        if (this.shouldMigrateCdnDefault()) {
            if (this.settings.githubSetting.cdnId === "github-raw") {
                this.settings.githubSetting.cdnId = "jsdelivr";
            }
        }
    }

    /**
     * Returns true if the user's installedVersion is from a build prior to
     * the jsdelivr default — i.e. they're upgrading from a version where
     * "github-raw" was the hard-coded default. Empty installedVersion
     * means fresh install, which already gets the new default via
     * DEFAULT_SETTINGS, so no migration is needed.
     */
    private shouldMigrateCdnDefault(): boolean {
        const v = this.settings.installedVersion;
        if (!v) return false;
        // Simple semver-ish compare: split on ".", pad, compare lexicographically.
        const parse = (s: string) => s.split(".").map(n => parseInt(n, 10) || 0);
        const [aMaj, aMin, aPat] = parse(v);
        const [bMaj, bMin, bPat] = parse(this.manifest?.version || "1.6.7");
        if (aMaj !== bMaj) return aMaj < bMaj;
        if (aMin !== bMin) return aMin < bMin;
        return aPat < bPat;
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private publish(): void {
        if (!this.imageUploader) {
            new Notice(this.translate.t("notice.uploaderSetupFailed"))
        } else {
            this.imageTagProcessor.process(ACTION_PUBLISH).catch((err: unknown) => {
                console.error("Image upload toolkit: publish failed", err);
                new Notice(this.translate.t("notice.publishFailed").replace("{error}", errorMessage(err)), 8000);
            });
        }
    }

    setupImageUploader(): void {
        try {
            this.imageUploader = buildUploader(this.settings);
            // Create ImageTagProcessor with the user's preference for modal vs status bar
            this.imageTagProcessor = new ImageTagProcessor(
                this.app,
                this.settings,
                this.imageUploader,
                this.settings.showProgressModal,
                this.translate,
            );
        } catch (e) {
            console.error(`Failed to setup image uploader: ${e}`)
        }
    }

    // ── Upload a single file (for context menu & auto-upload) ──

    /** Upload a single file to the configured cloud storage. */
    async uploadSingleFile(file: TFile): Promise<string | null> {
        if (!this.imageUploader) {
            new Notice(this.translate.t("notice.uploaderSetupFailed"));
            return null;
        }

        // Check file type support
        const ext = file.extension.toLowerCase();
        if (!this.imageUploader.supportsFileType(ext)) {
            new Notice(this.translate.t("notice.fileTypeNotSupported").replace("{ext}", ext));
            return null;
        }

        try {
            const buf = await this.app.vault.readBinary(file);
            const uploadFile = new File([buf], file.name);
            const url = await this.imageUploader.upload(uploadFile, file.path);
            new Notice(this.translate.t("notice.uploadSuccess").replace("{url}", url));
            return url;
        } catch (err) {
            console.error("obsidian-file-upload: upload failed", err);
            new Notice(this.translate.t("notice.uploadFailed").replace("{path}", file.path).replace("{error}", errorMessage(err)), 8000);
            return null;
        }
    }

    /** Handle auto-upload when a new file is created in the vault. */
    private async handleAutoUpload(file: TFile): Promise<void> {
        // Size check
        const maxBytes = this.settings.autoUploadSizeLimit * 1024 * 1024;
        if (file.stat.size > maxBytes) return;

        // Check file type support
        const ext = file.extension.toLowerCase();
        if (!this.imageUploader || !this.imageUploader.supportsFileType(ext)) return;

        const url = await this.uploadSingleFile(file);
        if (!url) return;

        // For images, try to replace the reference in the current document
        const imageExts = new Set(["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "tiff", "tif", "ico", "apng", "avif", "heic", "heif"]);
        if (imageExts.has(ext)) {
            await this.replaceImageRefInActiveDoc(file, url);
        }
    }

    /** Replace local image references in the active document with the remote URL. */
    private async replaceImageRefInActiveDoc(file: TFile, url: string): Promise<void> {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return;

        const editor = activeView.editor;
        const docContent = editor.getValue();

        // Match wiki-link format: ![[file.png]] or ![[file.png|alt]]
        const wikiPattern = new RegExp(`!\\[\\[${escapeRegex(file.name)}(\\|[^\\]]*)?\\]\\]`, "g");
        // Match markdown format: ![alt](file.png) or ![alt](file "title")
        const mdPattern = new RegExp(`!\\[[^\\]]*\\]\\(${escapeRegex(file.name)}(\\s+"[^"]*")?\\)`, "g");

        let newContent = docContent;
        let replaced = false;

        if (wikiPattern.test(docContent)) {
            newContent = docContent.replace(wikiPattern, `![${file.name}](${url})`);
            replaced = true;
        } else if (mdPattern.test(docContent)) {
            newContent = docContent.replace(mdPattern, `![${file.name}](${url})`);
            replaced = true;
        }

        if (replaced) {
            if (this.settings.replaceOriginalDoc) {
                editor.setValue(newContent);
            }
        }
    }
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}