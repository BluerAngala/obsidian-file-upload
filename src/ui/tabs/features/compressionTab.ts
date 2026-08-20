import {Setting} from "obsidian";
import type {TabContext} from "../types";

export function renderCompressionSection(el: HTMLElement, ctx: TabContext): void {
    const {plugin, t} = ctx;
    const settings = plugin.settings.compression;

    new Setting(el)
        .setName(t.t("settings.features.compression.heading"))
        .setHeading();

    new Setting(el)
        .setName(t.t("settings.features.compression.enabled.name"))
        .setDesc(t.t("settings.features.compression.enabled.desc"))
        .addToggle(toggle => toggle
            .setValue(settings.enabled)
            .onChange(value => { settings.enabled = value; })
        );

    new Setting(el)
        .setName(t.t("settings.features.compression.maxWidth.name"))
        .setDesc(t.t("settings.features.compression.maxWidth.desc"))
        .addSlider(slider => slider
            .setLimits(0, 4096, 100)
            .setValue(settings.maxWidth)
            .setDynamicTooltip()
            .onChange(value => { settings.maxWidth = value; })
        );

    new Setting(el)
        .setName(t.t("settings.features.compression.quality.name"))
        .setDesc(t.t("settings.features.compression.quality.desc"))
        .addSlider(slider => slider
            .setLimits(0.1, 1.0, 0.05)
            .setValue(settings.quality)
            .setDynamicTooltip()
            .onChange(value => { settings.quality = value; })
        );

    new Setting(el)
        .setName(t.t("settings.features.compression.format.name"))
        .setDesc(t.t("settings.features.compression.format.desc"))
        .addDropdown(dd => {
            dd.addOption("keep", t.t("settings.features.compression.format.options.keep"));
            dd.addOption("image/jpeg", "JPEG");
            dd.addOption("image/webp", "WebP");
            dd.setValue(settings.format);
            dd.onChange(value => {
                settings.format = value as "keep" | "image/jpeg" | "image/webp";
            });
        });
}
