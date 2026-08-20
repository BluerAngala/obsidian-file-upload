import { afterEach, describe, expect, it, vi } from "vitest";
import { UploaderUtils } from "../../src/uploader/uploaderUtils";

describe("UploaderUtils.generateName", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("replaces year month day variables", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-17T08:00:00.000Z"));

    const result = UploaderUtils.generateName("/{year}/{mon}/{day}/image.png", "ignored.png");

    expect(result).toBe("/2024/01/17/image.png");
  });

  it("replaces random variable deterministically", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = UploaderUtils.generateName("{random}", "ignored.png");

    expect(result).toBe("A".repeat(20));
  });

  it("replaces filename variable", () => {
    const result = UploaderUtils.generateName("uploads/{filename}", "photo.jpg");

    expect(result).toBe("uploads/photo.jpg");
  });

  it("replaces all variables together", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-17T08:00:00.000Z"));
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = UploaderUtils.generateName("{year}/{mon}/{day}/{random}/{filename}", "image.webp");

    expect(result).toBe(`2024/01/17/${"A".repeat(20)}/image.webp`);
  });

  it("returns image name when template is undefined", () => {
    const result = UploaderUtils.generateName(undefined as unknown as string, "keep.png");

    expect(result).toBe("keep.png");
  });

  it("returns image name when template is whitespace", () => {
    const result = UploaderUtils.generateName("   ", "keep.png");

    expect(result).toBe("keep.png");
  });
});

describe("UploaderUtils.customizeDomainName", () => {
  it("replaces domain for normal URL", () => {
    const result = UploaderUtils.customizeDomainName(
      "https://old.example.com/path/file.png",
      "cdn.example.com",
    );

    expect(result).toBe("https://cdn.example.com/path/file.png");
  });

  it("strips https prefix from custom domain before replacing", () => {
    const result = UploaderUtils.customizeDomainName(
      "https://old.example.com/path/file.png",
      "https://cdn.example.com",
    );

    expect(result).toBe("https://cdn.example.com/path/file.png");
  });

  it("returns original URL for empty custom domain", () => {
    const result = UploaderUtils.customizeDomainName("https://old.example.com/path/file.png", "");

    expect(result).toBe("https://old.example.com/path/file.png");
  });

  it("returns original URL for whitespace custom domain", () => {
    const result = UploaderUtils.customizeDomainName("https://old.example.com/path/file.png", "   ");

    expect(result).toBe("https://old.example.com/path/file.png");
  });

  it("wraps key-like URL with https and custom domain", () => {
    const result = UploaderUtils.customizeDomainName("path/to/file.png", "cdn.example.com");

    expect(result).toBe("https://cdn.example.com/path/to/file.png");
  });

  it("encodes key-like URL path segments when wrapping with custom domain", () => {
    const result = UploaderUtils.customizeDomainName(
      "2026-07-04/Pasted image 20260704164521.png",
      "cdn.example.com",
    );

    expect(result).toBe("https://cdn.example.com/2026-07-04/Pasted%20image%2020260704164521.png");
  });

  it("does not double encode already encoded key-like URL path segments", () => {
    const result = UploaderUtils.customizeDomainName(
      "2026-07-04/Pasted%20image%2020260704164521.png",
      "cdn.example.com",
    );

    expect(result).toBe("https://cdn.example.com/2026-07-04/Pasted%20image%2020260704164521.png");
  });

  it("preserves trailing slash from custom domain on full URLs (no double slash in middle)", () => {
    // Old behavior produced `https://cdn.example.com//path/file.png` (double
    // slash), which caused 404s on most CDNs. The fix moves the trailing
    // slash to the end of the final URL.
    const result = UploaderUtils.customizeDomainName(
      "https://old.example.com/path/file.png",
      "cdn.example.com/",
    );

    expect(result).toBe("https://cdn.example.com/path/file.png/");
  });

  it("strips http:// prefix from custom domain without producing https://http://...", () => {
    // Bug fix: original code only stripped https://, so http:// inputs
    // became `https://http://cdn.example.com/path`.
    const result = UploaderUtils.customizeDomainName(
      "https://old.example.com/path/file.png",
      "http://cdn.example.com",
    );

    expect(result).toBe("https://cdn.example.com/path/file.png");
  });

  it("encodes Chinese filename in full URL path during domain swap", () => {
    // Bug fix: original swap did not re-encode the path, leaving Chinese
    // characters unescaped in the final URL, which broke CDN access.
    const result = UploaderUtils.customizeDomainName(
      "https://old.example.com/images/截图.png",
      "cdn.example.com",
    );

    expect(result).toBe("https://cdn.example.com/images/%E6%88%AA%E5%9B%BE.png");
  });

  it("does not double-encode Chinese characters already percent-encoded", () => {
    const result = UploaderUtils.customizeDomainName(
      "https://old.example.com/images/%E6%88%AA%E5%9B%BE.png",
      "cdn.example.com",
    );

    expect(result).toBe("https://cdn.example.com/images/%E6%88%AA%E5%9B%BE.png");
  });

  it("preserves query strings during domain swap", () => {
    const result = UploaderUtils.customizeDomainName(
      "https://old.example.com/file.png?v=1&t=abc",
      "cdn.example.com",
    );

    expect(result).toBe("https://cdn.example.com/file.png?v=1&t=abc");
  });
});

describe("UploaderUtils.trimCredential", () => {
  it("strips trailing newline (the #58 footgun)", () => {
    expect(UploaderUtils.trimCredential("secret-key\n")).toBe("secret-key");
  });

  it("strips leading and trailing whitespace", () => {
    expect(UploaderUtils.trimCredential("  AKIA1234  ")).toBe("AKIA1234");
  });

  it("strips internal-edge tabs and CRLF", () => {
    expect(UploaderUtils.trimCredential("\tdeadbeef\r\n")).toBe("deadbeef");
  });

  it("returns empty string for undefined input", () => {
    expect(UploaderUtils.trimCredential(undefined)).toBe("");
  });

  it("returns empty string for null input", () => {
    expect(UploaderUtils.trimCredential(null)).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(UploaderUtils.trimCredential("")).toBe("");
  });

  it("preserves internal whitespace (does not collapse)", () => {
    // unlikely for AWS keys but spec the behavior
    expect(UploaderUtils.trimCredential("  a b  ")).toBe("a b");
  });
});

describe("UploaderUtils.normalizeEndpoint", () => {
  it("strips a single trailing slash", () => {
    expect(UploaderUtils.normalizeEndpoint("https://account.r2.cloudflarestorage.com/"))
      .toBe("https://account.r2.cloudflarestorage.com");
  });

  it("strips multiple trailing slashes", () => {
    expect(UploaderUtils.normalizeEndpoint("https://account.r2.cloudflarestorage.com///"))
      .toBe("https://account.r2.cloudflarestorage.com");
  });

  it("leaves endpoint without trailing slash unchanged", () => {
    expect(UploaderUtils.normalizeEndpoint("https://account.r2.cloudflarestorage.com"))
      .toBe("https://account.r2.cloudflarestorage.com");
  });

  it("trims whitespace and trailing slash together", () => {
    expect(UploaderUtils.normalizeEndpoint("  https://s3.example.com/  "))
      .toBe("https://s3.example.com");
  });

  it("returns empty string for undefined", () => {
    expect(UploaderUtils.normalizeEndpoint(undefined)).toBe("");
  });

  it("returns empty string for null", () => {
    expect(UploaderUtils.normalizeEndpoint(null)).toBe("");
  });
});
