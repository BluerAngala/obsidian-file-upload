import ImageUploader from "../imageUploader";
import { Octokit } from "@octokit/rest";
import {applyCdn, encodePathSegments} from "../cdn";

export default class GitHubUploader implements ImageUploader {
  private readonly octokit: Octokit;
  private readonly owner: string;
  private readonly repo: string;
  private readonly branch: string;
  private readonly path: string;
  private readonly cdnId: string;
  private readonly customDomain: string;
  private uploadQueue: Promise<void> = Promise.resolve();

  constructor(setting: GitHubSetting) {
    this.octokit = new Octokit({
      auth: setting.token
    });

    // Owner and repo are stored as separate fields. Owner is auto-fetched
    // from the token; the user only edits the repository name.
    this.owner = setting.githubOwner;
    this.repo = setting.repositoryName;
    this.branch = setting.branchName || 'main';
    this.path = setting.path;
    this.cdnId = setting.cdnId || "github-raw";
    this.customDomain = setting.customDomain || "";
  }

  supportsFileType(_extension: string): boolean {
    return true;
  }

  upload(image: File, fullPath: string): Promise<string> {
    const result: Promise<string> = this.uploadQueue.then(
      async (): Promise<string> => await this.uploadFile(image, fullPath),
    );
    this.uploadQueue = result.then(
      (): void => undefined,
      (): void => undefined,
    );
    return result;
  }

  private async uploadFile(image: File, fullPath: string): Promise<string> {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(image);
      const base64Content = this.arrayBufferToBase64(arrayBuffer);

      const baseName = image.name.replace(/^\/+/, ''); // Remove leading slashes
      // Prepend the configured upload path (e.g. "images/2026"), stripping
      // any leading/trailing slashes so the result is always exactly
      // "{prefix}/{filename}" — no stray double slashes.
      const prefix = this.path.replace(/^\/+|\/+$/g, "");
      const filePath = prefix ? `${prefix}/${baseName}` : baseName;

      // Get the SHA of the file if it exists (needed for updating)
      let fileSha: string | undefined;
      try {
        const { data } = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          ref: this.branch
        });

        if (!Array.isArray(data)) {
          fileSha = data.sha;
        }
      } catch {
        // File doesn't exist yet, which is fine
      }

      // Create or update the file in the repository
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: `Upload image: ${image.name}`,
        content: base64Content,
        branch: this.branch,
        sha: fileSha
      });

      // Build the canonical storage URL with each path segment properly
      // encoded so Chinese filenames and spaces do not break CDN access.
      const encodedPath = encodePathSegments(filePath);
      const storageUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${encodedPath}`;

      // Apply the user-selected CDN (jsdelivr / Statically / gh-proxy / etc.)
      // or fall back to the raw URL.
      return applyCdn("GITHUB", storageUrl, this.cdnId, {
        githubOwner: this.owner,
        githubRepo: this.repo,
        githubBranch: this.branch,
        githubPath: filePath,
        customDomain: this.customDomain,
      });
    } catch (error) {
      console.error("Error uploading to GitHub:", error);
      throw error;
    }
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }

  /**
   * Fetch the GitHub username (owner) for the given token. Independent of
   * repository creation — call this whenever you just need the owner.
   */
  static async fetchOwner(token: string): Promise<string> {
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.users.getAuthenticated();
    return user.login;
  }

  /**
   * Create a GitHub repository for storing images, or verify an existing one.
   * If `repoName` is empty, uses the default name "obsidian-file-upload-images".
   * Returns the repository info (owner, repo name, branch).
   */
  static async createRepository(token: string, repoName?: string): Promise<{ owner: string; repo: string; branch: string }> {
    const octokit = new Octokit({ auth: token });
    const owner = await GitHubUploader.fetchOwner(token);

    const name = (repoName && repoName.trim()) || "obsidian-file-upload-images";

    // Check if repo already exists
    try {
      await octokit.repos.get({ owner, repo: name });
      // Repo exists, use it as-is
    } catch {
      // Repo doesn't exist, create it
      await octokit.repos.createForAuthenticatedUser({
        name: name,
        description: "Auto-created by obsidian-file-upload plugin for storing images",
        private: true,
        auto_init: true,
      });
    }

    return { owner, repo: name, branch: "main" };
  }
}

export interface GitHubSetting {
  githubOwner: string;    // Auto-fetched from the token (GitHub username)
  repositoryName: string; // The repository name only (no owner prefix)
  branchName: string;
  token: string;
  path: string;
  /** CDN id from src/uploader/cdn.ts (e.g. "github-raw", "jsdelivr", "gh-proxy"). */
  cdnId: string;
  /** Optional custom CDN domain (used when cdnId is "__custom__"). */
  customDomain: string;
}
