# Speech-to-Text (STT) Backend Integration Guide

This guide explains how to integrate Agora's Real-time Speech-to-Text service with the DIAG Video Call UI Kit v2.

## Overview

The transcript/STT feature in DIAG Video Call UI Kit v2 consists of two parts:

1. **Client-side (UI Kit)** - Handles receiving and displaying transcript data
2. **Server-side (Your Backend)** - Starts/stops the Agora STT service

The UI Kit provides the client-side implementation. You need to implement the backend API to control the Agora STT service.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Your App      │────────▶│   Your Backend  │────────▶│   Agora STT     │
│   (UI Kit)      │         │   (API Server)  │         │   Service       │
└────────┬────────┘         └─────────────────┘         └────────┬────────┘
         │                                                        │
         │                  Stream Message (Transcript Data)      │
         └────────────────────────────────────────────────────────┘
                           (via Agora RTC SDK)
```

## Client-Side Usage (V2)

### Quick Start - Using DiagVideoCallV2 Events (Recommended)

The simplest integration uses the new STT events on `DiagVideoCallV2`:

```vue
<script setup lang="ts">
import { DiagVideoCallV2 } from '@diagvn/video-call-ui-kit-v2'
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2'
import { onMounted } from 'vue'

const store = useVideoCallStoreV2()

// Your backend API
const sttApi = {
  start: (channel: string, language: string) => 
    fetch('/api/stt/start', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName: channel, language }) 
    }),
  stop: (channel: string) => 
    fetch('/api/stt/stop', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName: channel }) 
    })
}

onMounted(async () => {
  const adapter = createAgoraAdapter({
    appId: import.meta.env.VITE_AGORA_APP_ID
  })
  store.setAdapter(adapter)
  await store.init()
})

// Called when user selects a language (BEFORE transcript starts)
// Use this to configure your backend STT service
async function onLanguageSelected(language: string) {
  console.log('User selected language:', language)
  const channel = store.channelName
  if (channel) {
    await sttApi.start(channel, language)
  }
}

// Called when transcript successfully starts
function onTranscriptStarted(language: string) {
  console.log('Transcript started with language:', language)
}

// Called when transcript stops
async function onTranscriptStopped() {
  console.log('Transcript stopped')
  const channel = store.channelName
  if (channel) {
    await sttApi.stop(channel)
  }
}
</script>

<template>
  <DiagVideoCallV2
    :show-transcript="true"
    @transcript-language-selected="onLanguageSelected"
    @transcript-started="onTranscriptStarted"
    @transcript-stopped="onTranscriptStopped"
  />
</template>
```

### Event Flow

When the user clicks the transcript button:

1. **Language Selector Modal** opens (first time)
2. User selects a language and clicks "Start"
3. `@transcript-language-selected` event fires with the selected language
4. Your handler calls your backend to start Agora STT
5. UI Kit calls `store.startTranscript(language)`
6. `@transcript-started` event fires when ready
7. Transcript entries start appearing

When the user clicks the transcript button again (to stop):

1. UI Kit calls `store.stopTranscript()`
2. `@transcript-stopped` event fires
3. Your handler calls your backend to stop Agora STT

### Changing Language During Active Session

```typescript
// Change language while transcript is running
await store.setTranscriptLanguage('zh-CN')

// This will:
// 1. Emit 'transcript-language-changed' event
// 2. Restart transcript with the new language (if adapter doesn't support live language change)
```

### Legacy Method - Manual Control

For custom views with individual components:

```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  DiagVideoGridV2,
  DiagCallControlsV2,
  DiagTranscriptPanelV2
} from '@diagvn/video-call-ui-kit-v2'
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2'

const store = useVideoCallStoreV2()
const showTranscriptPanel = computed(() => store.transcriptState.enabled)

onMounted(async () => {
  const adapter = createAgoraAdapter({
    appId: import.meta.env.VITE_AGORA_APP_ID
  })
  store.setAdapter(adapter)
  await store.init()
})

// Your backend API calls
async function startSTT(language = 'vi-VN') {
  await fetch('/api/stt/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      channelName: store.channelName, 
      language 
    })
  })
  await store.startTranscript(language)
}

async function stopSTT() {
  await fetch('/api/stt/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelName: store.channelName })
  })
  await store.stopTranscript()
}
</script>

<template>
  <div class="call-container">
    <DiagVideoGridV2 :participants="store.participants" />

    <DiagTranscriptPanelV2
      v-if="showTranscriptPanel"
      :entries="store.transcriptState.entries"
      :is-active="store.transcriptState.enabled"
      @close="stopSTT"
      @clear="store.clearTranscript"
    />

    <DiagCallControlsV2
      :is-muted="store.isMuted"
      :is-video-off="store.isVideoOff"
      :is-transcript-enabled="store.transcriptState.enabled"
      @toggle-mic="store.toggleMic"
      @toggle-cam="store.toggleCam"
      @toggle-transcript="store.transcriptState.enabled ? stopSTT() : startSTT()"
      @leave="store.leave"
    />
  </div>
</template>
```

### Store Methods Reference

```typescript
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'

const store = useVideoCallStoreV2()

// State (readonly)
store.transcriptState.enabled   // boolean - is STT active
store.transcriptState.language  // string - current language (e.g., 'vi-VN')
store.transcriptState.entries   // TranscriptEntry[] - transcript history

// Actions
await store.startTranscript('vi-VN')       // Start listening for transcript data
await store.stopTranscript()                // Stop listening
await store.toggleTranscript('vi-VN')       // Toggle on/off
await store.setTranscriptLanguage('zh-CN')  // Change language (restarts if active)
store.clearTranscript()                      // Clear transcript entries
```

### Listening for Transcript Events

```typescript
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2'

const store = useVideoCallStoreV2()

// Subscribe to transcript entries
store.eventBus.on('transcript-entry', (entry) => {
  console.log(`[${entry.speakerName}]: ${entry.text}`)
  // entry.isFinal - true if this is a final transcript, false for interim
  // entry.confidence - confidence score (0-1) for the transcription
  // entry.language - detected/set language
  // entry.timestamp - when the entry was received
})

// Subscribe to transcript state changes
store.eventBus.on('transcript-started', ({ language }) => {
  console.log('Transcript started with language:', language)
})

store.eventBus.on('transcript-stopped', () => {
  console.log('Transcript stopped')
})

store.eventBus.on('transcript-error', ({ code, message }) => {
  console.error('Transcript error:', code, message)
})

store.eventBus.on('transcript-language-changed', ({ language }) => {
  console.log('Language changed to:', language)
})
```

### TranscriptEntry Type

```typescript
interface TranscriptEntry {
  id: string           // Unique ID
  speakerName: string  // Speaker's display name
  speakerId: string    // Speaker's UID
  text: string         // Transcribed text
  isFinal: boolean     // Final vs interim result
  confidence?: number  // 0-1 confidence score
  language?: string    // Language code (e.g., 'vi-VN')
  timestamp: number    // Unix timestamp
  isLocal?: boolean    // Is from local user
}
```

## Backend Implementation

### Agora Real-time STT API

Your backend needs to call Agora's Real-time STT REST API to start/stop the service.

#### Prerequisites

1. Enable Real-time STT in your Agora Console
2. Get your App ID, App Certificate, and Customer ID/Secret
3. Generate a RESTful API token

#### Starting STT Service

**Endpoint:** `POST https://api.agora.io/v1/projects/{appId}/rtsc/speech-to-text/tasks`

**Request Headers:**
```
Authorization: Basic {base64(customerKey:customerSecret)}
Content-Type: application/json
```

**Request Body:**
```json
{
  "audio": {
    "subscribeSource": "AGORARTC",
    "agoraRtcConfig": {
      "channelName": "your-channel-name",
      "uid": "111111",
      "token": "your-rtc-token-for-bot",
      "channelType": "LIVE_TYPE",
      "subscribeConfig": {
        "subscribeMode": "CHANNEL_MODE"
      }
    }
  },
  "config": {
    "features": ["RECOGNIZE"],
    "recognizeConfig": {
      "language": "en-US",
      "model": "Model",
      "connectionTimeout": 60,
      "output": {
        "destinations": ["AgoraRTCDataStream"],
        "agoraRTCDataStream": {
          "channelName": "your-channel-name",
          "uid": "111111",
          "token": "your-rtc-token-for-bot"
        }
      }
    }
  }
}
```

**Supported Languages:**
- `en-US` - English (US)
- `en-GB` - English (UK)
- `zh-CN` - Chinese (Simplified)
- `zh-TW` - Chinese (Traditional)
- `ja-JP` - Japanese
- `ko-KR` - Korean
- `vi-VN` - Vietnamese
- `de-DE` - German
- `fr-FR` - French
- `es-ES` - Spanish
- `it-IT` - Italian
- `pt-BR` - Portuguese (Brazil)

#### Stopping STT Service

**Endpoint:** `DELETE https://api.agora.io/v1/projects/{appId}/rtsc/speech-to-text/tasks/{taskId}`

**Request Headers:**
```
Authorization: Basic {base64(customerKey:customerSecret)}
```

### Example Backend Implementation (Node.js)

```typescript
import express from 'express'
import fetch from 'node-fetch'

const app = express()
app.use(express.json())

const AGORA_APP_ID = process.env.AGORA_APP_ID
const AGORA_CUSTOMER_KEY = process.env.AGORA_CUSTOMER_KEY
const AGORA_CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET

// Store active STT tasks
const activeTasks = new Map<string, string>()

// Helper to generate auth header
function getAuthHeader() {
  const credentials = Buffer.from(`${AGORA_CUSTOMER_KEY}:${AGORA_CUSTOMER_SECRET}`).toString('base64')
  return `Basic ${credentials}`
}

// Start STT endpoint
app.post('/api/stt/start', async (req, res) => {
  try {
    const { channelName, language = 'en-US', token } = req.body
    
    const botUid = '111111'
    
    const response = await fetch(
      `https://api.agora.io/v1/projects/${AGORA_APP_ID}/rtsc/speech-to-text/tasks`,
      {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio: {
            subscribeSource: 'AGORARTC',
            agoraRtcConfig: {
              channelName,
              uid: botUid,
              token: token, // Generate token for bot UID
              channelType: 'LIVE_TYPE',
              subscribeConfig: {
                subscribeMode: 'CHANNEL_MODE'
              }
            }
          },
          config: {
            features: ['RECOGNIZE'],
            recognizeConfig: {
              language,
              model: 'Model',
              connectionTimeout: 60,
              output: {
                destinations: ['AgoraRTCDataStream'],
                agoraRTCDataStream: {
                  channelName,
                  uid: botUid,
                  token: token
                }
              }
            }
          }
        })
      }
    )
    
    const data = await response.json()
    
    if (data.taskId) {
      activeTasks.set(channelName, data.taskId)
      res.json({ success: true, taskId: data.taskId })
    } else {
      res.status(400).json({ success: false, error: data })
    }
  } catch (error) {
    console.error('Failed to start STT:', error)
    res.status(500).json({ success: false, error: String(error) })
  }
})

// Stop STT endpoint
app.post('/api/stt/stop', async (req, res) => {
  try {
    const { channelName } = req.body
    const taskId = activeTasks.get(channelName)
    
    if (!taskId) {
      return res.json({ success: true, message: 'No active STT task' })
    }
    
    await fetch(
      `https://api.agora.io/v1/projects/${AGORA_APP_ID}/rtsc/speech-to-text/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader()
        }
      }
    )
    
    activeTasks.delete(channelName)
    res.json({ success: true })
  } catch (error) {
    console.error('Failed to stop STT:', error)
    res.status(500).json({ success: false, error: String(error) })
  }
})

app.listen(3000)
```

## Data Stream Message Format

Agora STT sends transcript data via RTC data stream messages. The UI Kit's adapter listens for these messages automatically.

### JSON Format (Simple)

If you configure the STT service to output JSON:

```json
{
  "text": "Hello, how are you?",
  "isFinal": true,
  "language": "en-US",
  "confidence": 0.95
}
```

### Protobuf Format (Agora Default)

By default, Agora uses protobuf encoding. The message structure:

```protobuf
syntax = "proto3";

message Text {
  int32 vendor = 1;
  int32 version = 2;
  int32 seqnum = 3;
  string uid = 4;
  int32 flag = 5;
  int64 time = 6;
  int32 lang = 7;
  int32 starttime = 8;
  int32 offtime = 9;
  repeated Word words = 10;
  bool end_of_segment = 11;
  int32 duration_ms = 12;
  string data_type = 13;
  repeated Translation trans = 14;
  string culture = 15;
}

message Word {
  string text = 1;
  int32 start_ms = 2;
  int32 duration_ms = 3;
  bool is_final = 4;
  double confidence = 5;
}

message Translation {
  bool is_final = 1;
  string lang = 2;
  repeated string texts = 3;
}
```

### Custom Protobuf Handling

For production apps using protobuf, you can handle raw messages:

```typescript
import protobuf from 'protobufjs'

// Load the protobuf schema
const root = await protobuf.load('/path/to/stt.proto')
const TextMessage = root.lookupType('Text')

// Listen for raw STT data
store.eventBus.on('rtm-message', (message) => {
  if (message.messageType === 'stt-raw' && message.payload) {
    const decoded = TextMessage.decode(message.payload)
    console.log('Decoded STT message:', decoded)
    
    // Process words
    for (const word of decoded.words) {
      // ... handle each word
    }
  }
})
```

## Notifying Other Participants

When STT is started/stopped, you should notify other participants using RTM:

```typescript
// When host starts STT
store.eventBus.emit('rtm-message', {
  senderId: store.localUid,
  message: JSON.stringify({ type: 'STT_ACTIVE', active: true, language: 'en-US' }),
  messageType: 'control'
})

// Other participants listen for this
store.eventBus.on('rtm-message', (msg) => {
  if (msg.messageType === 'control') {
    const data = JSON.parse(msg.message)
    if (data.type === 'STT_ACTIVE') {
      // STT was started/stopped by someone
      if (data.active) {
        // Start local transcript listener
        store.startTranscript(data.language)
      } else {
        store.stopTranscript()
      }
    }
  }
})
```

## Pricing & Limits

Agora Real-time STT is a paid service. Check [Agora Pricing](https://www.agora.io/en/pricing/) for current rates.

- Billing is per minute of audio processed
- You're charged for the duration the STT service is running
- Stop the service when not needed to avoid unnecessary charges

## Troubleshooting

### No transcript data received

1. Verify your backend is correctly starting the STT service
2. Check that the bot UID (111111) has a valid token
3. Ensure the channel name matches exactly
4. Check Agora Console for STT service logs

### Transcript delayed or missing words

1. This is normal for real-time STT - there's inherent latency
2. Interim results (`isFinal: false`) appear faster but may change
3. Final results (`isFinal: true`) are more accurate but delayed

### STT service fails to start

1. Verify your Agora credentials
2. Check that Real-time STT is enabled in your Agora Console
3. Ensure your account has sufficient balance

## References

- [Agora Real-time STT Documentation](https://docs.agora.io/en/real-time-transcription/overview/product-overview)
- [Agora Real-time STT REST API](https://docs.agora.io/en/real-time-transcription/reference/restful-api)
- [Agora Console](https://console.agora.io/)
