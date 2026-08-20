/**
 * CDN acceleration helpers.
 *
 * Each provider can declare one or more well-known CDN endpoints. Users pick
 * a CDN from a dropdown instead of hand-typing a custom domain; we then
 * rewrite the provider's canonical storage URL into the CDN's URL.
 *
 * Why a dedicated module: CDN URL formats differ wildly between providers
 * (jsdelivr uses `/gh/{owner}/{repo}@{branch}/...`, raw.githack uses
 * `/raw/{owner}/{repo}/{branch}/...`, S3-CloudFront only swaps the host,
 * R2 keeps the same path), so the per-provider rewrite lives here instead
 * of inside each uploader class.
 */
export type CdnId = string;

export interface CdnOption {
    /** Stable id persisted in settings. */
    id: CdnId;
    /** Display label (already translated at render time). */
    label: string;
    /** Whether this CDN targets domestic (China) or foreign (global) users. */
    region: "domestic" | "foreign";
    /**
     * Build the final URL from the provider's canonical storage URL.
     * Return null when this CDN cannot be applied (e.g. the URL doesn't
     * match a known shape) so the caller can fall back to the raw URL.
     */
    rewrite(providerId: string, storageUrl: string, ctx: CdnContext): string | null;
}

export interface CdnContext {
    /** GitHub provider metadata. */
    githubOwner?: string;
    githubRepo?: string;
    githubBranch?: string;
    githubPath?: string;
    /** S3-style providers: region / bucket / endpoint. */
    region?: string;
    bucket?: string;
    /** Provider custom domain override (if user set one in provider settings). */
    customDomain?: string;
}

export const NONE_CDN_ID: CdnId = "__none__";
export const CUSTOM_CDN_ID: CdnId = "__custom__";

/**
 * Replace the host of `url` with `host`, preserving protocol/path/query.
 * The new host may be prefixed with `https://`; the prefix is stripped.
 */
export function swapHost(url: string, host: string): string {
    const cleaned = host.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (!cleaned) return url;
    try {
        const u = new URL(url);
        u.host = cleaned;
        return u.toString();
    } catch {
        // Fallback for malformed URLs
        return url.replace(/^https?:\/\/[^/]+/, (match) => `${match.startsWith("https") ? "https" : "http"}://${cleaned}`);
    }
}

/**
 * Encode every path segment of `path` so that Chinese filenames and spaces
 * are safe in URLs. Each segment is decoded first to avoid double-encoding.
 */
export function encodePathSegments(path: string): string {
    return path.split("/").map((segment) => {
        try {
            return encodeURIComponent(decodeURIComponent(segment));
        } catch {
            return encodeURIComponent(segment);
        }
    }).join("/");
}

// ── GitHub CDNs ───────────────────────────────────────────────────────────

const GITHUB_CDNS: CdnOption[] = [
    {
        id: "github-raw",
        label: "GitHub Raw (官方)",
        region: "foreign",
        rewrite: (_pid, storageUrl) => storageUrl,
    },
    {
        id: "jsdelivr",
        label: "jsDelivr (fastly.jsdelivr.net)",
        region: "foreign",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.githubOwner || !ctx.githubRepo || !ctx.githubPath) return null;
            const branch = ctx.githubBranch || "main";
            return `https://fastly.jsdelivr.net/gh/${ctx.githubOwner}/${ctx.githubRepo}@${branch}/${encodePathSegments(ctx.githubPath)}`;
        },
    },
    {
        id: "jsdelivr-cdn",
        label: "jsDelivr CDN (cdn.jsdelivr.net, 国内可能无法访问)",
        region: "foreign",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.githubOwner || !ctx.githubRepo || !ctx.githubPath) return null;
            const branch = ctx.githubBranch || "main";
            return `https://cdn.jsdelivr.net/gh/${ctx.githubOwner}/${ctx.githubRepo}@${branch}/${encodePathSegments(ctx.githubPath)}`;
        },
    },
    {
        id: "statically",
        label: "Statically (cdn.statically.io)",
        region: "foreign",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.githubOwner || !ctx.githubRepo || !ctx.githubPath) return null;
            const branch = ctx.githubBranch || "main";
            return `https://cdn.statically.io/gh/${ctx.githubOwner}/${ctx.githubRepo}/${branch}/${encodePathSegments(ctx.githubPath)}`;
        },
    },
    {
        id: "raw-githack",
        label: "raw.githack.com",
        region: "foreign",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.githubOwner || !ctx.githubRepo || !ctx.githubPath) return null;
            const branch = ctx.githubBranch || "main";
            return `https://raw.githack.com/${ctx.githubOwner}/${ctx.githubRepo}/${branch}/${encodePathSegments(ctx.githubPath)}`;
        },
    },
    {
        id: "gh-proxy",
        label: "gh-proxy.com (国内代理)",
        region: "domestic",
        rewrite: (_pid, storageUrl) => {
            // gh-proxy expects the raw.githubusercontent.com URL as a query param
            return `https://gh-proxy.com/${storageUrl}`;
        },
    },
    {
        id: "ghps",
        label: "ghps.cc (国内代理)",
        region: "domestic",
        rewrite: (_pid, storageUrl) => `https://ghps.cc/${storageUrl}`,
    },
    {
        id: "ghproxy",
        label: "ghproxy.com (国内代理)",
        region: "domestic",
        rewrite: (_pid, storageUrl) => `https://ghproxy.com/${storageUrl}`,
    },
    {
        id: "raw-staticdn",
        label: "raw.staticdn.net (国内镜像)",
        region: "domestic",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.githubOwner || !ctx.githubRepo || !ctx.githubPath) return null;
            const branch = ctx.githubBranch || "main";
            return `https://raw.staticdn.net/${ctx.githubOwner}/${ctx.githubRepo}/${branch}/${encodePathSegments(ctx.githubPath)}`;
        },
    },
    {
        id: "gitwarp",
        label: "proxy.gitwarp.com (全球加速)",
        region: "domestic",
        rewrite: (_pid, storageUrl) => `https://proxy.gitwarp.com/${storageUrl}`,
    },
];

// ── S3-compatible CDNs (R2 / AWS S3 / B2) ────────────────────────────────

const S3_CDNS: CdnOption[] = [
    {
        id: "s3-native",
        label: "默认端点",
        region: "foreign",
        rewrite: (_pid, storageUrl) => storageUrl,
    },
    {
        id: "s3-cloudfront",
        label: "Amazon CloudFront",
        region: "foreign",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.customDomain) return null;
            return null; // user-provided; handled by swapHost in the uploader
        },
    },
];

// ── Aliyun OSS CDNs ───────────────────────────────────────────────────────

const OSS_CDNS: CdnOption[] = [
    {
        id: "oss-native",
        label: "OSS 默认域名",
        region: "foreign",
        rewrite: (_pid, storageUrl) => storageUrl,
    },
    {
        id: "oss-accelerate",
        label: "OSS 全球加速 (oss-accelerate)",
        region: "domestic",
        rewrite: (_pid, storageUrl, ctx) => {
            if (!ctx.bucket) return null;
            const cleaned = storageUrl.replace(/^https?:\/\/[^/]+/, "");
            return `https://${ctx.bucket}.oss-accelerate.aliyuncs.com${cleaned}`;
        },
    },
    {
        id: "oss-https",
        label: "OSS 传输加速 (oss-https)",
        region: "domestic",
        rewrite: (_pid, storageUrl, ctx) => {
            if (!ctx.bucket) return null;
            const cleaned = storageUrl.replace(/^https?:\/\/[^/]+/, "");
            return `https://${ctx.bucket}.oss-https.aliyuncs.com${cleaned}`;
        },
    },
];

// ── TencentCloud COS CDNs ─────────────────────────────────────────────────

const COS_CDNS: CdnOption[] = [
    {
        id: "cos-native",
        label: "COS 默认域名",
        region: "foreign",
        rewrite: (_pid, storageUrl) => storageUrl,
    },
    {
        id: "cos-cdn",
        label: "腾讯云 CDN (自填域名)",
        region: "domestic",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.customDomain) return null;
            return null; // delegated to swapHost
        },
    },
];

// ── Qiniu Kodo CDNs ───────────────────────────────────────────────────────

const QINIU_CDNS: CdnOption[] = [
    {
        id: "qiniu-native",
        label: "七牛默认域名",
        region: "foreign",
        rewrite: (_pid, storageUrl) => storageUrl,
    },
    {
        id: "qiniu-cdn",
        label: "七牛融合 CDN (自填域名)",
        region: "domestic",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.customDomain) return null;
            return null; // delegated to swapHost
        },
    },
];

// ── R2 CDNs ───────────────────────────────────────────────────────────────

const R2_CDNS: CdnOption[] = [
    {
        id: "r2-native",
        label: "R2 默认端点",
        region: "foreign",
        rewrite: (_pid, storageUrl) => storageUrl,
    },
    {
        id: "r2-dev",
        label: "R2.dev 公共域名",
        region: "foreign",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.customDomain) return null;
            return null; // r2.dev is itself the customDomain value
        },
    },
    {
        id: "r2-cdn",
        label: "Cloudflare CDN (自填域名)",
        region: "domestic",
        rewrite: (_pid, _url, ctx) => {
            if (!ctx.customDomain) return null;
            return null; // delegated to swapHost
        },
    },
];

// ── Imgur / Gyazo / ImageKit (no CDN — use provider URL directly) ────────

const PASSTHROUGH_CDNS: CdnOption[] = [
    {
        id: "provider-native",
        label: "服务默认 URL",
        region: "foreign",
        rewrite: (_pid, storageUrl) => storageUrl,
    },
];

const REGISTRY: Record<string, CdnOption[]> = {
    GITHUB: GITHUB_CDNS,
    AWS_S3: S3_CDNS,
    CLOUDFLARE_R2: R2_CDNS,
    BACKBLAZE_B2: S3_CDNS,
    ALIYUN_OSS: OSS_CDNS,
    TENCENTCLOUD_COS: COS_CDNS,
    QINIU_KUDO: QINIU_CDNS,
    IMGUR: PASSTHROUGH_CDNS,
    GYAZO: PASSTHROUGH_CDNS,
    Imagekit: PASSTHROUGH_CDNS,
};

export function getCdnsForProvider(providerId: string): CdnOption[] {
    return REGISTRY[providerId] ?? PASSTHROUGH_CDNS;
}

export function findCdn(providerId: string, cdnId: CdnId): CdnOption | undefined {
    return getCdnsForProvider(providerId).find((c) => c.id === cdnId);
}

/**
 * Apply the selected CDN (or custom domain) to a provider's storage URL.
 * Resolution order:
 *   1. If `cdnId` is CUSTOM_CDN_ID, swap host with `customDomain`.
 *   2. Otherwise look up the CDN in the registry and call its `rewrite`.
 *   3. If rewrite returns null or the CDN is unknown, return the raw URL.
 */
export function applyCdn(
    providerId: string,
    storageUrl: string,
    cdnId: CdnId,
    ctx: CdnContext,
): string {
    if (cdnId === CUSTOM_CDN_ID) {
        if (ctx.customDomain && ctx.customDomain.trim()) {
            return swapHost(encodePathAwareUrl(storageUrl), ctx.customDomain);
        }
        return storageUrl;
    }
    if (cdnId === NONE_CDN_ID) return storageUrl;

    const cdn = findCdn(providerId, cdnId);
    if (!cdn) return storageUrl;

    const rewritten = cdn.rewrite(providerId, storageUrl, ctx);
    if (rewritten) return rewritten;

    // CDN opted out — fall back to custom domain swap if present
    if (ctx.customDomain && ctx.customDomain.trim()) {
        return swapHost(encodePathAwareUrl(storageUrl), ctx.customDomain);
    }
    return storageUrl;
}

/**
 * Ensure every path segment of a URL is properly encoded. Idempotent.
 * Useful before swapping the host, because a provider may return URLs
 * with raw Chinese characters in the path.
 */
function encodePathAwareUrl(url: string): string {
    try {
        const u = new URL(url);
        u.pathname = encodePathSegments(decodeURI(u.pathname));
        return u.toString();
    } catch {
        return url;
    }
}
