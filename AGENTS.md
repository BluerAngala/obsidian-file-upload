# obsidian-file-upload

An Obsidian plugin for uploading local images to multiple cloud storage providers (Imgur, Gyazo, GitHub, AWS S3, Aliyun OSS, TencentCloud COS, Qiniu Kodo, ImageKit, Cloudflare R2, Backblaze B2). Also supports automatic mermaid diagram conversion to images during publish, with multi-language support (中文/English/繁體中文).

Fork of [Obsidian Image Upload Toolkit](https://github.com/addozhang/obsidian-image-upload-toolkit). Enhanced with i18n and other improvements.

## Project Overview

This is a TypeScript-based Obsidian plugin that processes markdown documents, detects local images, uploads them to configured cloud storage, and replaces image references with remote URLs. The plugin supports multiple storage backends with a unified uploader interface. It also converts mermaid code blocks to PNG images during publish.

## Tech Stack

- **Language**: TypeScript 4.x
- **Target**: ES2021, CommonJS modules
- **Framework**: Obsidian Plugin API (minAppVersion 0.12.16)
- **Build Tool**: esbuild via custom `esbuild.config.mjs` (externals: `obsidian`, `electron`)
- **Test Runner**: Vitest 4.x
- **Platform**: Desktop only (Windows/macOS/Linux)

## Project Structure

```
src/
├── publish.ts                      # Main plugin entry point
├── imageStore.ts                   # Storage provider registry (with normalizeId() for legacy alias support)
├── styles.css                      # Plugin styles
├── i18n/                           # Multi-language support
│   ├── translate.ts                # Translation manager
│   ├── zh.ts                       # Simplified Chinese
│   ├── en.ts                       # English
│   └── zh-tw.ts                    # Traditional Chinese
├── ui/
│   ├── publishSettingTab.ts        # Settings UI
│   └── uploadProgressModal.ts      # Progress display modal
└── uploader/
    ├── imageUploader.ts            # Base uploader interface
    ├── imageUploaderBuilder.ts     # Factory for uploader instances
    ├── imageTagProcessor.ts        # Markdown image parser & processor
    ├── mermaidProcessor.ts         # Mermaid-to-PNG conversion (v1.3.0)
    ├── webImageDownloader.ts       # Web image download utility (v1.2.0)
    ├── uploaderUtils.ts            # Shared utilities
    ├── apiError.ts                 # Error handling
    ├── imgur/                      # Imgur implementation
    ├── gyazo/                      # Gyazo implementation (v1.6.0)
    ├── github/                     # GitHub implementation
    ├── s3/                         # AWS S3 implementation
    ├── r2/                         # Cloudflare R2 implementation
    ├── oss/                        # Aliyun OSS implementation
    ├── cos/                        # TencentCloud COS implementation
    ├── qiniu/                      # Qiniu Kodo implementation
    ├── imagekit/                   # ImageKit implementation
    └── b2/                         # Backblaze B2 implementation
```

## Build & Commands

### Quick Start (one-time setup)
1. `cp .env.example .env` — 填写 `OBSIDIAN_VAULT_PATH`
2. 在 Obsidian 安装 **Hot-Reload** (by pjeby)

### Development
```bash
npm install              # Install dependencies
npm run dev             # Watch mode → auto-build → auto-copy to vault
npm run build           # Production build
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

When you run `npm run dev`:
- `esbuild` watches for file changes and rebuilds automatically
- Built files are **auto-copied** to the vault's plugin directory (if `OBSIDIAN_VAULT_PATH` is set in `.env`)
- The **[Hot-Reload](https://github.com/pjeby/hot-reload)** plugin detects file changes and reloads the plugin automatically

## Key Concepts

### Storage Provider Architecture

Each storage provider implements the [`ImageUploader`](src/uploader/imageUploader.ts) interface:
```typescript
interface ImageUploader {
    upload(imageFilePath: string, filename: string): Promise<string>;
}
```

New providers are registered in [`ImageStore`](src/imageStore.ts) and instantiated via [`buildUploader()`](src/uploader/imageUploaderBuilder.ts).

### Image Processing Flow

1. **Detection**: [`ImageTagProcessor`](src/uploader/imageTagProcessor.ts) parses markdown for local and web images
2. **Mermaid Conversion** (v1.3.0): [`MermaidProcessor`](src/uploader/mermaidProcessor.ts) renders mermaid code blocks to PNG images and uploads them, replacing code blocks with image references in the clipboard output
3. **Web Image Handling** (v1.2.0): [`WebImageDownloader`](src/uploader/webImageDownloader.ts) downloads external images if `uploadWebImages` is enabled
4. **Upload**: Images are uploaded via the configured provider's `upload()` method
5. **Replace**: Local/web paths are replaced with remote URLs
6. **Output**: Updated markdown is copied to clipboard

#### Mermaid Diagram Conversion (v1.3.0)
- Converts mermaid code blocks to PNG images during publish
- Uses Obsidian's built-in `loadMermaid()` API (no bundled mermaid dependency)
- Configurable scale factor (1-4x, default 2) for image quality
- Configurable theme (default/dark/forest/neutral/base)
- Mermaid source blocks are preserved in the original document — only the clipboard output gets image replacements
- Generated images are tracked via a `Set<string>` to prevent double-upload when "Upload web images" is enabled

#### Web Image Upload Feature (v1.2.0)
- Automatically downloads web images (http/https URLs) when enabled
- Skips images already hosted on configured storage (via `isAlreadyHosted()`)
- Prevents link rot from external sources
- Configurable via `uploadWebImages` setting (default: disabled)

### Path Variables

Support dynamic path generation using these variables:
- `{year}` - Current year (4 digits)
- `{mon}` - Current month (2 digits)
- `{day}` - Current day (2 digits)
- `{filename}` - Original filename
- `{random}` - Random string

Example: `/{year}/{mon}/{day}/{filename}` → `/2024/01/17/image.jpg`

### Multi-language Support
- Languages: 中文 (Simplified Chinese), English, 繁體中文 (Traditional Chinese)
- Language selection in settings page top dropdown
- Switches language instantly on change
- Covers: settings UI, progress modal, command names, Notice messages

## Code Style & Conventions

### TypeScript Guidelines
- TypeScript strict mode is **not** currently enabled in [`tsconfig.json`](tsconfig.json); the lint suite covers most type-safety gaps via `typescript-eslint`. New code should still be written as if strict were on
- Prefer interfaces over type aliases for public APIs
- Use async/await over raw promises
- Handle errors gracefully with try-catch blocks

### Naming Conventions
- Classes: PascalCase (e.g., `ImageUploader`, `PublishSettingTab`)
- Interfaces: PascalCase with descriptive names (e.g., `PublishSettings`)
- Files: camelCase (e.g., `imageUploader.ts`, `publishSettingTab.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `IMGUR_PLUGIN_CLIENT_ID`)

### File Organization
- One class per file
- Group related functionality in subdirectories (e.g., `uploader/imgur/`)
- Keep UI components in `ui/` directory
- Shared utilities in root or dedicated `utils/` directory

## Adding a New Storage Provider

To add a new storage provider:

1. **Create provider directory**: `src/uploader/your-provider/`

2. **Implement uploader class**:
   ```typescript
   // src/uploader/your-provider/yourProviderUploader.ts
   import ImageUploader from "../imageUploader";
   
   export interface YourProviderSetting {
       apiKey: string;
       bucket: string;
       // ... other settings
   }
   
   export default class YourProviderUploader implements ImageUploader {
       constructor(private settings: YourProviderSetting) {}
       
       async upload(imageFilePath: string, filename: string): Promise<string> {
           // Implementation
           return remoteUrl;
       }
   }
   ```

3. **Register in ImageStore** ([`src/imageStore.ts`](src/imageStore.ts)):
   ```typescript
   static YOUR_PROVIDER = {id: "your-provider", description: "Your Provider"};
   static lists = [/* ... */, ImageStore.YOUR_PROVIDER];
   ```

4. **Add to builder** ([`src/uploader/imageUploaderBuilder.ts`](src/uploader/imageUploaderBuilder.ts)):
   ```typescript
   case ImageStore.YOUR_PROVIDER.id:
       return new YourProviderUploader(settings.yourProviderSetting);
   ```

5. **Update settings interface** ([`src/publish.ts`](src/publish.ts)):
   ```typescript
   export interface PublishSettings {
       // ... existing settings
       yourProviderSetting: YourProviderSetting;
   }
   ```

6. **Add UI settings** ([`src/ui/publishSettingTab.ts`](src/ui/publishSettingTab.ts)):
   - Create `drawYourProviderSetting(parentEL)` method
   - Add case to `drawImageStoreSettings()` switch

## Testing

### Automated Tests

Unit tests are located in `tests/unit/` and run via [Vitest](https://vitest.dev/):

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

Current test files:
- `gyazoUploader.test.ts` — Gyazo uploader (upload success, error handling, field omission)
- `imageStore.test.ts` — Provider registry and `normalizeId()` alias resolution
- `isAlreadyHosted.test.ts` — Hosted-URL detection for all providers
- `imageTagRegex.test.ts` — Markdown/Wiki image tag regex matching
- `uploaderUtils.test.ts` — Path template generation and domain customization
- `webImageDownloader.test.ts` — Web image download logic
- `mermaidProcessor.test.ts` — Mermaid-to-PNG conversion
- `mermaidRegex.test.ts` — Mermaid code block regex matching

### End-to-End Testing via Chrome DevTools Protocol

See [`scripts/e2e/README.md`](scripts/e2e/README.md) for the full workflow.

## Dependencies

### Runtime
- `obsidian` (external, provided by the host; also exposes `requestUrl` and `loadMermaid`)
- `@aws-sdk/client-s3` — used by AWS S3, Cloudflare R2, and Backblaze B2 uploaders (v3 modular SDK)
- `@octokit/rest` — GitHub API client

> **Note**: Aliyun OSS, Tencent COS, Qiniu Kodo, ImageKit, Gyazo, and Imgur uploaders use Obsidian's built-in `requestUrl` API with inline request signing — no provider SDKs are bundled. Mermaid rendering uses Obsidian's built-in `loadMermaid()` API. Bundle size dropped from ~16 MB to ~644 KB (−96%) as a result of dropping `ali-oss`, `cos-nodejs-sdk-v5`, `qiniu`, `aws-sdk` v2, and `proxy-agent`.

### Development
- `typescript` — TypeScript compiler
- `esbuild` — JavaScript bundler (config in `esbuild.config.mjs`)
- `vitest` — Test runner
- `eslint` + `typescript-eslint` + `eslint-plugin-obsidianmd` — Linting (Obsidian-specific rules)
- `@types/node` — Node.js type definitions
- `jsdom` — DOM environment for unit tests

## Plugin Configuration

Settings are stored in `.obsidian/plugins/obsidian-file-upload/data.json`:
```json
{
  "language": "zh",
  "imageAltText": true,
  "replaceOriginalDoc": false,
  "ignoreProperties": true,
  "imageStore": "imgur",
  "showProgressModal": true,
  "uploadWebImages": false,
  "convertMermaid": false,
  "mermaidScale": 2,
  "mermaidTheme": "default",
  "imgurAnonymousSetting": { "clientId": "..." },
  "gyazoSetting": { "accessToken": "...", "accessPolicy": "anyone", "description": "" },
  "b2Setting": { "keyId": "...", "applicationKey": "...", "bucketId": "...", "bucketName": "...", "customDomain": "" }
}
```

## Boundaries

### Do Not Modify
- [`manifest.json`](manifest.json) - Only update version and description during releases
- [`package.json`](package.json) - Only update version, dependencies, and scripts as needed
- Build configuration in [`package.json`](package.json) scripts
- TypeScript compiler options in [`tsconfig.json`](tsconfig.json)

### Version Sync Required
- When updating version for a release, BOTH [`package.json`](package.json) and [`manifest.json`](manifest.json) must have the same version number
- Version format: `X.Y.Z` (without `v` prefix)

### Careful With
- [`src/publish.ts`](src/publish.ts) - Core plugin logic, changes affect all providers
- [`src/uploader/imageTagProcessor.ts`](src/uploader/imageTagProcessor.ts) - Image parsing, affects all workflows
- [`src/imageStore.ts`](src/imageStore.ts) - Provider registry, maintain backward compatibility

### Safe to Modify
- Individual provider implementations in `src/uploader/*/`
- UI components in `src/ui/`
- Utility functions in `src/uploader/uploaderUtils.ts`
- Translation files in `src/i18n/`
- Web image downloader in `src/uploader/webImageDownloader.ts`
- Mermaid processor in `src/uploader/mermaidProcessor.ts`

## Resources

- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Obsidian API Reference](https://github.com/obsidianmd/obsidian-api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Author

**BluerAngala**