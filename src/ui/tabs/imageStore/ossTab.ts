import {Setting} from "obsidian";
import {AliYunRegionList} from "../../../uploader/oss/common";
import {renderCdnSection} from "./shared/cdnSection";
import type {TabRenderer} from "../types";

export const renderOssSettings: TabRenderer = (el, {plugin, t}) => {
    const settings = plugin.settings.ossSetting;

    new Setting(el)
        .setName(t.t("settings.imageStore.oss.region.name"))
        .setDesc(t.t("settings.imageStore.oss.region.desc"))
        .addDropdown(dropdown =>
            dropdown
                .addOptions(AliYunRegionList)
                .setValue(settings.region)
                .onChange(value => {
                    settings.region = value;
                    settings.endpoint = `https://${value}.aliyuncs.com/`;
                })
        );

    addText(el, t, "settings.imageStore.oss.accessKeyId", settings.accessKeyId,
        v => { settings.accessKeyId = v; });
    addText(el, t, "settings.imageStore.oss.accessKeySecret", settings.accessKeySecret,
        v => { settings.accessKeySecret = v; }, true);
    addText(el, t, "settings.imageStore.oss.bucket", settings.bucket,
        v => { settings.bucket = v; });
    addText(el, t, "settings.imageStore.oss.path", settings.path,
        v => { settings.path = v; });
    addText(el, t, "settings.imageStore.oss.customDomain", settings.customDomainName,
        v => { settings.customDomainName = v; });

    // CDN selector (new) — list includes domestic options like oss-accelerate
    renderCdnSection(el, plugin, t, {
        providerId: "ALIYUN_OSS",
        bucket: settings.bucket,
        customDomain: settings.customDomainName,
    });
};

function addText(
    el: HTMLElement,
    t: Parameters<TabRenderer>[1]["t"],
    keyPrefix: string,
    value: string,
    onChange: (v: string) => void,
    isSecret = false,
): void {
    new Setting(el)
        .setName(t.t(`${keyPrefix}.name`))
        .setDesc(t.t(`${keyPrefix}.desc`))
        .addText(text => {
            text
                .setPlaceholder(t.t(`${keyPrefix}.placeholder`))
                .setValue(value)
                .onChange(onChange);
            if (isSecret) text.inputEl.type = "password";
        });
}
