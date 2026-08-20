import {Setting, setIcon} from "obsidian";
import type {TabContext, TabRenderer} from "../types";
import {UploadLog} from "../../../uploader/features/uploadLog";

/**
 * Upload log tab — surfaces the in-memory upload log so the user can audit
 * what went where, copy any URL back to the clipboard, and clear the log
 * when needed. Memory-only by design (see features/uploadLog.ts).
 */
export const renderUploadLogTab: TabRenderer = (el, ctx) => {
    const log = UploadLog.getInstance();

    new Setting(el)
        .setName(ctx.t.t("settings.uploadLog.heading"))
        .setHeading();

    new Setting(el)
        .setName(ctx.t.t("settings.uploadLog.summary.name"))
        .setDesc(ctx.t.t("settings.uploadLog.summary.desc")
            .replace("{success}", String(log.successCount()))
            .replace("{failed}", String(log.failureCount()))
            .replace("{skipped}", String(log.skippedCount())))
        .addButton(btn => btn
            .setButtonText(ctx.t.t("settings.uploadLog.refresh"))
            .onClick(() => rerender(el, ctx)))
        .addButton(btn => btn
            .setButtonText(ctx.t.t("settings.uploadLog.clear"))
            .setWarning()
            .onClick(() => {
                log.clear();
                rerender(el, ctx);
            }));

    const list = el.createDiv({cls: "iuf-upload-log-list"});
    const entries = [...log.list()].reverse();
    if (entries.length === 0) {
        list.createDiv({
            cls: "iuf-upload-log-empty",
            text: ctx.t.t("settings.uploadLog.empty"),
        });
        return;
    }
    for (const e of entries) {
        const item = list.createDiv({cls: `iuf-upload-log-item status-${e.status}`});
        const icon = item.createSpan({cls: "iuf-upload-log-icon"});
        if (e.status === "success") setIcon(icon, "check-circle");
        else if (e.status === "failed") setIcon(icon, "x-circle");
        else setIcon(icon, "minus-circle");

        const text = item.createDiv({cls: "iuf-upload-log-text"});
        const nameRow = text.createDiv({cls: "iuf-upload-log-name"});
        nameRow.setText(e.fileName);
        const meta = text.createDiv({cls: "iuf-upload-log-meta"});
        const time = new Date(e.timestamp).toLocaleString();
        meta.setText(`${e.providerId} · ${time} · ${e.durationMs}ms`);
        if (e.status === "success" && e.url) {
            const urlEl = text.createEl("a", {
                cls: "iuf-upload-log-url",
                href: e.url,
                text: e.url,
            });
            urlEl.setAttr("target", "_blank");
            urlEl.setAttr("rel", "noopener noreferrer");
        } else if (e.status === "failed" && e.error) {
            text.createDiv({cls: "iuf-upload-log-error", text: e.error});
        } else if (e.status === "skipped") {
            text.createDiv({
                cls: "iuf-upload-log-error",
                text: ctx.t.t("settings.uploadLog.skippedReason"),
            });
        }
    }
};

function rerender(el: HTMLElement, ctx: TabContext): void {
    el.empty();
    void renderUploadLogTab(el, ctx);
}
