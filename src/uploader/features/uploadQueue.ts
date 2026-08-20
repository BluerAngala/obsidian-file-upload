/**
 * Upload queue with bounded concurrency.
 *
 * Existing uploaders already serialize within themselves (e.g. GitHub
 * uploader uses an internal promise chain). This module provides a
 * higher-level pool for batching multiple unrelated uploads — useful
 * when the publish command kicks off N concurrent uploads to providers
 * that don't internally serialize (e.g. R2 / S3 / COS / Qiniu).
 *
 * Usage:
 *   const queue = new UploadPool(3);
 *   const results = await Promise.all(
 *       files.map(f => queue.run(() => uploader.upload(f, f.name)))
 *   );
 */
export class UploadPool {
    private readonly concurrency: number;
    private active = 0;
    private readonly waiting: Array<() => void> = [];

    constructor(concurrency: number) {
        // Clamp to a sensible range — too low throttles, too high triggers
        // provider rate limits.
        this.concurrency = Math.max(1, Math.min(concurrency, 16));
    }

    /**
     * Run `task` when a slot is free. The returned promise resolves with
     * the task's return value or rejects with its error.
     */
    run<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const tryRun = (): void => {
                this.active += 1;
                task().then(resolve, reject).finally(() => {
                    this.active -= 1;
                    const next = this.waiting.shift();
                    if (next) next();
                });
            };
            if (this.active < this.concurrency) {
                tryRun();
            } else {
                this.waiting.push(tryRun);
            }
        });
    }

    get activeCount(): number {
        return this.active;
    }

    get waitingCount(): number {
        return this.waiting.length;
    }
}
