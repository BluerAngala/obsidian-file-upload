/**
 * EXIF / metadata stripping.
 *
 * Removes identifying metadata (GPS, camera serial, timestamps) from
 * uploaded images by re-encoding through canvas. Combined with the
 * compression step, this also removes any other ancillary chunks.
 *
 * This is best-effort. EXIF data embedded via a non-standard chunk
 * might survive a canvas round-trip in some browsers, but the common
 * cases (GPS, EXIF, IPTC) are stripped.
 */
export interface ExifStripOptions {
    enabled: boolean;
}

export const DEFAULT_EXIF_OPTIONS: ExifStripOptions = { enabled: false };

const STRIPPABLE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
]);

export class ExifStripper {
    /**
     * Returns a re-encoded Blob with metadata removed. If the file is
     * not an image or stripping is disabled, the original is returned.
     */
    static async strip(file: File, options: ExifStripOptions): Promise<{ blob: Blob; type: string; name: string }> {
        if (!options.enabled) {
            return { blob: file, type: file.type, name: file.name };
        }
        if (!file.type.startsWith("image/") || !STRIPPABLE_TYPES.has(file.type)) {
            return { blob: file, type: file.type, name: file.name };
        }
        const dataUrl = await readAsDataUrl(file);
        const img = await loadImage(dataUrl);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return { blob: file, type: file.type, name: file.name };
        // White fill for JPEG (otherwise transparent PNGs come out black)
        if (file.type === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const blob = await canvasToBlob(canvas, file.type, 0.95);
        if (!blob) return { blob: file, type: file.type, name: file.name };
        return { blob, type: file.type, name: file.name };
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
