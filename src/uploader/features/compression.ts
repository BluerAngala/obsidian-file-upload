/**
 * Client-side image compression.
 *
 * Uses the browser's `<canvas>` API to downscale and re-encode images
 * before upload. This is intentionally simple: it does not handle EXIF
 * rotation, animated GIFs, or RAW formats — those are passed through
 * unchanged.
 *
 * Settings:
 *   • `maxWidth`  — downscale images wider than this (px). 0 = disabled.
 *   • `quality`   — 0..1, applied to lossy formats (jpeg/webp).
 *   • `format`    — output format: "keep" | "image/jpeg" | "image/webp".
 */
export interface CompressionOptions {
    enabled: boolean;
    maxWidth: number;       // 0 = no resize
    quality: number;        // 0..1
    format: "keep" | "image/jpeg" | "image/webp";
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
    enabled: false,
    maxWidth: 1920,
    quality: 0.85,
    format: "keep",
};

const COMPRESSIBLE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/gif",
]);

export class ImageCompressor {
    /**
     * Returns a possibly-compressed Blob and the corresponding MIME type.
     * If the source is not an image or compression is disabled, the
     * original file is returned unchanged.
     */
    static async compress(file: File, options: CompressionOptions): Promise<{ blob: Blob; type: string; name: string }> {
        if (!options.enabled) {
            return { blob: file, type: file.type, name: file.name };
        }
        if (!file.type.startsWith("image/") || !COMPRESSIBLE_TYPES.has(file.type)) {
            return { blob: file, type: file.type, name: file.name };
        }

        const dataUrl = await readAsDataUrl(file);
        const img = await loadImage(dataUrl);
        const { width, height } = this.fitSize(img.width, img.height, options.maxWidth);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            // Canvas not available — fall back to original
            return { blob: file, type: file.type, name: file.name };
        }
        // White background for PNG → JPEG to avoid black-fill artifacts
        if (options.format === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);

        const targetType = options.format === "keep" ? file.type : options.format;
        const blob = await canvasToBlob(canvas, targetType, options.quality);
        if (!blob) {
            return { blob: file, type: file.type, name: file.name };
        }
        const ext = mimeToExt(targetType);
        const baseName = stripExt(file.name);
        return { blob, type: targetType, name: `${baseName}.${ext}` };
    }

    /** Compute the fitted (width, height) preserving aspect ratio. */
    static fitSize(srcW: number, srcH: number, maxW: number): { width: number; height: number } {
        if (maxW <= 0 || srcW <= maxW) return { width: srcW, height: srcH };
        const ratio = maxW / srcW;
        return { width: maxW, height: Math.round(srcH * ratio) };
    }
}

function readAsDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(r.error ?? new Error("readAsDataUrl failed"));
        r.readAsDataURL(file);
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("image load failed"));
        img.src = src;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), type, quality);
    });
}

function mimeToExt(mime: string): string {
    switch (mime) {
        case "image/jpeg": return "jpg";
        case "image/png": return "png";
        case "image/webp": return "webp";
        case "image/gif": return "gif";
        case "image/bmp": return "bmp";
        default: return "bin";
    }
}

function stripExt(name: string): string {
    const idx = name.lastIndexOf(".");
    return idx >= 0 ? name.slice(0, idx) : name;
}
