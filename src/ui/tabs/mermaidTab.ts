import {Setting} from "obsidian";
import type {TabRenderer} from "./types";

/**
 * Mermaid tab — converts Mermaid code blocks in the active document to
 * PNG images and uploads them during publish.
 */
export const renderMermaidTab: TabRenderer = (el, {plugin, t}) => {
    new Setting(el)
        .setName(t.t("settings.mermaid.convert.name"))
        .setDesc(t.t("settings.mermaid.convert.desc"))
        .addToggle(toggle =>
            toggle
                .setValue(plugin.settings.convertMermaid)
                .onChange(value => { plugin.settings.convertMermaid = value; })
        );

    new Setting(el)
        .setName(t.t("settings.mermaid.scale.name"))
        .setDesc(t.t("settings.mermaid.scale.desc"))
        .addSlider(slider =>
            slider
                .setLimits(1, 4, 1)
                .setValue(plugin.settings.mermaidScale)
                .setDynamicTooltip()
                .onChange(value => { plugin.settings.mermaidScale = value; })
        );

    new Setting(el)
        .setName(t.t("settings.mermaid.theme.name"))
        .setDesc(t.t("settings.mermaid.theme.desc"))
        .addDropdown(dd => {
            const themes: Record<string, string> = {
                "default": t.t("settings.mermaid.theme.options.default"),
                "dark": t.t("settings.mermaid.theme.options.dark"),
                "forest": t.t("settings.mermaid.theme.options.forest"),
                "neutral": t.t("settings.mermaid.theme.options.neutral"),
                "base": t.t("settings.mermaid.theme.options.base"),
            };
            Object.entries(themes).forEach(([value, label]) => { dd.addOption(value, label); });
            dd.setValue(plugin.settings.mermaidTheme);
            dd.onChange(value => { plugin.settings.mermaidTheme = value; });
        });
};
