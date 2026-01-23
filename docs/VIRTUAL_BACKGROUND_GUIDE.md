# Virtual Background Guide

This guide explains how to implement Virtual Background (VB) in your video call application using the DIAG Video Call UI Kit v2.

## Overview

The Virtual Background feature allows users to:
- **Blur** their background with adjustable strength
- **Replace** their background with a solid color
- **Replace** their background with a custom image

## Architecture

The implementation follows Agora's recommended two-processor pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Settings Panel                          │
│  ┌─────────────────┐                                        │
│  │  Preview Video  │ ◄── previewVideoTrack + vbPreviewProcessor
│  │  (with VB)      │                                        │
│  └─────────────────┘                                        │
│  [Blur] [Color] [Image]     [Apply Button]                  │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (on Apply)
┌─────────────────────────────────────────────────────────────┐
│                      Main Video                             │
│  ┌─────────────────┐                                        │
│  │   Call Video    │ ◄── localVideoTrack + vbProcessor      │
│  │   (with VB)     │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `vbProcessor` | Main processor applied to the actual call video |
| `vbPreviewProcessor` | Separate processor for settings preview |
| `localVideoTrack` | The main video track used in the call |
| `previewVideoTrack` | Dedicated track for preview (not affecting main) |

## Setup

### 1. Install Dependencies

```bash
pnpm add agora-extension-virtual-background@^1.3.0
```

### 2. Copy WASM File

Copy the WASM file to your public directory:

```bash
cp node_modules/agora-extension-virtual-background/wasms/agora-virtual-background.wasm public/wasms/
```

### 3. Configure the Adapter

```typescript
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2'

const adapter = createAgoraAdapter({
  appId: 'your-app-id',
  eventBus: eventBus,
  debug: true,
})
```

## Usage

### Basic Usage with DiagVideoCallV2

The `DiagVideoCallV2` component handles VB automatically:

```vue
<template>
  <DiagVideoCallV2
    :adapter="adapter"
    :features="features"
    :virtual-background-config="vbConfig"
    @update:virtual-background-config="vbConfig = $event"
    @apply-virtual-background="handleApplyVB"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VirtualBackgroundConfig, FeatureFlags } from '@diagvn/video-call-core-v2'

const features: FeatureFlags = {
  virtualBackground: true,
  // ... other features
}

const vbConfig = ref<VirtualBackgroundConfig>({
  type: 'none'
})

const handleApplyVB = async () => {
  // VB is applied to main video when user clicks Apply
  console.log('VB applied:', vbConfig.value)
}
</script>
```

### Manual Usage with Adapter

```typescript
// 1. Set VB config (preview only)
await adapter.setVirtualBackground({
  type: 'blur',
  blurStrength: 2  // 1=low, 2=medium, 3=high
})

// 2. Apply to main video
await adapter.applyVirtualBackground()

// 3. Disable VB
await adapter.setVirtualBackground({ type: 'none' })
await adapter.applyVirtualBackground()
```

## VirtualBackgroundConfig Types

```typescript
interface VirtualBackgroundConfig {
  type: 'none' | 'blur' | 'color' | 'image'
  blurStrength?: 1 | 2 | 3  // For blur type
  color?: string            // For color type (hex)
  imageUrl?: string         // For image type
}
```

### Examples

```typescript
// No background effect
{ type: 'none' }

// Blur background
{ type: 'blur', blurStrength: 2 }

// Solid color background
{ type: 'color', color: '#00FF00' }

// Image background
{ type: 'image', imageUrl: '/backgrounds/office.jpg' }
```

## Settings Panel Integration

The `DiagSettingsPanelV2` component includes a Background tab:

```vue
<template>
  <DiagSettingsPanelV2
    v-if="showSettings"
    :renderer="adapter"
    :features="features"
    :virtual-background-config="vbConfig"
    :preset-backgrounds="presetBackgrounds"
    @update:virtual-background-config="vbConfig = $event"
    @apply-virtual-background="handleApplyVB"
    @close="showSettings = false"
  />
</template>

<script setup lang="ts">
const presetBackgrounds = [
  { id: 'office', name: 'Office', url: '/bg/office.jpg', thumbnail: '/bg/office-thumb.jpg' },
  { id: 'nature', name: 'Nature', url: '/bg/nature.jpg', thumbnail: '/bg/nature-thumb.jpg' },
]
</script>
```

## Video Renderer Methods

The adapter implements these methods for video rendering:

| Method | Description |
|--------|-------------|
| `attachPreview(el, kind)` | Sync - Attach normal preview (PreJoin, Video tab) |
| `attachPreviewWithVB(el)` | Async - Attach VB-enabled preview (Background tab) |
| `detachPreview(el)` | Detach preview from element |
| `attachVideo(el, participantId, kind)` | Attach participant video |
| `detachVideo(el)` | Detach video from element |

## Events

```typescript
// Emitted when VB config changes (preview)
eventBus.on('virtual-background-changed', ({ enabled, config, applied }) => {
  // enabled: boolean - whether VB is enabled
  // config: VirtualBackgroundConfig - current config
  // applied: boolean - true if applied to main video
})

// Emitted when VB has error
eventBus.on('virtual-background-error', ({ code, message }) => {
  console.error('VB Error:', code, message)
})
```

## Troubleshooting

### WASM File Not Found

**Error:** `Failed to load WASM file`

**Solution:** Ensure the WASM file is in your public directory:
```
public/
  wasms/
    agora-virtual-background.wasm
```

### Preview Shows Original Video

**Issue:** Preview doesn't show VB effect

**Cause:** Using `attachPreview` instead of `attachPreviewWithVB`

**Solution:** For Background tab, use `attachPreviewWithVB`:
```typescript
if (renderer.attachPreviewWithVB) {
  await renderer.attachPreviewWithVB(previewElement)
}
```

### Main Video Not Updating After Apply

**Issue:** Clicking Apply doesn't update main video

**Solution:** Ensure you're listening to `local-video-changed` event and re-rendering:
```typescript
eventBus.on('local-video-changed', () => {
  // Re-attach main video
  adapter.attachVideo(videoElement, localParticipant.id, 'camera')
})
```

### VB Processor Initialization Failed

**Error:** `VB processor not initialized`

**Solution:** The adapter automatically initializes the processor on first use. Ensure:
1. WASM file is accessible
2. Browser supports WebGL (required for VB)
3. Camera permission is granted

## Browser Support

Virtual Background requires:
- WebGL 2.0 support
- Modern browser (Chrome 80+, Firefox 76+, Safari 14+, Edge 80+)

## Performance Tips

1. **Use appropriate blur strength** - Higher strength = more CPU usage
2. **Optimize background images** - Use images ≤ 1920x1080
3. **Test on target devices** - VB is CPU-intensive on mobile

## API Reference

### Adapter Methods

```typescript
interface Actions {
  // Set VB config (preview only)
  setVirtualBackground(config: VirtualBackgroundConfig): Promise<void>
  
  // Apply current config to main video
  applyVirtualBackground(): Promise<void>
}
```

### VideoRenderer Interface

```typescript
interface VideoRenderer {
  attachPreview?(el: HTMLElement, kind: 'camera' | 'screen'): void
  attachPreviewWithVB?(el: HTMLElement): Promise<void>
  detachPreview?(el: HTMLElement): void
  attachVideo(el: HTMLElement, participantId: string, kind: 'camera' | 'screen'): void
  detachVideo(el: HTMLElement): void
}
```
