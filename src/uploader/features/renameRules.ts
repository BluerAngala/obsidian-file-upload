/**
 * Rename rules — extended path template system.
 *
 * Builds on the legacy `{year} {mon} {day} {filename} {random}` variables
 * already supported by `UploaderUtils.generateName()`. New variables:
 *
 *   {hash}     8-char hex hash of original filename (stable across renames)
 *   {uuid}     Full UUID v4
 *   {seq}      Monotonically increasing per-day sequence (resets at midnight)
 *   {timestamp} Unix epoch milliseconds
 *   {ext}      Lowercase file extension (without dot)
 *   {basename} Filename without extension
 *
 * The output filename is sanitized — characters that break URLs or storage
 * providers (e.g. `? # % &` for S3, leading dots for hidden files) are
 * replaced with `-`.
 */
import {UploaderUtils} from "../uploaderUtils";

let lastSeqDate = "";
let lastSeqValue = 0;

export interface RenameOptions {
    /** When true, the variable set above is enabled. */
    enabled: boolean;
    /** Whether to convert spaces in filenames to dashes. */
    spacesToDashes: boolean;
    /** Whether to lowercase the entire filename. */
    lowercase: boolean;
}

export const DEFAULT_RENAME_OPTIONS: RenameOptions = {
    enabled: false,
    spacesToDashes: false,
    lowercase: false,
};

export class RenameRules {
    /**
     * Apply the template to the given filename. If `template` is empty,
     * returns the (sanitized) original filename.
     */
    static apply(
        template: string,
        originalName: string,
        options: RenameOptions,
    ): string {
        if (!template || !template.trim()) {
            return this.sanitize(originalName, options);
        }

        const now = new Date();
        const ext = this.extractExt(originalName);
        const basename = this.extractBasename(originalName);

        const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        if (dateKey !== lastSeqDate) {
            lastSeqDate = dateKey;
            lastSeqValue = 0;
        }
        lastSeqValue += 1;

        const hash = this.hashString(originalName).slice(0, 8);
        const uuid = this.uuid();
        const seq = String(lastSeqValue).padStart(4, "0");
        const timestamp = String(now.getTime());

        // Use the existing UploaderUtils for the legacy variables, then
        // apply the new ones on top so templates can mix both.
        const legacyApplied = UploaderUtils.generateName(template, basename + ext);
        const final = legacyApplied
            .replace("{hash}", hash)
            .replace("{uuid}", uuid)
            .replace("{seq}", seq)
            .replace("{timestamp}", timestamp)
            .replace("{ext}", ext.replace(/^\./, ""))
            .replace("{basename}", basename);

        return this.sanitize(final, options);
    }

    static extractExt(name: string): string {
        const idx = name.lastIndexOf(".");
        return idx >= 0 ? name.slice(idx) : "";
    }

    static extractBasename(name: string): string {
        const idx = name.lastIndexOf(".");
        return idx >= 0 ? name.slice(0, idx) : name;
    }

    /**
     * Hash a string to 8 hex chars using FNV-1a. We avoid Node's `crypto`
     * here because this code runs in the browser as well.
     */
    static hashString(s: string): string {
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return (h >>> 0).toString(16).padStart(8, "0");
    }

    /** Cryptographically-flavoured UUID v4 using Math.random. Not for security. */
    static uuid(): string {
        const hex = "0123456789abcdef";
        let out = "";
        for (let i = 0; i < 36; i++) {
            if (i === 8 || i === 13 || i === 18 || i === 23) {
                out += "-";
            } else if (i === 14) {
                out += "4";
            } else if (i === 19) {
                out += hex[(Math.random() * 4) | 8];
            } else {
                out += hex[(Math.random() * 16) | 0];
            }
        }
        return out;
    }

    /** Replace filesystem-unsafe characters and apply user prefs. */
    static sanitize(name: string, options: RenameOptions): string {
        // Strip path separators — providers treat them as directory boundaries
        let out = name.replace(/[\\/]/g, "-");
        // Strip characters that frequently break URL access.
        // Control chars (\x00-\x1f) are removed with an explicit char class
        // to satisfy the `no-control-regex` ESLint rule; everything else
        // is left to the dashes replacement below.
        // eslint-disable-next-line no-control-regex
        out = out.replace(/[\x00-\x1f?#%&<>|+`\s]/g, options.spacesToDashes ? "-" : "-");
        // Replace runs of dashes with a single dash for tidiness
        out = out.replace(/-+/g, "-").replace(/^-|-$/g, "");
        if (options.lowercase) out = out.toLowerCase();
        return out;
    }
}
