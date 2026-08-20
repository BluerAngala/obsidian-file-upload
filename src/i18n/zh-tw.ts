import type en from "./en";

const zhTw: typeof en = {
    command: {
        publishPage: "發佈頁面",
    },

    settings: {
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
                ImageKit: "ImageKit",
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
                repository: {
                    name: "倉庫名稱",
                    desc: "用於儲存圖片的 GitHub 倉庫名稱（格式：owner/repo）。",
                    placeholder: "輸入倉庫名稱（例如：username/repo）",
                },
                branch: {
                    name: "分支名稱",
                    desc: "儲存圖片的分支（預設為 'main'）。",
                    placeholder: "輸入分支名稱",
                },
                token: {
                    name: "個人存取權杖",
                    desc: "在此處生成具有 'repo' 權限的個人存取權杖：",
                    placeholder: "輸入你的 GitHub 個人存取權杖",
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
    },
};

export default zhTw;