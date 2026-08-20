import {App, Notice, PluginSettingTab, Setting} from "obsidian";
import ObsidianPublish from "../publish";
import ImageStore from "../imageStore";
import {AliYunRegionList} from "../uploader/oss/common";
import {TencentCloudRegionList} from "../uploader/cos/common";
import type {Language} from "../i18n/translate";
import GitHubUploader from "../uploader/github/gitHubUploader";

type TabId = "welcome" | "general" | "upload" | "mermaid" | "imageStore";

export default class PublishSettingTab extends PluginSettingTab {
    private plugin: ObsidianPublish;
    private imageStoreDiv: HTMLDivElement;
    private activeTab: TabId = "welcome";

    constructor(app: App, plugin: ObsidianPublish) {
        super(app, plugin);
        this.plugin = plugin;
        this.activeTab = plugin.settings.installedVersion ? "general" : "welcome";
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();
        containerEl.addClass("iuf-settings");
        // Remove top padding from Obsidian's settings container
        containerEl.parentElement?.classList.add("iuf-settings-parent");
        this.plugin.settings.imageStore = ImageStore.normalizeId(this.plugin.settings.imageStore);

        const t: (key: string) => string = (key: string) => this.plugin.translate.t(key);

        // ── Tab bar ──
        const tabBar = containerEl.createDiv({cls: "iuf-tab-bar"});
        const tabs: {id: TabId; label: string}[] = [
            {id: "welcome", label: t("settings.tabs.welcome")},
            {id: "general", label: t("settings.tabs.general")},
            {id: "upload", label: t("settings.tabs.upload")},
            {id: "mermaid", label: t("settings.tabs.mermaid")},
            {id: "imageStore", label: t("settings.tabs.imageStore")},
        ];

        const tabButtons: Map<TabId, HTMLDivElement> = new Map();
        for (const tab of tabs) {
            const btn = tabBar.createDiv({cls: "iuf-tab-btn", text: tab.label});
            if (tab.id === this.activeTab) btn.addClass("active");
            btn.addEventListener("click", () => {
                this.activeTab = tab.id;
                tabButtons.forEach((b, id) => b.toggleClass("active", id === tab.id));
                this.renderTabContent(contentEl);
            });
            tabButtons.set(tab.id, btn);
        }

        // ── Content ──
        const contentEl = containerEl.createDiv({cls: "iuf-tab-content"});
        this.renderTabContent(contentEl);
    }

    hide(): void {
        // Restore parent padding when leaving our settings
        this.containerEl.parentElement?.classList.remove("iuf-settings-parent");
        // Mark as installed when user closes settings (even without clicking "Get Started")
        if (!this.plugin.settings.installedVersion) {
            this.plugin.settings.installedVersion = this.plugin.manifest?.version || "1.0.0";
        }
        void this.plugin.saveSettings().then(() => {
            this.plugin.setupImageUploader();
        }).catch(err => {
            console.error("obsidian-file-upload: saveSettings failed", err);
        });
    }

    // ── Tab rendering ──────────────────────────────────────────────────────

    private renderTabContent(el: HTMLDivElement): void {
        el.empty();
        switch (this.activeTab) {
            case "welcome": this.renderWelcome(el); break;
            case "general": this.renderGeneral(el); break;
            case "upload": this.renderUpload(el); break;
            case "mermaid": this.renderMermaid(el); break;
            case "imageStore": this.renderImageStore(el); break;
        }
    }

    // ── Welcome ──

    private renderWelcome(el: HTMLDivElement): void {
        const t: (key: string) => string = (key: string) => this.t(key);

        const wrap = el.createDiv({cls: "iuf-welcome"});

        // Hero — title + subtitle
        const hero = wrap.createDiv({cls: "iuf-welcome-hero"});
        const titleSetting = new Setting(hero)
            .setName(t("settings.welcome.title"))
            .setHeading();
        titleSetting.nameEl.addClass("iuf-welcome-title");
        hero.createEl("p", {
            text: t("settings.welcome.subtitle"),
            cls: "iuf-welcome-subtitle",
        });

        // Core settings card
        const card = wrap.createDiv({cls: "iuf-welcome-card"});

        new Setting(card)
            .setName(t("settings.language.name"))
            .setDesc(t("settings.language.desc"))
            .setClass("iuf-welcome-row")
            .addDropdown(dd => {
                dd.addOption("zh", "中文");
                dd.addOption("en", "English");
                dd.addOption("zh-tw", "繁體中文");
                dd.setValue(this.plugin.settings.language);
                dd.onChange(async (v: Language) => {
                    this.plugin.settings.language = v;
                    this.plugin.translate.switch(v);
                    this.display();
                });
            });

        new Setting(card)
            .setName(t("settings.imageStore.select.name"))
            .setDesc(t("settings.imageStore.select.desc"))
            .setClass("iuf-welcome-row")
            .addDropdown(dd => {
                ImageStore.lists.forEach(s => {
                    const providerKey = `settings.imageStore.providers.${s.id}`;
                    dd.addOption(s.id, t(providerKey));
                });
                dd.setValue(this.plugin.settings.imageStore);
                dd.onChange(async (v) => {
                    this.plugin.settings.imageStore = v;
                    this.plugin.setupImageUploader();
                });
            });

        // Usage hint
        const tip = wrap.createDiv({cls: "iuf-welcome-tip"});
        tip.createEl("p", {text: t("settings.welcome.usageHint")});

        // Single primary action — go straight to the image-store tab to finish setup
        const actions = wrap.createDiv({cls: "iuf-welcome-actions"});
        const btn = actions.createEl("button", {
            text: t("settings.welcome.getStarted"),
            cls: "iuf-btn-primary iuf-welcome-cta",
        });
        btn.addEventListener("click", () => {
            this.plugin.settings.installedVersion = this.plugin.manifest?.version || "1.0.0";
            void this.plugin.saveSettings();
            this.activeTab = "imageStore";
            this.display();
        });
    }

    // ── General ──

    private renderGeneral(el: HTMLDivElement): void {
        const t: (key: string) => string = (key: string) => this.t(key);

        new Setting(el)
            .setName(t("settings.language.name"))
            .setDesc(t("settings.language.desc"))
            .addDropdown(dd => {
                dd.addOption("zh", "中文");
                dd.addOption("en", "English");
                dd.addOption("zh-tw", "繁體中文");
                dd.setValue(this.plugin.settings.language);
                dd.onChange(async (v: Language) => {
                    this.plugin.settings.language = v;
                    this.plugin.translate.switch(v);
                    this.display();
                });
            });

        new Setting(el)
            .setName(t("settings.general.imageAltText.name"))
            .setDesc(t("settings.general.imageAltText.desc"))
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.imageAltText)
                    .onChange(value => this.plugin.settings.imageAltText = value)
            );

        new Setting(el)
            .setName(t("settings.general.replaceOriginalDoc.name"))
            .setDesc(t("settings.general.replaceOriginalDoc.desc"))
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.replaceOriginalDoc)
                    .onChange(value => this.plugin.settings.replaceOriginalDoc = value)
            );

        new Setting(el)
            .setName(t("settings.general.ignoreProperties.name"))
            .setDesc(t("settings.general.ignoreProperties.desc"))
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.ignoreProperties)
                    .onChange(value => this.plugin.settings.ignoreProperties = value)
            );
    }

    // ── Upload ──

    private renderUpload(el: HTMLDivElement): void {
        const t: (key: string) => string = (key: string) => this.t(key);

        new Setting(el)
            .setName(t("settings.upload.showProgressModal.name"))
            .setDesc(t("settings.upload.showProgressModal.desc"))
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.showProgressModal)
                    .onChange(value => this.plugin.settings.showProgressModal = value)
            );

        new Setting(el)
            .setName(t("settings.upload.uploadWebImages.name"))
            .setDesc(t("settings.upload.uploadWebImages.desc"))
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.uploadWebImages)
                    .onChange(value => this.plugin.settings.uploadWebImages = value)
            );

        // ── Auto Upload ──
        new Setting(el).setName(t("settings.autoUpload.heading")).setHeading();

        new Setting(el)
            .setName(t("settings.autoUpload.enable.name"))
            .setDesc(t("settings.autoUpload.enable.desc"))
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.autoUpload)
                    .onChange(value => this.plugin.settings.autoUpload = value)
            );

        new Setting(el)
            .setName(t("settings.autoUpload.sizeLimit.name"))
            .setDesc(t("settings.autoUpload.sizeLimit.desc"))
            .addSlider(slider =>
                slider
                    .setLimits(1, 100, 1)
                    .setValue(this.plugin.settings.autoUploadSizeLimit)
                    .setDynamicTooltip()
                    .onChange(value => this.plugin.settings.autoUploadSizeLimit = value)
            );
    }

    // ── Mermaid ──

    private renderMermaid(el: HTMLDivElement): void {
        const t: (key: string) => string = (key: string) => this.t(key);

        new Setting(el)
            .setName(t("settings.mermaid.convert.name"))
            .setDesc(t("settings.mermaid.convert.desc"))
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.convertMermaid)
                    .onChange(value => this.plugin.settings.convertMermaid = value)
            );

        new Setting(el)
            .setName(t("settings.mermaid.scale.name"))
            .setDesc(t("settings.mermaid.scale.desc"))
            .addSlider(slider =>
                slider
                    .setLimits(1, 4, 1)
                    .setValue(this.plugin.settings.mermaidScale)
                    .setDynamicTooltip()
                    .onChange(value => this.plugin.settings.mermaidScale = value)
            );

        new Setting(el)
            .setName(t("settings.mermaid.theme.name"))
            .setDesc(t("settings.mermaid.theme.desc"))
            .addDropdown(dd => {
                const themes: Record<string, string> = {
                    "default": t("settings.mermaid.theme.options.default"),
                    "dark": t("settings.mermaid.theme.options.dark"),
                    "forest": t("settings.mermaid.theme.options.forest"),
                    "neutral": t("settings.mermaid.theme.options.neutral"),
                    "base": t("settings.mermaid.theme.options.base"),
                };
                Object.entries(themes).forEach(([value, label]) => { dd.addOption(value, label); });
                dd.setValue(this.plugin.settings.mermaidTheme);
                dd.onChange(value => this.plugin.settings.mermaidTheme = value);
            });
    }

    // ── Image Store ──

    private renderImageStore(el: HTMLDivElement): void {
        const t: (key: string) => string = (key: string) => this.t(key);

        const imageStoreTypeDiv = el.createDiv();
        this.imageStoreDiv = el.createDiv();

        new Setting(imageStoreTypeDiv)
            .setName(t("settings.imageStore.select.name"))
            .setDesc(t("settings.imageStore.select.desc"))
            .addDropdown(dd => {
                ImageStore.lists.forEach(s => {
                    const providerKey = `settings.imageStore.providers.${s.id}`;
                    dd.addOption(s.id, t(providerKey));
                });
                dd.setValue(this.plugin.settings.imageStore);
                dd.onChange(async (v) => {
                    this.plugin.settings.imageStore = v;
                    this.plugin.setupImageUploader();
                    await this.drawImageStoreSettings(this.imageStoreDiv);
                });
            });
        void this.drawImageStoreSettings(this.imageStoreDiv);
    }

    // ── Provider settings ──────────────────────────────────────────────────

    private async drawImageStoreSettings(parentEL: HTMLDivElement) {
        parentEL.empty();
        switch (ImageStore.normalizeId(this.plugin.settings.imageStore)) {
            case ImageStore.IMGUR.id:
                this.drawImgurSetting(parentEL);
                break;
            case ImageStore.GYAZO.id:
                this.drawGyazoSetting(parentEL);
                break;
            case ImageStore.ALIYUN_OSS.id:
                this.drawOSSSetting(parentEL);
                break;
            case ImageStore.ImageKit.id:
                this.drawImageKitSetting(parentEL);
                break;
            case ImageStore.AWS_S3.id:
                this.drawAwsS3Setting(parentEL);
                break;
            case ImageStore.TENCENTCLOUD_COS.id:
                this.drawTencentCloudCosSetting(parentEL);
                break;
            case ImageStore.QINIU_KUDO.id:
                this.drawQiniuSetting(parentEL);
                break
            case ImageStore.GITHUB.id:
                this.drawGitHubSetting(parentEL);
                break;
            case ImageStore.CLOUDFLARE_R2.id:
                this.drawR2Setting(parentEL);
                break;
            case ImageStore.BACKBLAZE_B2.id:
                this.drawB2Setting(parentEL);
                break;
            default:
                throw new Error("Should not reach here!")
        }
    }

    private t(key: string): string {
        return this.plugin.translate.t(key);
    }

    // Imgur Setting
    private drawImgurSetting(parentEL: HTMLDivElement) {
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.imgur.clientId.name"))
            .setDesc(PublishSettingTab.clientIdSettingDescription(this.t("settings.imageStore.imgur.clientId.desc")))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.imgur.clientId.placeholder"))
                    .setValue(this.plugin.settings.imgurAnonymousSetting.clientId)
                    .onChange(value => this.plugin.settings.imgurAnonymousSetting.clientId = value)
            )
    }

    private static clientIdSettingDescription(desc: string) {
        const url = "https://api.imgur.com/oauth2/addclient";
        return createFragment(frag => {
            frag.append(desc);
            frag.createEl("a", { text: url, href: url });
        });
    }

    private drawGyazoSetting(parentEL: HTMLDivElement) {
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.gyazo.accessToken.name"))
            .setDesc(PublishSettingTab.gyazoTokenSettingDescription(this.t("settings.imageStore.gyazo.accessToken.desc")))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.gyazo.accessToken.placeholder"))
                    .setValue(this.plugin.settings.gyazoSetting.accessToken)
                    .onChange(value => this.plugin.settings.gyazoSetting.accessToken = value)
            );

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.gyazo.accessPolicy.name"))
            .setDesc(this.t("settings.imageStore.gyazo.accessPolicy.desc"))
            .addDropdown(dropdown =>
                dropdown
                    .addOption("anyone", this.t("settings.imageStore.gyazo.accessPolicy.anyone"))
                    .addOption("only_me", this.t("settings.imageStore.gyazo.accessPolicy.onlyMe"))
                    .setValue(this.plugin.settings.gyazoSetting.accessPolicy)
                    .onChange((value: "anyone" | "only_me") => this.plugin.settings.gyazoSetting.accessPolicy = value)
            );

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.gyazo.commonDescription.name"))
            .setDesc(this.t("settings.imageStore.gyazo.commonDescription.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.gyazo.commonDescription.placeholder"))
                    .setValue(this.plugin.settings.gyazoSetting.desc)
                    .onChange(value => this.plugin.settings.gyazoSetting.desc = value)
            );
    }

    private static gyazoTokenSettingDescription(desc: string) {
        const url = "https://gyazo.com/oauth/applications";
        return createFragment(frag => {
            frag.append(desc);
            frag.createEl("a", { text: url, href: url });
        });
    }

    // Aliyun OSS Setting
    private drawOSSSetting(parentEL: HTMLDivElement) {
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.oss.region.name"))
            .setDesc(this.t("settings.imageStore.oss.region.desc"))
            .addDropdown(dropdown =>
                dropdown
                    .addOptions(AliYunRegionList)
                    .setValue(this.plugin.settings.ossSetting.region)
                    .onChange(value => {
                        this.plugin.settings.ossSetting.region = value;
                        this.plugin.settings.ossSetting.endpoint = `https://${value}.aliyuncs.com/`;
                    })
            )
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.oss.accessKeyId.name"))
            .setDesc(this.t("settings.imageStore.oss.accessKeyId.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.oss.accessKeyId.placeholder"))
                    .setValue(this.plugin.settings.ossSetting.accessKeyId)
                    .onChange(value => this.plugin.settings.ossSetting.accessKeyId = value))
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.oss.accessKeySecret.name"))
            .setDesc(this.t("settings.imageStore.oss.accessKeySecret.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.oss.accessKeySecret.placeholder"))
                    .setValue(this.plugin.settings.ossSetting.accessKeySecret)
                    .onChange(value => this.plugin.settings.ossSetting.accessKeySecret = value))
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.oss.bucket.name"))
            .setDesc(this.t("settings.imageStore.oss.bucket.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.oss.bucket.placeholder"))
                    .setValue(this.plugin.settings.ossSetting.bucket)
                    .onChange(value => this.plugin.settings.ossSetting.bucket = value))

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.oss.path.name"))
            .setDesc(this.t("settings.imageStore.oss.path.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.oss.path.placeholder"))
                    .setValue(this.plugin.settings.ossSetting.path)
                    .onChange(value => this.plugin.settings.ossSetting.path = value))

        //custom domain
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.oss.customDomain.name"))
            .setDesc(this.t("settings.imageStore.oss.customDomain.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.oss.customDomain.placeholder"))
                    .setValue(this.plugin.settings.ossSetting.customDomainName)
                    .onChange(value => this.plugin.settings.ossSetting.customDomainName = value))
    }

    private drawImageKitSetting(parentEL: HTMLDivElement) {
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.imagekit.imagekitId.name"))
            .setDesc(PublishSettingTab.imagekitSettingDescription(this.t("settings.imageStore.imagekit.imagekitId.desc")))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.imagekit.imagekitId.placeholder"))
                    .setValue(this.plugin.settings.imagekitSetting.imagekitID)
                    .onChange(value => {
                        this.plugin.settings.imagekitSetting.imagekitID = value
                        this.plugin.settings.imagekitSetting.endpoint = `https://ik.imagekit.io/${value}/`
                    }))

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.imagekit.folder.name"))
            .setDesc(this.t("settings.imageStore.imagekit.folder.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.imagekit.folder.placeholder"))
                    .setValue(this.plugin.settings.imagekitSetting.folder)
                    .onChange(value => this.plugin.settings.imagekitSetting.folder = value))

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.imagekit.publicKey.name"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.imagekit.publicKey.placeholder"))
                    .setValue(this.plugin.settings.imagekitSetting.publicKey)
                    .onChange(value => this.plugin.settings.imagekitSetting.publicKey = value))

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.imagekit.privateKey.name"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.imagekit.privateKey.placeholder"))
                    .setValue(this.plugin.settings.imagekitSetting.privateKey)
                    .onChange(value => this.plugin.settings.imagekitSetting.privateKey = value))
    }

    private static imagekitSettingDescription(desc: string) {
        const url = "https://imagekit.io/dashboard/developer/api-keys";
        return createFragment(frag => {
            frag.append(desc);
            frag.createEl("a", { text: url, href: url });
        });
    }

    private drawAwsS3Setting(parentEL: HTMLDivElement) {
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.awsS3.accessKeyId.name"))
            .setDesc(this.t("settings.imageStore.awsS3.accessKeyId.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.awsS3.accessKeyId.placeholder"))
                .setValue(this.plugin.settings.awsS3Setting?.accessKeyId || '')
                .onChange(value => this.plugin.settings.awsS3Setting.accessKeyId = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.awsS3.secretAccessKey.name"))
            .setDesc(this.t("settings.imageStore.awsS3.secretAccessKey.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.awsS3.secretAccessKey.placeholder"))
                .setValue(this.plugin.settings.awsS3Setting?.secretAccessKey || '')
                .onChange(value => this.plugin.settings.awsS3Setting.secretAccessKey = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.awsS3.region.name"))
            .setDesc(this.t("settings.imageStore.awsS3.region.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.awsS3.region.placeholder"))
                .setValue(this.plugin.settings.awsS3Setting?.region || '')
                .onChange(value => this.plugin.settings.awsS3Setting.region = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.awsS3.bucket.name"))
            .setDesc(this.t("settings.imageStore.awsS3.bucket.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.awsS3.bucket.placeholder"))
                .setValue(this.plugin.settings.awsS3Setting?.bucketName || '')
                .onChange(value => this.plugin.settings.awsS3Setting.bucketName = value));
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.awsS3.path.name"))
            .setDesc(this.t("settings.imageStore.awsS3.path.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.awsS3.path.placeholder"))
                    .setValue(this.plugin.settings.awsS3Setting.path)
                    .onChange(value => this.plugin.settings.awsS3Setting.path = value))

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.awsS3.customDomain.name"))
            .setDesc(this.t("settings.imageStore.awsS3.customDomain.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.awsS3.customDomain.placeholder"))
                    .setValue(this.plugin.settings.awsS3Setting.customDomainName)
                    .onChange(value => this.plugin.settings.awsS3Setting.customDomainName = value))
    }

    private drawTencentCloudCosSetting(parentEL: HTMLDivElement) {
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.cos.region.name"))
            .setDesc(this.t("settings.imageStore.cos.region.desc"))
            .addDropdown(dropdown =>
                dropdown
                    .addOptions(TencentCloudRegionList)
                    .setValue(this.plugin.settings.cosSetting.region)
                    .onChange(value => {
                        this.plugin.settings.cosSetting.region = value;
                    })
            )
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.cos.secretId.name"))
            .setDesc(this.t("settings.imageStore.cos.secretId.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.cos.secretId.placeholder"))
                    .setValue(this.plugin.settings.cosSetting.secretId)
                    .onChange(value => this.plugin.settings.cosSetting.secretId = value))
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.cos.secretKey.name"))
            .setDesc(this.t("settings.imageStore.cos.secretKey.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.cos.secretKey.placeholder"))
                    .setValue(this.plugin.settings.cosSetting.secretKey)
                    .onChange(value => this.plugin.settings.cosSetting.secretKey = value))
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.cos.bucket.name"))
            .setDesc(this.t("settings.imageStore.cos.bucket.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.cos.bucket.placeholder"))
                    .setValue(this.plugin.settings.cosSetting.bucket)
                    .onChange(value => this.plugin.settings.cosSetting.bucket = value))

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.cos.path.name"))
            .setDesc(this.t("settings.imageStore.cos.path.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.cos.path.placeholder"))
                    .setValue(this.plugin.settings.cosSetting.path)
                    .onChange(value => this.plugin.settings.cosSetting.path = value))

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.cos.customDomain.name"))
            .setDesc(this.t("settings.imageStore.cos.customDomain.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.cos.customDomain.placeholder"))
                    .setValue(this.plugin.settings.cosSetting.customDomainName)
                    .onChange(value => this.plugin.settings.cosSetting.customDomainName = value))
    }

    private drawQiniuSetting(parentEL: HTMLDivElement) {
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.qiniu.accessKey.name"))
            .setDesc(this.t("settings.imageStore.qiniu.accessKey.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.qiniu.accessKey.placeholder"))
                    .setValue(this.plugin.settings.kodoSetting.accessKey)
                    .onChange(value => this.plugin.settings.kodoSetting.accessKey = value))
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.qiniu.secretKey.name"))
            .setDesc(this.t("settings.imageStore.qiniu.secretKey.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.qiniu.secretKey.placeholder"))
                    .setValue(this.plugin.settings.kodoSetting.secretKey)
                    .onChange(value => this.plugin.settings.kodoSetting.secretKey = value))
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.qiniu.bucket.name"))
            .setDesc(this.t("settings.imageStore.qiniu.bucket.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.qiniu.bucket.placeholder"))
                    .setValue(this.plugin.settings.kodoSetting.bucket)
                    .onChange(value => this.plugin.settings.kodoSetting.bucket = value))

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.qiniu.customDomain.name"))
            .setDesc(this.t("settings.imageStore.qiniu.customDomain.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.qiniu.customDomain.placeholder"))
                    .setValue(this.plugin.settings.kodoSetting.customDomainName)
                    .onChange(value => this.plugin.settings.kodoSetting.customDomainName = value))
    }

    private drawGitHubSetting(parentEL: HTMLDivElement) {
        const t: (key: string) => string = (key: string) => this.t(key);
        const settings = this.plugin.settings.githubSetting;

        // ── Status (declared first so onChange handlers can refresh it) ──
        const statusDiv = parentEL.createDiv({cls: "iuf-github-status"});
        const updateStatus = () => {
            statusDiv.empty();
            if (settings.repositoryName) {
                const ownerSegment = settings.githubOwner || "_";
                const url = `https://github.com/${ownerSegment}/${settings.repositoryName}`;
                statusDiv.createEl("span", {
                    text: `✓ ${t("settings.imageStore.github.connected")}: `,
                    cls: "iuf-github-connected",
                });
                const linkText = settings.githubOwner
                    ? `${settings.githubOwner}/${settings.repositoryName}`
                    : settings.repositoryName;
                const link = statusDiv.createEl("a", {
                    text: linkText,
                    href: url,
                    cls: "iuf-github-link",
                });
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener noreferrer");
            }
        };

        // ── Token (full width, masked, with show/hide toggle).
        //    Custom layout so the toggle button can sit next to the input
        //    instead of wrapping to a new line.
        const tokenItem = parentEL.createDiv({cls: "setting-item iuf-github-token"});
        const tokenInfo = tokenItem.createDiv({cls: "setting-item-info"});
        tokenInfo.createDiv({
            cls: "setting-item-name",
            text: t("settings.imageStore.github.token.name"),
        });
        const tokenDescEl = tokenInfo.createDiv({cls: "setting-item-description"});
        tokenDescEl.appendChild(
            PublishSettingTab.githubTokenDescription(t("settings.imageStore.github.token.desc"))
        );

        const tokenControl = tokenItem.createDiv({cls: "setting-item-control"});
        const tokenInputWrap = tokenControl.createDiv({cls: "iuf-token-input-wrap"});
        const tokenInput = tokenInputWrap.createEl("input", {
            type: "password",
            cls: "iuf-token-input",
        });
        tokenInput.placeholder = t("settings.imageStore.github.token.placeholder");
        tokenInput.value = settings.token;

        // Track the token value seen at last blur so we can detect a change
        // and invalidate the cached owner / repository before refetching.
        let lastSeenToken = settings.token;

        tokenInput.addEventListener("input", () => {
            settings.token = tokenInput.value;
            this.plugin.settings.githubSetting = settings;
        });

        const toggleBtn = tokenControl.createEl("button", {
            text: "\u{1F441}", // 👁
            cls: "iuf-token-toggle",
            attr: {type: "button", "aria-label": "Toggle token visibility"},
        });
        toggleBtn.addEventListener("click", () => {
            const isPassword = tokenInput.type === "password";
            tokenInput.type = isPassword ? "text" : "password";
            toggleBtn.textContent = isPassword ? "\u{1F648}" : "\u{1F441}"; // 🙈 : 👁
        });

        // On token blur: (1) auto-fetch the GitHub username (owner) so the
        // status line can show the full owner/repo path; (2) if no repository
        // is configured yet, auto-create the default one.
        // If the token changed since the last blur, the cached owner / repo
        // are stale and get cleared first so they are refetched for the new
        // token.
        tokenInput.addEventListener("blur", () => {
            const token = tokenInput.value;
            if (!token) return;

            if (token !== lastSeenToken) {
                lastSeenToken = token;
                if (settings.githubOwner) {
                    settings.githubOwner = "";
                }
                if (settings.repositoryName) {
                    // Repo name is repo-only and re-usable across tokens, but
                    // clear it so we can re-verify the new token can see it.
                    settings.repositoryName = "";
                }
                this.plugin.settings.githubSetting = settings;
                void this.plugin.saveSettings();
                updateStatus();
            }

            if (!settings.githubOwner) {
                GitHubUploader.fetchOwner(token).then(owner => {
                    settings.githubOwner = owner;
                    this.plugin.settings.githubSetting = settings;
                    void this.plugin.saveSettings();
                    updateStatus();
                }).catch((err: unknown) => {
                    const msg = err instanceof Error ? err.message : JSON.stringify(err);
                    new Notice(`✗ ${t("settings.imageStore.github.createFailed")}: ${msg}`);
                });
            }

            if (!settings.repositoryName) {
                GitHubUploader.createRepository(token).then(repo => {
                    settings.githubOwner = repo.owner;
                    settings.repositoryName = repo.repo;
                    settings.branchName = repo.branch;
                    this.plugin.settings.githubSetting = settings;
                    void this.plugin.saveSettings();
                    this.display();
                    new Notice(`✓ ${t("settings.imageStore.github.connected")}: ${settings.repositoryName}`);
                }).catch((err: unknown) => {
                    const msg = err instanceof Error ? err.message : JSON.stringify(err);
                    new Notice(`✗ ${t("settings.imageStore.github.createFailed")}: ${msg}`);
                });
            }
        });

        // ── Repository (owner/repo) — user-editable, empty falls back to auto-create.
        //    Uses the same wrap layout as the token row: name + description sit
        //    in the info area, input fills the control area on the next line.
        new Setting(parentEL)
            .setName(t("settings.imageStore.github.repository.name"))
            .setDesc(t("settings.imageStore.github.repository.desc"))
            .setClass("iuf-github-repo")
            .addText(text =>
                text
                    .setPlaceholder(t("settings.imageStore.github.repository.placeholder"))
                    .setValue(settings.repositoryName)
                    .onChange(value => {
                        settings.repositoryName = value.trim();
                        this.plugin.settings.githubSetting = settings;
                        updateStatus();
                    })
            );

        // ── Branch (optional, defaults to repo's default branch) ──
        new Setting(parentEL)
            .setName(t("settings.imageStore.github.branch.name"))
            .setDesc(t("settings.imageStore.github.branch.desc"))
            .setClass("iuf-github-branch")
            .addText(text =>
                text
                    .setPlaceholder(t("settings.imageStore.github.branch.placeholder"))
                    .setValue(settings.branchName)
                    .onChange(value => {
                        settings.branchName = value.trim();
                        this.plugin.settings.githubSetting = settings;
                    })
            );

        updateStatus();

        // ── Path (optional) ──
        new Setting(parentEL)
            .setName(t("settings.imageStore.github.path.name"))
            .setDesc(t("settings.imageStore.github.path.desc"))
            .addText(text =>
                text
                    .setPlaceholder(t("settings.imageStore.github.path.placeholder"))
                    .setValue(settings.path)
                    .onChange(value => {
                        settings.path = value;
                        this.plugin.settings.githubSetting = settings;
                    })
            );
    }

    private static githubTokenDescription(desc: string) {
        const url = "https://github.com/settings/tokens";
        return createFragment(frag => {
            frag.append(desc);
            frag.createEl("a", { text: url, href: url });
        });
    }

    private drawR2Setting(parentEL: HTMLDivElement) {
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.r2.accessKeyId.name"))
            .setDesc(this.t("settings.imageStore.r2.accessKeyId.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.r2.accessKeyId.placeholder"))
                .setValue(this.plugin.settings.r2Setting?.accessKeyId || '')
                .onChange(value => this.plugin.settings.r2Setting.accessKeyId = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.r2.secretAccessKey.name"))
            .setDesc(this.t("settings.imageStore.r2.secretAccessKey.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.r2.secretAccessKey.placeholder"))
                .setValue(this.plugin.settings.r2Setting?.secretAccessKey || '')
                .onChange(value => this.plugin.settings.r2Setting.secretAccessKey = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.r2.endpoint.name"))
            .setDesc(this.t("settings.imageStore.r2.endpoint.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.r2.endpoint.placeholder"))
                .setValue(this.plugin.settings.r2Setting?.endpoint || '')
                .onChange(value => this.plugin.settings.r2Setting.endpoint = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.r2.bucket.name"))
            .setDesc(this.t("settings.imageStore.r2.bucket.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.r2.bucket.placeholder"))
                .setValue(this.plugin.settings.r2Setting?.bucketName || '')
                .onChange(value => this.plugin.settings.r2Setting.bucketName = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.r2.path.name"))
            .setDesc(this.t("settings.imageStore.r2.path.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.r2.path.placeholder"))
                    .setValue(this.plugin.settings.r2Setting.path)
                    .onChange(value => this.plugin.settings.r2Setting.path = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.r2.customDomain.name"))
            .setDesc(this.t("settings.imageStore.r2.customDomain.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.r2.customDomain.placeholder"))
                    .setValue(this.plugin.settings.r2Setting.customDomainName)
                    .onChange(value => this.plugin.settings.r2Setting.customDomainName = value));
    }

    private drawB2Setting(parentEL: HTMLDivElement) {
        new Setting(parentEL)
            .setName(this.t("settings.imageStore.b2.accessKeyId.name"))
            .setDesc(this.t("settings.imageStore.b2.accessKeyId.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.b2.accessKeyId.placeholder"))
                .setValue(this.plugin.settings.b2Setting?.accessKeyId || '')
                .onChange(value => this.plugin.settings.b2Setting.accessKeyId = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.b2.secretAccessKey.name"))
            .setDesc(this.t("settings.imageStore.b2.secretAccessKey.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.b2.secretAccessKey.placeholder"))
                .setValue(this.plugin.settings.b2Setting?.secretAccessKey || '')
                .onChange(value => this.plugin.settings.b2Setting.secretAccessKey = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.b2.region.name"))
            .setDesc(this.t("settings.imageStore.b2.region.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.b2.region.placeholder"))
                .setValue(this.plugin.settings.b2Setting?.region || '')
                .onChange(value => this.plugin.settings.b2Setting.region = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.b2.bucket.name"))
            .setDesc(this.t("settings.imageStore.b2.bucket.desc"))
            .addText(text => text
                .setPlaceholder(this.t("settings.imageStore.b2.bucket.placeholder"))
                .setValue(this.plugin.settings.b2Setting?.bucketName || '')
                .onChange(value => this.plugin.settings.b2Setting.bucketName = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.b2.path.name"))
            .setDesc(this.t("settings.imageStore.b2.path.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.b2.path.placeholder"))
                    .setValue(this.plugin.settings.b2Setting.path)
                    .onChange(value => this.plugin.settings.b2Setting.path = value));

        new Setting(parentEL)
            .setName(this.t("settings.imageStore.b2.customDomain.name"))
            .setDesc(this.t("settings.imageStore.b2.customDomain.desc"))
            .addText(text =>
                text
                    .setPlaceholder(this.t("settings.imageStore.b2.customDomain.placeholder"))
                    .setValue(this.plugin.settings.b2Setting.customDomainName)
                    .onChange(value => this.plugin.settings.b2Setting.customDomainName = value));
    }
}
