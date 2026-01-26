<template>
  <div class="simple-call-view">
    <!-- Back Button -->
    <button class="back-btn" @click="goHome">← Back to Home</button>

    <!-- Configuration Panel (shown when not connected) -->
    <div v-if="!isConnected" class="config-panel">
      <h2>Simple Integration Demo</h2>
      <p>Using <code>DiagVideoCallV2</code> - the all-in-one component</p>

      <div class="form-group">
        <label>App ID</label>
        <input v-model="appId" placeholder="Enter Agora App ID" />
      </div>

      <div class="form-group">
        <label>Channel Name</label>
        <input v-model="channelName" placeholder="Enter channel name" />
      </div>

      <div class="form-group">
        <label>User Name</label>
        <input v-model="userName" placeholder="Enter your name" />
      </div>

      <div class="form-group">
        <label>Token Server (optional)</label>
        <input v-model="tokenServer" placeholder="https://your-token-server.com" />
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="enableVirtualBackground" />
          Enable Virtual Background
        </label>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="enableBeautyEffects" />
          Enable Beauty Effects
        </label>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="enableWaitingRoom" />
          Enable Waiting Room
        </label>
      </div>

      <button class="start-btn" @click="startCall" :disabled="!canStart">
        Start Call
      </button>

      <div class="hint">
        <strong>Hint:</strong> You can get a free Agora App ID from
        <a href="https://console.agora.io" target="_blank">console.agora.io</a>
      </div>
    </div>

    <!-- Video Call Component -->
    <DiagVideoCallV2
      v-if="isConnected"
      :features="featureFlags"
      :room-title="channelName"
      theme="dark"
      @join="handleJoin"
      @leave="handleLeave"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { DiagVideoCallV2 } from '@diagvn/video-call-ui-kit-v2';
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2';
import { useVideoCallStoreV2 } from '@diagvn/video-call-core-v2';
import type { JoinOptions, FeatureFlags } from '@diagvn/video-call-core-v2';
import { useSttApi } from '../composables/useSttApi';

const router = useRouter();
const store = useVideoCallStoreV2();
const sttApi = useSttApi();

// Form state
const appId = ref(import.meta.env.VITE_AGORA_APP_ID || '');
const channelName = ref('test-room');
const userName = ref('User-' + Math.floor(Math.random() * 1000));
const tokenServer = ref(import.meta.env.VITE_TOKEN_SERVER_URL || '');
const enableVirtualBackground = ref(true);
const enableBeautyEffects = ref(true);
const enableWaitingRoom = ref(false);

// Call state
const isConnected = ref(false);

// Watch for transcript state changes to trigger STT API
watch(
  () => store.transcriptState?.enabled,
  async (enabled, prevEnabled) => {
    // Skip if same state or not connected
    if (enabled === prevEnabled || !isConnected.value) return;

    try {
      if (enabled) {
        // Start STT via Agora REST API
        await sttApi.startStt({
          channelName: channelName.value,
          uid: '999999', // Dedicated bot UID
          language: 'vi-VN'
        });
      } else {
        // Stop STT
        await sttApi.stopStt();
      }
    } catch (error) {
      console.error('[SimpleCallView] STT toggle failed:', error);
    }
  }
);

const canStart = computed(() => {
  return appId.value && channelName.value && userName.value;
});

const featureFlags = computed<Partial<FeatureFlags>>(() => ({
  virtualBackground: enableVirtualBackground.value,
  beautyEffects: enableBeautyEffects.value,
  waitingRoom: enableWaitingRoom.value,
  screenShare: true,
  recording: true,
  chat: true,
  transcript: true,
}));

const startCall = async () => {
  if (!canStart.value) return;

  try {
    // Create the Agora adapter
    const adapter = createAgoraAdapter({
      appId: appId.value,
    });

    // Set adapter on store and configure features
    store.setAdapter(adapter);
    store.setFeatureFlags(featureFlags.value);

    // Initialize (gets devices, moves to prejoin)
    await store.init();

    isConnected.value = true;
  } catch (error) {
    console.error('Failed to initialize:', error);
    alert(`Failed to initialize: ${(error as Error).message}`);
  }
};

const handleJoin = async (options: JoinOptions) => {
  try {
    await store.join({
      ...options,
      channel: channelName.value,
      uid: Math.floor(Math.random() * 100000),
      displayName: userName.value,
      token: undefined, // Use undefined for testing without token
    });
  } catch (error) {
    console.error('Failed to join:', error);
    onError(error as Error);
  }
};

const handleLeave = () => {
  isConnected.value = false;
};

const onError = (error: Error) => {
  console.error('Call error:', error);
  alert(`Error: ${error.message}`);
};

const goHome = () => {
  if (isConnected.value) {
    store.leave();
  }
  router.push('/');
};

onUnmounted(() => {
  if (isConnected.value) {
    store.leave();
  }
  // Stop STT if running
  if (sttApi.isRunning.value) {
    sttApi.stopStt().catch(console.error);
  }
});
</script>

<style scoped>
.simple-call-view {
  width: 100%;
  height: 100vh;
  background: #1a1a2e;
  position: relative;
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.config-panel {
  max-width: 500px;
  margin: 0 auto;
  padding: 60px 40px;
  background: #242442;
  border-radius: 16px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.config-panel h2 {
  color: white;
  margin-bottom: 8px;
  text-align: center;
}

.config-panel > p {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 32px;
}

.config-panel code {
  background: rgba(102, 126, 234, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  color: #667eea;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group input:not([type]) {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.form-group input[type="text"]:focus,
.form-group input:not([type]):focus {
  outline: none;
  border-color: #667eea;
}

.form-group input[type="checkbox"] {
  margin-right: 8px;
}

.form-group label:has(input[type="checkbox"]) {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.start-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
}

.start-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint {
  margin-top: 24px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  text-align: center;
}

.hint a {
  color: #667eea;
}
</style>
