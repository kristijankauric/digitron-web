const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const SRC_ROOT = path.resolve(process.cwd(), "src", "assets");
const DIST_ROOT = path.resolve(process.cwd(), "dist", "assets");
const MAX_RETRIES = 5;
const RETRY_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function listFiles(rootDir) {
  const result = new Map();

  async function walk(currentDir) {
    const entries = await fsp.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
      } else if (entry.isFile()) {
        const rel = path.relative(rootDir, abs).replace(/\\/g, "/");
        const stat = await fsp.stat(abs);
        result.set(rel, { abs, size: stat.size });
      }
    }
  }

  if (!fs.existsSync(rootDir)) {
    return result;
  }

  await walk(rootDir);
  return result;
}

async function copyWithRetry(srcAbs, dstAbs) {
  let lastError = null;
  await ensureDir(path.dirname(dstAbs));

  for (let i = 0; i < MAX_RETRIES; i += 1) {
    try {
      await fsp.copyFile(srcAbs, dstAbs);
      return true;
    } catch (error) {
      lastError = error;
      await sleep(RETRY_MS * (i + 1));
    }
  }

  if (lastError) {
    throw lastError;
  }
  return false;
}

async function main() {
  if (!fs.existsSync(SRC_ROOT)) {
    console.log("[assets-guard] src/assets not found, skipping.");
    return;
  }

  await ensureDir(DIST_ROOT);

  const srcFiles = await listFiles(SRC_ROOT);
  const distFiles = await listFiles(DIST_ROOT);

  const missingOrMismatched = [];
  for (const [rel, srcMeta] of srcFiles.entries()) {
    const distMeta = distFiles.get(rel);
    if (!distMeta || distMeta.size !== srcMeta.size) {
      missingOrMismatched.push(rel);
    }
  }

  if (missingOrMismatched.length === 0) {
    console.log(`[assets-guard] OK (${srcFiles.size} files).`);
    return;
  }

  console.log(
    `[assets-guard] Repairing ${missingOrMismatched.length} missing/mismatched files in dist/assets...`
  );

  const failed = [];
  for (const rel of missingOrMismatched) {
    const srcAbs = path.join(SRC_ROOT, rel);
    const dstAbs = path.join(DIST_ROOT, rel);
    try {
      await copyWithRetry(srcAbs, dstAbs);
    } catch (error) {
      failed.push({ rel, error: error.message });
    }
  }

  const finalSrc = await listFiles(SRC_ROOT);
  const finalDist = await listFiles(DIST_ROOT);
  const stillMissing = [];

  for (const [rel, srcMeta] of finalSrc.entries()) {
    const distMeta = finalDist.get(rel);
    if (!distMeta || distMeta.size !== srcMeta.size) {
      stillMissing.push(rel);
    }
  }

  if (failed.length > 0 || stillMissing.length > 0) {
    console.error("[assets-guard] FAILED to fully sync assets.");
    if (failed.length > 0) {
      console.error("[assets-guard] Copy errors:");
      for (const item of failed.slice(0, 20)) {
        console.error(`  - ${item.rel}: ${item.error}`);
      }
    }
    if (stillMissing.length > 0) {
      console.error(`[assets-guard] Still missing/mismatched: ${stillMissing.length}`);
      for (const rel of stillMissing.slice(0, 20)) {
        console.error(`  - ${rel}`);
      }
    }
    process.exit(1);
  }

  console.log(
    `[assets-guard] Repaired successfully. dist/assets now matches src/assets (${finalSrc.size} files).`
  );
}

main().catch((error) => {
  console.error("[assets-guard] Unexpected error:", error);
  process.exit(1);
});
