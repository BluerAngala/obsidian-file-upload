import type {TabRenderer} from "./types";
import {renderUploadLogTab as renderUploadLogSection} from "./features/uploadLogTab";

/**
 * Upload log stand-alone tab. Delegates to the same renderer used by the
 * upload tab, but presented as a top-level settings tab so users can browse
 * history without scrolling through upload settings.
 */
export const renderUploadLogTab: TabRenderer = (el, ctx) => {
    void renderUploadLogSection(el, ctx);
};