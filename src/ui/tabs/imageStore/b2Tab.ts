import {Setting} from "obsidian";
import type {TabRenderer} from "../types";

export const renderB2Settings: TabRenderer = (el, {plugin, t}) => {
    const settings = plugin.settings.b2Setting;
    addSecret(el, t, "settings.imageStore.b2.accessKeyId", settings.accessKeyId, v => { settings.accessKeyId = v; });
    addSecret(el, t, "settings.imageStore.b2.secretAccessKey", settings.secretAccessKey, v => { settings.secretAccessKey = v; });
    addText(el, t, "settings.imageStore.b2.region", settings.region, v => { settings.region = v; });
    addText(el, t, "settings.imageStore.b2.bucket", settings.bucketName, v => { settings.bucketName = v; });
    addText(el, t, "settings.imageStore.b2.path", settings.path, v => { settings.path = v; });
    addText(el, t, "settings.imageStore.b2.customDomain", settings.customDomainName, v => { settings.customDomainName = v; });
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
