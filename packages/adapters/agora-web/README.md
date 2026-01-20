# @diag/agora-web-adapter

Agora Web SDK adapter for DIAG Video Call UI Kit. Implements the `Actions` interface to connect the headless core with Agora's RTC services.

## Features

- 🔌 **Drop-in Adapter** - Implements full `Actions` interface
- 📹 **Video Rendering** - Built-in renderer for video tiles
- 🔄 **Token Refresh** - Automatic token expiry handling
- 📱 **Device Management** - Camera/mic switching
- 🖥️ **Screen Share** - Desktop/window sharing support

## Installation

```bash
pnpm add @diag/agora-web-adapter agora-rtc-sdk-ng
```

### Peer Dependencies

```bash
pnpm add @diag/video-call-core agora-rtc-sdk-ng@^4.20.0
```

## Usage

### Basic Setup

```ts
import { useVideoCallStore, createEventBus } from '@diag/video-call-core'
import { createAgoraAdapter } from '@diag/agora-web-adapter'

const eventBus = createEventBus()
const adapter = createAgoraAdapter({
  appId: 'YOUR_AGORA_APP_ID',
  eventBus,
  debug: true // Enable console logging
})

const store = useVideoCallStore()
store.setAdapter(adapter)
await store.init()
```

### Joining a Channel

```ts
await store.join({
  channel: 'my-channel',
  uid: 12345,
  token: 'YOUR_RTC_TOKEN', // Required if App Certificate is enabled
  joinMuted: false,
  joinVideoOff: false,
  displayName: 'John Doe'
})
```

### Video Rendering

```ts
import { createAgoraRenderer } from '@diag/agora-web-adapter'

const renderer = createAgoraRenderer()

// In Vue template
<DiagVideoGrid :participants="participants" :renderer="renderer" />
```

### Token Refresh

```ts
// Listen for token expiry
eventBus.on('token-will-expire', async ({ expiresIn }) => {
  console.log(`Token expires in ${expiresIn} seconds`)
  
  // Fetch new token from your server
  const response = await fetch('/api/rtc-token', {
    method: 'POST',
    body: JSON.stringify({ channel, uid })
  })
  const { token } = await response.json()
  
  // Refresh token
  await store.refreshToken(token)
})

eventBus.on('token-expired', () => {
  // Handle expired token - force rejoin
  console.error('Token expired!')
})
```

### Device Management

```ts
// Get available devices
const devices = await adapter.getDevices()
// { microphones: [...], cameras: [...], speakers: [...] }

// Switch input devices
await store.setInputDevice({ micId: 'device-id', camId: 'device-id' })

// Switch output device (speaker)
await store.setOutputDevice('speaker-id')

// Switch camera (cycle through available cameras)
await store.switchCamera()
```

### Screen Sharing

```ts
// Start screen share
await store.startScreenShare()

// Stop screen share
await store.stopScreenShare()

// Listen for screen share events
eventBus.on('screen-share-started', ({ uid }) => { ... })
eventBus.on('screen-share-stopped', ({ uid }) => { ... })
```

### Quality Control

```ts
// Set video quality
await store.setQuality('720p') // 'auto' | '360p' | '720p' | '1080p'

// Set audio-only mode
await store.setAudioOnly(true)
```

## API Reference

### createAgoraAdapter(config)

Creates an Agora adapter instance.

```ts
interface AdapterConfig {
  appId: string
  eventBus: EventBus
  debug?: boolean
}

const adapter = createAgoraAdapter({
  appId: 'YOUR_APP_ID',
  eventBus: createEventBus(),
  debug: true
})
```

### createAgoraRenderer()

Creates a video renderer for use with video tile components.

```ts
const renderer = createAgoraRenderer()

// The renderer implements:
interface VideoRenderer {
  attachVideo(container: HTMLElement, participant: Participant, kind: 'camera' | 'screen'): void
  detachVideo(container: HTMLElement): void
}
```

### AgoraWebAdapter

The adapter class implementing the `Actions` interface:

```ts
class AgoraWebAdapter implements Actions {
  init(): Promise<void>
  join(options: JoinOptions): Promise<void>
  leave(): Promise<void>
  toggleMic(): Promise<boolean>
  toggleCam(): Promise<boolean>
  switchCamera(): Promise<void>
  setInputDevice(selection: DeviceSelection): Promise<void>
  setOutputDevice(speakerId: string): Promise<void>
  startScreenShare(): Promise<void>
  stopScreenShare(): Promise<void>
  refreshToken(newToken: string): Promise<void>
  setQuality(quality: VideoQuality): Promise<void>
  setAudioOnly(audioOnly: boolean): Promise<void>
  getDevices(): Promise<Devices>
  getParticipants(): Participant[]
  getCallState(): CallState
  getStats(): CallStats
  destroy(): Promise<void>
}
```

## Events

The adapter emits these events through the event bus:

| Event | Payload | Description |
|-------|---------|-------------|
| `participant-joined` | `Participant` | Remote user joined |
| `participant-left` | `{ id: string }` | Remote user left |
| `participant-updated` | `Participant` | Participant state changed |
| `call-state-changed` | `{ state: CallState }` | Call state changed |
| `device-changed` | `{ kind, deviceId }` | Device selection changed |
| `token-will-expire` | `{ expiresIn: number }` | Token expiring soon (~30s) |
| `token-expired` | `void` | Token has expired |
| `error` | `CallError` | Error occurred |
| `network-quality-changed` | `{ uid, quality }` | Network quality changed |
| `speaking-changed` | `{ uid, isSpeaking }` | Speaking state changed |
| `screen-share-started` | `{ uid }` | Screen share started |
| `screen-share-stopped` | `{ uid }` | Screen share stopped |

## Error Handling

```ts
eventBus.on('error', (error) => {
  console.error('Error:', error.code, error.messageKey, error.details)
  
  // error.code: 'INIT_FAILED' | 'JOIN_FAILED' | 'DEVICE_ERROR' | ...
  // error.messageKey: 'vc.err.joinFailed' | 'vc.err.deviceNotFound' | ...
  // error.recoverable: boolean
})
```

## Requirements

- Agora App ID (from [Agora Console](https://console.agora.io/))
- Token server (if App Certificate is enabled)
- HTTPS (required for camera/mic access in production)

## License

MIT © DIAG
