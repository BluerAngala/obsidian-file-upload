import {Setting} from "obsidian";
import type {TabRenderer} from "./types";

/**
 * Welcome tab — only shown on the first install (until the user clicks
 * "Get Started" or closes the settings tab). Carries language + image-store
 * selection and a primary CTA that drops the user straight into the
 * image-store tab to finish setup.
 */
export const renderWelcomeTab: TabRenderer = (el, {plugin, t}) => {
    const wrap = el.createDiv({cls: "iuf-welcome"});

    // Hero — title + subtitle
    const hero = wrap.createDiv({cls: "iuf-welcome-hero"});
    const titleSetting = new Setting(hero)
        .setName(t.t("settings.welcome.title"))
        .setHeading();
    titleSetting.nameEl.addClass("iuf-welcome-title");
    hero.createEl("p", {
        text: t.t("settings.welcome.subtitle"),
        cls: "iuf-welcome-subtitle",
    });

    // Core settings card
    const card = wrap.createDiv({cls: "iuf-welcome-card"});

    new Setting(card)
        .setName(t.t("settings.language.name"))
        .setDesc(t.t("settings.language.desc"))
        .setClass("iuf-welcome-row")
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

    // Image store selection + "Get Started" button. The store selector
    // intentionally uses the same dropdown shape as the imageStore tab.
    new Setting(card)
        .setName(t.t("settings.imageStore.select.name"))
        .setDesc(t.t("settings.imageStore.select.desc"))
        .setClass("iuf-welcome-row")
        .addDropdown(dd => {
            void import("../../imageStore").then(({default: ImageStore}) => {
                ImageStore.lists.forEach(s => {
                    const providerKey = `settings.imageStore.providers.${s.id}`;
                    dd.addOption(s.id, t.t(providerKey));
                });
                dd.setValue(plugin.settings.imageStore);
                dd.onChange(async v => {
                    plugin.settings.imageStore = v;
                    plugin.setupImageUploader();
                });
            });
        });

    // Usage hint
    const tip = wrap.createDiv({cls: "iuf-welcome-tip"});
    tip.createEl("p", {text: t.t("settings.welcome.usageHint")});

    // Single primary action — go straight to the image-store tab to finish setup
    const actions = wrap.createDiv({cls: "iuf-welcome-actions"});
    const btn = actions.createEl("button", {
        text: t.t("settings.welcome.getStarted"),
        cls: "iuf-btn-primary iuf-welcome-cta",
    });
    btn.addEventListener("click", () => {
        plugin.settings.installedVersion = plugin.manifest?.version || "1.0.0";
        void plugin.saveSettings();
        plugin.settingTab?.switchTo("imageStore");
    });
};
