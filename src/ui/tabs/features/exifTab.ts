import {Setting} from "obsidian";
import type {TabContext} from "../types";

export function renderExifSection(el: HTMLElement, ctx: TabContext): void {
    const {plugin, t} = ctx;
    new Setting(el)
        .setName(t.t("settings.features.exif.heading"))
        .setHeading();

    new Setting(el)
        .setName(t.t("settings.features.exif.enabled.name"))
        .setDesc(t.t("settings.features.exif.enabled.desc"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.exifStrip.enabled)
            .onChange(value => { plugin.settings.exifStrip.enabled = value; })
        );
}
