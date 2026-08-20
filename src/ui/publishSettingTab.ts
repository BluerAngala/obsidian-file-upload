/**
 * Settings tab coordinator.
 *
 * Owns the tab-bar navigation and persists settings on hide. The actual
 * content of each tab is rendered by a per-tab module under `./tabs/*`.
 *
 * Keeping this file small means each tab can be edited independently
 * without merge conflicts, and unit tests can render a single tab in
 * isolation if needed.
 */
import {App, PluginSettingTab} from "obsidian";
import ObsidianPublish from "../publish";
import {renderWelcomeTab} from "./tabs/welcomeTab";
import {renderGeneralTab} from "./tabs/generalTab";
import {renderUploadTab} from "./tabs/uploadTab";
import {renderMermaidTab} from "./tabs/mermaidTab";
import {renderImageStoreTab} from "./tabs/imageStoreTab";
import {renderUploadLogTab} from "./tabs/uploadLogTab";
import type {TabContext, TabRenderer} from "./tabs/types";

type TabId = "welcome" | "general" | "upload" | "mermaid" | "imageStore" | "uploadLog";

interface TabSpec {
    id: TabId;
    labelKey: string;
    render: TabRenderer;
}

const TABS: TabSpec[] = [
    { id: "welcome", labelKey: "settings.tabs.welcome", render: renderWelcomeTab },
    { id: "general", labelKey: "settings.tabs.general", render: renderGeneralTab },
    { id: "upload", labelKey: "settings.tabs.upload", render: renderUploadTab },
    { id: "uploadLog", labelKey: "settings.tabs.uploadLog", render: renderUploadLogTab },
    { id: "mermaid", labelKey: "settings.tabs.mermaid", render: renderMermaidTab },
    { id: "imageStore", labelKey: "settings.tabs.imageStore", render: renderImageStoreTab as TabRenderer },
];

export default class PublishSettingTab extends PluginSettingTab {
    private readonly plugin: ObsidianPublish;
    private activeTab: TabId;

    constructor(app: App, plugin: ObsidianPublish) {
        super(app, plugin);
        this.plugin = plugin;
        // First-install users land on the welcome tab; everyone else on general.
        this.activeTab = plugin.settings.installedVersion ? "general" : "welcome";
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();
        containerEl.addClass("iuf-settings");
        containerEl.parentElement?.classList.add("iuf-settings-parent");

        this.renderTabBar(containerEl);
        const contentEl = containerEl.createDiv({cls: "iuf-tab-content"});
        this.renderActiveTab(contentEl);
    }

    hide(): void {
        this.containerEl.parentElement?.classList.remove("iuf-settings-parent");
        // Mark as installed even if the user closes the tab without
        // clicking "Get Started" — otherwise we re-show the welcome page
        // every time they re-open settings.
        if (!this.plugin.settings.installedVersion) {
            this.plugin.settings.installedVersion = this.plugin.manifest?.version || "1.0.0";
        }
        void this.plugin.saveSettings().then(() => {
            this.plugin.setupImageUploader();
        }).catch(err => {
            console.error("obsidian-file-upload: saveSettings failed", err);
        });
    }

    /** Switch to a specific tab and re-render. Used by the welcome CTA. */
    switchTo(tabId: TabId): void {
        this.activeTab = tabId;
        this.display();
    }

    // ── Internals ─────────────────────────────────────────────────────────

    private renderTabBar(containerEl: HTMLElement): void {
        const bar = containerEl.createDiv({cls: "iuf-tab-bar"});
        const buttons = new Map<TabId, HTMLDivElement>();
        for (const tab of TABS) {
            const btn = bar.createDiv({
                cls: "iuf-tab-btn",
                text: this.plugin.translate.t(tab.labelKey),
            });
            if (tab.id === this.activeTab) btn.addClass("active");
            btn.addEventListener("click", () => {
                this.activeTab = tab.id;
                buttons.forEach((b, id) => b.toggleClass("active", id === tab.id));
                // Re-render the whole settings panel so the active tab's
                // content matches the new active class. (Cheaper than
                // tracking partial state.)
                this.display();
            });
            buttons.set(tab.id, btn);
        }
    }

    private renderActiveTab(contentEl: HTMLElement): void {
        contentEl.empty();
        const spec = TABS.find(t => t.id === this.activeTab) ?? TABS[1];
        const ctx: TabContext = {
            plugin: this.plugin,
            t: this.plugin.translate,
        };
        const result = spec.render(contentEl, ctx);
        if (result && typeof result.then === "function") {
            result.catch(err => {
                console.error(`obsidian-file-upload: tab ${spec.id} render failed`, err);
            });
        }
    }
}
