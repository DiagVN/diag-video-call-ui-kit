# Type Definitions Fix

## Problem
The packages were missing proper type definition generation, making them unfriendly to TypeScript projects that consume these packages.

## Solution
Added automatic TypeScript declaration file generation to all packages using `vite-plugin-dts`.

### Changes Made

#### 1. Installation
- Added `vite-plugin-dts` as a dev dependency to the workspace root

#### 2. Updated Vite Configurations
All three packages now use `vite-plugin-dts` in their `vite.config.ts`:
- `packages/core/vite.config.ts`
- `packages/ui-kit/vite.config.ts`
- `packages/adapters/agora-web/vite.config.ts`

```typescript
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.spec.ts']
    })
  ],
  // ... rest of config
})
```

#### 3. Updated TypeScript Build Configurations
Updated all `tsconfig.build.json` files to properly emit declaration files:
- Removed `emitDeclarationOnly: true` (vite-plugin-dts handles this)
- Removed `declarationDir` (handled by vite-plugin-dts)
- Added `declarationMap: true` for source map support
- Set `noEmit: false` to allow compilation

### Generated Type Definitions

After running `pnpm build`, the following `.d.ts` files are now generated:

**@diagvn/video-call-core:**
- `dist/index.d.ts`
- `dist/actions.d.ts`
- `dist/events.d.ts`
- `dist/eventBus.d.ts`
- `dist/store.d.ts`
- `dist/types.d.ts`

**@diagvn/video-call-ui-kit:**
- `dist/index.d.ts`
- `dist/i18n/index.d.ts`
- `dist/i18n/messages.d.ts`
- `dist/components/*.vue.d.ts` (for each Vue component)

**@diagvn/agora-web-adapter:**
- `dist/index.d.ts`
- `dist/adapter.d.ts`

### Benefits

1. **Full TypeScript Support**: Consumers can now use these packages in TypeScript projects with full type checking
2. **Intellisense**: IDE support (VSCode, WebStorm, etc.) will show proper type hints and completions
3. **Source Maps**: Declaration map files (`.d.ts.map`) are generated for better debugging
4. **Type Safety**: Ensures API contracts are maintained through type definitions

### Package.json Configuration

All packages already had proper `types` and `exports` fields configured:

```json
{
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

These fields now correctly point to the generated type definition files.

### Verification

You can verify the types are working by:

```typescript
// In a TypeScript project consuming these packages
import { useVideoCallStore } from '@diagvn/video-call-core'
import { createEventBus } from '@diagvn/video-call-core'

// Full TypeScript support with proper type hints
const store = useVideoCallStore()
const eventBus = createEventBus()
```
