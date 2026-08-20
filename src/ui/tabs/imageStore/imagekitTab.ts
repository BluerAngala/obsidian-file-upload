import {Setting} from "obsidian";
import type {TabRenderer} from "../types";

export const renderImagekitSettings: TabRenderer = (el, {plugin, t}) => {
    const settings = plugin.settings.imagekitSetting;

    new Setting(el)
        .setName(t.t("settings.imageStore.imagekit.imagekitId.name"))
        .setDesc(idDescription(t.t("settings.imageStore.imagekit.imagekitId.desc")))
        .addText(text => text
            .setPlaceholder(t.t("settings.imageStore.imagekit.imagekitId.placeholder"))
            .setValue(settings.imagekitID)
            .onChange(value => {
                settings.imagekitID = value;
                settings.endpoint = `https://ik.imagekit.io/${value}/`;
            }));

    new Setting(el)
        .setName(t.t("settings.imageStore.imagekit.folder.name"))
        .setDesc(t.t("settings.imageStore.imagekit.folder.desc"))
        .addText(text => text
            .setPlaceholder(t.t("settings.imageStore.imagekit.folder.placeholder"))
            .setValue(settings.folder)
            .onChange(value => { settings.folder = value; }));

    new Setting(el)
        .setName(t.t("settings.imageStore.imagekit.publicKey.name"))
        .addText(text => text
            .setPlaceholder(t.t("settings.imageStore.imagekit.publicKey.placeholder"))
            .setValue(settings.publicKey)
            .onChange(value => { settings.publicKey = value; }));

    new Setting(el)
        .setName(t.t("settings.imageStore.imagekit.privateKey.name"))
        .addText(text => {
            text
                .setPlaceholder(t.t("settings.imageStore.imagekit.privateKey.placeholder"))
                .setValue(settings.privateKey)
                .onChange(value => { settings.privateKey = value; });
            text.inputEl.type = "password";
        });
};

function idDescription(desc: string): DocumentFragment {
    const url = "https://imagekit.io/dashboard/developer/api-keys";
    return createFragment(frag => {
        frag.append(desc);
        frag.createEl("a", { text: url, href: url });
    });
}
