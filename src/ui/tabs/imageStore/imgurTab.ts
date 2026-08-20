import {Setting} from "obsidian";
import type {TabRenderer} from "../types";

export const renderImgurSettings: TabRenderer = (el, {plugin, t}) => {
    new Setting(el)
        .setName(t.t("settings.imageStore.imgur.clientId.name"))
        .setDesc(clientIdSettingDescription(t.t("settings.imageStore.imgur.clientId.desc")))
        .addText(text =>
            text
                .setPlaceholder(t.t("settings.imageStore.imgur.clientId.placeholder"))
                .setValue(plugin.settings.imgurAnonymousSetting.clientId)
                .onChange(value => { plugin.settings.imgurAnonymousSetting.clientId = value; })
        );
};

function clientIdSettingDescription(desc: string): DocumentFragment {
    const url = "https://api.imgur.com/oauth2/addclient";
    return createFragment(frag => {
        frag.append(desc);
        frag.createEl("a", { text: url, href: url });
    });
}
