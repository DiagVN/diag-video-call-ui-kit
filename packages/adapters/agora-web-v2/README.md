# @diagvn/agora-web-adapter-v2

Full-featured Agora Web SDK adapter for DiagVN Video Call UI Kit V2.

## Features

- ✅ Core video/audio calling
- ✅ Screen sharing with audio
- ✅ Virtual backgrounds (blur, images)
- ✅ Beauty effects
- ✅ AI noise suppression
- ✅ Dual stream support
- ✅ Cloud proxy support
- ✅ End-to-end encryption
- ✅ Cloud recording integration
- ✅ RTMP live streaming
- ✅ Audio level monitoring
- ✅ Network quality tracking
- ✅ Token refresh handling

## Installation

```bash
pnpm add @diagvn/agora-web-adapter-v2 agora-rtc-sdk-ng
```

For virtual backgrounds, also install:
```bash
pnpm add agora-extension-virtual-background
```

For AI noise suppression:
```bash
pnpm add agora-extension-ai-denoiser
```

## Usage

### Basic Setup

```typescript
import { AgoraAdapterV2 } from '@diagvn/agora-web-adapter-v2'

const adapter = new AgoraAdapterV2({
  appId: 'YOUR_AGORA_APP_ID',
  enableDualStream: true,
  enableCloudProxy: false,
  logLevel: 1
})

// Join a call
await adapter.join({
  channelName: 'test-room',
  token: 'YOUR_TOKEN', // or null for testing
  uid: 12345, // optional
  userName: 'John Doe'
})

// Leave
await adapter.leave()
```

### Audio/Video Controls

```typescript
// Toggle audio
await adapter.setAudioEnabled(true)

// Toggle video
await adapter.setVideoEnabled(true)

// Change devices
const devices = await adapter.getDevices()
await adapter.setAudioInputDevice(devices.audioInputs[0].deviceId)
await adapter.setVideoInputDevice(devices.videoInputs[1].deviceId)

// Set video quality
await adapter.setVideoQuality('720p')
```

### Screen Sharing

```typescript
// Start screen share with audio
await adapter.startScreenShare({ withAudio: true })

// Stop screen share
await adapter.stopScreenShare()
```

### Virtual Background

```typescript
// Blur background
await adapter.setVirtualBackground({
  type: 'blur',
  blurLevel: 'medium'
})

// Image background
await adapter.setVirtualBackground({
  type: 'image',
  url: '/backgrounds/office.jpg'
})

// Disable
await adapter.setVirtualBackground({ type: 'none' })
```

### Beauty Effects

```typescript
await adapter.setBeautyEffect({
  smoothing: 50,
  lightening: 30,
  redness: 10,
  sharpness: 30
})

await adapter.disableBeautyEffect()
```

### Noise Suppression

```typescript
await adapter.setNoiseSuppression('high') // 'off' | 'low' | 'medium' | 'high'
```

### Encryption

```typescript
await adapter.setEncryption({
  mode: 'aes-256-gcm2',
  secret: 'your-secret-key',
  salt: new Uint8Array([...]) // 32 bytes
})
```

### Event Handling

```typescript
// Listen to events
adapter.on('participantJoined', ({ participant }) => {
  console.log(`${participant.name} joined`)
})

adapter.on('participantLeft', ({ participantId, reason }) => {
  console.log(`Participant ${participantId} left: ${reason}`)
})

adapter.on('connectionStateChanged', ({ state }) => {
  console.log(`Connection: ${state}`)
})

adapter.on('networkQualityChanged', ({ participantId, quality }) => {
  console.log(`Network quality for ${participantId}: ${quality}`)
})

adapter.on('tokenWillExpire', async ({ channel }) => {
  const newToken = await fetchNewToken(channel)
  // Renew token...
})
```

### Video Rendering

```typescript
// Render local video
adapter.renderVideo(localContainer, adapter.getLocalParticipant().id, true)

// Render remote video
adapter.renderVideo(remoteContainer, remoteParticipantId, false)

// Render screen share
adapter.renderScreenShare(screenContainer, participantId)

// Clear video
adapter.clearVideo(container)
```

## Integration with UI Kit

```vue
<template>
  <DiagVideoCallV2
    :adapter="adapter"
    :channel-name="channelName"
    :token="token"
    :user-name="userName"
    :features="features"
    @call-ended="handleCallEnd"
  />
</template>

<script setup lang="ts">
import { DiagVideoCallV2 } from '@diagvn/video-call-ui-kit-v2'
import { AgoraAdapterV2 } from '@diagvn/agora-web-adapter-v2'

const adapter = new AgoraAdapterV2({
  appId: import.meta.env.VITE_AGORA_APP_ID,
  enableDualStream: true
})

const features = {
  virtualBackground: true,
  beautyEffect: true,
  noiseSuppression: true,
  screenShare: true,
  chat: true,
  recording: false // Requires server setup
}
</script>
```

## Cloud Recording Setup

Cloud recording requires server-side implementation. This adapter provides the client interface:

```typescript
const recordingInfo = await adapter.startRecording({
  type: 'cloud',
  region: 'us',
  // Additional config passed to your server
})

await adapter.stopRecording()
```

## Requirements

- Agora App ID (from Agora Console)
- HTTPS for production (required for media access)
- Supported browsers: Chrome 58+, Firefox 56+, Safari 11+, Edge 79+

## License

MIT
