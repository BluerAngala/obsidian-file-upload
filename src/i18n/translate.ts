import zh from "./zh";
import en from "./en";
import zhTw from "./zh-tw";

export type Language = "en" | "zh" | "zh-tw";

export type TranslationDict = typeof en;

const bundles: Record<Language, TranslationDict> = { en, zh, "zh-tw": zhTw };

export default class Translate {
    private dict: TranslationDict;

    constructor(lang: Language) {
        this.dict = bundles[lang] || bundles.en;
    }

    switch(lang: Language): void {
        this.dict = bundles[lang] || bundles.en;
    }

    /**
     * Look up a translation key, e.g. t("settings.general.imageAltText.name")
     * Falls back to the key itself if not found.
     */
    t(key: string): string {
        const parts = key.split(".");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj: any = this.dict;
        for (const p of parts) {
            if (obj && typeof obj === "object" && p in obj) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                obj = obj[p];
            } else {
                return key;
            }
        }
        return typeof obj === "string" ? obj : key;
    }

    /** Return the raw translation dict for cases where keys are dynamic (e.g. dropdown options). */
    get raw(): TranslationDict {
        return this.dict;
    }
}