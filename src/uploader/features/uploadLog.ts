/**
 * In-memory upload log.
 *
 * Records each upload attempt (success or failure) for the current Obsidian
 * session. Surfaced in a "Recent uploads" view inside the upload tab and
 * also exportable as JSON via the command palette. Memory-only by design:
 * a 1000-entry cap keeps the log from growing unbounded across long sessions.
 *
 * The log is intentionally in-memory: persisting it would require
 * serializing URLs and provider metadata to disk on every upload, and
 * stale entries across sessions tend to confuse users more than help.
 */
export type UploadStatus = "success" | "failed" | "skipped";

export interface UploadLogEntry {
    /** Stable id, e.g. `${timestamp}-${index}` */
    id: string;
    timestamp: number;
    fileName: string;
    url?: string;            // remote URL on success
    error?: string;          // error message on failure
    status: UploadStatus;
    /** ms duration of the upload */
    durationMs: number;
    /** Source provider id, e.g. "GITHUB" */
    providerId: string;
}

const MAX_ENTRIES = 1000;

export class UploadLog {
    private entries: UploadLogEntry[] = [];

    add(entry: Omit<UploadLogEntry, "id">): void {
        const id = `${entry.timestamp}-${this.entries.length}`;
        this.entries.push({ id, ...entry });
        if (this.entries.length > MAX_ENTRIES) {
            this.entries = this.entries.slice(-MAX_ENTRIES);
        }
    }

    list(): readonly UploadLogEntry[] {
        return this.entries;
    }

    clear(): void {
        this.entries = [];
    }

    successCount(): number {
        return this.entries.filter(e => e.status === "success").length;
    }

    failureCount(): number {
        return this.entries.filter(e => e.status === "failed").length;
    }

    skippedCount(): number {
        return this.entries.filter(e => e.status === "skipped").length;
    }
}
