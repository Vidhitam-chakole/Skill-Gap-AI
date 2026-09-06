/**
 * Repository Scanner
 *
 * Reads a repository directory and extracts:
 * - File list with extensions
 * - Directory structure
 * - package.json / requirements.txt / go.mod dependencies
 * - Config files, CI/CD files, test files
 * - README content
 */

import fs from "fs";
import path from "path";

export interface ScannedRepo {
  name: string;
  rootPath: string;
  allFiles: string[];
  directories: string[];
  fileCount: Record<string, number>;
  configFiles: string[];
  ciCdFiles: string[];
  testFiles: string[];
  dockerFiles: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  readmeContent: string;
  languages: Record<string, number>;
}

const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".next", ".nuxt", "dist", "build", "coverage",
  "__pycache__", ".venv", "venv", ".tox", "target", "vendor", ".gradle",
  "out", ".cache", ".parcel-cache", "tmp", ".tmp", ".turbo",
]);

const IGNORED_FILES = new Set([
  ".DS_Store", "Thumbs.db", "desktop.ini", ".gitkeep", ".npmrc",
]);

export function scanRepository(repoPath: string, repoName?: string): ScannedRepo {
  const name = repoName || path.basename(repoPath);
  const allFiles: string[] = [];
  const directories: string[] = [];
  const fileCount: Record<string, number> = {};
  const configFiles: string[] = [];
  const ciCdFiles: string[] = [];
  const testFiles: string[] = [];
  const dockerFiles: string[] = [];
  let dependencies: Record<string, string> = {};
  let devDependencies: Record<string, string> = {};
  let readmeContent = "";

  function walkDir(dir: string, relativeTo: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(relativeTo, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        if (entry.name.startsWith(".")) continue;
        directories.push(relPath);
        walkDir(fullPath, relativeTo);
      } else if (entry.isFile()) {
        if (IGNORED_FILES.has(entry.name)) continue;

        allFiles.push(relPath);

        // Count by extension
        const ext = path.extname(entry.name).toLowerCase();
        if (ext) {
          fileCount[ext] = (fileCount[ext] || 0) + 1;
        }

        // Categorize files
        const basename = entry.name.toLowerCase();

        // Config files
        if (/^(tsconfig|jsconfig|\.eslintrc|\.prettierrc|babel\.config|webpack\.config|vite\.config|rollup\.config|tailwind\.config|postcss\.config|jest\.config|vitest\.config|drizzle\.config|prisma\.schema|vercel\.json|netlify\.toml|wrangler\.toml|docker-compose|\.dockerignore|Makefile|CMakeLists|go\.mod|Cargo\.toml|requirements\.txt|pyproject\.toml|setup\.py|tox\.ini|\.editorconfig|\.gitattributes)/.test(basename) ||
            basename === "dockerfile" || basename === "docker-compose.yml" || basename === "docker-compose.yaml" ||
            basename === ".gitignore" || basename === ".env" || basename.startsWith(".env.") ||
            basename === "pnpm-workspace.yaml" || basename === "lerna.json" || basename === "nx.json" ||
            basename === "turbo.json" || basename === "renovate.json" || basename === ".renovaterc") {
          configFiles.push(relPath);
        }

        // CI/CD files
        if (relPath.includes(".github/workflows/") || relPath.includes(".gitlab/") ||
            basename === ".gitlab-ci.yml" || basename === "jenkinsfile" || basename === ".circleci" ||
            relPath.includes(".circleci/")) {
          ciCdFiles.push(relPath);
        }

        // Test files
        if (/\.(test|spec|spec\.|test\.|e2e)\.(ts|tsx|js|jsx|py|go|rs|java)$/.test(entry.name) ||
            relPath.includes("__tests__") || relPath.includes("/test/") || relPath.includes("/tests/") ||
            relPath.includes("/specs/") || basename.includes("testutil") || basename.includes("testhelper")) {
          testFiles.push(relPath);
        }

        // Docker files
        if (/docker|container/.test(basename)) {
          dockerFiles.push(relPath);
        }

        // README
        if (/^readme/i.test(entry.name)) {
          try {
            readmeContent = fs.readFileSync(fullPath, "utf-8").slice(0, 5000);
          } catch { /* ignore */ }
        }

        // package.json
        if (entry.name === "package.json") {
          try {
            const pkg = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
            dependencies = pkg.dependencies || {};
            devDependencies = pkg.devDependencies || {};
          } catch { /* ignore */ }
        }

        // requirements.txt
        if (entry.name === "requirements.txt") {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            for (const line of content.split("\n")) {
              const match = line.trim().match(/^([a-zA-Z0-9_-]+)/);
              if (match) dependencies[match[1]] = "*";
            }
          } catch { /* ignore */ }
        }

        // go.mod
        if (entry.name === "go.mod") {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            const requireBlock = content.match(/require\s*\(([\s\S]*?)\)/);
            if (requireBlock) {
              for (const line of requireBlock[1].split("\n")) {
                const match = line.trim().match(/^([\w./-]+)\s+v/);
                if (match) dependencies[match[1]] = "*";
              }
            }
          } catch { /* ignore */ }
        }

        // Cargo.toml
        if (entry.name === "Cargo.toml") {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            const depSection = content.match(/\[dependencies\]([\s\S]*?)(?:\[|$)/);
            if (depSection) {
              for (const line of depSection[1].split("\n")) {
                const match = line.trim().match(/^(\w[\w-]*)\s*=/);
                if (match) dependencies[match[1]] = "*";
              }
            }
          } catch { /* ignore */ }
        }
      }
    }
  }

  walkDir(repoPath, repoPath);

  return {
    name,
    rootPath: repoPath,
    allFiles,
    directories,
    fileCount,
    configFiles,
    ciCdFiles,
    testFiles,
    dockerFiles,
    dependencies,
    devDependencies,
    readmeContent,
    languages: fileCount,
  };
}
