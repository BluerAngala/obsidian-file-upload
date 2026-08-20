/**
 * Shared types and utilities for the settings-tab renderers.
 *
 * Each renderer is a pure function: it gets the container element, a handle
 * to the plugin (for reading/writing settings), and the translate instance.
 * It does NOT manage tab navigation or persistence — the coordinator
 * (`publishSettingTab.ts`) owns that.
 */
import type ObsidianPublish from "../../publish";
import type Translate from "../../i18n/translate";

export interface TabContext {
    plugin: ObsidianPublish;
    t: Translate;
}

/**
 * The element the renderer is mounted on. We use Obsidian's
 * `Setting`/createDiv helpers extensively, which require the broader
 * Obsidian container interface, not the bare DOM `HTMLElement`.
 */
export type TabContainerEl = HTMLElement & {
    createDiv(options?: { cls?: string; text?: string }): HTMLDivElement;
    empty(): void;
};

/** Type for a tab content renderer. */
export type TabRenderer = (el: TabContainerEl, ctx: TabContext) => void | Promise<void>;

/** Build a short alias `t(key)` that the legacy code used heavily. */
export function makeT(t: Translate): (key: string) => string {
    return (key: string) => t.t(key);
}
