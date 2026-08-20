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
    },
    cosSetting: {
        region: "",
        bucket: "",
        secretId: "",
        secretKey: "",
        path: "",
        customDomainName: "",
    },
    kodoSetting: {
        accessKey: "",
        secretKey: "",
        bucket: "",
        customDomainName: "",
        path: ""
    },
    githubSetting: {
        githubOwner: "",
        repositoryName: "",
        branchName: "main",
        token: "",
        path: "images"
    },
    r2Setting: {
        accessKeyId: "",
        secretAccessKey: "",
        endpoint: "",
        bucketName: "",
        path: "",
        customDomainName: "",
    },
    b2Setting: {
        accessKeyId: "",
        secretAccessKey: "",
        region: "",
        bucketName: "",
        path: "",
        customDomainName: "",
    },
};
export default class ObsidianPublish extends Plugin {
    settings: PublishSettings;
    imageTagProcessor: ImageTagProcessor;
    imageUploader: ImageUploader;
    statusBarItem: HTMLElement;
    translate: Translate;

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

        this.addSettingTab(new PublishSettingTab(this.app, this));

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