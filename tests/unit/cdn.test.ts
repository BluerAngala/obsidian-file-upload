import { describe, expect, it } from "vitest";
import {
    applyCdn,
    CUSTOM_CDN_ID,
    encodePathSegments,
    findCdn,
    getCdnsForProvider,
    NONE_CDN_ID,
    swapHost,
} from "../../src/uploader/cdn";

describe("cdn.swapHost", () => {
    it("replaces the host of a normal URL", () => {
        expect(swapHost("https://old.example.com/path/file.png", "cdn.example.com"))
            .toBe("https://cdn.example.com/path/file.png");
    });

    it("strips https:// prefix from the new host", () => {
        expect(swapHost("https://old.example.com/path", "https://cdn.example.com"))
            .toBe("https://cdn.example.com/path");
    });

    it("strips http:// prefix from the new host", () => {
        expect(swapHost("https://old.example.com/path", "http://cdn.example.com"))
            .toBe("https://cdn.example.com/path");
    });

    it("strips trailing slashes from the new host", () => {
        expect(swapHost("https://old.example.com/path", "cdn.example.com/"))
            .toBe("https://cdn.example.com/path");
    });

    it("preserves query string and fragment", () => {
        expect(swapHost("https://old.example.com/path?x=1#frag", "cdn.example.com"))
            .toBe("https://cdn.example.com/path?x=1#frag");
    });

    it("returns the URL unchanged when new host is empty", () => {
        expect(swapHost("https://old.example.com/path", "")).toBe("https://old.example.com/path");
    });
});

describe("cdn.encodePathSegments", () => {
    it("encodes Chinese characters in each segment", () => {
        expect(encodePathSegments("images/截图.png"))
            .toBe("images/%E6%88%AA%E5%9B%BE.png");
    });

    it("encodes spaces", () => {
        expect(encodePathSegments("Pasted image 2026.png"))
            .toBe("Pasted%20image%202026.png");
    });

    it("does not double-encode already encoded characters", () => {
        expect(encodePathSegments("images/%E6%88%AA%E5%9B%BE.png"))
            .toBe("images/%E6%88%AA%E5%9B%BE.png");
    });
});

describe("cdn.getCdnsForProvider", () => {
    it("returns GitHub CDNs including jsdelivr and gh-proxy", () => {
        const cdns = getCdnsForProvider("GITHUB");
        const ids = cdns.map((c) => c.id);
        expect(ids).toContain("github-raw");
        expect(ids).toContain("jsdelivr");
        expect(ids).toContain("gh-proxy");
        expect(ids).toContain("statically");
    });

    it("returns domestic+foreign options for OSS", () => {
        const cdns = getCdnsForProvider("ALIYUN_OSS");
        expect(cdns.some((c) => c.region === "domestic")).toBe(true);
        expect(cdns.some((c) => c.region === "foreign")).toBe(true);
    });

    it("returns passthrough CDN for Imgur/Gyazo/ImageKit", () => {
        expect(getCdnsForProvider("IMGUR").map((c) => c.id)).toEqual(["provider-native"]);
        expect(getCdnsForProvider("GYAZO").map((c) => c.id)).toEqual(["provider-native"]);
        expect(getCdnsForProvider("Imagekit").map((c) => c.id)).toEqual(["provider-native"]);
    });

    it("falls back to passthrough for unknown provider id", () => {
        const cdns = getCdnsForProvider("NONEXISTENT");
        expect(cdns.length).toBeGreaterThan(0);
    });
});

describe("cdn.findCdn", () => {
    it("returns the option when found", () => {
        const cdn = findCdn("GITHUB", "jsdelivr");
        expect(cdn?.id).toBe("jsdelivr");
        expect(cdn?.region).toBe("foreign");
    });

    it("returns undefined when not found", () => {
        expect(findCdn("GITHUB", "nope")).toBeUndefined();
    });
});

describe("cdn.applyCdn", () => {
    const ghUrl = "https://raw.githubusercontent.com/owner/repo/main/images/foo.png";
    const ghCtx = {
        githubOwner: "owner",
        githubRepo: "repo",
        githubBranch: "main",
        githubPath: "images/foo.png",
    };

    it("returns raw URL when cdnId is NONE_CDN_ID", () => {
        expect(applyCdn("GITHUB", ghUrl, NONE_CDN_ID, {})).toBe(ghUrl);
    });

    it("swaps host to customDomain when cdnId is CUSTOM_CDN_ID", () => {
        const result = applyCdn("GITHUB", ghUrl, CUSTOM_CDN_ID, {
            customDomain: "cdn.example.com",
        });
        expect(result).toBe("https://cdn.example.com/owner/repo/main/images/foo.png");
    });

    it("falls back to raw URL when CUSTOM_CDN_ID but no customDomain", () => {
        expect(applyCdn("GITHUB", ghUrl, CUSTOM_CDN_ID, {})).toBe(ghUrl);
    });

    it("rewrites to jsdelivr for github/jsdelivr", () => {
        const result = applyCdn("GITHUB", ghUrl, "jsdelivr", ghCtx);
        expect(result).toBe("https://cdn.jsdelivr.net/gh/owner/repo@main/images/foo.png");
    });

    it("rewrites to jsdelivr Fastly mirror", () => {
        const result = applyCdn("GITHUB", ghUrl, "jsdelivr-fastly", ghCtx);
        expect(result).toBe("https://test1.jsdelivr.net/gh/owner/repo@main/images/foo.png");
    });

    it("rewrites to Statically", () => {
        const result = applyCdn("GITHUB", ghUrl, "statically", ghCtx);
        expect(result).toBe("https://cdn.statically.io/gh/owner/repo/main/images/foo.png");
    });

    it("rewrites to raw.githack", () => {
        const result = applyCdn("GITHUB", ghUrl, "raw-githack", ghCtx);
        expect(result).toBe("https://raw.githack.com/owner/repo/main/images/foo.png");
    });

    it("rewrites GitHub URL to gh-proxy.com (domestic)", () => {
        const result = applyCdn("GITHUB", ghUrl, "gh-proxy", ghCtx);
        expect(result).toBe("https://gh-proxy.com/" + ghUrl);
    });

    it("encodes Chinese filename in jsdelivr path", () => {
        const result = applyCdn("GITHUB", ghUrl, "jsdelivr", {
            ...ghCtx,
            githubPath: "images/截图.png",
        });
        expect(result).toBe("https://cdn.jsdelivr.net/gh/owner/repo@main/images/%E6%88%AA%E5%9B%BE.png");
    });

    it("returns raw URL when unknown cdnId", () => {
        expect(applyCdn("GITHUB", ghUrl, "nope", ghCtx)).toBe(ghUrl);
    });

    it("uses default branch 'main' when context branch is empty", () => {
        const result = applyCdn("GITHUB", ghUrl, "jsdelivr", {
            githubOwner: "owner",
            githubRepo: "repo",
            githubPath: "f.png",
        });
        expect(result).toBe("https://cdn.jsdelivr.net/gh/owner/repo@main/f.png");
    });

    it("OSS accelerate rewrite swaps host to oss-accelerate endpoint", () => {
        const ossUrl = "https://my-bucket.oss-cn-hangzhou.aliyuncs.com/path/file.png";
        const result = applyCdn("ALIYUN_OSS", ossUrl, "oss-accelerate", {bucket: "my-bucket"});
        expect(result).toBe("https://my-bucket.oss-accelerate.aliyuncs.com/path/file.png");
    });

    it("R2 s3-native returns URL unchanged", () => {
        const r2Url = "https://pub-xxx.r2.dev/img.png";
        expect(applyCdn("CLOUDFLARE_R2", r2Url, "r2-native", {})).toBe(r2Url);
    });

    it("Imgur provider URL passes through", () => {
        const imgur = "https://i.imgur.com/abc.png";
        expect(applyCdn("IMGUR", imgur, "provider-native", {})).toBe(imgur);
    });
});
