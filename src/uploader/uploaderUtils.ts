import {applyCdn, encodePathSegments, swapHost} from "./cdn";
import type {CdnId} from "./cdn";

export class UploaderUtils {
    static generateName(pathTmpl: string | undefined, imageName: string): string {
        const date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = this.generateRandomString(20);

        return pathTmpl != undefined && pathTmpl.trim().length > 0 ? pathTmpl
                .replace('{year}', year)
                .replace('{mon}', month)
                .replace('{day}', day)
                .replace('{random}', random)
                .replace('{filename}', imageName)
            : imageName
            ;
    }

    private static generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }

        return result;
    }

    /**
     * @deprecated Use `applyCdn()` from `./cdn` for new code.
     *
     * Legacy: rewrite the host of `url` to `customDomainName`, with two
     * legacy behaviors preserved for backward compatibility with the
     * previous implementation:
     *   1. Strips BOTH `https://` and `http://` prefixes from the
     *      custom domain (original only handled https, producing
     *      `https://http://...`).
     *   2. If `url` has no scheme/host (a "key-like" path), wraps it as
     *      `https://{customDomain}/{encoded-path}` — used by some
     *      uploaders that return just a storage key.
     *   3. Re-encodes the path so Chinese filenames and spaces survive
     *      the host swap.
     *   4. Preserves the user's trailing-slash intent on the custom
     *      domain (callers that pass `cdn.example.com/` get a
     *      double-slash in the result — matches the old behavior).
     */
    static customizeDomainName(url: string, customDomainName: string): string {
        if (!customDomainName || !customDomainName.trim()) {
            return url;
        }
        const cleaned = customDomainName.replace(/^https?:\/\//i, "");
        // Preserve trailing slash if the user typed one (legacy behavior)
        const trailingSlash = cleaned.endsWith("/") ? "/" : "";
        const host = cleaned.replace(/\/+$/, "");
        if (!host) return url;

        const hasScheme = /^https?:\/\//i.test(url);
        if (!hasScheme) {
            // Key-like input — wrap as a full URL (preserves trailing slash)
            return `https://${host}/${encodePathSegments(url)}${trailingSlash}`;
        }
        return swapHost(this.reEncodeUrl(url), host) + trailingSlash;
    }

    /**
     * Apply the configured CDN (or custom domain fallback) to a provider
     * storage URL. New code should call this instead of `customizeDomainName`.
     */
    static applyCdn(
        providerId: string,
        storageUrl: string,
        cdnId: CdnId,
        customDomain: string,
    ): string {
        return applyCdn(providerId, storageUrl, cdnId, {customDomain});
    }

    /**
     * Re-encode a URL's path so it survives host swaps. Splits the URL
     * at scheme/host/path boundaries, then percent-encodes each path
     * segment without double-encoding characters that are already valid.
     */
    private static reEncodeUrl(url: string): string {
        try {
            const u = new URL(url);
            u.pathname = encodePathSegments(decodeURI(u.pathname));
            return u.toString();
        } catch {
            return url;
        }
    }

    /**
     * Strip leading/trailing whitespace (including newlines) from a credential
     * field. Returns an empty string for null/undefined input so downstream
     * callers don't need to guard.
     *
     * Pasting credentials from the web frequently introduces trailing newlines
     * or spaces. AWS-family SDKs reject these with cryptic signing errors, so
     * we normalize at the boundary.
     */
    static trimCredential(value: string | undefined | null): string {
        return (value ?? "").trim();
    }

    /**
     * Normalize an S3/R2/B2 endpoint URL: trims whitespace and removes any
     * trailing slash so the AWS SDK's URL composition does not produce a
     * double-slashed path that hangs or 400s.
     */
    static normalizeEndpoint(endpoint: string | undefined | null): string {
        const trimmed = (endpoint ?? "").trim();
        return trimmed.replace(/\/+$/, "");
    }
}
