# @diagvn/video-call-core-v2

> State management and TypeScript types for video calling applications

[![npm version](https://img.shields.io/npm/v/@diagvn/video-call-core-v2.svg)](https://www.npmjs.com/package/@diagvn/video-call-core-v2)

## Installation

```bash
npm install @diagvn/video-call-core-v2
# or
pnpm add @diagvn/video-call-core-v2
```

### Peer Dependencies

```bash
npm install vue@^3.4.0 pinia@^3.0.4
```

## Features

| Feature | Status |
|---------|--------|
| Video/Audio calling | ✅ |
| Screen sharing | ✅ |
| Virtual background | ✅ |
| Beauty effects | ✅ |
| Noise suppression | ✅ |
| Cloud recording | ✅ |
| Live streaming | ✅ |
| End-to-end encryption | ✅ |
| In-call chat | ✅ |
| Transcript (STT) | ✅ |
| Waiting room | ✅ |
| Raise hand | ✅ |
| Multiple layouts | ✅ |

## Quick Start

```typescript
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2'

const store = useVideoCallStoreV2()

// Create and set adapter
const adapter = createAgoraAdapter({ appId: 'YOUR_APP_ID' })
store.setAdapter(adapter)

// Initialize
await store.init()

// Join call
await store.join({
  channel: 'room-123',
  uid: 12345,
  displayName: 'John Doe'
})

// Control media
await store.toggleMic()
await store.toggleCam()

// Leave
await store.leave()
```

## Store Actions

| Action | Description |
|--------|-------------|
| `init()` | Initialize adapter, get devices |
| `join(options)` | Join a call |
| `leave()` | Leave the call |
| `toggleMic()` | Toggle microphone |
| `toggleCam()` | Toggle camera |
| `toggleScreenShare()` | Toggle screen sharing |
| `setLayout(layout)` | Change video layout |
| `setVirtualBackground(config)` | Set virtual background |
| `setBeautyEffects(config)` | Set beauty effects |
| `startRecording(options)` | Start recording |
| `sendChatMessage(text)` | Send chat message |

## Event Bus

```typescript
import { createEventBus } from '@diagvn/video-call-core-v2'

const eventBus = createEventBus()

eventBus.on('participant-joined', (participant) => {
  console.log('Joined:', participant.displayName)
})

eventBus.on('call-state-changed', ({ from, to }) => {
  console.log(`State: ${from} -> ${to}`)
})
```

## TypeScript Types

```typescript
import type {
  Participant,
  JoinOptions,
  FeatureFlags,
  CallState,
  VirtualBackgroundConfig,
  BeautyEffectsConfig,
  ChatMessage,
  TranscriptEntry,
} from '@diagvn/video-call-core-v2'
```

## Related Packages

- [@diagvn/video-call-ui-kit-v2](https://www.npmjs.com/package/@diagvn/video-call-ui-kit-v2) - Vue 3 UI components
- [@diagvn/agora-web-adapter-v2](https://www.npmjs.com/package/@diagvn/agora-web-adapter-v2) - Agora Web SDK adapter

## License

MIT © DiagVN
