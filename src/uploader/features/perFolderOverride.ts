/**
 * Per-folder override — pick a different image store, CDN, or rename
 * template for files inside a specific vault folder.
 *
 * The rules are evaluated **first match wins** in the order the user lists
 * them. Each rule has:
 *   • folderPattern: literal prefix or simple glob (`assets/**`, `daily/*`)
 *   • imageStore: optional override ("GITHUB", "AWS_S3", ...)
 *   • cdnId: optional override for the chosen store
 *   • path: optional override for the upload path template
 *   • platformFormat: optional override
 *
 * Rules are persisted as part of `PublishSettings` (see publish.ts).
 */
import ImageStore from "../../imageStore";
import type {PlatformId} from "./platformFormat";

export interface PerFolderRule {
    /** Glob-style path prefix, e.g. "assets/**" or "daily/*". */
    folderPattern: string;
    /** Optional override of the image store id. */
    imageStore?: string;
    /** Optional CDN id override (only applies if `imageStore` is also set). */
    cdnId?: string;
    /** Optional path template override. */
    path?: string;
    /** Optional platform format override. */
    platformFormat?: PlatformId;
    enabled: boolean;
}

export const DEFAULT_PER_FOLDER_RULES: PerFolderRule[] = [];

/**
 * Match a vault-relative path against a rule's folder pattern.
 *
 * Supports:
 *   - `assets`     — exact folder match
 *   - `assets/**`  — anything inside `assets/`
 *   - `daily/*`    — direct children of `daily/`
 *   - `*`          — every path
 */
export function matchFolderRule(pattern: string, filePath: string): boolean {
    if (!pattern || !pattern.trim()) return false;
    const p = pattern.trim();
    if (p === "*") return true;
    if (p.endsWith("/**")) {
        const prefix = p.slice(0, -3);
        return filePath === prefix || filePath.startsWith(prefix + "/");
    }
    if (p.endsWith("/*")) {
        const prefix = p.slice(0, -2);
        return filePath.startsWith(prefix + "/") && !filePath.slice(prefix.length + 1).includes("/");
    }
    if (p.endsWith("/")) {
        return filePath.startsWith(p);
    }
    return filePath === p || filePath.startsWith(p + "/");
}

/**
 * Resolve the effective settings for a given file path by applying the
 * first matching per-folder rule on top of the global settings.
 *
 * If no rule matches, returns the original settings (and original store).
 */
export interface ResolvedUploadConfig {
    imageStore: string;
    cdnId?: string;
    path?: string;
    platformFormat: PlatformId;
}

export function resolveConfigFor(
    filePath: string,
    rules: PerFolderRule[],
    globalImageStore: string,
    globalPlatformFormat: PlatformId,
): ResolvedUploadConfig {
    for (const rule of rules) {
        if (!rule.enabled) continue;
        if (!matchFolderRule(rule.folderPattern, filePath)) continue;

        const storeId = rule.imageStore
            ? ImageStore.normalizeId(rule.imageStore)
            : globalImageStore;
        return {
            imageStore: storeId,
            cdnId: rule.cdnId,
            path: rule.path,
            platformFormat: rule.platformFormat ?? globalPlatformFormat,
        };
    }
    return {
        imageStore: globalImageStore,
        platformFormat: globalPlatformFormat,
    };
}

/** Validate a single glob pattern; returns null if valid or an error string. */
export function validatePattern(pattern: string): string | null {
    if (!pattern || !pattern.trim()) return "Pattern cannot be empty";
    const p = pattern.trim();
    if (p.includes("**") && !p.endsWith("/**")) {
        return "** must be at the end of a path segment (use assets/**)";
    }
    return null;
}
