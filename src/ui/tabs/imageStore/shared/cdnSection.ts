import {Setting} from "obsidian";
import {CUSTOM_CDN_ID, getCdnsForProvider, NONE_CDN_ID} from "../../../../uploader/cdn";
import type {CdnId, CdnContext} from "../../../../uploader/cdn";
import type ObsidianPublish from "../../../../publish";
import type Translate from "../../../../i18n/translate";

/**
 * Per-provider CDN selector + optional custom-domain fallback.
 *
 * Reads the current cdnId from the matching `*Setting.cdnId` field and
 * writes it back on change. The renderCdnSection function is invoked by
 * every per-provider tab; it figures out which provider is in scope from
 * either the CdnContext hints (GitHub) or the active imageStore setting.
 */
export function renderCdnSection(
    el: HTMLElement,
    plugin: ObsidianPublish,
    t: Translate,
    ctx: CdnContext,
): void {
    const providerId = inferProviderId(plugin, ctx);
    if (!providerId) return;
    const cdns = getCdnsForProvider(providerId);

    // Only render the section if the provider has more than one CDN option
    // OR supports a custom domain. For pass-through providers (Imgur / Gyazo
    // / ImageKit) skip the section entirely — it would only add noise.
    const hasMultiple = cdns.length > 1;
    const supportsCustom = Boolean(ctx.customDomain !== undefined);
    if (!hasMultiple && !supportsCustom) return;

    new Setting(el)
        .setName(t.t("settings.cdn.heading"))
        .setDesc(t.t("settings.cdn.desc"))
        .setHeading();

    const currentCdnId = readCdnIdFromSettings(plugin, providerId) ?? NONE_CDN_ID;
    const initialChoice = ctx.customDomain
        ? (cdns.find(c => c.id === currentCdnId)?.id ?? CUSTOM_CDN_ID)
        : (cdns.find(c => c.id === currentCdnId)?.id ?? cdns[0].id);

    new Setting(el)
        .setName(t.t("settings.cdn.select.name"))
        .setDesc(t.t("settings.cdn.select.desc"))
        .addDropdown(dd => {
            dd.addOption(NONE_CDN_ID, t.t("settings.cdn.options.none"));
            for (const c of cdns) {
                const labelPrefix = c.region === "domestic" ? "🇨🇳 " : "🌐 ";
                dd.addOption(c.id, labelPrefix + c.label);
            }
            if (supportsCustom) {
                dd.addOption(CUSTOM_CDN_ID, t.t("settings.cdn.options.custom"));
            }
            dd.setValue(initialChoice);
            dd.onChange(value => {
                writeCdnIdToSettings(plugin, providerId, value);
                // Persist immediately and rebuild the uploader so the
                // next right-click/upload uses the newly selected CDN
                // even if the user never closes the settings tab.
                plugin.setupImageUploader();
                void plugin.saveSettings();
            });
        });

    if (supportsCustom && initialChoice === CUSTOM_CDN_ID) {
        new Setting(el)
            .setName(t.t("settings.cdn.customDomain.name"))
            .setDesc(t.t("settings.cdn.customDomain.desc"))
            .addText(text => text
                .setPlaceholder(t.t("settings.cdn.customDomain.placeholder"))
                .setValue(ctx.customDomain ?? "")
                .onChange(value => {
                    writeCustomDomain(plugin, providerId, value);
                    // Same reasoning as the CDN dropdown: keep the live
                    // uploader in sync with the latest custom domain so
                    // uploads done right after editing work as expected.
                    plugin.setupImageUploader();
                    void plugin.saveSettings();
                }));
    }
}

function inferProviderId(plugin: ObsidianPublish, ctx: CdnContext): string | null {
    // GitHub: caller passes owner/repo hints. We can also infer from the
    // imageStore setting as a fallback.
    if (ctx.githubOwner !== undefined || ctx.githubRepo !== undefined || ctx.githubPath !== undefined) {
        return "GITHUB";
    }
    // Otherwise map the active image store to a CDN provider id.
    switch (plugin.settings.imageStore) {
        case "ALIYUN_OSS": return "ALIYUN_OSS";
        case "AWS_S3": return "AWS_S3";
        case "CLOUDFLARE_R2": return "CLOUDFLARE_R2";
        case "BACKBLAZE_B2": return "BACKBLAZE_B2";
        case "TENCENTCLOUD_COS": return "TENCENTCLOUD_COS";
        case "QINIU_KUDO": return "QINIU_KUDO";
        default: return null;
    }
}

function readCdnIdFromSettings(plugin: ObsidianPublish, providerId: string): CdnId | null {
    switch (providerId) {
        case "GITHUB": return plugin.settings.githubSetting.cdnId || null;
        case "ALIYUN_OSS": return plugin.settings.ossSetting.cdnId || null;
        case "AWS_S3": return plugin.settings.awsS3Setting.cdnId || null;
        case "CLOUDFLARE_R2": return plugin.settings.r2Setting.cdnId || null;
        case "BACKBLAZE_B2": return plugin.settings.b2Setting.cdnId || null;
        case "TENCENTCLOUD_COS": return plugin.settings.cosSetting.cdnId || null;
        case "QINIU_KUDO": return plugin.settings.kodoSetting.cdnId || null;
        default: return null;
    }
}

function writeCdnIdToSettings(plugin: ObsidianPublish, providerId: string, cdnId: CdnId): void {
    switch (providerId) {
        case "GITHUB": plugin.settings.githubSetting.cdnId = cdnId; break;
        case "ALIYUN_OSS": plugin.settings.ossSetting.cdnId = cdnId; break;
        case "AWS_S3": plugin.settings.awsS3Setting.cdnId = cdnId; break;
        case "CLOUDFLARE_R2": plugin.settings.r2Setting.cdnId = cdnId; break;
        case "BACKBLAZE_B2": plugin.settings.b2Setting.cdnId = cdnId; break;
        case "TENCENTCLOUD_COS": plugin.settings.cosSetting.cdnId = cdnId; break;
        case "QINIU_KUDO": plugin.settings.kodoSetting.cdnId = cdnId; break;
    }
}

function writeCustomDomain(plugin: ObsidianPublish, providerId: string, value: string): void {
    switch (providerId) {
        case "GITHUB": plugin.settings.githubSetting.customDomain = value; break;
        case "ALIYUN_OSS": plugin.settings.ossSetting.customDomainName = value; break;
        case "AWS_S3": plugin.settings.awsS3Setting.customDomainName = value; break;
        case "CLOUDFLARE_R2": plugin.settings.r2Setting.customDomainName = value; break;
        case "BACKBLAZE_B2": plugin.settings.b2Setting.customDomainName = value; break;
        case "TENCENTCLOUD_COS": plugin.settings.cosSetting.customDomainName = value; break;
        case "QINIU_KUDO": plugin.settings.kodoSetting.customDomainName = value; break;
    }
}
