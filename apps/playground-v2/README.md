# Video Call UI Kit V2 Playground

Interactive demo application showcasing the V2 video call components.

## Features

This playground demonstrates three integration patterns:

### 1. Simple Integration (`/simple`)
Uses `DiagVideoCallV2` - the all-in-one component that handles everything:
- Built-in prejoin flow
- Automatic state management
- Virtual backgrounds, beauty effects, and more

### 2. Custom Integration (`/custom`)
Build your own UI with individual components:
- `DiagTopBarV2` - Top navigation bar
- `DiagVideoGridV2` - Video tile grid with multiple layouts
- `DiagCallControlsV2` - Call control buttons
- `DiagParticipantsPanelV2` - Participant list panel
- `DiagChatPanelV2` - Chat panel
- `DiagSettingsPanelV2` - Settings panel
- `DiagTranscriptPanelV2` - Live transcription panel

### 3. Step-by-Step Flow (`/prejoin` → `/call`)
Traditional routing approach with separate views:
- Prejoin page with device selection
- In-call page with full controls
- Mock and Agora modes

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp apps/playground-v2/.env.example apps/playground-v2/.env
```

Edit `.env` and add your Agora App ID:
```
VITE_AGORA_APP_ID=your-agora-app-id
VITE_TOKEN_SERVER_URL=https://your-token-server.com (optional)
```

### 3. Run the playground

```bash
pnpm --filter playground-v2 dev
```

The playground will open at `http://localhost:5174`

## V2 Features Showcased

| Feature | Simple Demo | Custom Demo | Step-by-Step |
|---------|-------------|-------------|--------------|
| Video Grid | ✅ | ✅ | ✅ |
| Multiple Layouts | ✅ | ✅ | ✅ |
| Audio/Video Controls | ✅ | ✅ | ✅ |
| Screen Share | ✅ | ✅ | ✅ |
| Virtual Background | ✅ | ✅ | ✅ |
| Beauty Effects | ✅ | ✅ | ✅ |
| Noise Suppression | ✅ | ✅ | ✅ |
| Recording | ✅ | ✅ | ✅ |
| Chat | ✅ | ✅ | ✅ |
| Transcription | ✅ | ✅ | ✅ |
| Waiting Room | ✅ | ✅ | ✅ |
| Participants Panel | ✅ | ✅ | ✅ |
| Settings Panel | ✅ | ✅ | ✅ |
| i18n (EN/VI) | ✅ | ✅ | ✅ |

## Project Structure

```
apps/playground-v2/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.ts           # App entry point
    ├── App.vue           # Root component
    ├── env.d.ts          # Environment types
    └── views/
        ├── HomeView.vue      # Landing page
        ├── SimpleCallView.vue # Simple integration demo
        ├── CustomCallView.vue # Custom integration demo
        ├── PreJoinView.vue    # Step-by-step: prejoin
        └── InCallView.vue     # Step-by-step: in-call
```

## Using V2 Packages

### Simple Integration

```vue
<template>
  <DiagVideoCallV2
    :adapter="adapter"
    :channel-name="channelName"
    :user-name="userName"
    :options="callOptions"
    @call-ended="onCallEnded"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { DiagVideoCallV2 } from '@diagvn/video-call-ui-kit-v2';
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2';

const adapter = createAgoraAdapter({ appId: 'your-app-id' });
const callOptions = {
  features: {
    virtualBackground: true,
    beautyEffects: true,
    screenShare: true,
  },
  showPrejoin: true,
};
</script>
```

### Custom Integration

```vue
<template>
  <DiagCallShellV2>
    <template #topbar>
      <DiagTopBarV2 :channel-name="channelName" />
    </template>
    
    <template #main>
      <DiagVideoGridV2
        :participants="participants"
        :layout="layout"
      />
    </template>
    
    <template #controls>
      <DiagCallControlsV2
        @toggle-audio="toggleAudio"
        @toggle-video="toggleVideo"
        @leave="leave"
      />
    </template>
  </DiagCallShellV2>
</template>
```

## License

MIT
