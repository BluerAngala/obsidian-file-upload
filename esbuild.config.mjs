import esbuild from "esbuild";
import {copyFile, mkdir, readFile} from "node:fs/promises";
import {existsSync} from "node:fs";

const prod = process.argv.includes("--prod") || process.env.NODE_ENV === "production";
const watch = process.argv.includes("--watch");

// ── Load .env ─────────────────────────────────────────────────────────────
const env = {};
const envPath = ".env";
if (existsSync(envPath)) {
    const raw = await readFile(envPath, "utf-8");
    for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
}

const vaultPath = env.OBSIDIAN_VAULT_PATH || "";

// ── Plugin directory inside vault ─────────────────────────────────────────
const pluginDir = vaultPath ? `${vaultPath}/.obsidian/plugins/image-upload-toolkit` : "";

// ── Copy files to vault ───────────────────────────────────────────────────
async function deploy() {
    if (!pluginDir) return;
    await mkdir(pluginDir, {recursive: true});
    await Promise.all([
        copyFile("dist/main.js", `${pluginDir}/main.js`),
        copyFile("manifest.json", `${pluginDir}/manifest.json`),
        copyFile("src/styles.css", `${pluginDir}/styles.css`),
    ]);
    console.log(`[deploy] Copied to ${pluginDir}`);
}

// ── esbuild ───────────────────────────────────────────────────────────────
const context = await esbuild.context({
    entryPoints: ["src/publish.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "es2022",
    mainFields: ["browser", "module", "main"],
    external: ["obsidian", "electron"],
    outfile: "dist/main.js",
    sourcemap: prod ? false : "inline",
    minify: prod,
    logLevel: "info",
});

await mkdir("dist", {recursive: true});
await copyFile("manifest.json", "dist/manifest.json");
await copyFile("src/styles.css", "dist/styles.css");

if (watch) {
    await context.watch();
    // Deploy on first build (watch triggers an initial build)
    setTimeout(deploy, 500);
    console.log("");
    console.log("── Dev mode ──────────────────────────────────────────────");
    if (pluginDir) {
        console.log(`  Vault:  ${vaultPath}`);
        console.log("  Hot-Reload: Install 'Hot-Reload' by pjeby in Obsidian");
    } else {
        console.log("  ⚠ Set OBSIDIAN_VAULT_PATH in .env to auto-deploy");
    }
    console.log("──────────────────────────────────────────────────────────");
    console.log("");
} else {
    await context.rebuild();
    await context.dispose();
    await deploy();
}