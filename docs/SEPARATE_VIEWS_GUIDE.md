# Separate Pre-Join and In-Call Views Guide

This guide explains how to implement a video call flow where the pre-join screen and in-call view are on separate routes/URLs. This is a common pattern in video conferencing applications.

## Architecture Overview

```
┌──────────────────┐     Navigate      ┌──────────────────┐
│   Pre-Join View  │ ───────────────▶ │   In-Call View   │
│   /prejoin       │                   │   /call          │
├──────────────────┤                   ├──────────────────┤
│ • Device preview │                   │ • Video grid     │
│ • Select camera  │                   │ • Call controls  │
│ • Select mic     │                   │ • Participants   │
│ • Join button    │                   │ • Leave button   │
└──────────────────┘                   └──────────────────┘
         │                                      │
         │         ┌──────────────┐             │
         └────────▶│ Pinia Store  │◀────────────┘
                   │ (shared)     │
                   └──────────────┘
```

## Key Concepts

1. **Pinia store persists across route changes** - The adapter and state survive navigation
2. **Initialize adapter in Pre-Join** - Set up the Agora adapter before navigating
3. **Join after navigation** - Call `store.join()` in In-Call view's `onMounted`
4. **OR Join before navigation** - Call `store.join()` in Pre-Join, then navigate

## Option 1: Join Before Navigation (Recommended)

This is the approach used in the playground. Join the call first, then navigate.

### Pre-Join View

```vue
<!-- /views/PreJoinView.vue -->
<template>
  <DiagPreJoinPanel
    :devices="devices"
    :has-video-preview="hasVideoPreview"
    @join="handleJoin"
    @device-change="handleDeviceChange"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoCallStore, createEventBus } from '@diagvn/video-call-core'
import { DiagPreJoinPanel } from '@diagvn/video-call-ui-kit'
import { createAgoraAdapter } from '@diagvn/agora-web-adapter'
import AgoraRTC, { type ILocalVideoTrack } from 'agora-rtc-sdk-ng'

const router = useRouter()
const store = useVideoCallStore()

const devices = ref({ microphones: [], cameras: [], speakers: [] })
const hasVideoPreview = ref(false)
let previewTrack: ILocalVideoTrack | null = null

onMounted(async () => {
  // 1. Create event bus and adapter
  const eventBus = createEventBus()
  const adapter = createAgoraAdapter({
    appId: import.meta.env.VITE_AGORA_APP_ID,
    eventBus,
    debug: true
  })
  
  // 2. Store adapter in Pinia (persists across navigation)
  store.setAdapter(adapter)
  await store.init()
  
  // 3. Get devices and start preview
  devices.value = await adapter.getDevices()
  await startPreview()
})

async function startPreview() {
  // Preview camera before joining
  previewTrack = await AgoraRTC.createCameraVideoTrack()
  // ... play in preview container
}

async function stopPreview() {
  if (previewTrack) {
    previewTrack.stop()
    previewTrack.close()
    previewTrack = null
  }
}

async function handleJoin(options: { joinMuted: boolean; joinVideoOff: boolean }) {
  try {
    // 4. Stop preview before joining
    await stopPreview()
    
    // 5. Join the call
    await store.join({
      channel: 'my-channel',
      uid: Math.floor(Math.random() * 10000),
      token: await fetchToken(), // optional
      joinMuted: options.joinMuted,
      joinVideoOff: options.joinVideoOff,
      displayName: 'User Name'
    })
    
    // 6. Navigate to call view AFTER successful join
    router.push('/call')
  } catch (error) {
    console.error('Failed to join:', error)
  }
}

onBeforeUnmount(() => {
  stopPreview()
})
</script>
```

### In-Call View

```vue
<!-- /views/InCallView.vue -->
<template>
  <DiagCallShell :call-state="store.callState" :duration="store.stats.duration">
    <DiagVideoGrid :participants="store.participants" :renderer="renderer" />
    
    <template #bottombar>
      <DiagCallControls
        :is-muted="store.isMuted"
        :is-video-off="store.isVideoOff"
        @toggle-mic="store.toggleMic"
        @toggle-cam="store.toggleCam"
        @leave="handleLeave"
      />
    </template>
  </DiagCallShell>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoCallStore } from '@diagvn/video-call-core'
import { DiagCallShell, DiagVideoGrid, DiagCallControls } from '@diagvn/video-call-ui-kit'
import { AgoraWebAdapter } from '@diagvn/agora-web-adapter'

const router = useRouter()
const store = useVideoCallStore()

// Create renderer from the stored adapter
const renderer = computed(() => {
  const adapter = store.adapter as AgoraWebAdapter | null
  return adapter?.createRenderer() ?? null
})

onMounted(() => {
  // Guard: redirect if not in call
  if (store.callState !== 'in_call') {
    router.replace('/prejoin')
    return
  }
})

async function handleLeave() {
  await store.leave()
  router.push('/prejoin')
}
</script>
```

## Option 2: Join After Navigation

Store join parameters and execute join after navigating.

### Pre-Join View

```vue
<script setup lang="ts">
// ... same setup code ...

async function handleJoin(options: { joinMuted: boolean; joinVideoOff: boolean }) {
  await stopPreview()
  
  // Store join options in query params or Pinia
  router.push({
    path: '/call',
    query: {
      channel: 'my-channel',
      joinMuted: options.joinMuted ? '1' : '0',
      joinVideoOff: options.joinVideoOff ? '1' : '0'
    }
  })
}
</script>
```

### In-Call View

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVideoCallStore } from '@diagvn/video-call-core'

const route = useRoute()
const router = useRouter()
const store = useVideoCallStore()

onMounted(async () => {
  // Guard: check adapter exists
  if (!store.adapter) {
    router.replace('/prejoin')
    return
  }
  
  // Extract join options from query
  const { channel, joinMuted, joinVideoOff } = route.query
  
  try {
    await store.join({
      channel: String(channel || 'default'),
      uid: Math.floor(Math.random() * 10000),
      joinMuted: joinMuted === '1',
      joinVideoOff: joinVideoOff === '1',
      displayName: 'User'
    })
  } catch (error) {
    console.error('Failed to join:', error)
    router.replace('/prejoin')
  }
})
</script>
```

## Router Configuration

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import PreJoinView from '@/views/PreJoinView.vue'
import InCallView from '@/views/InCallView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/prejoin'
    },
    {
      path: '/prejoin',
      name: 'prejoin',
      component: PreJoinView
    },
    {
      path: '/call',
      name: 'call',
      component: InCallView,
      // Optional: navigation guard
      beforeEnter: (to, from, next) => {
        const store = useVideoCallStore()
        if (!store.adapter) {
          next('/prejoin')
        } else {
          next()
        }
      }
    }
  ]
})

export default router
```

## Handling Page Refresh

If the user refreshes the page while in-call, the Pinia state will be lost. Handle this case:

```vue
<!-- InCallView.vue -->
<script setup lang="ts">
onMounted(() => {
  // Check if we have a valid adapter (survives navigation but not refresh)
  if (!store.adapter) {
    // Redirect to pre-join to re-initialize
    router.replace('/prejoin')
    return
  }
})
</script>
```

## Passing Channel Info

### Method 1: URL Query Parameters

```typescript
// PreJoin: navigate with channel info
router.push({
  path: '/call',
  query: { channel: 'room-123', token: 'xxx' }
})

// InCall: read from query
const channel = route.query.channel as string
```

### Method 2: Route Parameters

```typescript
// Router config
{ path: '/call/:channel', component: InCallView }

// PreJoin: navigate
router.push(`/call/room-123`)

// InCall: read param
const channel = route.params.channel as string
```

### Method 3: Pinia Store

```typescript
// Add to store
const pendingJoinOptions = ref<JoinOptions | null>(null)

// PreJoin: set options
store.pendingJoinOptions = { channel: 'room-123', ... }
router.push('/call')

// InCall: consume options
const options = store.pendingJoinOptions
store.pendingJoinOptions = null
await store.join(options)
```

## Complete Example Flow

```
1. User lands on /prejoin
   └── Initialize Agora adapter
   └── Store adapter in Pinia
   └── Show camera preview
   └── User selects devices

2. User clicks "Join"
   └── Stop preview track
   └── Call store.join() with channel/token
   └── On success: router.push('/call')

3. /call view loads
   └── Check store.adapter exists
   └── Check store.callState === 'in_call'
   └── Create renderer from adapter
   └── Render video grid

4. User clicks "Leave"
   └── Call store.leave()
   └── router.push('/prejoin')
```

## Tips & Best Practices

1. **Always stop preview tracks** before joining to avoid conflicts
2. **Use navigation guards** to prevent accessing /call without proper setup
3. **Handle refresh gracefully** by redirecting to pre-join
4. **Clean up on unmount** to prevent memory leaks
5. **Test with slow networks** to ensure state transitions work correctly

## Troubleshooting

### Video not showing after navigation

The adapter and tracks persist in Pinia, but you need to create a new renderer instance in the In-Call view:

```typescript
const renderer = computed(() => {
  const adapter = store.adapter as AgoraWebAdapter
  return adapter?.createRenderer() // Creates fresh renderer
})
```

### "Adapter not initialized" error

Make sure to:
1. Call `store.setAdapter(adapter)` in Pre-Join
2. Call `store.init()` after setting adapter
3. Check adapter exists before joining

### Preview track conflicts with call track

Always stop and close the preview track before joining:

```typescript
async function handleJoin() {
  // IMPORTANT: Stop preview first!
  await stopPreview()
  await store.join({ ... })
}
```
