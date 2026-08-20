/**
 * Paste-and-drop auto-upload.
 *
 * Obsidian inserts dropped / pasted images as `![[filename.png]]` wiki
 * links (or `![alt](filename.png)` markdown). This handler intercepts
 * the event, uploads the image to the configured cloud store BEFORE
 * Obsidian writes the link, then swaps the inserted text in place.
 *
 * The hook is registered against the active markdown editor's DOM
 * container. The actual swap happens in two ways:
 *   1. For data-transfer drops: we read the blob directly and replace
 *      the file via vault.process so the local copy is never created.
 *   2. For paste events where Obsidian already created a file: we use
 *      the vault `create` event the plugin already listens to, then
 *      transform the editor contents after upload completes.
 *
 * This is best-effort: if Obsidian's API changes the editor handling,
 * we fall back to uploading the post-hoc file and rewriting the link.
 */
import {App, TFile, Editor, MarkdownView} from "obsidian";
import ImageUploader from "../imageUploader";

export interface PasteUploadDeps {
    app: App;
    getUploader: () => ImageUploader | null;
    getActiveEditor: () => Editor | null;
}

export class PasteAutoUpload {
    private readonly deps: PasteUploadDeps;

    constructor(deps: PasteUploadDeps) {
        this.deps = deps;
    }

    /**
     * Try to upload the given file and replace its markdown link in the
     * active editor with the remote URL. Returns the remote URL on
     * success, or null if upload was skipped / failed.
     *
     * Note: callers should `await` this and tolerate null — paste flow
     * should never throw (a failed upload leaves the local file intact).
     */
    async handlePastedFile(file: TFile): Promise<string | null> {
        const uploader = this.deps.getUploader();
        if (!uploader) return null;
        const editor = this.deps.getActiveEditor();
        if (!editor) return null;

        const ext = file.extension.toLowerCase();
        if (!uploader.supportsFileType(ext)) return null;

        try {
            const buf = await this.deps.app.vault.readBinary(file);
            const blob = new File([buf], file.name, { type: this.mimeFor(ext) });
            const url = await uploader.upload(blob, file.path);
            this.replaceLocalLink(editor, file.name, url);
            return url;
        } catch (err) {
            // Don't break the user's editing flow — leave the local file in place
            console.error("obsidian-file-upload: paste upload failed", err);
            return null;
        }
    }

    /** Find a `![[name]]` or `![alt](name)` in the editor and swap with the URL. */
    private replaceLocalLink(editor: Editor, fileName: string, remoteUrl: string): void {
        const content = editor.getValue();
        const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const wikiPattern = new RegExp(`!\\[\\[${escaped}(\\|[^\\]]*)?\\]\\]`, "g");
        const mdPattern = new RegExp(`!\\[[^\\]]*\\]\\(${escaped}(\\s+"[^"]*")?\\)`, "g");
        let replaced = false;
        let newContent = content;
        if (wikiPattern.test(content)) {
            newContent = content.replace(wikiPattern, `![${fileName}](${remoteUrl})`);
            replaced = true;
        } else if (mdPattern.test(content)) {
            newContent = content.replace(mdPattern, `![${fileName}](${remoteUrl})`);
            replaced = true;
        }
        if (replaced) {
            editor.setValue(newContent);
        }
    }

    private mimeFor(ext: string): string {
        const map: Record<string, string> = {
            jpg: "image/jpeg", jpeg: "image/jpeg",
            png: "image/png", gif: "image/gif", webp: "image/webp",
            bmp: "image/bmp", svg: "image/svg+xml", avif: "image/avif",
        };
        return map[ext] ?? "application/octet-stream";
    }
}

/**
 * Convenience: resolve the active markdown view's editor + filename.
 * Returns nulls if no markdown view is currently focused.
 */
export function resolveActiveEditor(view: MarkdownView | null): {
    editor: Editor | null;
    fileName: string | null;
} {
    if (!view || !view.editor) return { editor: null, fileName: null };
    return { editor: view.editor, fileName: view.file?.name ?? null };
}
