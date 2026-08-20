import {Setting} from "obsidian";
import ImageStore from "../../imageStore";
import type {TabRenderer} from "../types";
import {renderImgurSettings} from "./imageStore/imgurTab";
import {renderGyazoSettings} from "./imageStore/gyazoTab";
import {renderOssSettings} from "./imageStore/ossTab";
import {renderS3Settings} from "./imageStore/s3Tab";
import {renderR2Settings} from "./imageStore/r2Tab";
import {renderB2Settings} from "./imageStore/b2Tab";
import {renderCosSettings} from "./imageStore/cosTab";
import {renderQiniuSettings} from "./imageStore/qiniuTab";
import {renderImagekitSettings} from "./imageStore/imagekitTab";
import {renderGithubSettings} from "./imageStore/githubTab";

/**
 * Image store tab — provider selector dropdown + per-provider settings.
 *
 * The actual provider UI lives in `imageStore/*Tab.ts`. The selector
 * change rebuilds the provider panel below it.
 */
export const renderImageStoreTab: TabRenderer = (el, {plugin, t}) => {
    plugin.settings.imageStore = ImageStore.normalizeId(plugin.settings.imageStore);

    const providerDiv = el.createDiv({cls: "iuf-imageStore-selector"});
    const settingsDiv = el.createDiv({cls: "iuf-imageStore-settings"});

    new Setting(providerDiv)
        .setName(t.t("settings.imageStore.select.name"))
        .setDesc(t.t("settings.imageStore.select.desc"))
        .addDropdown(dd => {
            ImageStore.lists.forEach(s => {
                const providerKey = `settings.imageStore.providers.${s.id}`;
                dd.addOption(s.id, t.t(providerKey));
            });
            dd.setValue(plugin.settings.imageStore);
            dd.onChange(async v => {
                plugin.settings.imageStore = v;
                plugin.setupImageUploader();
                renderProvider(settingsDiv, plugin, t);
            });
        });

    renderProvider(settingsDiv, plugin, t);
};

function renderProvider(
    el: HTMLElement,
    plugin: Parameters<TabRenderer>[1]["plugin"],
    t: Parameters<TabRenderer>[1]["t"],
): void {
    el.empty();
    // Each renderer has the type `void | Promise<void>` so a plain call is
    // flagged as a floating promise. These renderers do no async work
    // today; `void` documents the intent and silences the lint rule.
    const invoke = (fn: TabRenderer) => { void fn(el, {plugin, t}); };
    switch (ImageStore.normalizeId(plugin.settings.imageStore)) {
        case ImageStore.IMGUR.id: invoke(renderImgurSettings); break;
        case ImageStore.GYAZO.id: invoke(renderGyazoSettings); break;
        case ImageStore.ALIYUN_OSS.id: invoke(renderOssSettings); break;
        case ImageStore.ImageKit.id: invoke(renderImagekitSettings); break;
        case ImageStore.AWS_S3.id: invoke(renderS3Settings); break;
        case ImageStore.TENCENTCLOUD_COS.id: invoke(renderCosSettings); break;
        case ImageStore.QINIU_KUDO.id: invoke(renderQiniuSettings); break;
        case ImageStore.GITHUB.id: invoke(renderGithubSettings); break;
        case ImageStore.CLOUDFLARE_R2.id: invoke(renderR2Settings); break;
        case ImageStore.BACKBLAZE_B2.id: invoke(renderB2Settings); break;
        default: throw new Error("Unknown image store: " + plugin.settings.imageStore);
    }
}
