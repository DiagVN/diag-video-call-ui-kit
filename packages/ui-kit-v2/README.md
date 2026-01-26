# @diagvn/video-call-ui-kit-v2

> Vue 3 UI components for video calling applications

[![npm version](https://img.shields.io/npm/v/@diagvn/video-call-ui-kit-v2.svg)](https://www.npmjs.com/package/@diagvn/video-call-ui-kit-v2)

## Installation

```bash
npm install @diagvn/video-call-ui-kit-v2 @diagvn/video-call-core-v2 @diagvn/agora-web-adapter-v2
# or
pnpm add @diagvn/video-call-ui-kit-v2 @diagvn/video-call-core-v2 @diagvn/agora-web-adapter-v2
```

### Peer Dependencies

```bash
npm install vue@^3.4.0 pinia@^3.0.4 vue-i18n@^11.2.8 agora-rtc-sdk-ng@^4.20.0
```

### Optional (for advanced features)

```bash
# Virtual background
npm install agora-extension-virtual-background@^1.1.3

# Beauty effects
npm install agora-extension-beauty-effect@^1.0.2-beta

# AI noise suppression
npm install agora-extension-ai-denoiser@^1.1.0
```

## Features

- 🎥 **Video Layouts** - Grid, speaker, spotlight, and PiP modes
- 🎨 **Customizable** - CSS variables, slots, themes (light/dark)
- 🌍 **i18n Ready** - Built-in English and Vietnamese
- 📱 **Responsive** - Desktop and mobile support
- 🎭 **Virtual Background** - Blur and image backgrounds
- ✨ **Beauty Effects** - Smoothing, lightening effects
- 💬 **Chat** - In-call messaging
- 📝 **Transcription** - Real-time speech-to-text
- 🚪 **Waiting Room** - Host approval flow

## Quick Start

### Option 1: All-in-One Component (Easiest)

```vue
<template>
  <DiagVideoCallV2
    :features="featureFlags"
    room-title="My Meeting"
    theme="dark"
    @join="handleJoin"
    @leave="handleLeave"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DiagVideoCallV2 } from '@diagvn/video-call-ui-kit-v2'
import '@diagvn/video-call-ui-kit-v2/style.css'
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2'

const store = useVideoCallStoreV2()

const featureFlags = {
  virtualBackground: true,
  beautyEffects: true,
  screenShare: true,
  chat: true,
  transcript: true
}

onMounted(async () => {
  const adapter = createAgoraAdapter({ appId: 'YOUR_APP_ID' })
  store.setAdapter(adapter)
  store.setFeatureFlags(featureFlags)
  await store.init()
})

const handleJoin = async (options) => {
  await store.join({
    channel: 'my-room',
    uid: Math.floor(Math.random() * 100000),
    displayName: 'User Name',
    ...options
  })
}

const handleLeave = () => {
  console.log('Call ended')
}
</script>
```

### Option 2: Compose Your Own UI (Advanced)

```vue
<template>
  <DiagCallShellV2>
    <template #topbar>
      <DiagTopBarV2
        :call-duration="store.callDuration"
        :is-recording="store.isRecording"
        :participant-count="store.participantCount"
      />
    </template>

    <template #main>
      <DiagVideoGridV2
        :participants="store.participants"
        :layout="store.layout"
      />
    </template>

    <template #bottombar>
      <DiagCallControlsV2
        :is-audio-enabled="store.isLocalAudioEnabled"
        :is-video-enabled="store.isLocalVideoEnabled"
        @toggle-audio="store.toggleMic"
        @toggle-video="store.toggleCam"
        @leave="store.leave"
      />
    </template>
  </DiagCallShellV2>
</template>

<script setup lang="ts">
import {
  DiagCallShellV2,
  DiagTopBarV2,
  DiagVideoGridV2,
  DiagCallControlsV2
} from '@diagvn/video-call-ui-kit-v2'
import '@diagvn/video-call-ui-kit-v2/style.css'
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'

const store = useVideoCallStoreV2()
</script>
```

## Components

### Main Components

| Component | Description |
|-----------|-------------|
| `DiagVideoCallV2` | All-in-one component with full flow |
| `DiagCallShellV2` | Layout wrapper with slots |
| `DiagPrejoinV2` | Pre-join screen with device preview |

### Video Components

| Component | Description |
|-----------|-------------|
| `DiagVideoGridV2` | Responsive video grid |
| `DiagVideoTileV2` | Individual video tile |

### Control Components

| Component | Description |
|-----------|-------------|
| `DiagCallControlsV2` | Bottom control bar |
| `DiagTopBarV2` | Top bar with timer/recording |

### Panel Components

| Component | Description |
|-----------|-------------|
| `DiagParticipantsPanelV2` | Participant list |
| `DiagChatPanelV2` | Chat panel |
| `DiagSettingsPanelV2` | Device/effects settings |
| `DiagTranscriptPanelV2` | Live transcription |

### Other Components

| Component | Description |
|-----------|-------------|
| `DiagWaitingRoomV2` | Waiting room view |
| `DiagCallEndedV2` | Post-call summary |
| `DiagToastsV2` | Toast notifications |
| `DiagBannerV2` | Alert banners |

## Styling

### Import Styles

```typescript
// In your main.ts or component
import '@diagvn/video-call-ui-kit-v2/style.css'
```

### CSS Variables

```css
:root {
  --vc-primary-color: #667eea;
  --vc-background: #1a1a2e;
  --vc-surface: #242442;
  --vc-text-primary: #ffffff;
  --vc-text-secondary: rgba(255, 255, 255, 0.7);
  --vc-border-radius: 8px;
}
```

## i18n Setup

```typescript
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { messages } from '@diagvn/video-call-ui-kit-v2'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: messages.en,
    vi: messages.vi
  }
})

const app = createApp(App)
app.use(i18n)
```

## Feature Flags

Control which features are enabled:

```typescript
const featureFlags = {
  virtualBackground: true,  // Virtual background button
  beautyEffects: true,      // Beauty effects button
  screenShare: true,        // Screen share button
  recording: true,          // Recording button
  chat: true,               // Chat panel
  transcript: true,         // Transcript panel
  waitingRoom: false,       // Waiting room flow
  raiseHand: true,          // Raise hand button
  audioToggle: true,        // Mic toggle button
  videoToggle: true,        // Camera toggle button
}

store.setFeatureFlags(featureFlags)
```

## Related Packages

- [@diagvn/video-call-core-v2](https://www.npmjs.com/package/@diagvn/video-call-core-v2) - Core state management
- [@diagvn/agora-web-adapter-v2](https://www.npmjs.com/package/@diagvn/agora-web-adapter-v2) - Agora SDK adapter

## License

MIT © DiagVN
