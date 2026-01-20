# @diag/video-call-core

Headless core library for DIAG Video Call UI Kit. Provides SDK-agnostic state management, typed events, and actions interface.

## Features

- 🧠 **Headless Architecture** - No UI dependencies, works with any frontend
- 🔒 **SSR-Safe** - No browser APIs in core logic
- 📦 **TypeScript First** - Full type definitions included
- 🔌 **Adapter Pattern** - Pluggable SDK adapters (Agora, etc.)
- ⚡ **Pinia Store** - Reactive state management for Vue 3

## Installation

```bash
pnpm add @diag/video-call-core
```

### Peer Dependencies

```bash
pnpm add vue@^3.4.0 pinia@^2.1.7
```

## Usage

### Basic Setup

```ts
import { createPinia } from 'pinia'
import { useVideoCallStore, createEventBus } from '@diag/video-call-core'

const pinia = createPinia()
app.use(pinia)

const store = useVideoCallStore()
```

### With Adapter

```ts
import { useVideoCallStore, createEventBus } from '@diag/video-call-core'
import { createAgoraAdapter } from '@diag/agora-web-adapter'

const eventBus = createEventBus()
const adapter = createAgoraAdapter({ appId: 'YOUR_APP_ID', eventBus })

const store = useVideoCallStore()
store.setAdapter(adapter)
await store.init()
```

### Store API

```ts
const store = useVideoCallStore()

// Readonly State
store.callState      // CallState
store.participants   // Participant[]
store.localParticipant // Participant | null
store.duration       // number
store.isMuted        // boolean
store.isVideoOff     // boolean
store.isScreenSharing // boolean
store.networkQuality // NetworkQuality
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
await store.setQuality(quality)
await store.refreshToken(newToken)
store.dismissToast(id)
store.dismissError()
store.destroy()
```

### Event Bus

```ts
import { createEventBus } from '@diag/video-call-core'

const eventBus = createEventBus()

eventBus.on('participant-joined', (participant) => { ... })
eventBus.on('participant-left', ({ id }) => { ... })
eventBus.on('call-state-changed', ({ state }) => { ... })
eventBus.on('token-will-expire', ({ expiresIn }) => { ... })
eventBus.on('token-expired', () => { ... })
eventBus.on('error', (error) => { ... })
eventBus.on('network-quality-changed', ({ uid, quality }) => { ... })
eventBus.on('speaking-changed', ({ uid, isSpeaking }) => { ... })

eventBus.off('participant-joined', handler)
eventBus.clear()
```

## Types

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
  ToastMessage,
  EventMap,
  EventBus,
  Actions,
  AdapterConfig,
  AdapterFactory
} from '@diag/video-call-core'
```

### CallState

```ts
type CallState = 'idle' | 'prejoin' | 'connecting' | 'in_call' | 'reconnecting' | 'ended' | 'error'
```

### Participant

```ts
interface Participant {
  id: string
  displayName: string
  role: ParticipantRole
  isLocal: boolean
  audioEnabled: boolean
  videoEnabled: boolean
  isScreenSharing?: boolean
  isSpeaking?: boolean
  networkQuality?: NetworkQuality
  joinedAt?: number
}
```

### JoinOptions

```ts
interface JoinOptions {
  channel: string
  uid: number
  token?: string
  joinMuted?: boolean
  joinVideoOff?: boolean
  displayName?: string
}
```

## Creating a Custom Adapter

```ts
import type { Actions, AdapterConfig, EventBus } from '@diag/video-call-core'

class MyCustomAdapter implements Actions {
  constructor(private config: AdapterConfig) {}

  async init(): Promise<void> { ... }
  async join(options: JoinOptions): Promise<void> { ... }
  async leave(): Promise<void> { ... }
  async toggleMic(): Promise<boolean> { ... }
  async toggleCam(): Promise<boolean> { ... }
  // ... implement all Actions methods
}
```

## License

MIT © DIAG
