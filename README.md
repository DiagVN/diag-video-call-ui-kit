# DIAG Video Call UI Kit

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Vue](https://img.shields.io/badge/vue-3.4+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.4+-blue.svg)
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

## ✨ Features

- 🎨 **DIAG Brand Styling** - Clean clinical design with DIAG blue gradients, rounded corners, soft shadows
- 🌍 **i18n Ready** - Built-in Vietnamese and English translations with runtime switching
- 🔌 **SDK-Agnostic Architecture** - Headless core layer with pluggable adapters (Agora included)
- 📱 **Responsive** - Mobile-first design that works on all screen sizes
- ♿ **Accessible** - ARIA labels, focus management, keyboard shortcuts
- 🌙 **Dark Mode** - Built-in light and dark theme support
- 📦 **Tree-Shakeable** - ESM exports with TypeScript definitions
- 🧪 **Tested** - Vitest + Vue Test Utils coverage

## 📦 Packages

| Package | Description |
|---------|-------------|
| [`@diag/video-call-core`](./packages/core) | Headless state machine (SSR-safe) |
| [`@diag/video-call-ui-kit`](./packages/ui-kit) | Vue 3 components + DIAG styles |
| [`@diag/agora-web-adapter`](./packages/adapters/agora-web) | Agora Web SDK adapter |

## 📁 Project Structure

```
diag-video-call-ui-kit/
├── packages/
│   ├── core/                  # Headless state machine (SSR-safe)
│   │   ├── src/
│   │   │   ├── types.ts       # TypeScript definitions
│   │   │   ├── events.ts      # Event bus types
│   │   │   ├── actions.ts     # Actions interface
│   │   │   └── store.ts       # Pinia store
│   │   └── package.json
│   ├── ui-kit/                # Vue components + DIAG styles
│   │   ├── src/
│   │   │   ├── components/    # Vue components
│   │   │   ├── styles/        # CSS tokens & base styles
│   │   │   └── i18n/          # Translation messages
│   │   └── package.json
│   └── adapters/
│       └── agora-web/         # Agora Web SDK adapter
│           ├── src/
│           │   └── adapter.ts # AgoraWebAdapter implementation
│           └── package.json
└── apps/
    └── playground/            # Demo app with mock/Agora modes
```

## 🚀 Installation

### Using GitHub Packages

Configure npm to use GitHub Packages for the `@diag` scope:

```bash
# Create or edit .npmrc in your project root
echo "@diag:registry=https://npm.pkg.github.com" >> .npmrc
```

Then install the packages:

```bash
# Using pnpm (recommended)
pnpm add @diag/video-call-core @diag/video-call-ui-kit

# With Agora adapter
pnpm add @diag/agora-web-adapter agora-rtc-sdk-ng

# Using npm
npm install @diag/video-call-core @diag/video-call-ui-kit

# Using yarn
yarn add @diag/video-call-core @diag/video-call-ui-kit
```

### Peer Dependencies

```bash
pnpm add vue@^3.4.0 pinia@^2.1.7 vue-i18n@^9.9.0
```

## 🏃 Quick Start

### 1. Setup Vue App

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVideoCallI18n } from '@diag/video-call-ui-kit'

// Import DIAG styles
import '@diag/video-call-ui-kit/style.css'

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
import { DiagPreJoinPanel } from '@diag/video-call-ui-kit'
import { useVideoCallStore, createEventBus } from '@diag/video-call-core'
import { createAgoraAdapter } from '@diag/agora-web-adapter'
import type { Devices } from '@diag/video-call-core'

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
} from '@diag/video-call-ui-kit'
import { useVideoCallStore } from '@diag/video-call-core'
import { createAgoraRenderer } from '@diag/agora-web-adapter'

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
import { useVideoCallStore } from '@diag/video-call-core'

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
```

### Event Bus

```ts
import { createEventBus } from '@diag/video-call-core'

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
} from '@diag/video-call-core'
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
import { createVideoCallI18n } from '@diag/video-call-ui-kit'

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
git clone https://github.com/YOUR_ORG/diag-video-call-ui-kit.git
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
