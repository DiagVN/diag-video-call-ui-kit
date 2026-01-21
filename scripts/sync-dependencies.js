#!/usr/bin/env node

/**
 * Sync dependencies between root package.json and workspace packages
 * 
 * This script ensures that common dependencies (vue, typescript, vite, etc.)
 * are kept in sync across the workspace to avoid version conflicts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Dependencies to sync from root to packages
const SYNC_DEV_DEPS = [
  'typescript',
  'vite',
  '@types/node',
  '@vitejs/plugin-vue'
];

const SYNC_PEER_DEPS = [
  'vue',
  'vue-i18n',
  'pinia'
];

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function syncDependencies() {
  const rootPkg = readJsonFile(path.join(rootDir, 'package.json'));
  
  const packagePaths = [
    'packages/core',
    'packages/ui-kit',
    'packages/adapters/agora-web'
  ];

  console.log('🔄 Syncing dependencies...\n');

  let syncedCount = 0;

  packagePaths.forEach(pkgPath => {
    const pkgJsonPath = path.join(rootDir, pkgPath, 'package.json');
    
    if (!fs.existsSync(pkgJsonPath)) {
      console.warn(`⚠️  ${pkgPath}/package.json not found`);
      return;
    }

    const pkgJson = readJsonFile(pkgJsonPath);
    let updated = false;

    // Sync devDependencies
    if (pkgJson.devDependencies) {
      SYNC_DEV_DEPS.forEach(dep => {
        if (rootPkg.devDependencies && rootPkg.devDependencies[dep]) {
          const rootVersion = rootPkg.devDependencies[dep];
          const pkgVersion = pkgJson.devDependencies[dep];
          
          if (pkgVersion !== rootVersion) {
            console.log(`  📦 ${pkgPath}: ${dep}`);
            console.log(`     ${pkgVersion} → ${rootVersion}`);
            pkgJson.devDependencies[dep] = rootVersion;
            updated = true;
            syncedCount++;
          }
        }
      });
    }

    // Sync peerDependencies
    if (pkgJson.peerDependencies) {
      SYNC_PEER_DEPS.forEach(dep => {
        if (rootPkg.devDependencies && rootPkg.devDependencies[dep]) {
          const rootVersion = rootPkg.devDependencies[dep];
          const pkgVersion = pkgJson.peerDependencies[dep];
          
          if (pkgVersion !== rootVersion) {
            console.log(`  📦 ${pkgPath}: ${dep} (peer)`);
            console.log(`     ${pkgVersion} → ${rootVersion}`);
            pkgJson.peerDependencies[dep] = rootVersion;
            updated = true;
            syncedCount++;
          }
        }
      });
    }

    if (updated) {
      writeJsonFile(pkgJsonPath, pkgJson);
      console.log(`  ✅ ${pkgPath} updated\n`);
    }
  });

  if (syncedCount === 0) {
    console.log('✅ All dependencies are already in sync!\n');
  } else {
    console.log(`\n✅ Synced ${syncedCount} dependencies`);
    console.log('📝 Run "pnpm install" to update lock file\n');
  }
}

try {
  syncDependencies();
} catch (error) {
  console.error('❌ Error syncing dependencies:', error.message);
  process.exit(1);
}
