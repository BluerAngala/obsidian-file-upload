import {Setting} from "obsidian";
import type {TabRenderer} from "./types";

/**
 * General settings — language picker (also exposed on the welcome page)
 * and document-level toggles that apply to the publish command.
 */
export const renderGeneralTab: TabRenderer = (el, {plugin, t}) => {
    new Setting(el)
        .setName(t.t("settings.language.name"))
        .setDesc(t.t("settings.language.desc"))
        .addDropdown(dd => {
            dd.addOption("zh", "中文");
            dd.addOption("en", "English");
            dd.addOption("zh-tw", "繁體中文");
            dd.setValue(plugin.settings.language);
            dd.onChange(async v => {
                plugin.settings.language = v;
                plugin.translate.switch(v);
                plugin.settingTab?.display();
            });
        });

    new Setting(el)
        .setName(t.t("settings.general.imageAltText.name"))
        .setDesc(t.t("settings.general.imageAltText.desc"))
        .addToggle(toggle =>
            toggle
                .setValue(plugin.settings.imageAltText)
                .onChange(value => { plugin.settings.imageAltText = value; })
        );

    new Setting(el)
        .setName(t.t("settings.general.replaceOriginalDoc.name"))
        .setDesc(t.t("settings.general.replaceOriginalDoc.desc"))
        .addToggle(toggle =>
            toggle
                .setValue(plugin.settings.replaceOriginalDoc)
                .onChange(value => { plugin.settings.replaceOriginalDoc = value; })
        );

    new Setting(el)
        .setName(t.t("settings.general.ignoreProperties.name"))
        .setDesc(t.t("settings.general.ignoreProperties.desc"))
        .addToggle(toggle =>
            toggle
                .setValue(plugin.settings.ignoreProperties)
                .onChange(value => { plugin.settings.ignoreProperties = value; })
        );
};
