import {Setting} from "obsidian";
import type {TabRenderer} from "../types";

export const renderGyazoSettings: TabRenderer = (el, {plugin, t}) => {
    new Setting(el)
        .setName(t.t("settings.imageStore.gyazo.accessToken.name"))
        .setDesc(tokenSettingDescription(t.t("settings.imageStore.gyazo.accessToken.desc")))
        .addText(text =>
            text
                .setPlaceholder(t.t("settings.imageStore.gyazo.accessToken.placeholder"))
                .setValue(plugin.settings.gyazoSetting.accessToken)
                .onChange(value => { plugin.settings.gyazoSetting.accessToken = value; })
        );

    new Setting(el)
        .setName(t.t("settings.imageStore.gyazo.accessPolicy.name"))
        .setDesc(t.t("settings.imageStore.gyazo.accessPolicy.desc"))
        .addDropdown(dropdown =>
            dropdown
                .addOption("anyone", t.t("settings.imageStore.gyazo.accessPolicy.anyone"))
                .addOption("only_me", t.t("settings.imageStore.gyazo.accessPolicy.onlyMe"))
                .setValue(plugin.settings.gyazoSetting.accessPolicy)
                .onChange((value: "anyone" | "only_me") => { plugin.settings.gyazoSetting.accessPolicy = value; })
        );

    new Setting(el)
        .setName(t.t("settings.imageStore.gyazo.commonDescription.name"))
        .setDesc(t.t("settings.imageStore.gyazo.commonDescription.desc"))
        .addText(text =>
            text
                .setPlaceholder(t.t("settings.imageStore.gyazo.commonDescription.placeholder"))
                .setValue(plugin.settings.gyazoSetting.desc)
                .onChange(value => { plugin.settings.gyazoSetting.desc = value; })
        );
};

function tokenSettingDescription(desc: string): DocumentFragment {
    const url = "https://gyazo.com/oauth/applications";
    return createFragment(frag => {
        frag.append(desc);
        frag.createEl("a", { text: url, href: url });
    });
}
