import {Setting} from "obsidian";
import type {TabRenderer} from "./types";
import {renderRenameRulesSection} from "./features/renameRulesTab";
import {renderCompressionSection} from "./features/compressionTab";
import {renderSkipRulesSection} from "./features/skipRulesTab";
import {renderConcurrencySection} from "./features/concurrencyTab";
import {renderExifSection} from "./features/exifTab";
import {PLATFORMS} from "../../uploader/features/platformFormat";
import type {PlatformId} from "../../uploader/features/platformFormat";
import {renderPerFolderOverrideSection} from "./features/perFolderOverrideTab";
import {renderUploadLogTab} from "./features/uploadLogTab";

/**
 * Upload tab — the catch-all for everything related to the upload pipeline:
 *   • Progress / web-image behavior
 *   • Auto-upload (drop files in vault → upload)
 *   • Tier 1 feature: paste auto-upload (handled inside autoUpload flow)
 *   • Tier 1 feature: rename rules (path-template)
 *   • Tier 1 feature: image compression (max width / quality / format)
 *   • Tier 1 feature: skip rules (regex)
 *   • Tier 2 feature: concurrency
 *   • Tier 2 feature: platform format
 *   • Tier 3 feature: EXIF strip
 *   • Tier 3 feature: per-folder override
 *   • Upload log (separate section)
 */
export const renderUploadTab: TabRenderer = (el, ctx) => {
    const {plugin, t} = ctx;

    new Setting(el)
        .setName(t.t("settings.upload.showProgressModal.name"))
        .setDesc(t.t("settings.upload.showProgressModal.desc"))
        .addToggle(toggle =>
            toggle
                .setValue(plugin.settings.showProgressModal)
                .onChange(value => { plugin.settings.showProgressModal = value; })
        );

    new Setting(el)
        .setName(t.t("settings.upload.uploadWebImages.name"))
        .setDesc(t.t("settings.upload.uploadWebImages.desc"))
        .addToggle(toggle =>
            toggle
                .setValue(plugin.settings.uploadWebImages)
                .onChange(value => { plugin.settings.uploadWebImages = value; })
        );

    // ── Auto Upload (existing) ──
    new Setting(el).setName(t.t("settings.autoUpload.heading")).setHeading();

    new Setting(el)
        .setName(t.t("settings.autoUpload.enable.name"))
        .setDesc(t.t("settings.autoUpload.enable.desc"))
        .addToggle(toggle =>
            toggle
                .setValue(plugin.settings.autoUpload)
                .onChange(value => { plugin.settings.autoUpload = value; })
        );

    new Setting(el)
        .setName(t.t("settings.autoUpload.sizeLimit.name"))
        .setDesc(t.t("settings.autoUpload.sizeLimit.desc"))
        .addSlider(slider =>
            slider
                .setLimits(1, 100, 1)
                .setValue(plugin.settings.autoUploadSizeLimit)
                .setDynamicTooltip()
                .onChange(value => { plugin.settings.autoUploadSizeLimit = value; })
        );

    // ── Tier 1 features ──
    renderRenameRulesSection(el, ctx);
    renderCompressionSection(el, ctx);
    renderSkipRulesSection(el, ctx);

    // ── Tier 2 / 3 features ──
    renderConcurrencySection(el, ctx);
    renderExifSection(el, ctx);

    // ── Platform format (Tier 2) ──
    new Setting(el)
        .setName(t.t("settings.features.platformFormat.heading"))
        .setHeading();
    new Setting(el)
        .setName(t.t("settings.features.platformFormat.select.name"))
        .setDesc(t.t("settings.features.platformFormat.select.desc"))
        .addDropdown(dd => {
            for (const p of PLATFORMS) {
                const labelKey = `settings.features.platformFormat.options.${p.id}`;
                dd.addOption(p.id, t.t(labelKey));
            }
            dd.setValue(plugin.settings.platformFormat);
            dd.onChange(value => {
                plugin.settings.platformFormat = value as PlatformId;
            });
        });

    // ── Per-folder override (Tier 3) ──
    renderPerFolderOverrideSection(el, ctx);

    // ── Upload log section ──
    void renderUploadLogTab(el, ctx);
};
