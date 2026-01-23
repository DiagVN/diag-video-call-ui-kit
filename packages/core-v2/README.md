# @diagvn/video-call-core-v2

Comprehensive state management and types for video calling with full Agora feature support.

## Features

- 🎯 **Complete TypeScript types** for all video call features
- 📡 **Event-driven architecture** with typed event bus
- 🏪 **Pinia store** with reactive state management
- 🔌 **Adapter interface** for SDK abstraction (Agora, Twilio, etc.)

### Supported Features

- ✅ Waiting Room
- ✅ Virtual Background
- ✅ Beauty Effects
- ✅ Noise Suppression
- ✅ Recording (Cloud & Local)
- ✅ Live Streaming
- ✅ Encryption
- ✅ Chat
- ✅ Transcript (STT)
- ✅ Screen Sharing
- ✅ Multiple Layouts
- ✅ Raise Hand
- ✅ Active Speaker Detection
- ✅ Network Quality Monitoring

## Installation

```bash
pnpm add @diagvn/video-call-core-v2
```

## Usage

### With Pinia Store

```typescript
import { createPinia } from 'pinia'
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'
import { createAgoraAdapterV2 } from '@diagvn/agora-web-adapter-v2'

const pinia = createPinia()
const store = useVideoCallStoreV2(pinia)

// Set up adapter
const adapter = createAgoraAdapterV2({
  appId: 'YOUR_APP_ID',
  eventBus: store.eventBus.value,
  debug: true
})

store.setAdapter(adapter)

// Initialize
await store.init()

// Join call
await store.join({
  channel: 'test-room',
  uid: 123,
  token: 'YOUR_TOKEN',
  displayName: 'User'
})

// Media controls
await store.toggleMic()
await store.toggleCam()
await store.toggleScreenShare()

// Virtual background
await store.setVirtualBackground({
  type: 'blur',
  blurStrength: 50
})

// Recording
await store.startRecording({ mode: 'cloud' })

// Leave
await store.leave()
```

### Event Bus Only

```typescript
import { createEventBus } from '@diagvn/video-call-core-v2'

const eventBus = createEventBus()

// Subscribe to events
eventBus.on('participant-joined', (participant) => {
  console.log('Joined:', participant.displayName)
})

eventBus.on('call-state-changed', ({ from, to }) => {
  console.log(`State: ${from} -> ${to}`)
})

// Emit events
eventBus.emit('toast', {
  id: '1',
  type: 'info',
  messageKey: 'vc.toast.userJoined',
  duration: 3000,
  timestamp: Date.now()
})
```

## Types

See [types.ts](./src/types.ts) for complete type definitions.

## License

MIT
