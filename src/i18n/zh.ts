import type en from "./en";

const zh: typeof en = {
    command: {
        publishPage: "发布页面",
    },

    settings: {
        tabs: {
            welcome: "欢迎",
            general: "通用",
            upload: "上传",
            mermaid: "Mermaid",
            imageStore: "图床",
        },
        welcome: {
            title: "欢迎使用文件上传",
            subtitle: "一键将本地图片和文件上传到云端存储，支持 10+ 种存储服务。",
            quickSetup: "快速设置",
            getStarted: "开始使用",
            usageHint: "设置完成后，使用左侧菜单栏图标或命令面板（Cmd+P → 发布页面）上传。\n右键点击文件可单独上传。",
        },
        general: {
            heading: "通用",
            imageAltText: {
                name: "使用图片名称作为替代文本",
                desc: "使用图片名称作为替代文本，并将 '-' 和 '_' 替换为空格。",
            },
            replaceOriginalDoc: {
                name: "更新原始文档",
                desc: "是否将内部链接替换为存储链接。",
            },
            ignoreProperties: {
                name: "忽略笔记属性",
                desc: "复制到剪贴板时忽略笔记属性区域。不会影响原始笔记。",
            },
        },
        upload: {
            heading: "上传",
            showProgressModal: {
                name: "显示进度弹窗",
                desc: "上传图片时显示详细进度的弹窗（3秒后自动关闭）。如果禁用，将使用更简单的状态指示器。",
            },
            uploadWebImages: {
                name: "上传网络图片",
                desc: "启用后，网络图片（http/https 链接）将被下载并重新上传到您配置的存储服务。已托管在您存储服务上的图片将被跳过。",
            },
        },
        autoUpload: {
            heading: "自动上传",
            enable: {
                name: "启用自动上传",
                desc: "当文件添加到笔记时自动上传到云端（图片、视频、音频等）。仅支持的文件类型会被上传。",
            },
            sizeLimit: {
                name: "文件大小限制 (MB)",
                desc: "自动上传的最大文件大小（1–100 MB）。默认 30 MB。",
            },
        },
        mermaid: {
            heading: "Mermaid",
            convert: {
                name: "将 Mermaid 图表转换为图片",
                desc: "在发布时将 Mermaid 代码块渲染为 PNG 图片并上传。",
            },
            scale: {
                name: "Mermaid 图片缩放",
                desc: "导出图片的缩放因子（1x–4x）。视网膜显示屏推荐 2x。",
            },
            theme: {
                name: "Mermaid 主题",
                desc: "渲染图表的颜色主题。",
                options: {
                    default: "默认",
                    dark: "暗色",
                    forest: "森林",
                    neutral: "中性",
                    base: "基础",
                },
            },
        },
        imageStore: {
            heading: "图床",
            select: {
                name: "图床",
                desc: "选择用于上传图片的远程图床。",
            },
            providers: {
                IMGUR: "Imgur 上传",
                ALIYUN_OSS: "阿里云 OSS",
                Imagekit: "ImageKit",
                AWS_S3: "AWS S3",
                TENCENTCLOUD_COS: "腾讯云 COS",
                QINIU_KUDO: "七牛云 Kodo",
                GITHUB: "GitHub 仓库",
                GYAZO: "Gyazo",
                CLOUDFLARE_R2: "Cloudflare R2",
                BACKBLAZE_B2: "Backblaze B2",
            },
            imgur: {
                clientId: {
                    name: "客户端 ID",
                    desc: "在此处生成你自己的客户端 ID：",
                    placeholder: "输入客户端 ID",
                },
            },
            gyazo: {
                accessToken: {
                    name: "访问令牌",
                    desc: "在此处创建应用并生成访问令牌：",
                    placeholder: "输入访问令牌",
                },
                accessPolicy: {
                    name: "访问策略",
                    desc: "设置图片可见性。仅当不需要其他人或外部网站访问上传的图片 URL 时选择「仅自己」。",
                    anyone: "任何人",
                    onlyMe: "仅自己",
                },
                commonDescription: {
                    name: "通用描述",
                    desc: "每次上传时附加的固定描述。留空则跳过描述字段。",
                    placeholder: "输入通用描述（可选）",
                },
            },
            oss: {
                region: {
                    name: "区域",
                    desc: "OSS 数据中心区域。",
                },
                accessKeyId: {
                    name: "Access Key ID",
                    desc: "阿里云 RAM 的访问密钥 ID。",
                    placeholder: "输入 Access Key ID",
                },
                accessKeySecret: {
                    name: "Access Key Secret",
                    desc: "阿里云 RAM 的访问密钥 Secret。",
                    placeholder: "输入 Access Key Secret",
                },
                bucket: {
                    name: "存储桶名称",
                    desc: "用于存储图片的存储桶名称。",
                    placeholder: "输入存储桶名称",
                },
                path: {
                    name: "目标路径",
                    desc: "存储图片的路径。支持 {year} {mon} {day} {random} {filename} 变量。例如 /{year}/{mon}/{day}/{filename}，上传 pic.jpg 会存储为 /2023/06/08/pic.jpg。",
                    placeholder: "输入路径",
                },
                customDomain: {
                    name: "自定义域名",
                    desc: "如果自定义域名是 example.com，则可以使用 https://example.com/pic.jpg 访问图片。",
                    placeholder: "输入路径",
                },
            },
            imagekit: {
                imagekitId: {
                    name: "ImageKit ID",
                    desc: "在此处获取 ID 和密钥：",
                    placeholder: "输入你的 ImageKit ID",
                },
                folder: {
                    name: "文件夹名称",
                    desc: "目录名称。留空则上传到根目录。",
                    placeholder: "输入文件夹名称",
                },
                publicKey: {
                    name: "公钥",
                    placeholder: "输入你的公钥",
                },
                privateKey: {
                    name: "私钥",
                    placeholder: "输入你的私钥",
                },
            },
            awsS3: {
                accessKeyId: {
                    name: "AWS S3 Access Key ID",
                    desc: "你的 AWS S3 Access Key ID。",
                    placeholder: "输入你的 Access Key ID",
                },
                secretAccessKey: {
                    name: "AWS S3 Secret Access Key",
                    desc: "你的 AWS S3 Secret Access Key。",
                    placeholder: "输入你的 Secret Access Key",
                },
                region: {
                    name: "AWS S3 区域",
                    desc: "你的 AWS S3 区域。",
                    placeholder: "输入你的区域",
                },
                bucket: {
                    name: "AWS S3 存储桶名称",
                    desc: "你的 AWS S3 存储桶名称。",
                    placeholder: "输入你的存储桶名称",
                },
                path: {
                    name: "目标路径",
                    desc: "存储图片的路径。支持 {year} {mon} {day} {random} {filename} 变量。例如 /{year}/{mon}/{day}/{filename}，上传 pic.jpg 会存储为 /2023/06/08/pic.jpg。",
                    placeholder: "输入路径",
                },
                customDomain: {
                    name: "自定义域名",
                    desc: "如果自定义域名是 example.com，则可以使用 https://example.com/pic.jpg 访问图片。",
                    placeholder: "输入路径",
                },
            },
            cos: {
                region: {
                    name: "区域",
                    desc: "COS 数据中心区域。",
                },
                secretId: {
                    name: "Secret ID",
                    desc: "腾讯云的 Secret ID。",
                    placeholder: "输入 Secret ID",
                },
                secretKey: {
                    name: "Secret Key",
                    desc: "腾讯云的 Secret Key。",
                    placeholder: "输入 Secret Key",
                },
                bucket: {
                    name: "存储桶名称",
                    desc: "用于存储图片的存储桶名称。",
                    placeholder: "输入存储桶名称",
                },
                path: {
                    name: "目标路径",
                    desc: "存储图片的路径。支持 {year} {mon} {day} {random} {filename} 变量。例如 /{year}/{mon}/{day}/{filename}，上传 pic.jpg 会存储为 /2023/06/08/pic.jpg。",
                    placeholder: "输入路径",
                },
                customDomain: {
                    name: "自定义域名",
                    desc: "如果自定义域名是 example.com，则可以使用 https://example.com/pic.jpg 访问图片。",
                    placeholder: "输入路径",
                },
            },
            qiniu: {
                accessKey: {
                    name: "Access Key",
                    desc: "七牛云的 Access Key。",
                    placeholder: "输入 Access Key",
                },
                secretKey: {
                    name: "Secret Key",
                    desc: "七牛云的 Secret Key。",
                    placeholder: "输入 Secret Key",
                },
                bucket: {
                    name: "存储桶名称",
                    desc: "用于存储图片的存储桶名称。",
                    placeholder: "输入存储桶名称",
                },
                customDomain: {
                    name: "自定义域名",
                    desc: "如果自定义域名是 example.com，则可以使用 https://example.com/pic.jpg 访问图片。",
                    placeholder: "输入路径",
                },
            },
            github: {
                token: {
                    name: "个人访问令牌",
                    desc: "在此处生成具有 'repo' 权限的个人访问令牌：",
                    placeholder: "输入你的 GitHub 个人访问令牌",
                },
                repository: {
                    name: "仓库名称",
                    desc: "留空则自动创建默认仓库。",
                    placeholder: "obsidian-file-upload-images",
                },
                branch: {
                    name: "分支名称",
                    desc: "上传到哪个分支。留空则使用仓库的默认分支。",
                    placeholder: "main",
                },
                connected: "已连接",
                reconnect: "重新连接",
                createRepo: "创建仓库",
                creating: "正在创建...",
                createFailed: "仓库创建失败",
                tokenRequired: "请先输入 Token",
                path: {
                    name: "上传路径",
                    desc: "图片在仓库中的存储路径（可选）",
                    placeholder: "默认：images",
                },
            },
            r2: {
                accessKeyId: {
                    name: "Cloudflare R2 Access Key ID",
                    desc: "你的 Cloudflare R2 Access Key ID。",
                    placeholder: "输入你的 Access Key ID",
                },
                secretAccessKey: {
                    name: "Cloudflare R2 Secret Access Key",
                    desc: "你的 Cloudflare R2 Secret Access Key。",
                    placeholder: "输入你的 Secret Access Key",
                },
                endpoint: {
                    name: "Cloudflare R2 端点",
                    desc: "你的 Cloudflare R2 端点 URL（例如 https://account-id.r2.cloudflarestorage.com）。",
                    placeholder: "输入你的 R2 端点",
                },
                bucket: {
                    name: "Cloudflare R2 存储桶名称",
                    desc: "你的 Cloudflare R2 存储桶名称。",
                    placeholder: "输入你的存储桶名称",
                },
                path: {
                    name: "目标路径",
                    desc: "存储图片的路径。支持 {year} {mon} {day} {random} {filename} 变量。例如 /{year}/{mon}/{day}/{filename}，上传 pic.jpg 会存储为 /2023/06/08/pic.jpg。",
                    placeholder: "输入路径",
                },
                customDomain: {
                    name: "R2.dev 网址或自定义域名",
                    desc: "你可以使用 R2.dev 网址（如 https://pub-xxxx.r2.dev）或自定义域名。如果自定义域名是 example.com，则可以使用 https://example.com/pic.jpg 访问图片。",
                    placeholder: "输入域名",
                },
            },
            b2: {
                accessKeyId: {
                    name: "Backblaze B2 Access Key ID",
                    desc: "你的 Backblaze B2 应用密钥 ID。",
                    placeholder: "输入你的应用密钥 ID",
                },
                secretAccessKey: {
                    name: "Backblaze B2 Secret Access Key",
                    desc: "你的 Backblaze B2 应用密钥。",
                    placeholder: "输入你的应用密钥",
                },
                region: {
                    name: "Backblaze B2 区域",
                    desc: "你的 Backblaze B2 区域（例如 us-west-004）。",
                    placeholder: "输入你的区域",
                },
                bucket: {
                    name: "Backblaze B2 存储桶名称",
                    desc: "你的 Backblaze B2 存储桶名称。",
                    placeholder: "输入你的存储桶名称",
                },
                path: {
                    name: "目标路径",
                    desc: "存储图片的路径。支持 {year} {mon} {day} {random} {filename} 变量。例如 /{year}/{mon}/{day}/{filename}，上传 pic.jpg 会存储为 /2023/06/08/pic.jpg。",
                    placeholder: "输入路径",
                },
                customDomain: {
                    name: "自定义域名",
                    desc: "如果你已配置自定义域名，可以使用 https://example.com/pic.jpg 访问图片。否则留空以使用默认的 B2 URL。",
                    placeholder: "输入自定义域名（可选）",
                },
            },
        },
        language: {
            name: "语言",
            desc: "选择插件设置界面的显示语言。",
        },
        cdn: {
            heading: "CDN 加速",
            desc: "选择一个 CDN 以加速图片访问。国内 CDN 适合中国大陆用户，海外 CDN 适合其他地区用户。",
            select: {
                name: "CDN",
                desc: "对所有上传后的图片 URL 应用 CDN 改写。",
            },
            options: {
                none: "不使用（使用图床默认 URL）",
                custom: "自定义域名",
            },
            customDomain: {
                name: "自定义 CDN 域名",
                desc: "当 CDN 选择「自定义域名」时使用。填写主机名（如 cdn.example.com），协议默认为 https。",
                placeholder: "cdn.example.com",
            },
        },
        features: {
            renameRules: {
                heading: "重命名规则",
                enabled: {
                    name: "启用自定义文件命名模板",
                    desc: "对上传的文件名应用路径模板和清洗规则。",
                },
                template: {
                    name: "文件命名模板",
                    desc: "上传路径的模板。支持 {year} {mon} {day} {random} {filename} 变量。例如 uploads/{year}/{mon}/{filename}",
                    placeholder: "uploads/{year}/{mon}/{filename}",
                },
                spacesToDashes: {
                    name: "将空格转换为短横线",
                },
                lowercase: {
                    name: "文件名转小写",
                },
            },
            compression: {
                heading: "图片压缩",
                enabled: {
                    name: "启用压缩",
                    desc: "在上传前调整尺寸和重新编码图片，以节省流量和存储空间。",
                },
                maxWidth: {
                    name: "最大宽度 (px)",
                    desc: "宽度超过此值的图片会被缩放。0 表示不缩放。",
                },
                quality: {
                    name: "质量",
                    desc: "JPEG/WebP 输出质量（0.1 – 1.0）。值越小文件越小。",
                },
                format: {
                    name: "输出格式",
                    desc: "上传时转换为该格式。\"保持原格式\" 不做转换。",
                    options: {
                        keep: "保持原格式",
                    },
                },
            },
            skipRules: {
                heading: "跳过规则",
                urlRegex: {
                    name: "跳过匹配此正则的 URL",
                    desc: "若网络图片的 URL 匹配此正则，则跳过上传（保留原 URL）。",
                    placeholder: "^https://(cdn\\.jsdelivr\\.net|raw\\.githubusercontent\\.com)/",
                },
                pathRegex: {
                    name: "跳过匹配此正则的本地路径",
                    desc: "若本地文件路径匹配此正则，则跳过上传。",
                    placeholder: "^templates/",
                },
                maxSize: {
                    name: "跳过大于此大小的文件 (MB)",
                    desc: "大于此大小的文件保持不动。0 表示禁用大小过滤。",
                },
            },
            concurrency: {
                heading: "上传并发数",
                upload: {
                    name: "并发上传数",
                    desc: "并行上传的图片数量（1–16）。较高的值可能触发图床的速率限制。",
                },
            },
            exif: {
                heading: "EXIF 信息清除",
                enabled: {
                    name: "上传时清除 EXIF 元数据",
                    desc: "在上传前移除 GPS 坐标、相机信息等 EXIF 标签。",
                },
            },
        },
    },

    progressModal: {
        title: "正在上传图片",
        uploading: "上传中...",
        complete: "完成",
        failed: "失败",
        images: "图片",
        completedWithErrors: "已完成，但有 {count} 个失败",
        succeeded: "{count} 个成功",
        failedCount: "{count} 个失败",
    },

    notice: {
        copiedToClipboard: "已复制到剪贴板",
        uploaderSetupFailed: "图片上传器设置失败，请检查设置。",
        publishFailed: "发布失败：{error}",
        uploadFailed: "上传 {path} 失败，远程服务器返回错误：{error}",
        webImageUploadFailed: "上传网络图片 {path} 失败：{error}",
        cannotLocate: "找不到 {name}（路径：{path}），请检查图片路径或插件中的附件选项设置！",
        failedToReadFile: "读取文件失败：{path}",
        mermaidRendering: "正在渲染 {count} 个 Mermaid 图表...",
        mermaidInitFailed: "Mermaid 初始化失败：{error}",
        mermaidRenderFailed: "渲染 Mermaid 块 {index} 失败：{error}",
        uploadSuccess: "上传成功：{url}",
        fileTypeNotSupported: "不支持的文件类型：{ext}",
    },

    ribbon: {
        title: "打开插件设置",
    },

    contextMenu: {
        uploadFile: "上传到云端",
    },
};

export default zh;