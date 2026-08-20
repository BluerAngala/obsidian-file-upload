import {Setting} from "obsidian";
import type {TabContext} from "../types";

/**
 * Rename rules — extended path template (see src/uploader/features/renameRules.ts).
 */
export function renderRenameRulesSection(el: HTMLElement, ctx: TabContext): void {
    const {plugin, t} = ctx;

    new Setting(el)
        .setName(t.t("settings.features.renameRules.heading"))
        .setHeading();

    new Setting(el)
        .setName(t.t("settings.features.renameRules.enabled.name"))
        .setDesc(t.t("settings.features.renameRules.enabled.desc"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.renameRules.enabled)
            .onChange(value => { plugin.settings.renameRules.enabled = value; })
        );

    new Setting(el)
        .setName(t.t("settings.features.renameRules.template.name"))
        .setDesc(t.t("settings.features.renameRules.template.desc"))
        .addText(text => text
            .setPlaceholder(t.t("settings.features.renameRules.template.placeholder"))
            .setValue(plugin.settings.renameRules.template)
            .onChange(value => { plugin.settings.renameRules.template = value; })
        );

    new Setting(el)
        .setName(t.t("settings.features.renameRules.spacesToDashes.name"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.renameRules.spacesToDashes)
            .onChange(value => { plugin.settings.renameRules.spacesToDashes = value; })
        );

    new Setting(el)
        .setName(t.t("settings.features.renameRules.lowercase.name"))
        .addToggle(toggle => toggle
            .setValue(plugin.settings.renameRules.lowercase)
            .onChange(value => { plugin.settings.renameRules.lowercase = value; })
        );
}
