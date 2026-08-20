import {Setting} from "obsidian";
import type {TabContext} from "../types";

export function renderConcurrencySection(el: HTMLElement, ctx: TabContext): void {
    const {plugin, t} = ctx;
    new Setting(el)
        .setName(t.t("settings.features.concurrency.heading"))
        .setHeading();

    new Setting(el)
        .setName(t.t("settings.features.concurrency.upload.name"))
        .setDesc(t.t("settings.features.concurrency.upload.desc"))
        .addSlider(slider => slider
            .setLimits(1, 16, 1)
            .setValue(plugin.settings.uploadConcurrency)
            .setDynamicTooltip()
            .onChange(value => { plugin.settings.uploadConcurrency = value; })
        );
}
