/**
 * Technology Detection Engine
 *
 * Detects technologies from:
 * 1. File extensions → language detection
 * 2. package.json / requirements.txt / go.mod → dependency detection
 * 3. Config files → framework/tool detection
 * 4. CI/CD files → DevOps detection
 * 5. Docker files → containerization detection
 *
 * Evidence hierarchy:
 * 1. Source-code usage (highest confidence)
 * 2. Dependency/package usage
 * 3. Configuration usage
 * 4. Build/CI usage
 * 5. README mention (lowest confidence)
 */

import type { TechnologyEvidence } from "./types.js";

// Language detection from file extensions
const LANGUAGE_MAP: Record<string, string> = {
  ".ts": "TypeScript", ".tsx": "TypeScript", ".js": "JavaScript", ".jsx": "JavaScript",
  ".py": "Python", ".rb": "Ruby", ".go": "Go", ".rs": "Rust", ".java": "Java",
  ".kt": "Kotlin", ".swift": "Swift", ".c": "C", ".cpp": "C++", ".cs": "C#",
  ".php": "PHP", ".scala": "Scala", ".r": "R", ".m": "Objective-C",
  ".vue": "Vue", ".svelte": "Svelte", ".dart": "Dart", ".ex": "Elixir",
  ".exs": "Elixir", ".hs": "Haskell", ".clj": "Clojure", ".lua": "Lua",
  ".sh": "Shell", ".bash": "Shell", ".zsh": "Shell",
};

// Dependency → Technology mapping
const DEPENDENCY_MAP: Record<string, { name: string; category: TechnologyEvidence["category"] }> = {
  // Frameworks
  react: { name: "React", category: "framework" },
  "react-dom": { name: "React", category: "framework" },
  "next": { name: "Next.js", category: "framework" },
  "nuxt": { name: "Nuxt.js", category: "framework" },
  "vue": { name: "Vue.js", category: "framework" },
  "@angular/core": { name: "Angular", category: "framework" },
  svelte: { name: "Svelte", category: "framework" },
  express: { name: "Express", category: "framework" },
  fastify: { name: "Fastify", category: "framework" },
  koa: { name: "Koa", category: "framework" },
  nestjs: { name: "NestJS", category: "framework" },
  "@nestjs/core": { name: "NestJS", category: "framework" },
  "django": { name: "Django", category: "framework" },
  "flask": { name: "Flask", category: "framework" },
  fastapi: { name: "FastAPI", category: "framework" },
  "ruby on rails": { name: "Rails", category: "framework" },
  "rails": { name: "Rails", category: "framework" },
  spring: { name: "Spring", category: "framework" },
  gin: { name: "Gin", category: "framework" },
  "actix-web": { name: "Actix Web", category: "framework" },
  axum: { name: "Axum", category: "framework" },
  "laravel": { name: "Laravel", category: "framework" },
  "tailwindcss": { name: "Tailwind CSS", category: "library" },
  "tailwindcss": { name: "Tailwind CSS", category: "library" },
  "@mui/material": { name: "Material UI", category: "library" },
  "antd": { name: "Ant Design", category: "library" },
  "chakra-ui": { name: "Chakra UI", category: "library" },

  // State management
  zustand: { name: "Zustand", category: "library" },
  redux: { name: "Redux", category: "library" },
  "react-redux": { name: "Redux", category: "library" },
  "@reduxjs/toolkit": { name: "Redux Toolkit", category: "library" },
  mobx: { name: "MobX", category: "library" },
  jotai: { name: "Jotai", category: "library" },
  "recoil": { name: "Recoil", category: "library" },
  "pinia": { name: "Pinia", category: "library" },
  "vuex": { name: "Vuex", category: "library" },

  // Data fetching
  "tanstack-query": { name: "TanStack Query", category: "library" },
  "@tanstack/react-query": { name: "TanStack Query", category: "library" },
  swr: { name: "SWR", category: "library" },
  "apollo-client": { name: "Apollo Client", category: "library" },
  urql: { name: "urql", category: "library" },
  axios: { name: "Axios", category: "library" },

  // UI / Animation
  "framer-motion": { name: "Framer Motion", category: "library" },
  "recharts": { name: "Recharts", category: "library" },
  d3: { name: "D3.js", category: "library" },
  "chart.js": { name: "Chart.js", category: "library" },
  "three": { name: "Three.js", category: "library" },

  // Validation
  zod: { name: "Zod", category: "library" },
  yup: { name: "Yup", category: "library" },
  joi: { name: "Joi", category: "library" },
  "react-hook-form": { name: "React Hook Form", category: "library" },
  "formik": { name: "Formik", category: "library" },

  // Testing
  jest: { name: "Jest", category: "testing" },
  vitest: { name: "Vitest", category: "testing" },
  mocha: { name: "Mocha", category: "testing" },
  cypress: { name: "Cypress", category: "testing" },
  playwright: { name: "Playwright", category: "testing" },
  "@testing-library/react": { name: "React Testing Library", category: "testing" },
  "@testing-library/jest-dom": { name: "Jest DOM", category: "testing" },
  pytest: { name: "pytest", category: "testing" },
  rspec: { name: "RSpec", category: "testing" },

  // Build tools
  webpack: { name: "Webpack", category: "build" },
  vite: { name: "Vite", category: "build" },
  esbuild: { name: "esbuild", category: "build" },
  rollup: { name: "Rollup", category: "build" },
  parcel: { name: "Parcel", category: "build" },
  turbopack: { name: "Turbopack", category: "build" },
  "tsup": { name: "tsup", category: "build" },
  babel: { name: "Babel", category: "build" },
  "@babel/core": { name: "Babel", category: "build" },

  // Databases
  prisma: { name: "Prisma", category: "database" },
  "@prisma/client": { name: "Prisma", category: "database" },
  drizzle: { name: "Drizzle ORM", category: "database" },
  "drizzle-orm": { name: "Drizzle ORM", category: "database" },
  mongoose: { name: "MongoDB (Mongoose)", category: "database" },
  sequelize: { name: "Sequelize", category: "database" },
  "typeorm": { name: "TypeORM", category: "database" },
  knex: { name: "Knex", category: "database" },
  "better-sqlite3": { name: "SQLite", category: "database" },
  "pg": { name: "PostgreSQL", category: "database" },
  "mysql2": { name: "MySQL", category: "database" },
  ioredis: { name: "Redis", category: "database" },
  redis: { name: "Redis", category: "database" },

  // DevOps / Cloud
  "aws-sdk": { name: "AWS", category: "cloud" },
  "@aws-sdk/client-s3": { name: "AWS S3", category: "cloud" },
  "@google-cloud/storage": { name: "Google Cloud", category: "cloud" },
  "azure-sdk": { name: "Azure", category: "cloud" },
  firebase: { name: "Firebase", category: "cloud" },
  "firebase-admin": { name: "Firebase", category: "cloud" },
  supabase: { name: "Supabase", category: "cloud" },
  "@supabase/supabase-js": { name: "Supabase", category: "cloud" },

  // Auth
  "next-auth": { name: "NextAuth.js", category: "library" },
  "@auth/core": { name: "Auth.js", category: "library" },
  passport: { name: "Passport.js", category: "library" },
  jsonwebtoken: { name: "JWT", category: "library" },
  bcryptjs: { name: "bcrypt", category: "library" },

  // API
  graphql: { name: "GraphQL", category: "framework" },
  "apollo-server": { name: "Apollo Server", category: "framework" },
  trpc: { name: "tRPC", category: "framework" },
  "@trpc/server": { name: "tRPC", category: "framework" },

  // Python specific
  numpy: { name: "NumPy", category: "library" },
  pandas: { name: "Pandas", category: "library" },
  torch: { name: "PyTorch", category: "library" },
  tensorflow: { name: "TensorFlow", category: "library" },
  scikit: { name: "Scikit-learn", category: "library" },
  scikit_learn: { name: "Scikit-learn", category: "library" },

  // Go specific
  "gorilla/mux": { name: "Gorilla Mux", category: "framework" },
  "golang-jwt": { name: "Go JWT", category: "library" },

  // Rust specific
  tokio: { name: "Tokio", category: "library" },
  serde: { name: "Serde", category: "library" },
  actix_web: { name: "Actix Web", category: "framework" },
};

export function detectLanguages(fileCount: Record<string, number>): Record<string, number> {
  const languages: Record<string, number> = {};
  for (const [ext, count] of Object.entries(fileCount)) {
    const lang = LANGUAGE_MAP[ext];
    if (lang) {
      languages[lang] = (languages[lang] || 0) + count;
    }
  }
  // Sort by count descending
  return Object.fromEntries(Object.entries(languages).sort(([, a], [, b]) => b - a));
}

export function detectTechnologiesFromDependencies(
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  repoName: string,
  filePaths: string[],
): TechnologyEvidence[] {
  const techMap = new Map<string, TechnologyEvidence>();
  const allDeps = { ...dependencies, ...devDependencies };

  for (const [pkg] of Object.entries(allDeps)) {
    const mapping = DEPENDENCY_MAP[pkg];
    if (mapping) {
      const key = mapping.name;
      if (techMap.has(key)) {
        const existing = techMap.get(key)!;
        existing.usageCount++;
        if (!existing.repositories.includes(repoName)) existing.repositories.push(repoName);
      } else {
        techMap.set(key, {
          id: `tech-${key.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          name: key,
          category: mapping.category,
          confidence: 70, // Dependency detection = 70% confidence
          detectionSource: "dependency",
          repositories: [repoName],
          files: [],
          usageCount: 1,
        });
      }
    }
  }

  return Array.from(techMap.values());
}

export function detectTechnologiesFromConfig(
  configFiles: string[],
  repoName: string,
): TechnologyEvidence[] {
  const techs: TechnologyEvidence[] = [];
  const CONFIG_TECH: Record<string, { name: string; category: TechnologyEvidence["category"] }> = {
    "tsconfig.json": { name: "TypeScript", category: "language" },
    ".eslintrc.js": { name: "ESLint", category: "build" },
    ".eslintrc.json": { name: "ESLint", category: "build" },
    ".prettierrc": { name: "Prettier", category: "build" },
    "tailwind.config.js": { name: "Tailwind CSS", category: "library" },
    "tailwind.config.ts": { name: "Tailwind CSS", category: "library" },
    "postcss.config.js": { name: "PostCSS", category: "build" },
    "next.config.js": { name: "Next.js", category: "framework" },
    "next.config.mjs": { name: "Next.js", category: "framework" },
    "next.config.ts": { name: "Next.js", category: "framework" },
    "nuxt.config.js": { name: "Nuxt.js", category: "framework" },
    "nuxt.config.ts": { name: "Nuxt.js", category: "framework" },
    "vite.config.ts": { name: "Vite", category: "build" },
    "vite.config.js": { name: "Vite", category: "build" },
    "webpack.config.js": { name: "Webpack", category: "build" },
    "webpack.config.ts": { name: "Webpack", category: "build" },
    "docker-compose.yml": { name: "Docker Compose", category: "devops" },
    "docker-compose.yaml": { name: "Docker Compose", category: "devops" },
    "Dockerfile": { name: "Docker", category: "devops" },
    ".dockerignore": { name: "Docker", category: "devops" },
    "drizzle.config.ts": { name: "Drizzle ORM", category: "database" },
    "prisma/schema.prisma": { name: "Prisma", category: "database" },
    "vercel.json": { name: "Vercel", category: "cloud" },
    "netlify.toml": { name: "Netlify", category: "cloud" },
    "wrangler.toml": { name: "Cloudflare Workers", category: "cloud" },
    ".github/workflows": { name: "GitHub Actions", category: "devops" },
    ".gitlab-ci.yml": { name: "GitLab CI", category: "devops" },
    "Makefile": { name: "Make", category: "build" },
    "CMakeLists.txt": { name: "CMake", category: "build" },
    "go.mod": { name: "Go Modules", category: "build" },
    "Cargo.toml": { name: "Cargo", category: "build" },
    "requirements.txt": { name: "pip", category: "build" },
    "pyproject.toml": { name: "Python (pyproject)", category: "build" },
    "setup.py": { name: "setuptools", category: "build" },
  };

  for (const file of configFiles) {
    const basename = file.split("/").pop() || file;
    for (const [pattern, tech] of Object.entries(CONFIG_TECH)) {
      if (basename === pattern || file.includes(pattern)) {
        techs.push({
          id: `tech-${tech.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          name: tech.name,
          category: tech.category,
          confidence: 55, // Config detection = 55% confidence
          detectionSource: "config",
          repositories: [repoName],
          files: [file],
          usageCount: 1,
        });
        break;
      }
    }
  }

  return techs;
}

export function detectTechnologiesFromCI(ciFiles: string[], repoName: string): TechnologyEvidence[] {
  const techs: TechnologyEvidence[] = [];
  for (const file of ciFiles) {
    if (file.includes(".github/workflows")) {
      techs.push({
        id: "tech-github-actions",
        name: "GitHub Actions",
        category: "devops",
        confidence: 60,
        detectionSource: "ci_cd",
        repositories: [repoName],
        files: [file],
        usageCount: 1,
      });
    }
  }
  return techs;
}
