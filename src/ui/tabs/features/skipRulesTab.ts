import {Setting} from "obsidian";
import type {TabContext} from "../types";
import {SkipRules} from "../../../uploader/features/skipRules";

export function renderSkipRulesSection(el: HTMLElement, ctx: TabContext): void {
    const {plugin, t} = ctx;
    const settings = plugin.settings.skipRules;

    new Setting(el)
        .setName(t.t("settings.features.skipRules.heading"))
        .setHeading();

    new Setting(el)
        .setName(t.t("settings.features.skipRules.urlRegex.name"))
        .setDesc(t.t("settings.features.skipRules.urlRegex.desc"))
        .addText(text => text
            .setPlaceholder(t.t("settings.features.skipRules.urlRegex.placeholder"))
            .setValue(settings.urlRegex)
            .onChange(value => { settings.urlRegex = value; })
        );

    new Setting(el)
        .setName(t.t("settings.features.skipRules.pathRegex.name"))
        .setDesc(t.t("settings.features.skipRules.pathRegex.desc"))
        .addText(text => text
            .setPlaceholder(t.t("settings.features.skipRules.pathRegex.placeholder"))
            .setValue(settings.pathRegex)
            .onChange(value => { settings.pathRegex = value; })
        );

    new Setting(el)
        .setName(t.t("settings.features.skipRules.maxSize.name"))
        .setDesc(t.t("settings.features.skipRules.maxSize.desc"))
        .addSlider(slider => slider
            .setLimits(0, 100, 1)
            .setValue(settings.maxSizeMB)
            .setDynamicTooltip()
            .onChange(value => { settings.maxSizeMB = value; })
        );

    // Live validate regex on change — show a Notice if the user types garbage.
    // (Kept lightweight: we don't render error UI, just log + skip silently.)
    const validate = (pattern: string): void => {
        const result = SkipRules.validateRegex(pattern);
        if (!result.valid) {
            console.warn("obsidian-file-upload: invalid skip-rules regex", pattern, result.error);
        }
    };
    validate(settings.urlRegex);
    validate(settings.pathRegex);
}
