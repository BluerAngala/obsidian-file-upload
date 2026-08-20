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
        let obj: unknown = this.dict;
        for (const p of parts) {
            if (obj && typeof obj === "object" && p in (obj as Record<string, unknown>)) {
                obj = (obj as Record<string, unknown>)[p];
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