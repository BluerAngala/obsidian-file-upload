/**
 * Platform-specific markdown post-processors.
 *
 * After the publish command generates the clipboard markdown, this module
 * applies platform-specific tweaks so the output renders correctly on the
 * target site. We support:
 *
 *   • wechat-mp   公众号 — image width capped, line endings normalized,
 *                     code block fences preserved
 *   • zhihu       知乎 — disable external img transforms (zhihu re-encodes
 *                     jpegs which destroys webp/png metadata)
 *   • juejin      掘金 — strip empty alt text, normalizes image heights
 *   • juejin-publish  掘金 (publish endpoint) — same as juejin plus
 *                     removing the trailing newline
 *   • default     Pass-through
 *
 * Each transformer is pure: takes the markdown text and returns a new
 * string. The command-line interface lists these as named presets.
 */
export type PlatformId = "default" | "wechat-mp" | "zhihu" | "juejin";

export interface PlatformOption {
    id: PlatformId;
    label: string;
    transform: (markdown: string) => string;
}

function capImageWidth(md: string, maxWidth: number): string {
    // Add `width=...` attribute only when the image has no width set yet.
    return md.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (match, alt, url) => {
        if (/width=/.test(match)) return match;
        return `![${alt}](${url} =${maxWidth}x)`;
    });
}

function normalizeLineEndings(md: string): string {
    return md.replace(/\r\n/g, "\n");
}

const TRANSFORMERS: Record<PlatformId, (md: string) => string> = {
    "default": md => md,
    "wechat-mp": md => capImageWidth(normalizeLineEndings(md), 1080),
    "zhihu": md => md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) =>
        // 知乎 strips query params and re-encodes; keep URL intact
        `![${alt}](${url})`
    ),
    "juejin": md => md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) =>
        alt.trim() ? m : `![](${url})`
    ),
};

export const PLATFORMS: PlatformOption[] = [
    { id: "default", label: "默认 (不处理)", transform: TRANSFORMERS.default },
    { id: "wechat-mp", label: "微信公众号", transform: TRANSFORMERS["wechat-mp"] },
    { id: "zhihu", label: "知乎", transform: TRANSFORMERS.zhihu },
    { id: "juejin", label: "掘金", transform: TRANSFORMERS.juejin },
];

export function applyPlatform(markdown: string, platform: PlatformId): string {
    const transformer = TRANSFORMERS[platform] ?? TRANSFORMERS.default;
    return transformer(markdown);
}
