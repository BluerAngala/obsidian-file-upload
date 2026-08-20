import type en from "./en";

const zhTw: typeof en = {
    command: {
        publishPage: "發佈頁面",
    },

    settings: {
        tabs: {
            welcome: "歡迎",
            general: "通用",
            upload: "上傳",
            mermaid: "Mermaid",
            imageStore: "圖床",
        },
        welcome: {
            title: "歡迎使用檔案上傳",
            subtitle: "一鍵將本地圖片和檔案上傳到雲端儲存，支援 10+ 種儲存服務。",
            quickSetup: "快速設定",
            getStarted: "開始使用",
            usageHint: "設定完成後，使用左側選單欄圖示或命令面板（Cmd+P → 發佈頁面）上傳。\n右鍵點擊檔案可單獨上傳。",
        },
        general: {
            heading: "通用",
            imageAltText: {
                name: "使用圖片名稱作為替代文字",
                desc: "使用圖片名稱作為替代文字，並將 '-' 和 '_' 替換為空格。",
            },
            replaceOriginalDoc: {
                name: "更新原始文件",
                desc: "是否將內部連結替換為儲存連結。",
            },
            ignoreProperties: {
                name: "忽略筆記屬性",
                desc: "複製到剪貼簿時忽略筆記屬性區域。不會影響原始筆記。",
            },
        },
        upload: {
            heading: "上傳",
            showProgressModal: {
                name: "顯示進度彈窗",
                desc: "上傳圖片時顯示詳細進度的彈窗（3秒後自動關閉）。如果停用，將使用更簡單的狀態指示器。",
            },
            uploadWebImages: {
                name: "上傳網路圖片",
                desc: "啟用後，網路圖片（http/https 連結）將被下載並重新上傳到您設定的儲存服務。已託管在您儲存服務上的圖片將被跳過。",
            },
        },
        autoUpload: {
            heading: "自動上傳",
            enable: {
                name: "啟用自動上傳",
                desc: "當檔案新增到筆記時自動上傳到雲端（圖片、影片、音訊等）。僅支援的檔案類型會被上傳。",
            },
            sizeLimit: {
                name: "檔案大小限制 (MB)",
                desc: "自動上傳的最大檔案大小（1–100 MB）。預設 30 MB。",
            },
        },
        mermaid: {
            heading: "Mermaid",
            convert: {
                name: "將 Mermaid 圖表轉換為圖片",
                desc: "在發佈時將 Mermaid 程式碼區塊渲染為 PNG 圖片並上傳。",
            },
            scale: {
                name: "Mermaid 圖片縮放",
                desc: "匯出圖片的縮放因子（1x–4x）。視網膜顯示器建議使用 2x。",
            },
            theme: {
                name: "Mermaid 主題",
                desc: "渲染圖表的顏色主題。",
                options: {
                    default: "預設",
                    dark: "深色",
                    forest: "森林",
                    neutral: "中性",
                    base: "基礎",
                },
            },
        },
        imageStore: {
            heading: "圖床",
            select: {
                name: "圖床",
                desc: "選擇用於上傳圖片的遠端圖床。",
            },
            providers: {
                IMGUR: "Imgur 上傳",
                ALIYUN_OSS: "阿里雲 OSS",
                Imagekit: "ImageKit",
                AWS_S3: "AWS S3",
                TENCENTCLOUD_COS: "騰訊雲 COS",
                QINIU_KUDO: "七牛雲 Kodo",
                GITHUB: "GitHub 倉庫",
                GYAZO: "Gyazo",
                CLOUDFLARE_R2: "Cloudflare R2",
                BACKBLAZE_B2: "Backblaze B2",
            },
            imgur: {
                clientId: {
                    name: "用戶端 ID",
                    desc: "在此處生成你自己的用戶端 ID：",
                    placeholder: "輸入用戶端 ID",
                },
            },
            gyazo: {
                accessToken: {
                    name: "存取權杖",
                    desc: "在此處建立應用程式並產生存取權杖：",
                    placeholder: "輸入存取權杖",
                },
                accessPolicy: {
                    name: "存取政策",
                    desc: "設定圖片可見性。僅當不需要其他人或外部網站存取上傳的圖片 URL 時選擇「僅自己」。",
                    anyone: "任何人",
                    onlyMe: "僅自己",
                },
                commonDescription: {
                    name: "通用描述",
                    desc: "每次上傳時附加的固定描述。留空則跳過描述欄位。",
                    placeholder: "輸入通用描述（可選）",
                },
            },
            oss: {
                region: {
                    name: "區域",
                    desc: "OSS 資料中心區域。",
                },
                accessKeyId: {
                    name: "Access Key ID",
                    desc: "阿里雲 RAM 的存取金鑰 ID。",
                    placeholder: "輸入 Access Key ID",
                },
                accessKeySecret: {
                    name: "Access Key Secret",
                    desc: "阿里雲 RAM 的存取金鑰 Secret。",
                    placeholder: "輸入 Access Key Secret",
                },
                bucket: {
                    name: "儲存桶名稱",
                    desc: "用於儲存圖片的儲存桶名稱。",
                    placeholder: "輸入儲存桶名稱",
                },
                path: {
                    name: "目標路徑",
                    desc: "儲存圖片的路徑。支援 {year} {mon} {day} {random} {filename} 變數。例如 /{year}/{mon}/{day}/{filename}，上傳 pic.jpg 會儲存為 /2023/06/08/pic.jpg。",
                    placeholder: "輸入路徑",
                },
                customDomain: {
                    name: "自訂網域",
                    desc: "如果自訂網域是 example.com，則可以使用 https://example.com/pic.jpg 存取圖片。",
                    placeholder: "輸入路徑",
                },
            },
            imagekit: {
                imagekitId: {
                    name: "ImageKit ID",
                    desc: "在此處取得 ID 和金鑰：",
                    placeholder: "輸入你的 ImageKit ID",
                },
                folder: {
                    name: "資料夾名稱",
                    desc: "目錄名稱。留空則上傳到根目錄。",
                    placeholder: "輸入資料夾名稱",
                },
                publicKey: {
                    name: "公鑰",
                    placeholder: "輸入你的公鑰",
                },
                privateKey: {
                    name: "私鑰",
                    placeholder: "輸入你的私鑰",
                },
            },
            awsS3: {
                accessKeyId: {
                    name: "AWS S3 Access Key ID",
                    desc: "你的 AWS S3 Access Key ID。",
                    placeholder: "輸入你的 Access Key ID",
                },
                secretAccessKey: {
                    name: "AWS S3 Secret Access Key",
                    desc: "你的 AWS S3 Secret Access Key。",
                    placeholder: "輸入你的 Secret Access Key",
                },
                region: {
                    name: "AWS S3 區域",
                    desc: "你的 AWS S3 區域。",
                    placeholder: "輸入你的區域",
                },
                bucket: {
                    name: "AWS S3 儲存桶名稱",
                    desc: "你的 AWS S3 儲存桶名稱。",
                    placeholder: "輸入你的儲存桶名稱",
                },
                path: {
                    name: "目標路徑",
                    desc: "儲存圖片的路徑。支援 {year} {mon} {day} {random} {filename} 變數。例如 /{year}/{mon}/{day}/{filename}，上傳 pic.jpg 會儲存為 /2023/06/08/pic.jpg。",
                    placeholder: "輸入路徑",
                },
                customDomain: {
                    name: "自訂網域",
                    desc: "如果自訂網域是 example.com，則可以使用 https://example.com/pic.jpg 存取圖片。",
                    placeholder: "輸入路徑",
                },
            },
            cos: {
                region: {
                    name: "區域",
                    desc: "COS 資料中心區域。",
                },
                secretId: {
                    name: "Secret ID",
                    desc: "騰訊雲的 Secret ID。",
                    placeholder: "輸入 Secret ID",
                },
                secretKey: {
                    name: "Secret Key",
                    desc: "騰訊雲的 Secret Key。",
                    placeholder: "輸入 Secret Key",
                },
                bucket: {
                    name: "儲存桶名稱",
                    desc: "用於儲存圖片的儲存桶名稱。",
                    placeholder: "輸入儲存桶名稱",
                },
                path: {
                    name: "目標路徑",
                    desc: "儲存圖片的路徑。支援 {year} {mon} {day} {random} {filename} 變數。例如 /{year}/{mon}/{day}/{filename}，上傳 pic.jpg 會儲存為 /2023/06/08/pic.jpg。",
                    placeholder: "輸入路徑",
                },
                customDomain: {
                    name: "自訂網域",
                    desc: "如果自訂網域是 example.com，則可以使用 https://example.com/pic.jpg 存取圖片。",
                    placeholder: "輸入路徑",
                },
            },
            qiniu: {
                accessKey: {
                    name: "Access Key",
                    desc: "七牛雲的 Access Key。",
                    placeholder: "輸入 Access Key",
                },
                secretKey: {
                    name: "Secret Key",
                    desc: "七牛雲的 Secret Key。",
                    placeholder: "輸入 Secret Key",
                },
                bucket: {
                    name: "儲存桶名稱",
                    desc: "用於儲存圖片的儲存桶名稱。",
                    placeholder: "輸入儲存桶名稱",
                },
                customDomain: {
                    name: "自訂網域",
                    desc: "如果自訂網域是 example.com，則可以使用 https://example.com/pic.jpg 存取圖片。",
                    placeholder: "輸入路徑",
                },
            },
            github: {
                token: {
                    name: "個人存取權杖",
                    desc: "在此處生成具有 'repo' 權限的個人存取權杖：",
                    placeholder: "輸入你的 GitHub 個人存取權杖",
                },
                repository: {
                    name: "倉庫名稱",
                    desc: "留空則自動建立預設倉庫。",
                    placeholder: "obsidian-file-upload-images",
                },
                branch: {
                    name: "分支名稱",
                    desc: "上傳到哪個分支。留空則使用倉庫的預設分支。",
                    placeholder: "main",
                },
                connected: "已連線",
                reconnect: "重新連線",
                createRepo: "建立倉庫",
                creating: "正在建立...",
                createFailed: "倉庫建立失敗",
                tokenRequired: "請先輸入 Token",
                path: {
                    name: "上傳路徑",
                    desc: "圖片在倉庫中的儲存路徑（可選）",
                    placeholder: "預設：images",
                },
            },
            r2: {
                accessKeyId: {
                    name: "Cloudflare R2 Access Key ID",
                    desc: "你的 Cloudflare R2 Access Key ID。",
                    placeholder: "輸入你的 Access Key ID",
                },
                secretAccessKey: {
                    name: "Cloudflare R2 Secret Access Key",
                    desc: "你的 Cloudflare R2 Secret Access Key。",
                    placeholder: "輸入你的 Secret Access Key",
                },
                endpoint: {
                    name: "Cloudflare R2 端點",
                    desc: "你的 Cloudflare R2 端點 URL（例如 https://account-id.r2.cloudflarestorage.com）。",
                    placeholder: "輸入你的 R2 端點",
                },
                bucket: {
                    name: "Cloudflare R2 儲存桶名稱",
                    desc: "你的 Cloudflare R2 儲存桶名稱。",
                    placeholder: "輸入你的儲存桶名稱",
                },
                path: {
                    name: "目標路徑",
                    desc: "儲存圖片的路徑。支援 {year} {mon} {day} {random} {filename} 變數。例如 /{year}/{mon}/{day}/{filename}，上傳 pic.jpg 會儲存為 /2023/06/08/pic.jpg。",
                    placeholder: "輸入路徑",
                },
                customDomain: {
                    name: "R2.dev 網址或自訂網域",
                    desc: "你可以使用 R2.dev 網址（如 https://pub-xxxx.r2.dev）或自訂網域。如果自訂網域是 example.com，則可以使用 https://example.com/pic.jpg 存取圖片。",
                    placeholder: "輸入網域",
                },
            },
            b2: {
                accessKeyId: {
                    name: "Backblaze B2 Access Key ID",
                    desc: "你的 Backblaze B2 應用金鑰 ID。",
                    placeholder: "輸入你的應用金鑰 ID",
                },
                secretAccessKey: {
                    name: "Backblaze B2 Secret Access Key",
                    desc: "你的 Backblaze B2 應用金鑰。",
                    placeholder: "輸入你的應用金鑰",
                },
                region: {
                    name: "Backblaze B2 區域",
                    desc: "你的 Backblaze B2 區域（例如 us-west-004）。",
                    placeholder: "輸入你的區域",
                },
                bucket: {
                    name: "Backblaze B2 儲存桶名稱",
                    desc: "你的 Backblaze B2 儲存桶名稱。",
                    placeholder: "輸入你的儲存桶名稱",
                },
                path: {
                    name: "目標路徑",
                    desc: "儲存圖片的路徑。支援 {year} {mon} {day} {random} {filename} 變數。例如 /{year}/{mon}/{day}/{filename}，上傳 pic.jpg 會儲存為 /2023/06/08/pic.jpg。",
                    placeholder: "輸入路徑",
                },
                customDomain: {
                    name: "自訂網域",
                    desc: "如果你已設定自訂網域，可以使用 https://example.com/pic.jpg 存取圖片。否則留空以使用預設的 B2 URL。",
                    placeholder: "輸入自訂網域（可選）",
                },
            },
        },
        language: {
            name: "語言",
            desc: "選擇外掛程式設定介面的顯示語言。",
        },
        cdn: {
            heading: "CDN 加速",
            desc: "選擇一個 CDN 以加速圖片存取。國內 CDN 適合中國大陸使用者，海外 CDN 適合其他地區使用者。",
            select: {
                name: "CDN",
                desc: "對所有上傳後的圖片 URL 套用 CDN 改寫。",
            },
            options: {
                none: "不使用（使用圖床預設 URL）",
                custom: "自訂網域",
            },
            customDomain: {
                name: "自訂 CDN 網域",
                desc: "當 CDN 選擇「自訂網域」時使用。填寫主機名稱（如 cdn.example.com），通訊協定預設為 https。",
                placeholder: "cdn.example.com",
            },
        },
        features: {
            renameRules: {
                heading: "重新命名規則",
                enabled: {
                    name: "啟用自訂檔案命名範本",
                    desc: "對上傳的檔案名稱套用路徑範本和清理規則。",
                },
                template: {
                    name: "檔案命名範本",
                    desc: "上傳路徑的範本。支援 {year} {mon} {day} {random} {filename} 變數。例如 uploads/{year}/{mon}/{filename}",
                    placeholder: "uploads/{year}/{mon}/{filename}",
                },
                spacesToDashes: {
                    name: "將空格轉換為短橫線",
                },
                lowercase: {
                    name: "檔案名稱轉小寫",
                },
            },
            compression: {
                heading: "圖片壓縮",
                enabled: {
                    name: "啟用壓縮",
                    desc: "在上傳前調整尺寸和重新編碼圖片，以節省流量和儲存空間。",
                },
                maxWidth: {
                    name: "最大寬度 (px)",
                    desc: "寬度超過此值的圖片會被縮放。0 表示不縮放。",
                },
                quality: {
                    name: "品質",
                    desc: "JPEG/WebP 輸出品質（0.1 – 1.0）。值越小檔案越小。",
                },
                format: {
                    name: "輸出格式",
                    desc: "上傳時轉換為該格式。「保持原格式」不做轉換。",
                    options: {
                        keep: "保持原格式",
                    },
                },
            },
            skipRules: {
                heading: "略過規則",
                urlRegex: {
                    name: "略過符合此正規表示式的 URL",
                    desc: "若網路圖片的 URL 符合此正規表示式，則略過上傳（保留原 URL）。",
                    placeholder: "^https://(cdn\\.jsdelivr\\.net|raw\\.githubusercontent\\.com)/",
                },
                pathRegex: {
                    name: "略過符合此正規表示式的本機路徑",
                    desc: "若本機檔案路徑符合此正規表示式，則略過上傳。",
                    placeholder: "^templates/",
                },
                maxSize: {
                    name: "略過大於此大小的檔案 (MB)",
                    desc: "大於此大小的檔案保持不動。0 表示停用大小過濾。",
                },
            },
            concurrency: {
                heading: "上傳並行數",
                upload: {
                    name: "並行上傳數",
                    desc: "並行上傳的圖片數量（1–16）。較高的值可能觸發圖床的速率限制。",
                },
            },
            exif: {
                heading: "EXIF 資訊清除",
                enabled: {
                    name: "上傳時清除 EXIF 中繼資料",
                    desc: "在上傳前移除 GPS 座標、相機資訊等 EXIF 標籤。",
                },
            },
        },
    },

    progressModal: {
        title: "正在上傳圖片",
        uploading: "上傳中...",
        complete: "完成",
        failed: "失敗",
        images: "圖片",
        completedWithErrors: "已完成，但有 {count} 個失敗",
        succeeded: "{count} 個成功",
        failedCount: "{count} 個失敗",
    },

    notice: {
        copiedToClipboard: "已複製到剪貼簿",
        uploaderSetupFailed: "圖片上傳器設定失敗，請檢查設定。",
        publishFailed: "發佈失敗：{error}",
        uploadFailed: "上傳 {path} 失敗，遠端伺服器返回錯誤：{error}",
        webImageUploadFailed: "上傳網路圖片 {path} 失敗：{error}",
        cannotLocate: "找不到 {name}（路徑：{path}），請檢查圖片路徑或外掛程式中的附件選項設定！",
        failedToReadFile: "讀取檔案失敗：{path}",
        mermaidRendering: "正在渲染 {count} 個 Mermaid 圖表...",
        mermaidInitFailed: "Mermaid 初始化失敗：{error}",
        mermaidRenderFailed: "渲染 Mermaid 區塊 {index} 失敗：{error}",
        uploadSuccess: "上傳成功：{url}",
        fileTypeNotSupported: "不支援的檔案類型：{ext}",
    },

    ribbon: {
        title: "開啟外掛設定",
    },

    contextMenu: {
        uploadFile: "上傳到雲端",
    },
};

export default zhTw;