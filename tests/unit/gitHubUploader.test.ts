import {beforeEach, describe, expect, it, vi} from "vitest";

const octokitMocks = vi.hoisted(() => ({
    getContent: vi.fn(),
    createOrUpdateFileContents: vi.fn(),
}));

vi.mock("@octokit/rest", () => ({
    Octokit: class {
        repos = octokitMocks;
    },
}));

import GitHubUploader from "../../src/uploader/github/gitHubUploader";

function createUploader(overrides: Partial<ConstructorParameters<typeof GitHubUploader>[0]> = {}): GitHubUploader {
    return new GitHubUploader({
        githubOwner: "owner",
        repositoryName: "repo",
        branchName: "main",
        token: "token",
        path: "",
        cdnId: "github-raw",
        customDomain: "",
        ...overrides,
    });
}

describe("GitHubUploader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        octokitMocks.getContent.mockRejectedValue(new Error("Not found"));
        octokitMocks.createOrUpdateFileContents.mockResolvedValue({});
    });

    it("serializes concurrent uploads to the same branch", async () => {
        let finishFirstUpload: () => void;
        const firstUpload = new Promise<void>(resolve => {
            finishFirstUpload = resolve;
        });
        octokitMocks.createOrUpdateFileContents
            .mockImplementationOnce(() => firstUpload)
            .mockResolvedValueOnce({});

        const uploader = createUploader();
        const first = uploader.upload(new File(["first"], "first.png"), "/first.png");
        const second = uploader.upload(new File(["second"], "second.png"), "/second.png");

        await vi.waitFor(() => {
            expect(octokitMocks.createOrUpdateFileContents).toHaveBeenCalledTimes(1);
        });
        expect(octokitMocks.getContent).toHaveBeenCalledTimes(1);

        finishFirstUpload!();
        await expect(Promise.all([first, second])).resolves.toEqual([
            "https://raw.githubusercontent.com/owner/repo/main/first.png",
            "https://raw.githubusercontent.com/owner/repo/main/second.png",
        ]);
        expect(octokitMocks.createOrUpdateFileContents).toHaveBeenCalledTimes(2);
    });

    it("continues the queue after an upload fails", async () => {
        octokitMocks.createOrUpdateFileContents
            .mockRejectedValueOnce(new Error("Conflict"))
            .mockResolvedValueOnce({});

        const uploader = createUploader();
        const first = uploader.upload(new File(["first"], "first.png"), "/first.png");
        const second = uploader.upload(new File(["second"], "second.png"), "/second.png");

        await expect(first).rejects.toThrow("Conflict");
        await expect(second).resolves.toBe(
            "https://raw.githubusercontent.com/owner/repo/main/second.png",
        );
        expect(octokitMocks.createOrUpdateFileContents).toHaveBeenCalledTimes(2);
    });

    it("returns jsdelivr URL when cdnId is 'jsdelivr'", async () => {
        const uploader = createUploader({cdnId: "jsdelivr"});
        const url = await uploader.upload(new File(["x"], "pic.png"), "/pic.png");
        expect(url).toBe("https://fastly.jsdelivr.net/gh/owner/repo@main/pic.png");
    });

    it("returns gh-proxy.com URL when cdnId is 'gh-proxy' (domestic)", async () => {
        const uploader = createUploader({cdnId: "gh-proxy"});
        const url = await uploader.upload(new File(["x"], "pic.png"), "/pic.png");
        expect(url).toBe(
            "https://gh-proxy.com/https://raw.githubusercontent.com/owner/repo/main/pic.png",
        );
    });

    it("uses custom domain when cdnId is '__custom__'", async () => {
        const uploader = createUploader({cdnId: "__custom__", customDomain: "cdn.example.com"});
        const url = await uploader.upload(new File(["x"], "pic.png"), "/pic.png");
        expect(url).toBe("https://cdn.example.com/owner/repo/main/pic.png");
    });

    it("encodes Chinese filename in the storage URL (raw)", async () => {
        const uploader = createUploader();
        const url = await uploader.upload(new File(["x"], "截图.png"), "/截图.png");
        expect(url).toBe("https://raw.githubusercontent.com/owner/repo/main/%E6%88%AA%E5%9B%BE.png");
    });

    it("encodes Chinese filename in the jsdelivr URL", async () => {
        const uploader = createUploader({cdnId: "jsdelivr"});
        const url = await uploader.upload(new File(["x"], "截图.png"), "/截图.png");
        expect(url).toBe("https://fastly.jsdelivr.net/gh/owner/repo@main/%E6%88%AA%E5%9B%BE.png");
    });

    it("respects a configured upload path prefix", async () => {
        const uploader = createUploader({path: "images/2026"});
        const url = await uploader.upload(new File(["x"], "pic.png"), "/pic.png");
        expect(url).toBe("https://raw.githubusercontent.com/owner/repo/main/images/2026/pic.png");
    });
});
