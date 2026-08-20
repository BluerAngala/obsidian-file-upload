import {Setting} from "obsidian";
import type {TabRenderer} from "../types";

export const renderS3Settings: TabRenderer = (el, {plugin, t}) => {
    const settings = plugin.settings.awsS3Setting;
    addSecret(el, t, "settings.imageStore.awsS3.accessKeyId", settings.accessKeyId, v => { settings.accessKeyId = v; });
    addSecret(el, t, "settings.imageStore.awsS3.secretAccessKey", settings.secretAccessKey, v => { settings.secretAccessKey = v; });
    addText(el, t, "settings.imageStore.awsS3.region", settings.region, v => { settings.region = v; });
    addText(el, t, "settings.imageStore.awsS3.bucket", settings.bucketName, v => { settings.bucketName = v; });
    addText(el, t, "settings.imageStore.awsS3.path", settings.path, v => { settings.path = v; });
    addText(el, t, "settings.imageStore.awsS3.customDomain", settings.customDomainName, v => { settings.customDomainName = v; });
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
