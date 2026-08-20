import {Notice, Setting} from "obsidian";
import GitHubUploader from "../../../uploader/github/gitHubUploader";
import type {TabRenderer} from "../types";
import {renderCdnSection} from "./shared/cdnSection";

export const renderGithubSettings: TabRenderer = (el, {plugin, t}) => {
    const settings = plugin.settings.githubSetting;

    // ── Status line ──
    const statusDiv = el.createDiv({cls: "iuf-github-status"});
    const updateStatus = () => {
        statusDiv.empty();
        if (settings.repositoryName) {
            const ownerSegment = settings.githubOwner || "_";
            const url = `https://github.com/${ownerSegment}/${settings.repositoryName}`;
            statusDiv.createEl("span", {
                text: `✓ ${t.t("settings.imageStore.github.connected")}: `,
                cls: "iuf-github-connected",
            });
            const linkText = settings.githubOwner
                ? `${settings.githubOwner}/${settings.repositoryName}`
                : settings.repositoryName;
            const link = statusDiv.createEl("a", {
                text: linkText,
                href: url,
                cls: "iuf-github-link",
            });
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
        }
    };

    // ── Token (with show/hide toggle) ──
    const tokenItem = el.createDiv({cls: "setting-item iuf-github-token"});
    const tokenInfo = tokenItem.createDiv({cls: "setting-item-info"});
    tokenInfo.createDiv({
        cls: "setting-item-name",
        text: t.t("settings.imageStore.github.token.name"),
    });
    const tokenDescEl = tokenInfo.createDiv({cls: "setting-item-description"});
    tokenDescEl.appendChild(tokenDescription(t.t("settings.imageStore.github.token.desc")));

    const tokenControl = tokenItem.createDiv({cls: "setting-item-control"});
    const tokenInputWrap = tokenControl.createDiv({cls: "iuf-token-input-wrap"});
    const tokenInput = tokenInputWrap.createEl("input", {
        type: "password",
        cls: "iuf-token-input",
    });
    tokenInput.placeholder = t.t("settings.imageStore.github.token.placeholder");
    tokenInput.value = settings.token;

    let lastSeenToken = settings.token;

    tokenInput.addEventListener("input", () => {
        settings.token = tokenInput.value;
    });

    const toggleBtn = tokenControl.createEl("button", {
        text: "\u{1F441}", // 👁
        cls: "iuf-token-toggle",
        attr: { type: "button", "aria-label": "Toggle token visibility" },
    });
    toggleBtn.addEventListener("click", () => {
        const isPassword = tokenInput.type === "password";
        tokenInput.type = isPassword ? "text" : "password";
        toggleBtn.textContent = isPassword ? "\u{1F648}" : "\u{1F441}";
    });

    tokenInput.addEventListener("blur", () => {
        const token = tokenInput.value;
        if (!token) return;

        if (token !== lastSeenToken) {
            lastSeenToken = token;
            if (settings.githubOwner) settings.githubOwner = "";
            if (settings.repositoryName) settings.repositoryName = "";
            void plugin.saveSettings();
            updateStatus();
        }

        if (!settings.githubOwner) {
            GitHubUploader.fetchOwner(token).then(owner => {
                settings.githubOwner = owner;
                void plugin.saveSettings();
                updateStatus();
                // After fetching owner, always try to create/verify the repo
                return GitHubUploader.createRepository(token, settings.repositoryName);
            }).then(repo => {
                settings.githubOwner = repo.owner;
                settings.repositoryName = repo.repo;
                settings.branchName = repo.branch;
                void plugin.saveSettings();
                plugin.settingTab?.display();
                new Notice(`✓ ${t.t("settings.imageStore.github.connected")}: ${settings.repositoryName}`);
            }).catch((err: unknown) => {
                const msg = err instanceof Error ? err.message : JSON.stringify(err);
                new Notice(`✗ ${t.t("settings.imageStore.github.createFailed")}: ${msg}`);
            });
        } else if (!settings.repositoryName) {
            GitHubUploader.createRepository(token, settings.repositoryName).then(repo => {
                settings.githubOwner = repo.owner;
                settings.repositoryName = repo.repo;
                settings.branchName = repo.branch;
                void plugin.saveSettings();
                plugin.settingTab?.display();
                new Notice(`✓ ${t.t("settings.imageStore.github.connected")}: ${settings.repositoryName}`);
            }).catch((err: unknown) => {
                const msg = err instanceof Error ? err.message : JSON.stringify(err);
                new Notice(`✗ ${t.t("settings.imageStore.github.createFailed")}: ${msg}`);
            });
        }
    });

    // ── Repository ──
    new Setting(el)
        .setName(t.t("settings.imageStore.github.repository.name"))
        .setDesc(t.t("settings.imageStore.github.repository.desc"))
        .setClass("iuf-github-repo")
        .addText(text => text
            .setPlaceholder(t.t("settings.imageStore.github.repository.placeholder"))
            .setValue(settings.repositoryName)
            .onChange(value => {
                settings.repositoryName = value.trim();
                updateStatus();
            })
        );

    // ── Branch ──
    new Setting(el)
        .setName(t.t("settings.imageStore.github.branch.name"))
        .setDesc(t.t("settings.imageStore.github.branch.desc"))
        .setClass("iuf-github-branch")
        .addText(text => text
            .setPlaceholder(t.t("settings.imageStore.github.branch.placeholder"))
            .setValue(settings.branchName)
            .onChange(value => { settings.branchName = value.trim(); })
        );

    // ── Path ──
    new Setting(el)
        .setName(t.t("settings.imageStore.github.path.name"))
        .setDesc(t.t("settings.imageStore.github.path.desc"))
        .addText(text => text
            .setPlaceholder(t.t("settings.imageStore.github.path.placeholder"))
            .setValue(settings.path)
            .onChange(value => { settings.path = value; })
        );

    // ── CDN (new) — jsdelivr / Statically / gh-proxy / etc. ──
    renderCdnSection(el, plugin, t, {
        githubOwner: settings.githubOwner,
        githubRepo: settings.repositoryName,
        githubBranch: settings.branchName,
        githubPath: settings.path,
        customDomain: settings.customDomain,
    });

    updateStatus();
};

function tokenDescription(desc: string): DocumentFragment {
    const url = "https://github.com/settings/tokens";
    return createFragment(frag => {
        frag.append(desc);
        frag.createEl("a", { text: url, href: url });
    });
}
