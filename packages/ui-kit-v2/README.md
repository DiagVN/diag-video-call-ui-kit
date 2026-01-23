# @diagvn/video-call-ui-kit-v2

Comprehensive Vue 3 UI components for video calling applications, designed to work with `@diagvn/video-call-core-v2`.

## Features

- 🎥 **Full Video Call Support** - Grid, speaker, spotlight, and PiP layouts
- 🎨 **Customizable** - CSS variables, slots, and component composition
- 🌍 **i18n Ready** - Built-in English and Vietnamese translations
- 📱 **Responsive** - Works on desktop and mobile
- ♿ **Accessible** - ARIA labels and keyboard navigation
- 🎭 **Virtual Background** - Blur and image backgrounds
- ✨ **Beauty Effects** - Smoothing, lightening, and more
- 🔇 **Noise Suppression** - AI-powered audio cleanup
- 📹 **Recording** - Cloud and local recording support
- 📡 **Live Streaming** - RTMP streaming support
- 💬 **Chat** - In-call messaging with emoji support
- 📝 **Transcription** - Real-time speech-to-text
- 🚪 **Waiting Room** - Host approval for participants

## Installation

```bash
pnpm add @diagvn/video-call-ui-kit-v2 @diagvn/video-call-core-v2
```

## Quick Start

### Using DiagVideoCallV2 (Unified Component)

The easiest way to add video calling to your app:

```vue
<template>
  <DiagVideoCallV2
    :adapter="adapter"
    :channel-name="channelName"
    :token="token"
    :user-name="userName"
    @call-ended="handleCallEnd"
  />
</template>

<script setup lang="ts">
import { DiagVideoCallV2 } from '@diagvn/video-call-ui-kit-v2'
import { AgoraAdapterV2 } from '@diagvn/agora-web-adapter-v2'

const adapter = new AgoraAdapterV2({ appId: 'YOUR_APP_ID' })
const channelName = 'test-room'
const token = null // Or your token
const userName = 'John Doe'

function handleCallEnd() {
  // Navigate away or show message
}
</script>
```

### Using Individual Components (Advanced)

For full customization, compose your own video call UI:

```vue
<template>
  <DiagCallShellV2 :state="store.state" :recording="store.recordingInfo">
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
        :pinned-id="store.pinnedParticipantId"
        :renderer="adapter"
      />
    </template>

    <template #bottombar>
      <DiagCallControlsV2
        :is-audio-enabled="store.isLocalAudioEnabled"
        :is-video-enabled="store.isLocalVideoEnabled"
        @toggle-audio="store.toggleAudio"
        @toggle-video="store.toggleVideo"
        @leave="store.leave"
      />
    </template>

    <template #sidebar>
      <DiagParticipantsPanelV2
        v-if="showParticipants"
        :participants="store.participants"
        @close="showParticipants = false"
      />
      <DiagChatPanelV2
        v-if="showChat"
        :messages="store.chatMessages"
        @close="showChat = false"
        @send="store.sendMessage"
      />
    </template>
  </DiagCallShellV2>
</template>
```

## Components

### Main Components

| Component | Description |
|-----------|-------------|
| `DiagVideoCallV2` | Unified wrapper with all features |
| `DiagCallShellV2` | Layout structure with slots |
| `DiagPrejoinV2` | Pre-join screen with device selection |

### Video Components

| Component | Description |
|-----------|-------------|
| `DiagVideoGridV2` | Responsive grid layout for videos |
| `DiagVideoTileV2` | Individual participant video tile |

### Control Components

| Component | Description |
|-----------|-------------|
| `DiagCallControlsV2` | Audio/video/share controls |
| `DiagTopBarV2` | Header with timer and indicators |

### Panel Components

| Component | Description |
|-----------|-------------|
| `DiagParticipantsPanelV2` | Participant list with host controls |
| `DiagChatPanelV2` | In-call chat panel |
| `DiagSettingsPanelV2` | Device and effect settings |
| `DiagTranscriptPanelV2` | Real-time transcription |

### State Components

| Component | Description |
|-----------|-------------|
| `DiagWaitingRoomV2` | Waiting room for participants |
| `DiagCallEndedV2` | Post-call screen with stats |

### Feedback Components

| Component | Description |
|-----------|-------------|
| `DiagToastsV2` | Toast notifications |
| `DiagBannerV2` | Banner alerts |

## Customization

### CSS Variables

```css
:root {
  --vc-primary: #3498db;
  --vc-success: #27ae60;
  --vc-warning: #f1c40f;
  --vc-danger: #e74c3c;
  --vc-bg: #ffffff;
  --vc-text: #333333;
}

/* Dark mode */
.dark {
  --vc-bg: #1a1a1a;
  --vc-text: #ffffff;
}
```

### Slots

Most components provide slots for customization:

```vue
<DiagVideoCallV2>
  <template #topbar="{ store }">
    <MyCustomTopBar :duration="store.callDuration" />
  </template>
  
  <template #controls="{ store }">
    <MyCustomControls :is-muted="!store.isLocalAudioEnabled" />
  </template>
</DiagVideoCallV2>
```

## i18n Setup

```typescript
import { createI18n } from 'vue-i18n'
import { messages } from '@diagvn/video-call-ui-kit-v2'

const i18n = createI18n({
  locale: 'en',
  messages
})

app.use(i18n)
```

## License

MIT
