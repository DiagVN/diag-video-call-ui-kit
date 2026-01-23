<template>
  <div class="prejoin-view">
    <!-- Back Button -->
    <button class="back-btn" @click="goHome">← Back to Home</button>

    <div class="prejoin-container">
      <h1>{{ t('prejoin.title') }}</h1>
      <p class="subtitle">{{ t('prejoin.subtitle') }}</p>

      <!-- Mode Selector -->
      <div class="mode-selector">
        <button
          :class="['mode-btn', { active: mode === 'mock' }]"
          @click="mode = 'mock'"
        >
          🎭 Mock Mode
        </button>
        <button
          :class="['mode-btn', { active: mode === 'agora' }]"
          @click="mode = 'agora'"
        >
          📡 Agora Mode
        </button>
      </div>

      <!-- Agora Config (only in agora mode) -->
      <div v-if="mode === 'agora'" class="agora-config">
        <div class="form-group">
          <label>{{ t('prejoin.appId') }}</label>
          <input
            v-model="appId"
            :placeholder="t('prejoin.appIdPlaceholder')"
          />
        </div>
        <div class="form-group">
          <label>{{ t('prejoin.tokenServer') }}</label>
          <input
            v-model="tokenServer"
            :placeholder="t('prejoin.tokenServerPlaceholder')"
          />
        </div>
      </div>

      <!-- Room Settings -->
      <div class="room-settings">
        <div class="form-group">
          <label>{{ t('prejoin.channelName') }}</label>
          <input
            v-model="channelName"
            :placeholder="t('prejoin.channelNamePlaceholder')"
          />
        </div>
        <div class="form-group">
          <label>{{ t('prejoin.displayName') }}</label>
          <input
            v-model="displayName"
            :placeholder="t('prejoin.displayNamePlaceholder')"
          />
        </div>
      </div>

      <!-- Preview & Device Selection -->
      <DiagPrejoinV2
        ref="prejoinRef"
        :adapter="previewAdapter"
        :initial-audio-enabled="audioEnabled"
        :initial-video-enabled="videoEnabled"
        @audio-change="audioEnabled = $event"
        @video-change="videoEnabled = $event"
        @device-change="onDeviceChange"
      />

      <!-- Join Button -->
      <button
        class="join-btn"
        :disabled="!canJoin || isJoining"
        @click="joinCall"
      >
        <span v-if="isJoining">{{ t('prejoin.joining') }}...</span>
        <span v-else>{{ t('prejoin.join') }}</span>
      </button>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { DiagPrejoinV2 } from '@diagvn/video-call-ui-kit-v2';
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2';
import type { VideoCallAdapter, SelectedDevices } from '@diagvn/video-call-core-v2';

const router = useRouter();
const { t } = useI18n();

// Mode
const mode = ref<'mock' | 'agora'>('agora');

// Agora config
const appId = ref(import.meta.env.VITE_AGORA_APP_ID || '');
const tokenServer = ref(import.meta.env.VITE_TOKEN_SERVER_URL || '');

// Room settings
const channelName = ref('test-room-' + Math.floor(Math.random() * 1000));
const displayName = ref('User-' + Math.floor(Math.random() * 1000));

// Device settings
const audioEnabled = ref(true);
const videoEnabled = ref(true);
const selectedDevices = ref<SelectedDevices>({});

// State
const isJoining = ref(false);
const errorMessage = ref('');
const previewAdapter = ref<VideoCallAdapter | null>(null);
const prejoinRef = ref<InstanceType<typeof DiagPrejoinV2> | null>(null);

const canJoin = computed(() => {
  if (mode.value === 'agora' && !appId.value) return false;
  return channelName.value && displayName.value;
});

const onDeviceChange = (devices: SelectedDevices) => {
  selectedDevices.value = devices;
};

const joinCall = async () => {
  if (!canJoin.value) return;

  isJoining.value = true;
  errorMessage.value = '';

  try {
    // Store settings in sessionStorage for InCallView
    sessionStorage.setItem('v2-call-settings', JSON.stringify({
      mode: mode.value,
      appId: appId.value,
      tokenServer: tokenServer.value,
      channelName: channelName.value,
      displayName: displayName.value,
      audioEnabled: audioEnabled.value,
      videoEnabled: videoEnabled.value,
      selectedDevices: selectedDevices.value,
    }));

    // Navigate to call view
    router.push('/call');
  } catch (error) {
    errorMessage.value = (error as Error).message;
    isJoining.value = false;
  }
};

const goHome = () => {
  router.push('/');
};

onMounted(async () => {
  // Create preview adapter for device selection
  if (mode.value === 'agora' && appId.value) {
    previewAdapter.value = createAgoraAdapter({
      appId: appId.value,
    });
  }
});

onUnmounted(() => {
  previewAdapter.value = null;
});
</script>

<style scoped>
.prejoin-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px 20px;
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

.prejoin-container {
  max-width: 600px;
  margin: 0 auto;
  padding-top: 60px;
}

h1 {
  color: white;
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 32px;
}

.mode-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.mode-btn {
  flex: 1;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.mode-btn.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
  color: white;
}

.agora-config,
.room-settings {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.join-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 24px;
}

.join-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.join-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  text-align: center;
}
</style>
