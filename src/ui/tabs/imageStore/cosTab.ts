import {Setting} from "obsidian";
import {TencentCloudRegionList} from "../../../uploader/cos/common";
import type {TabRenderer} from "../types";

export const renderCosSettings: TabRenderer = (el, {plugin, t}) => {
    const settings = plugin.settings.cosSetting;

    new Setting(el)
        .setName(t.t("settings.imageStore.cos.region.name"))
        .setDesc(t.t("settings.imageStore.cos.region.desc"))
        .addDropdown(dropdown =>
            dropdown
                .addOptions(TencentCloudRegionList)
                .setValue(settings.region)
                .onChange(value => { settings.region = value; })
        );

    addSecret(el, t, "settings.imageStore.cos.secretId", settings.secretId, v => { settings.secretId = v; });
    addSecret(el, t, "settings.imageStore.cos.secretKey", settings.secretKey, v => { settings.secretKey = v; });
    addText(el, t, "settings.imageStore.cos.bucket", settings.bucket, v => { settings.bucket = v; });
    addText(el, t, "settings.imageStore.cos.path", settings.path, v => { settings.path = v; });
    addText(el, t, "settings.imageStore.cos.customDomain", settings.customDomainName, v => { settings.customDomainName = v; });
};

function addText(
    el: HTMLElement,
    t: Parameters<TabRenderer>[1]["t"],
    keyPrefix: string,
    value: string,
    onChange: (v: string) => void,
): void {
    new Setting(el)
        .setName(t.t(`${keyPrefix}.name`))
        .setDesc(t.t(`${keyPrefix}.desc`))
        .addText(text => text
            .setPlaceholder(t.t(`${keyPrefix}.placeholder`))
            .setValue(value)
            .onChange(onChange));
}

function addSecret(
    el: HTMLElement,
    t: Parameters<TabRenderer>[1]["t"],
    keyPrefix: string,
    value: string,
    onChange: (v: string) => void,
): void {
    new Setting(el)
        .setName(t.t(`${keyPrefix}.name`))
        .setDesc(t.t(`${keyPrefix}.desc`))
        .addText(text => {
            text
                .setPlaceholder(t.t(`${keyPrefix}.placeholder`))
                .setValue(value)
                .onChange(onChange);
            text.inputEl.type = "password";
        });
}
