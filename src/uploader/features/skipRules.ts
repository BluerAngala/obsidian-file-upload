/**
 * Skip rules — decide whether a given URL / file should be uploaded at all.
 *
 * Three independent checks; an image is skipped if ANY of them matches.
 *   1. URL regex — skip images whose remote URL matches the pattern.
 *   2. Path regex — skip images whose local path matches the pattern.
 *   3. Size threshold — skip files larger than N MB.
 *
 * Useful for:
 *   • Avoiding re-upload of already-CDN'd images
 *   • Skipping the same logo / favicon on every page
 *   • Refusing oversize files on slow connections
 */
export interface SkipRulesOptions {
    urlRegex: string;     // empty = disabled
    pathRegex: string;    // empty = disabled
    maxSizeMB: number;    // 0 = disabled
}

export const DEFAULT_SKIP_RULES_OPTIONS: SkipRulesOptions = {
    urlRegex: "",
    pathRegex: "",
    maxSizeMB: 0,
};

export interface SkipCheckInput {
    url?: string;          // remote URL (for web image re-upload)
    localPath?: string;    // local file path (for embedded images)
    sizeBytes?: number;    // file size
}

export interface SkipDecision {
    shouldSkip: boolean;
    reason?: string;
}

export class SkipRules {
    static shouldSkip(input: SkipCheckInput, options: SkipRulesOptions): SkipDecision {
        if (options.urlRegex && input.url) {
            try {
                const re = new RegExp(options.urlRegex);
                if (re.test(input.url)) {
                    return { shouldSkip: true, reason: "url-regex" };
                }
            } catch {
                // invalid regex — ignore
            }
        }
        if (options.pathRegex && input.localPath) {
            try {
                const re = new RegExp(options.pathRegex);
                if (re.test(input.localPath)) {
                    return { shouldSkip: true, reason: "path-regex" };
                }
            } catch {
                // invalid regex — ignore
            }
        }
        if (options.maxSizeMB > 0 && input.sizeBytes !== undefined) {
            const maxBytes = options.maxSizeMB * 1024 * 1024;
            if (input.sizeBytes > maxBytes) {
                return { shouldSkip: true, reason: "size-limit" };
            }
        }
        return { shouldSkip: false };
    }

    static validateRegex(pattern: string): { valid: boolean; error?: string } {
        if (!pattern) return { valid: true };
        try {
            new RegExp(pattern);
            return { valid: true };
        } catch (e) {
            return { valid: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
}
