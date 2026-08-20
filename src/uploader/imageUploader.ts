export default interface ImageUploader {
    upload(image: File, fullPath: string): Promise<string>;

    /** Check whether this provider supports uploading a file with the given extension. */
    supportsFileType(extension: string): boolean;
}