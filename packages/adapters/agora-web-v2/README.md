# @diagvn/agora-web-adapter-v2

> Agora Web SDK adapter for DiagVN Video Call UI Kit

[![npm version](https://img.shields.io/npm/v/@diagvn/agora-web-adapter-v2.svg)](https://www.npmjs.com/package/@diagvn/agora-web-adapter-v2)

## Installation

```bash
npm install @diagvn/agora-web-adapter-v2 @diagvn/video-call-core-v2 agora-rtc-sdk-ng
# or
pnpm add @diagvn/agora-web-adapter-v2 @diagvn/video-call-core-v2 agora-rtc-sdk-ng
```

### Optional Extensions

```bash
# Virtual background (blur, image backgrounds)
npm install agora-extension-virtual-background@^1.1.3

# Beauty effects (smoothing, lightening)
npm install agora-extension-beauty-effect@^1.0.2-beta

# AI noise suppression
npm install agora-extension-ai-denoiser@^1.1.0

# RTM for chat/signaling
npm install agora-rtm-sdk@^2.1.0
```

## Features

| Feature | Status |
|---------|--------|
| Core video/audio | ✅ |
| Screen sharing | ✅ |
| Virtual backgrounds | ✅ (requires extension) |
| Beauty effects | ✅ (requires extension) |
| AI noise suppression | ✅ (requires extension) |
| Dual stream | ✅ |
| Cloud proxy | ✅ |
| End-to-end encryption | ✅ |
| Cloud recording | ✅ |
| RTMP streaming | ✅ |
| Audio levels | ✅ |
| Network quality | ✅ |
| Token refresh | ✅ |

## Quick Start

### Basic Usage

```typescript
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2'
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'

// Create adapter
const adapter = createAgoraAdapter({
  appId: 'YOUR_AGORA_APP_ID',
  enableDualStream: true,
  logLevel: 1 // 0=none, 1=error, 2=warn, 3=info, 4=debug
})

// Connect to store
const store = useVideoCallStoreV2()
store.setAdapter(adapter)

// Initialize and join
await store.init()
await store.join({
  channel: 'my-room',
  uid: 12345,
  displayName: 'John Doe',
  token: 'YOUR_TOKEN' // optional for testing
})
```

### With Token Server

```typescript
const adapter = createAgoraAdapter({
  appId: 'YOUR_AGORA_APP_ID',
  tokenServer: 'https://your-server.com/api/agora/token'
})

// Token will be fetched automatically when joining
await store.join({
  channel: 'my-room',
  uid: 12345,
  displayName: 'John Doe'
})
```

## API Reference

### createAgoraAdapter(options)

```typescript
interface CreateAgoraAdapterOptions {
  appId: string              // Agora App ID (required)
  tokenServer?: string       // Token server URL
  enableDualStream?: boolean // Enable dual stream (default: true)
  enableCloudProxy?: boolean // Enable cloud proxy (default: false)
  logLevel?: 0 | 1 | 2 | 3 | 4 // Log verbosity (default: 1)
}
```

### Media Controls

```typescript
// Audio
await adapter.setAudioEnabled(true)
await adapter.setAudioInputDevice(deviceId)

// Video
await adapter.setVideoEnabled(true)
await adapter.setVideoInputDevice(deviceId)
await adapter.setVideoQuality('720p') // '360p' | '480p' | '720p' | '1080p'

// Screen share
await adapter.startScreenShare({ withAudio: true })
await adapter.stopScreenShare()
```

### Virtual Background

Requires `agora-extension-virtual-background`:

```typescript
// Blur background
await adapter.setVirtualBackground({
  type: 'blur',
  blurLevel: 'medium' // 'low' | 'medium' | 'high'
})

// Image background
await adapter.setVirtualBackground({
  type: 'image',
  source: '/backgrounds/office.jpg'
})

// Disable
await adapter.setVirtualBackground({ type: 'none' })
```

### Beauty Effects

Requires `agora-extension-beauty-effect`:

```typescript
await adapter.setBeautyEffects({
  smoothing: 50,    // 0-100
  lightening: 30,   // 0-100
  redness: 10,      // 0-100
  sharpness: 30     // 0-100
})

await adapter.disableBeautyEffects()
```

### Noise Suppression

Requires `agora-extension-ai-denoiser`:

```typescript
await adapter.setNoiseSuppression('high') // 'off' | 'low' | 'medium' | 'high'
```

### Encryption

```typescript
await adapter.setEncryption({
  mode: 'aes-256-gcm2',
  secret: 'your-secret-key',
  salt: new Uint8Array(32) // 32 random bytes
})
```

### Recording (Cloud)

Requires backend integration with Agora Cloud Recording API:

```typescript
await adapter.startRecording({
  mode: 'cloud',
  config: {
    // Your cloud recording config
  }
})

await adapter.stopRecording()
```

## Events

The adapter emits events through the store's event bus:

```typescript
store.eventBus.on('participant-joined', (participant) => {
  console.log(`${participant.displayName} joined`)
})

store.eventBus.on('participant-left', ({ participantId, reason }) => {
  console.log(`Participant left: ${reason}`)
})

store.eventBus.on('audio-level-changed', ({ participantId, level }) => {
  // Update audio visualizer
})

store.eventBus.on('network-quality-changed', (quality) => {
  console.log(`Uplink: ${quality.uplinkQuality}, Downlink: ${quality.downlinkQuality}`)
})

store.eventBus.on('error', (error) => {
  console.error('Adapter error:', error)
})
```

## Get Your Agora App ID

1. Go to [Agora Console](https://console.agora.io/)
2. Create a new project
3. Copy the App ID
4. For production, enable token authentication

## Troubleshooting

### Camera/Mic not working

```typescript
// Check device permissions
const devices = await adapter.getDevices()
console.log('Available devices:', devices)

// Request permissions explicitly
await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
```

### Virtual background not loading

```typescript
// Ensure extension is installed
npm install agora-extension-virtual-background

// Check browser support (requires WebGL2)
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl2')
if (!gl) {
  console.warn('WebGL2 not supported')
}
```

### Network issues

```typescript
// Enable cloud proxy for restrictive networks
const adapter = createAgoraAdapter({
  appId: 'YOUR_APP_ID',
  enableCloudProxy: true
})
```

## Related Packages

- [@diagvn/video-call-core-v2](https://www.npmjs.com/package/@diagvn/video-call-core-v2) - Core state management
- [@diagvn/video-call-ui-kit-v2](https://www.npmjs.com/package/@diagvn/video-call-ui-kit-v2) - Vue 3 UI components

## License

MIT © DiagVN
