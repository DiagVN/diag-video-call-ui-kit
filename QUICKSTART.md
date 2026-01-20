# DIAG Video Call UI Kit - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 2. Set Up Environment

For the playground app, create `apps/playground/.env.local`:

```env
VITE_AGORA_APP_ID=your_agora_app_id
VITE_DEFAULT_MODE=mock
VITE_DEFAULT_LANGUAGE=vi
```

> **Note:** You can test in Mock Mode without Agora credentials. Set `VITE_DEFAULT_MODE=mock` to try the UI without connecting to Agora servers.

### 3. Run Development Server

```bash
# Start the playground demo
pnpm dev

# Or build all packages
pnpm build
```

The playground will be available at `http://localhost:5173`

---

## 📚 Integration Guide

### Basic Setup

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVideoCallI18n } from '@diag/video-call-ui-kit'
import '@diag/video-call-ui-kit/style.css'

const app = createApp(App)
const pinia = createPinia()
const i18n = createI18n(createVideoCallI18n({}, 'vi'))

app.use(pinia).use(i18n).mount('#app')
```

### Using with Agora

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useVideoCallStore, createEventBus } from '@diag/video-call-core'
import { DiagPreJoinPanel, DiagCallShell, DiagVideoGrid } from '@diag/video-call-ui-kit'
import { createAgoraAdapter, createAgoraRenderer } from '@diag/agora-web-adapter'

const store = useVideoCallStore()

onMounted(async () => {
  // Initialize adapter
  const eventBus = createEventBus()
  const adapter = createAgoraAdapter({
    appId: 'YOUR_AGORA_APP_ID',
    eventBus,
    debug: true
  })

  store.setAdapter(adapter)
  await store.init()
})

async function handleJoin(options) {
  await store.join({
    channel: 'your-channel-name',
    uid: generateUID(),
    joinMuted: options.joinMuted,
    joinVideoOff: options.joinVideoOff,
    displayName: 'User Name'
  })
}
</script>

<template>
  <DiagPreJoinPanel
    v-if="store.callState === 'prejoin'"
    :devices="store.devices"
    @join="handleJoin"
  />

  <DiagCallShell
    v-else-if="store.isInCall"
    :call-state="store.callState"
    :duration="store.stats.duration"
  >
    <DiagVideoGrid :participants="store.participants" />
  </DiagCallShell>
</template>
```

---

## 🎨 Theming

### Override CSS Variables

```css
:root {
  /* Primary Colors */
  --vc-primary: #2B85C5;
  --vc-primary-strong: #024473;
  
  /* Customize radius */
  --vc-radius: 12px;
  
  /* Customize shadows */
  --vc-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Dark Theme */
.vc-theme-dark {
  --vc-bg: #0B1B2B;
  --vc-surface: #1A2C3E;
}
```

### Apply Dark Theme

```vue
<template>
  <div class="vc-theme-dark">
    <DiagCallShell>...</DiagCallShell>
  </div>
</template>
```

---

## 🌍 i18n

### Add Custom Translations

```typescript
import { createVideoCallI18n } from '@diag/video-call-ui-kit'

const i18n = createI18n(
  createVideoCallI18n({
    vi: {
      vc: {
        custom: {
          welcome: 'Chào mừng đến cuộc gọi'
        }
      }
    },
    en: {
      vc: {
        custom: {
          welcome: 'Welcome to the call'
        }
      }
    }
  })
)
```

### Switch Language at Runtime

```typescript
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
locale.value = 'en' // or 'vi'
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

---

## 📦 Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @diag/video-call-core build

# Build playground
pnpm build:playground
```

---

## 🏗️ Project Structure

```
diag-video-call-ui-kit/
├── packages/
│   ├── core/                    # Headless state machine
│   │   └── src/
│   │       ├── types.ts         # TypeScript definitions
│   │       ├── events.ts        # Event bus types
│   │       ├── actions.ts       # Adapter interface
│   │       └── store.ts         # Pinia store
│   ├── ui-kit/                  # Vue components
│   │   └── src/
│   │       ├── components/      # UI components
│   │       ├── styles/          # DIAG tokens & base styles
│   │       └── i18n/            # Vi/En translations
│   └── adapters/
│       └── agora-web/           # Agora SDK adapter
│           └── src/
│               └── adapter.ts   # Agora implementation
└── apps/
    └── playground/              # Demo app
        └── src/
            ├── views/
            │   ├── PreJoinView.vue
            │   └── InCallView.vue
            └── main.ts
```

---

## 🔧 Common Tasks

### Add a New Component

1. Create component in `packages/ui-kit/src/components/`
2. Export from `packages/ui-kit/src/index.ts`
3. Add i18n keys to `packages/ui-kit/src/i18n/messages.ts`
4. Add tests in `packages/ui-kit/src/__tests__/`

### Add a New Event Type

1. Update `EventMap` in `packages/core/src/events.ts`
2. Emit from adapter in `packages/adapters/agora-web/src/adapter.ts`
3. Handle in store `packages/core/src/store.ts`

---

## 🆘 Troubleshooting

### "Adapter not set" Error

Make sure to call `store.setAdapter()` before `store.init()`:

```typescript
const adapter = createAgoraAdapter(config)
store.setAdapter(adapter)
await store.init()
```

### Video Not Showing

1. Check if renderer is properly passed to `DiagVideoTile`
2. Ensure video track is published
3. Verify participant has `videoEnabled: true`

### i18n Keys Not Working

1. Ensure vue-i18n is installed and configured
2. Check that component has access to i18n instance
3. Verify message keys exist in `messages.ts`

---

## 📞 Support

For issues or questions:
- Check the [README.md](README.md) for detailed documentation
- Review component TypeScript definitions for API details
- Examine playground code for usage examples

---

**Built with ❤️ for DIAG by the Engineering Team**
