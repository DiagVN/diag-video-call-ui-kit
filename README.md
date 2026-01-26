# DIAG Video Call UI Kit

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.7-blue.svg)
![Vue](https://img.shields.io/badge/vue-3.4+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.4+-blue.svg)
![Pinia](https://img.shields.io/badge/pinia-3.0+-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Production-ready Vue 3 Video Call UI Kit with Agora integration, Vietnamese/English i18n, and DIAG brand styling.**

[Installation](#-installation) •
[Quick Start](#-quick-start) •
[Components](#-components) •
[API Reference](#-api-reference) •
[Theming](#-theming) •
[i18n](#-internationalization)

</div>

---

## 🆕 What's New in v2.0.7

- 🎭 **Virtual Background** - Blur, solid color, or custom image backgrounds (requires optional extension)
- 💅 **Beauty Effects** - Smoothing, lightening, redness, sharpness controls
- 🔇 **AI Noise Suppression** - Advanced noise reduction for clear audio
- 🗣️ **Speech-to-Text** - Real-time transcript support with Agora STT integration
- 🏗️ **Redesigned Architecture** - Cleaner separation with Pinia 3.0+ store
- 📝 **Full TypeScript** - Strict typing throughout with better DX
- ⚡ **Optimized Bundle** - Tree-shakeable with optional extensions externalized
- 📦 **Dual Format** - ESM and CommonJS outputs for maximum compatibility

> **Migration:** v2 packages (`*-v2`) can be used alongside v1 packages during migration.

## ✨ Features

- 🎨 **DIAG Brand Styling** - Clean clinical design with DIAG blue gradients, rounded corners, soft shadows
- 🎭 **Virtual Background** - Blur, color, and image backgrounds with preview/apply workflow
- 🗣️ **Speech-to-Text** - Real-time transcription with language support (backend integration guide included)
- 🌍 **i18n Ready** - Built-in Vietnamese and English translations with runtime switching
- 🔌 **SDK-Agnostic Architecture** - Headless core layer with pluggable adapters (Agora included)
- 📱 **Responsive** - Mobile-first design that works on all screen sizes
- ♿ **Accessible** - ARIA labels, focus management, keyboard shortcuts
- 🌙 **Dark Mode** - Built-in light and dark theme support
- 📦 **Tree-Shakeable** - ESM exports with TypeScript definitions
- 🧪 **Tested** - Vitest + Vue Test Utils coverage

## 📦 Packages

### V2 Packages (Recommended)

| Package | Description |
|---------|-------------|
| [`@diagvn/video-call-core-v2`](./packages/core-v2) | Redesigned core with Pinia store |
| [`@diagvn/video-call-ui-kit-v2`](./packages/ui-kit-v2) | Vue 3 Composition API components |
| [`@diagvn/agora-web-adapter-v2`](./packages/adapters/agora-web-v2) | Agora adapter with Virtual Background |

### V1 Packages (Legacy)

| Package | Description |
|---------|-------------|
| [`@diagvn/video-call-core`](./packages/core) | Headless state machine (SSR-safe) |
| [`@diagvn/video-call-ui-kit`](./packages/ui-kit) | Vue 3 components + DIAG styles |
| [`@diagvn/agora-web-adapter`](./packages/adapters/agora-web) | Agora Web SDK adapter |

## 📁 Project Structure

```
diag-video-call-ui-kit/
├── packages/
│   ├── core-v2/               # V2 Core with Pinia store
│   ├── ui-kit-v2/             # V2 Vue components
│   ├── adapters/
│   │   └── agora-web-v2/      # V2 Agora adapter with VB
│   ├── core/                  # V1 Headless state machine
│   ├── ui-kit/                # V1 Vue components
│   └── adapters/
│       └── agora-web/         # V1 Agora adapter
├── apps/
│   ├── playground-v2/         # V2 Demo app
│   └── playground/            # V1 Demo app
└── docs/
    ├── VIRTUAL_BACKGROUND_GUIDE.md
    ├── STT_BACKEND_INTEGRATION.md
    └── SEPARATE_VIEWS_GUIDE.md
```

## 🚀 Installation

### Using GitHub Packages

Configure npm to use GitHub Packages for the `@diagvn` scope:

```bash
# Create or edit .npmrc in your project root
echo "@diagvn:registry=https://npm.pkg.github.com" >> .npmrc
```

Then install the packages:

**V2 Packages (Recommended):**
```bash
# Core + UI Kit
pnpm add @diagvn/video-call-core-v2 @diagvn/video-call-ui-kit-v2

# With Agora adapter
pnpm add @diagvn/agora-web-adapter-v2 agora-rtc-sdk-ng

# Optional: Virtual background, beauty effects, noise suppression
pnpm add agora-extension-virtual-background@^1.1.3
pnpm add agora-extension-beauty-effect@^1.0.2-beta
pnpm add agora-extension-ai-denoiser@^1.1.0
```

**V1 Packages (Legacy):**
```bash
pnpm add @diagvn/video-call-core @diagvn/video-call-ui-kit
pnpm add @diagvn/agora-web-adapter agora-rtc-sdk-ng
```

### Peer Dependencies

**For V2 packages:**
```bash
pnpm add vue@^3.4.0 pinia@^3.0.4 vue-i18n@^11.2.8
```

**For V1 packages:**
```bash
pnpm add vue@^3.4.0 pinia@^3.0.4 vue-i18n@^11.2.8
```

## 🏃 Quick Start (V2)

### Option A: All-in-One DiagCallShell

The simplest approach - one component handles everything:

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVideoCallI18n } from '@diagvn/video-call-ui-kit-v2'
import '@diagvn/video-call-ui-kit-v2/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(createI18n(createVideoCallI18n({}, 'vi')))
app.mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { DiagCallShell } from '@diagvn/video-call-ui-kit-v2'
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2'

const store = useVideoCallStoreV2()

onMounted(async () => {
  const adapter = createAgoraAdapter({
    appId: import.meta.env.VITE_AGORA_APP_ID
  })
  store.setAdapter(adapter)
  await store.init()
})
</script>

<template>
  <DiagCallShell
    :channel="'my-room'"
    :uid="12345"
    :display-name="'John'"
    @leave="() => console.log('Left call')"
  />
</template>
```

### Option B: Compose Individual Components

For full control, compose components yourself:

```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  DiagPreJoinPanel,
  DiagVideoGrid,
  DiagCallControls,
  DiagToasts
} from '@diagvn/video-call-ui-kit-v2'
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2'

const store = useVideoCallStoreV2()
const isInCall = computed(() => store.callState === 'in_call')

onMounted(async () => {
  const adapter = createAgoraAdapter({
    appId: import.meta.env.VITE_AGORA_APP_ID
  })
  store.setAdapter(adapter)
  await store.init()
})

async function handleJoin(opts: { joinMuted: boolean; joinVideoOff: boolean }) {
  await store.join({
    channel: 'my-room',
    uid: 12345,
    displayName: 'John',
    ...opts
  })
}
</script>

<template>
  <!-- Pre-join -->
  <DiagPreJoinPanel
    v-if="!isInCall"
    :devices="store.devices"
    @join="handleJoin"
  />

  <!-- In-call -->
  <template v-else>
    <DiagVideoGrid :participants="store.participants" />
    <DiagCallControls
      :is-muted="store.isMuted"
      :is-video-off="store.isVideoOff"
      @toggle-mic="store.toggleMic"
      @toggle-cam="store.toggleCam"
      @leave="store.leave"
    />
  </template>

  <DiagToasts :toasts="store.toasts" @dismiss="store.dismissToast" />
</template>
```

---

## 🏃 Quick Start (V1 - Legacy)

### 1. Setup Vue App

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVideoCallI18n } from '@diagvn/video-call-ui-kit'

// Import DIAG styles
import '@diagvn/video-call-ui-kit/style.css'

import App from './App.vue'

const app = createApp(App)

// Setup Pinia
app.use(createPinia())

// Setup i18n with video call messages
app.use(createI18n(createVideoCallI18n({}, 'vi'))) // Default to Vietnamese

app.mount('#app')
```

### 2. Pre-Join Screen

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DiagPreJoinPanel } from '@diagvn/video-call-ui-kit'
import { useVideoCallStore, createEventBus } from '@diagvn/video-call-core'
import { createAgoraAdapter } from '@diagvn/agora-web-adapter'
import type { Devices } from '@diagvn/video-call-core'

const store = useVideoCallStore()
const devices = ref<Devices>({ microphones: [], cameras: [], speakers: [] })

onMounted(async () => {
  // Initialize adapter
  const eventBus = createEventBus()
  const adapter = createAgoraAdapter({
    appId: import.meta.env.VITE_AGORA_APP_ID,
    eventBus,
    debug: true
  })

  store.setAdapter(adapter)
  await store.init()
  devices.value = await adapter.getDevices()
})

async function handleJoin(options: { joinMuted: boolean; joinVideoOff: boolean }) {
  await store.join({
    channel: 'my-channel',
    uid: Math.floor(Math.random() * 10000),
    token: 'YOUR_TOKEN', // From your token server
    ...options
  })
}
</script>

<template>
  <DiagPreJoinPanel
    :devices="devices"
    @join="handleJoin"
    @device-change="store.setInputDevice"
  />
</template>
```

### 3. In-Call Screen

```vue
<script setup lang="ts">
import { computed } from 'vue'
import {
  DiagCallShell,
  DiagVideoGrid,
  DiagCallControls,
  DiagBanner
} from '@diagvn/video-call-ui-kit'
import { useVideoCallStore } from '@diagvn/video-call-core'
import { createAgoraRenderer } from '@diagvn/agora-web-adapter'

const store = useVideoCallStore()
const renderer = createAgoraRenderer()

const participants = computed(() => store.participants)
const isReconnecting = computed(() => store.callState === 'reconnecting')
</script>

<template>
  <DiagCallShell
    mode="grid"
    :call-state="store.callState"
    :duration="store.duration"
    :network-quality="store.networkQuality"
  >
    <template #default>
      <DiagBanner v-if="isReconnecting" type="reconnecting" />
      <DiagVideoGrid :participants="participants" :renderer="renderer" />
    </template>

    <template #bottombar>
      <DiagCallControls
        :is-muted="store.isMuted"
        :is-video-off="store.isVideoOff"
        :is-screen-sharing="store.isScreenSharing"
        :participant-count="participants.length"
        @toggle-mic="store.toggleMic"
        @toggle-cam="store.toggleCam"
        @share-screen="store.startScreenShare"
        @stop-share="store.stopScreenShare"
        @leave="store.leave"
      />
    </template>
  </DiagCallShell>
</template>
```

## 🧩 Components

### DiagPreJoinPanel

Device picker with camera preview, join options, and language switcher.

```vue
<DiagPreJoinPanel
  :devices="devices"
  :has-video-preview="true"
  @join="handleJoin"
  @device-change="handleDeviceChange"
  @language-change="handleLanguageChange"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `devices` | `Devices` | Required | Available media devices |
| `hasVideoPreview` | `boolean` | `false` | Whether camera preview is active |

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ joinMuted: boolean; joinVideoOff: boolean }` | User clicked join |
| `device-change` | `{ micId?: string; camId?: string; speakerId?: string }` | Device selection changed |
| `language-change` | `string` | Language selection changed |

### DiagCallShell

Layout wrapper with status bar showing call state and duration.

```vue
<DiagCallShell
  mode="grid"
  :call-state="callState"
  :duration="duration"
  :network-quality="networkQuality"
  :show-status-bar="true"
  theme="light"
>
  <template #topbar><!-- Optional top bar --></template>
  <template #default><!-- Main content --></template>
  <template #bottombar><!-- Call controls --></template>
  <template #sidebar><!-- Optional sidebar --></template>
</DiagCallShell>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'grid' \| 'speaker' \| 'presentation'` | `'grid'` | Layout mode |
| `callState` | `CallState` | `'idle'` | Current call state |
| `duration` | `number` | `0` | Call duration in seconds |
| `networkQuality` | `NetworkQuality` | `0` | Network quality (0-5) |
| `showStatusBar` | `boolean` | `true` | Show status bar |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme |

### DiagCallControls

Control buttons for mic, camera, screen share, and leave.

```vue
<DiagCallControls
  :is-muted="isMuted"
  :is-video-off="isVideoOff"
  :is-screen-sharing="isScreenSharing"
  :show-switch-camera="true"
  :participant-count="5"
  @toggle-mic="handleToggleMic"
  @toggle-cam="handleToggleCam"
  @switch-camera="handleSwitchCamera"
  @share-screen="handleShareScreen"
  @stop-share="handleStopShare"
  @open-participants="handleOpenParticipants"
  @more="handleMore"
  @leave="handleLeave"
/>
```

### DiagVideoGrid

Responsive grid of video tiles with automatic layout.

```vue
<DiagVideoGrid
  :participants="participants"
  :renderer="renderer"
  :show-network-quality="true"
  :show-role="true"
/>
```

### DiagVideoTile

Individual video tile with participant info overlay.

```vue
<DiagVideoTile
  :participant="participant"
  :renderer="renderer"
  :video-kind="'camera'"
  :show-network-quality="true"
  :show-role="true"
/>
```

### DiagToasts

Toast notifications for errors and info messages.

```vue
<DiagToasts :toasts="toasts" @dismiss="handleDismiss" />
```

### DiagBanner

Status banners for reconnecting, poor network, recording.

```vue
<DiagBanner
  type="reconnecting"
  :dismissible="false"
  @dismiss="handleDismiss"
/>
```

## 📚 API Reference

### Core Store

```ts
import { useVideoCallStore } from '@diagvn/video-call-core'

const store = useVideoCallStore()

// State (readonly)
store.callState      // 'idle' | 'prejoin' | 'connecting' | 'in_call' | 'reconnecting' | 'ended' | 'error'
store.participants   // Participant[]
store.localParticipant // Participant | null
store.duration       // number (seconds)
store.isMuted        // boolean
store.isVideoOff     // boolean
store.isScreenSharing // boolean
store.networkQuality // 0 | 1 | 2 | 3 | 4 | 5
store.error          // CallError | null
store.toasts         // ToastMessage[]

// Actions
await store.init()
await store.join({ channel, uid, token?, joinMuted?, joinVideoOff?, displayName? })
await store.leave()
await store.toggleMic()
await store.toggleCam()
await store.switchCamera()
await store.startScreenShare()
await store.stopScreenShare()
await store.setInputDevice({ micId?, camId? })
await store.setOutputDevice(speakerId)
await store.setQuality('720p')
await store.refreshToken(newToken)
store.dismissToast(id)
store.dismissError()
store.destroy()

// Transcript/STT (V2 only)
await store.startTranscript('en-US')  // Start listening for transcript data
await store.stopTranscript()           // Stop transcript
await store.toggleTranscript('vi-VN')  // Toggle with language
store.clearTranscript()                 // Clear transcript entries
```

### Transcript Events (V2)

```ts
// Listen for transcript entries
store.eventBus.on('transcript-entry', (entry) => {
  console.log(`[${entry.participantName}]: ${entry.text}`)
  // entry.isFinal - true if final, false for interim
  // entry.confidence - confidence score (0-1)
})

// Transcript state changes
store.eventBus.on('transcript-started', ({ language }) => { ... })
store.eventBus.on('transcript-stopped', () => { ... })
store.eventBus.on('transcript-error', ({ code, message }) => { ... })
```

> **Note:** Transcript requires backend integration with Agora Real-time STT. See [STT Backend Integration Guide](./docs/STT_BACKEND_INTEGRATION.md) for setup instructions.

### Event Bus

```ts
import { createEventBus } from '@diagvn/video-call-core'

const eventBus = createEventBus()

// Listen to events
eventBus.on('participant-joined', (participant) => { ... })
eventBus.on('participant-left', ({ id }) => { ... })
eventBus.on('call-state-changed', ({ state }) => { ... })
eventBus.on('token-will-expire', ({ expiresIn }) => { ... })
eventBus.on('token-expired', () => { ... })
eventBus.on('error', (error) => { ... })
eventBus.on('network-quality-changed', ({ uid, quality }) => { ... })
eventBus.on('speaking-changed', ({ uid, isSpeaking }) => { ... })

// Remove listener
eventBus.off('participant-joined', handler)

// Clear all
eventBus.clear()
```

### Types

```ts
import type {
  CallState,
  Participant,
  ParticipantRole,
  NetworkQuality,
  MediaDevice,
  Devices,
  CallError,
  VideoQuality,
  JoinOptions,
  DeviceSelection,
  ToastMessage
} from '@diagvn/video-call-core'
```

## 🎨 Theming

### CSS Variables

Override these CSS variables to customize the theme:

```css
:root {
  /* Primary Colors */
  --vc-primary: #0066CC;
  --vc-primary-hover: #0052A3;
  --vc-primary-deep: #003D7A;
  --vc-gradient: linear-gradient(135deg, #0066CC 0%, #0052A3 100%);

  /* Backgrounds */
  --vc-bg: #F5F7FA;
  --vc-surface: #FFFFFF;
  --vc-video-tile-bg: #1A2C3E;

  /* Text */
  --vc-fg: #1A2C3E;
  --vc-fg-muted: #6B7B8C;
  --vc-fg-subtle: #9CA3AF;

  /* Borders & Shadows */
  --vc-border: #E5E7EB;
  --vc-radius: 12px;
  --vc-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  /* Status Colors */
  --vc-success: #10B981;
  --vc-warn: #F59E0B;
  --vc-danger: #EF4444;
  --vc-info: var(--vc-primary);
}
```

### Dark Theme

```css
.vc-theme-dark {
  --vc-bg: #0B1B2B;
  --vc-surface: #1A2C3E;
  --vc-fg: #F9FAFB;
  --vc-fg-muted: #9CA3AF;
  --vc-border: #374151;
}
```

Enable dark theme by adding the class:

```vue
<DiagCallShell theme="dark">...</DiagCallShell>
```

Or toggle globally:

```ts
document.documentElement.classList.toggle('vc-theme-dark')
```

## 🌍 Internationalization

### Default Languages

Built-in support for Vietnamese (`vi`) and English (`en`).

### Setup

```ts
import { createI18n } from 'vue-i18n'
import { createVideoCallI18n } from '@diagvn/video-call-ui-kit'

// Default locale Vietnamese
const i18n = createI18n(createVideoCallI18n({}, 'vi'))

// With custom messages
const i18n = createI18n(createVideoCallI18n({
  vi: {
    vc: {
      custom: {
        myLabel: 'Nhãn của tôi'
      }
    }
  },
  en: {
    vc: {
      custom: {
        myLabel: 'My Label'
      }
    }
  }
}))
```

### Runtime Language Switch

```ts
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
locale.value = 'en' // Switch to English
```

## 📖 Guides

### Virtual Background

For detailed instructions on implementing Virtual Background with preview/apply workflow, see [Virtual Background Guide](./docs/VIRTUAL_BACKGROUND_GUIDE.md).

### Speech-to-Text Integration

Complete guide for integrating Agora Real-time STT with backend implementation examples:
- [STT Backend Integration Guide](./docs/STT_BACKEND_INTEGRATION.md)

### Separate Views Pattern

Learn how to implement separate Pre-Join and In-Call views with route navigation:
- [Separate Views Guide](./docs/SEPARATE_VIEWS_GUIDE.md)

### Available Keys

All translation keys are prefixed with `vc.`:

- `vc.btn.*` - Button labels (join, leave, mute, etc.)
- `vc.state.*` - Call states (connecting, in call, etc.)
- `vc.err.*` - Error messages
- `vc.banner.*` - Banner messages
- `vc.label.*` - Form labels
- `vc.tooltip.*` - Tooltips
- `vc.permission.*` - Permission messages
- `vc.placeholder.*` - Input placeholders
- `vc.action.*` - Action labels
- `vc.quality.*` - Quality levels
- `vc.network.*` - Network quality labels
- `vc.time.*` - Time units

## 🔧 Development

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Setup

```bash
# Clone repository
git clone https://github.com/DiagVN/diag-video-call-ui-kit.git
cd diag-video-call-ui-kit

# Install dependencies
pnpm install

# Run playground
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint & format
pnpm lint
pnpm format
```

### Release via CI/CD

This repo ships packages through GitHub Actions. Two options:

- Tag-based release:
  - Bump versions in each workspace package (e.g., `packages/core`, `packages/ui-kit`, `packages/adapters/agora-web`).
  - Create and push a tag following `vX.Y.Z` (for example `v1.0.0`).
  - CI will run tests, build all packages, publish to GitHub Packages, and create a GitHub Release.

- Manual dispatch with version:
  - In GitHub → Actions → "Publish Packages", click "Run workflow".
  - Provide `version` (e.g., `1.0.1`). The workflow will publish using that version without committing version bumps.

Notes:
- Publishing uses the repository `GITHUB_TOKEN` with `packages: write` permission; no extra secrets required.
- Consumers must configure `.npmrc` with `@diagvn:registry=https://npm.pkg.github.com`.
- The workflow runs on `ubuntu-latest` with Node 20 and pnpm, and caches dependencies for speed.

### Playground Environment

Create `apps/playground/.env.local`:

```env
VITE_AGORA_APP_ID=your_agora_app_id
VITE_TOKEN_SERVER_URL=https://your-token-server.com/rtc-token
VITE_DEFAULT_MODE=agora
```

## 📄 License

MIT © DIAG

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

---

<div align="center">
  Made with ❤️ by the DIAG Team
</div>
