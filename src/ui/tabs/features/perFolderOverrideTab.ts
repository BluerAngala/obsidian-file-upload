import {Setting} from "obsidian";
import type {TabRenderer} from "../types";
import {PLATFORMS} from "../../../uploader/features/platformFormat";
import type {PlatformId} from "../../../uploader/features/platformFormat";
import ImageStore from "../../../imageStore";
import {validatePattern, type PerFolderRule} from "../../../uploader/features/perFolderOverride";

/**
 * Per-folder override UI.
 *
 * Renders a list of rules plus an "Add rule" button. Each rule has:
 *   • folderPattern
 *   • imageStore (optional)
 *   • cdnId (optional, free-text — gets validated against the chosen store)
 *   • path (optional)
 *   • platformFormat (optional)
 *   • enabled toggle
 *
 * The list is editable in place; changes write directly to
 * `plugin.settings.perFolderRules` and the parent re-renders on edit.
 */
export function renderPerFolderOverrideSection(el: HTMLElement, ctx: Parameters<TabRenderer>[1]): void {
    const {plugin, t} = ctx;
    const rules = plugin.settings.perFolderRules;

    new Setting(el)
        .setName(t.t("settings.features.perFolder.heading"))
        .setHeading();

    new Setting(el)
        .setName(t.t("settings.features.perFolder.add.name"))
        .setDesc(t.t("settings.features.perFolder.add.desc"))
        .addButton(btn => btn
            .setButtonText(t.t("settings.features.perFolder.add.button"))
            .onClick(() => {
                rules.push({
                    folderPattern: "",
                    enabled: true,
                });
                rerender(el, ctx);
            }));

    if (rules.length === 0) {
        el.createDiv({
            cls: "iuf-per-folder-empty",
            text: t.t("settings.features.perFolder.empty"),
        });
        return;
    }

    const list = el.createDiv({cls: "iuf-per-folder-list"});
    rules.forEach((rule, index) => {
        const ruleEl = list.createDiv({cls: "iuf-per-folder-rule"});
        renderRule(ruleEl, rule, index, ctx);
    });
}

function renderRule(
    el: HTMLElement,
    rule: PerFolderRule,
    index: number,
    ctx: Parameters<TabRenderer>[1],
): void {
    const {plugin, t} = ctx;
    const rules = plugin.settings.perFolderRules;

    new Setting(el)
        .setName(t.t("settings.features.perFolder.rule.pattern.name"))
        .setDesc(t.t("settings.features.perFolder.rule.pattern.desc"))
        .addText(text => text
            .setPlaceholder("assets/**")
            .setValue(rule.folderPattern)
            .onChange(value => {
                rule.folderPattern = value;
            }))
        .addToggle(toggle => toggle
            .setValue(rule.enabled)
            .onChange(value => { rule.enabled = value; }));

    new Setting(el)
        .setName(t.t("settings.features.perFolder.rule.store.name"))
        .setDesc(t.t("settings.features.perFolder.rule.store.desc"))
        .addDropdown(dd => {
            dd.addOption("", t.t("settings.features.perFolder.rule.store.useDefault"));
            for (const s of ImageStore.lists) {
                dd.addOption(s.id, t.t(`settings.imageStore.providers.${s.id}`));
            }
            dd.setValue(rule.imageStore ?? "");
            dd.onChange(value => {
                rule.imageStore = value || undefined;
                if (!value) rule.cdnId = undefined;
            });
        });

    if (rule.imageStore) {
        new Setting(el)
            .setName(t.t("settings.features.perFolder.rule.cdn.name"))
            .setDesc(t.t("settings.features.perFolder.rule.cdn.desc"))
            .addText(text => text
                .setPlaceholder("jsdelivr")
                .setValue(rule.cdnId ?? "")
                .onChange(value => { rule.cdnId = value || undefined; }));
    }

    new Setting(el)
        .setName(t.t("settings.features.perFolder.rule.path.name"))
        .setDesc(t.t("settings.features.perFolder.rule.path.desc"))
        .addText(text => text
            .setPlaceholder("assets/{year}/{filename}")
            .setValue(rule.path ?? "")
            .onChange(value => { rule.path = value || undefined; }));

    new Setting(el)
        .setName(t.t("settings.features.perFolder.rule.platform.name"))
        .setDesc(t.t("settings.features.perFolder.rule.platform.desc"))
        .addDropdown(dd => {
            dd.addOption("", t.t("settings.features.perFolder.rule.store.useDefault"));
            for (const p of PLATFORMS) {
                dd.addOption(p.id, t.t(`settings.features.platformFormat.options.${p.id}`));
            }
            dd.setValue(rule.platformFormat ?? "");
            dd.onChange(value => {
                rule.platformFormat = (value || undefined) as PlatformId | undefined;
            });
        });

    // Validation hint
    const err = validatePattern(rule.folderPattern);
    if (err) {
        el.createDiv({cls: "iuf-per-folder-error", text: err});
    }

    new Setting(el)
        .addButton(btn => btn
            .setButtonText(t.t("settings.features.perFolder.rule.delete"))
            .setWarning()
            .onClick(() => {
                rules.splice(index, 1);
                const parent = el.parentElement;
                if (parent) rerender(parent, ctx);
            }));
}

function rerender(el: HTMLElement, ctx: Parameters<TabRenderer>[1]): void {
    // Re-render the whole section by clearing the parent and re-drawing.
    const root = el.querySelector(".iuf-per-folder-list")?.parentElement ?? el;
    root.empty();
    renderPerFolderOverrideSection(root, ctx);
}
