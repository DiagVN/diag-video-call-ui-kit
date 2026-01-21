# Dependency Synchronization

## Overview

To maintain consistency across the workspace and prevent version conflicts, a dependency synchronization system has been implemented. This ensures that common dependencies like `vue`, `typescript`, `vite`, and others are kept in sync between the root `package.json` and all workspace packages.

## Automatically Synced Dependencies

### devDependencies (from root to packages)
- `typescript`
- `vite`
- `@types/node`
- `@vitejs/plugin-vue`

### peerDependencies (from root to packages)
- `vue`
- `vue-i18n`
- `pinia`

## Usage

### Manual Sync
To manually synchronize all dependencies across packages:

```bash
pnpm sync-deps
```

This will:
1. Compare root `package.json` with each package's `package.json`
2. Update any mismatched versions in packages
3. Display a report of changes
4. Suggest running `pnpm install` if changes were made

### Automatic Sync
When updating root dependencies, follow this workflow:

```bash
# 1. Update dependencies in root package.json manually
# 2. Run sync script
pnpm sync-deps

# 3. Install to update lock file
pnpm install

# 4. Build to verify
pnpm build
```

## Example Output

```
🔄 Syncing dependencies...

  📦 packages/core: vue-i18n (peer)
     ^9.9.0 → ^11.2.8
  ✅ packages/core updated

  📦 packages/ui-kit: typescript
     ~5.4.0 → ~5.5.0
  ✅ packages/ui-kit updated

✅ Synced 2 dependencies
📝 Run "pnpm install" to update lock file
```

## Adding New Dependencies to Sync

To add a new dependency to the automatic sync system:

1. Open `scripts/sync-dependencies.js`
2. Add the dependency name to either `SYNC_DEV_DEPS` or `SYNC_PEER_DEPS` array
3. Run `pnpm sync-deps` to apply the sync

Example:
```javascript
const SYNC_DEV_DEPS = [
  'typescript',
  'vite',
  '@types/node',
  '@vitejs/plugin-vue',
  'new-dependency'  // Add here
];
```

## Why This Matters

- **Version Consistency**: Prevents "works on my machine" issues caused by different dependency versions
- **Security**: Ensures security patches are applied uniformly across packages
- **Build Stability**: Reduces conflicts and build errors from version mismatches
- **Maintenance**: Simplifies the workflow when updating dependencies

## Manual Override

If a package needs a specific version different from the root:

1. Edit the package's `package.json` directly
2. Add a comment explaining why the different version is needed
3. Document the reason in your PR/commit

Example:
```json
{
  "devDependencies": {
    "typescript": "~5.4.0"  // Keep older for compatibility with legacy code
  }
}
```
