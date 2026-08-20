const en = {
    // Command
    command: {
        publishPage: "Publish page",
    },

    // Settings page
    settings: {
        tabs: {
            welcome: "Welcome",
            general: "General",
            upload: "Upload",
            mermaid: "Mermaid",
            imageStore: "Image Store",
        },
        welcome: {
            title: "Welcome to File Upload",
            subtitle: "Upload local images and files to your cloud storage with one click. Supports 10+ providers.",
            quickSetup: "Quick Setup",
            getStarted: "Get Started",
            usageHint: "After setup, use the ribbon icon or Cmd+P → 'Publish page' to upload.\nRight-click any file to upload individually.",
        },
        general: {
            heading: "General",
            imageAltText: {
                name: "Use image name as alt text",
                desc: "Use the image name as alt text, replacing '-' and '_' with spaces.",
            },
            replaceOriginalDoc: {
                name: "Update original document",
                desc: "Whether to replace internal link with store link.",
            },
            ignoreProperties: {
                name: "Ignore note properties",
                desc: "Where to ignore note properties when copying to clipboard. This won't affect original note.",
            },
        },
        upload: {
            heading: "Upload",
            showProgressModal: {
                name: "Show progress modal",
                desc: "Show a modal dialog with detailed progress when uploading images (auto close in 3s). If disabled, a simpler status indicator will be used.",
            },
            uploadWebImages: {
                name: "Upload web images",
                desc: "When enabled, web images (http/https URLs) are downloaded and re-uploaded to your configured storage. Images already hosted on your storage service are skipped.",
            },
        },
        autoUpload: {
            heading: "Auto Upload",
            enable: {
                name: "Enable auto upload",
                desc: "Automatically upload files to cloud storage when they are added to your notes (images, videos, audio, etc.). Only supported file types will be uploaded.",
            },
            sizeLimit: {
                name: "File size limit (MB)",
                desc: "Maximum file size for auto upload (1–100 MB). Default is 30 MB.",
            },
        },
        mermaid: {
            heading: "Mermaid",
            convert: {
                name: "Convert Mermaid diagrams to images",
                desc: "Render Mermaid code blocks as PNG images and upload them during publish.",
            },
            scale: {
                name: "Mermaid image scale",
                desc: "Scale factor for exported images (1x–4x). 2x recommended for retina displays.",
            },
            theme: {
                name: "Mermaid theme",
                desc: "Color theme for rendered diagrams.",
                options: {
                    default: "Default",
                    dark: "Dark",
                    forest: "Forest",
                    neutral: "Neutral",
                    base: "Base",
                },
            },
        },
        imageStore: {
            heading: "Image store",
            select: {
                name: "Image store",
                desc: "Remote image store for upload images to.",
            },
            providers: {
                IMGUR: "Imgur upload",
                ALIYUN_OSS: "AliYun OSS",
                Imagekit: "Imagekit",
                AWS_S3: "AWS S3",
                TENCENTCLOUD_COS: "TencentCloud COS",
                QINIU_KUDO: "Qiniu KuDo",
                GITHUB: "GitHub Repository",
                GYAZO: "Gyazo",
                CLOUDFLARE_R2: "Cloudflare R2",
                BACKBLAZE_B2: "Backblaze B2",
            },
            // Imgur
            imgur: {
                clientId: {
                    name: "Client ID",
                    desc: "Generate your own Client ID at ",
                    placeholder: "Enter client ID",
                },
            },
            // Gyazo
            gyazo: {
                accessToken: {
                    name: "Access token",
                    desc: "Create an application and issue an access token at ",
                    placeholder: "Enter access token",
                },
                accessPolicy: {
                    name: "Access policy",
                    desc: "Set image visibility. Choose 'Only me' only if you do not need other people or external sites to access the uploaded image URL.",
                    anyone: "Anyone",
                    onlyMe: "Only me",
                },
                commonDescription: {
                    name: "Common description",
                    desc: "A fixed Gyazo description applied to every upload. Leave empty to skip the description field.",
                    placeholder: "Enter a shared description (optional)",
                },
            },
            // OSS
            oss: {
                region: {
                    name: "Region",
                    desc: "OSS data center region.",
                },
                accessKeyId: {
                    name: "Access key ID",
                    desc: "The access key ID of Aliyun RAM.",
                    placeholder: "Enter access key ID",
                },
                accessKeySecret: {
                    name: "Access key secret",
                    desc: "The access key secret of Aliyun RAM.",
                    placeholder: "Enter access key secret",
                },
                bucket: {
                    name: "Bucket name",
                    desc: "The name of the bucket to store images.",
                    placeholder: "Enter bucket name",
                },
                path: {
                    name: "Target path",
                    desc: "The path to store images. Supports {year} {mon} {day} {random} {filename} vars. For example, /{year}/{mon}/{day}/{filename} with uploading pic.jpg stores it as /2023/06/08/pic.jpg.",
                    placeholder: "Enter path",
                },
                customDomain: {
                    name: "Custom domain name",
                    desc: "If the custom domain name is example.com, you can use https://example.com/pic.jpg to access pic.img.",
                    placeholder: "Enter path",
                },
            },
            // ImageKit
            imagekit: {
                imagekitId: {
                    name: "ImageKit ID",
                    desc: "Obtain id and keys from ",
                    placeholder: "Enter your ImageKit ID",
                },
                folder: {
                    name: "Folder name",
                    desc: "The directory name. Leave blank to upload to the root folder.",
                    placeholder: "Enter the folder name",
                },
                publicKey: {
                    name: "Public key",
                    placeholder: "Enter your public key",
                },
                privateKey: {
                    name: "Private key",
                    placeholder: "Enter your private key",
                },
            },
            // AWS S3
            awsS3: {
                accessKeyId: {
                    name: "AWS S3 access key ID",
                    desc: "Your AWS S3 access key ID.",
                    placeholder: "Enter your access key ID",
                },
                secretAccessKey: {
                    name: "AWS S3 secret access key",
                    desc: "Your AWS S3 secret access key.",
                    placeholder: "Enter your secret access key",
                },
                region: {
                    name: "AWS S3 region",
                    desc: "Your AWS S3 region.",
                    placeholder: "Enter your region",
                },
                bucket: {
                    name: "AWS S3 bucket name",
                    desc: "Your AWS S3 bucket name.",
                    placeholder: "Enter your bucket name",
                },
                path: {
                    name: "Target path",
                    desc: "The path to store images. Supports {year} {mon} {day} {random} {filename} vars. For example, /{year}/{mon}/{day}/{filename} with uploading pic.jpg stores it as /2023/06/08/pic.jpg.",
                    placeholder: "Enter path",
                },
                customDomain: {
                    name: "Custom domain name",
                    desc: "If the custom domain name is example.com, you can use https://example.com/pic.jpg to access pic.img.",
                    placeholder: "Enter path",
                },
            },
            // TencentCloud COS
            cos: {
                region: {
                    name: "Region",
                    desc: "COS data center region.",
                },
                secretId: {
                    name: "Secret ID",
                    desc: "The secret ID of Tencent Cloud.",
                    placeholder: "Enter secret ID",
                },
                secretKey: {
                    name: "Secret key",
                    desc: "The secret key of Tencent Cloud.",
                    placeholder: "Enter secret key",
                },
                bucket: {
                    name: "Bucket name",
                    desc: "The name of the bucket to store images.",
                    placeholder: "Enter bucket name",
                },
                path: {
                    name: "Target path",
                    desc: "The path to store images. Supports {year} {mon} {day} {random} {filename} vars. For example, /{year}/{mon}/{day}/{filename} with uploading pic.jpg stores it as /2023/06/08/pic.jpg.",
                    placeholder: "Enter path",
                },
                customDomain: {
                    name: "Custom domain name",
                    desc: "If the custom domain name is example.com, you can use https://example.com/pic.jpg to access pic.img.",
                    placeholder: "Enter path",
                },
            },
            // Qiniu Kodo
            qiniu: {
                accessKey: {
                    name: "Access key",
                    desc: "The access key of Qiniu.",
                    placeholder: "Enter access key",
                },
                secretKey: {
                    name: "Secret key",
                    desc: "The secret key of Qiniu.",
                    placeholder: "Enter secret key",
                },
                bucket: {
                    name: "Bucket name",
                    desc: "The name of the bucket to store images.",
                    placeholder: "Enter bucket name",
                },
                customDomain: {
                    name: "Custom domain name",
                    desc: "If the custom domain name is example.com, you can use https://example.com/pic.jpg to access pic.img.",
                    placeholder: "Enter path",
                },
            },
            // GitHub
            github: {
                token: {
                    name: "Personal access token",
                    desc: "Generate a personal access token with 'repo' scope at ",
                    placeholder: "Enter your GitHub personal access token",
                },
                repository: {
                    name: "Repository",
                    desc: "Leave empty to auto-create the default repository.",
                    placeholder: "obsidian-file-upload-images",
                },
                branch: {
                    name: "Branch",
                    desc: "Branch to upload to. Leave empty to use the repository's default branch.",
                    placeholder: "main",
                },
                connected: "Connected",
                reconnect: "Reconnect",
                createRepo: "Create Repository",
                creating: "Creating...",
                createFailed: "Repository creation failed",
                tokenRequired: "Please enter a token first",
                path: {
                    name: "Upload path",
                    desc: "Directory path in the repository (optional)",
                    placeholder: "Default: images",
                },
            },
            // Cloudflare R2
            r2: {
                accessKeyId: {
                    name: "Cloudflare R2 access key ID",
                    desc: "Your Cloudflare R2 access key ID.",
                    placeholder: "Enter your access key ID",
                },
                secretAccessKey: {
                    name: "Cloudflare R2 secret access key",
                    desc: "Your Cloudflare R2 secret access key.",
                    placeholder: "Enter your secret access key",
                },
                endpoint: {
                    name: "Cloudflare R2 endpoint",
                    desc: "Your Cloudflare R2 endpoint URL (e.g., https://account-id.r2.cloudflarestorage.com).",
                    placeholder: "Enter your R2 endpoint",
                },
                bucket: {
                    name: "Cloudflare R2 bucket name",
                    desc: "Your Cloudflare R2 bucket name.",
                    placeholder: "Enter your bucket name",
                },
                path: {
                    name: "Target path",
                    desc: "The path to store images. Supports {year} {mon} {day} {random} {filename} vars. For example, /{year}/{mon}/{day}/{filename} with uploading pic.jpg stores it as /2023/06/08/pic.jpg.",
                    placeholder: "Enter path",
                },
                customDomain: {
                    name: "R2.dev URL or custom domain name",
                    desc: "You can use the R2.dev URL such as https://pub-xxxx.r2.dev, or a custom domain. If the custom domain name is example.com, you can use https://example.com/pic.jpg to access pic.img.",
                    placeholder: "Enter domain name",
                },
            },
            // Backblaze B2
            b2: {
                accessKeyId: {
                    name: "Backblaze B2 access key ID",
                    desc: "Your Backblaze B2 application key ID.",
                    placeholder: "Enter your application key ID",
                },
                secretAccessKey: {
                    name: "Backblaze B2 secret access key",
                    desc: "Your Backblaze B2 application key.",
                    placeholder: "Enter your application key",
                },
                region: {
                    name: "Backblaze B2 region",
                    desc: "Your Backblaze B2 region (e.g., us-west-004).",
                    placeholder: "Enter your region",
                },
                bucket: {
                    name: "Backblaze B2 bucket name",
                    desc: "Your Backblaze B2 bucket name.",
                    placeholder: "Enter your bucket name",
                },
                path: {
                    name: "Target path",
                    desc: "The path to store images. Supports {year} {mon} {day} {random} {filename} vars. For example, /{year}/{mon}/{day}/{filename} with uploading pic.jpg stores it as /2023/06/08/pic.jpg.",
                    placeholder: "Enter path",
                },
                customDomain: {
                    name: "Custom domain name",
                    desc: "If you have configured a custom domain, you can use https://example.com/pic.jpg to access pic.img. Otherwise, leave it empty to use the default B2 URL.",
                    placeholder: "Enter custom domain (optional)",
                },
            },
        },
        language: {
            name: "Language",
            desc: "Select the display language for the plugin settings.",
        },
    },

    // Progress modal
    progressModal: {
        title: "Uploading images",
        uploading: "Uploading...",
        complete: "Complete",
        failed: "Failed",
        images: "Images",
        completedWithErrors: "Completed with errors ({count} failed)",
        succeeded: "{count} succeeded",
        failedCount: "{count} failed",
    },

    // Notices
    notice: {
        copiedToClipboard: "Copied to clipboard",
        uploaderSetupFailed: "Image uploader setup failed, please check setting.",
        publishFailed: "Publish failed: {error}",
        uploadFailed: "Upload {path} failed, remote server returned an error: {error}",
        webImageUploadFailed: "Upload web image {path} failed: {error}",
        cannotLocate: "Can NOT locate {name} with {path}, please check image path or attachment option in plugin setting!",
        failedToReadFile: "Failed to read file: {path}",
        mermaidRendering: "Rendering {count} mermaid diagram(s)...",
        mermaidInitFailed: "Mermaid initialization failed: {error}",
        mermaidRenderFailed: "Failed to render mermaid block {index}: {error}",
        uploadSuccess: "Upload successful: {url}",
        fileTypeNotSupported: "File type not supported: {ext}",
    },

    ribbon: {
        title: "Open plugin settings",
    },

    contextMenu: {
        uploadFile: "Upload to cloud",
    },
};

export default en;