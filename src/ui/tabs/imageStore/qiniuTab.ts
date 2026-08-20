import {Setting} from "obsidian";
import type {TabRenderer} from "../types";

export const renderQiniuSettings: TabRenderer = (el, {plugin, t}) => {
    const settings = plugin.settings.kodoSetting;
    addSecret(el, t, "settings.imageStore.qiniu.accessKey", settings.accessKey, v => { settings.accessKey = v; });
    addSecret(el, t, "settings.imageStore.qiniu.secretKey", settings.secretKey, v => { settings.secretKey = v; });
    addText(el, t, "settings.imageStore.qiniu.bucket", settings.bucket, v => { settings.bucket = v; });
    addText(el, t, "settings.imageStore.qiniu.customDomain", settings.customDomainName, v => { settings.customDomainName = v; });
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
