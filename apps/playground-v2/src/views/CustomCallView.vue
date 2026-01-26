<template>
  <div class="custom-call-view">
    <!-- Back Button -->
    <button class="back-btn" @click="goHome" v-if="!callState.isConnected">
      ← Back to Home
    </button>

    <!-- Configuration Panel (shown when not connected) -->
    <div v-if="!callState.isConnected" class="config-panel">
      <h2>Custom Integration Demo</h2>
      <p>Build your own layout with individual components</p>

      <div class="form-row">
        <div class="form-group">
          <label>App ID</label>
          <input v-model="appId" placeholder="Agora App ID" />
        </div>
        <div class="form-group">
          <label>Channel</label>
          <input v-model="channelName" placeholder="Channel name" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>User Name</label>
          <input v-model="userName" placeholder="Your name" />
        </div>
        <div class="form-group">
          <label>Layout</label>
          <select v-model="layout">
            <option value="grid">Grid</option>
            <option value="speaker">Speaker</option>
            <option value="spotlight">Spotlight</option>
          </select>
        </div>
      </div>

      <button class="start-btn" @click="startCall" :disabled="!canStart">
        Join Call
      </button>
    </div>

    <!-- Custom Call UI -->
    <div v-else class="call-container">
      <!-- Top Bar -->
      <DiagTopBarV2
        :channel-name="channelName"
        :participant-count="callState.participants.length"
        :is-recording="callState.recording?.state === 'recording'"
        :is-streaming="callState.streaming?.state === 'streaming'"
        @toggle-participants="toggleParticipants"
        @toggle-chat="toggleChat"
        @toggle-settings="toggleSettings"
      >
        <template #left>
          <div class="custom-badge">V2 Custom</div>
        </template>
      </DiagTopBarV2>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Video Grid -->
        <div class="video-area">
          <DiagVideoGridV2
            :participants="callState.participants"
            :local-participant="callState.localParticipant"
            :layout="layout"
            :pinned-participant-id="pinnedId"
            @pin-participant="onPinParticipant"
          />

          <!-- Reconnecting Banner -->
          <DiagBannerV2
            v-if="callState.connectionState === 'reconnecting'"
            type="warning"
            :message="t('banner.reconnecting')"
            :dismissible="false"
          />
        </div>

        <!-- Side Panel -->
        <div v-if="activePanel" class="side-panel">
          <DiagParticipantsPanelV2
            v-if="activePanel === 'participants'"
            :participants="callState.participants"
            :local-participant="callState.localParticipant"
            :is-host="true"
            @close="activePanel = null"
            @mute-participant="onMuteParticipant"
            @remove-participant="onRemoveParticipant"
          />

          <DiagChatPanelV2
            v-else-if="activePanel === 'chat'"
            :messages="callState.chatMessages"
            :local-user-id="callState.localParticipant?.id"
            @close="activePanel = null"
            @send-message="onSendMessage"
          />

          <DiagSettingsPanelV2
            v-else-if="activePanel === 'settings'"
            :devices="callState.devices"
            :selected-devices="callState.selectedDevices"
            :virtual-background="callState.virtualBackground"
            :beauty-effects="callState.beautyEffects"
            :noise-suppression="callState.noiseSuppression"
            @close="activePanel = null"
            @change-device="onChangeDevice"
            @change-virtual-background="onChangeVirtualBackground"
            @apply-virtual-background="onApplyVirtualBackground"
            @change-beauty-effects="onChangeBeautyEffects"
            @change-noise-suppression="onChangeNoiseSuppression"
          />
        </div>
      </div>

      <!-- Controls -->
      <DiagCallControlsV2
        :is-audio-enabled="callState.localParticipant?.isAudioEnabled ?? false"
        :is-video-enabled="callState.localParticipant?.isVideoEnabled ?? false"
        :is-screen-sharing="callState.isScreenSharing"
        :is-recording="callState.recording?.state === 'recording'"
        :layout="layout"
        @toggle-audio="onToggleAudio"
        @toggle-video="onToggleVideo"
        @toggle-screen-share="onToggleScreenShare"
        @toggle-recording="onToggleRecording"
        @change-layout="onChangeLayout"
        @leave="onLeave"
      >
        <template #extra>
          <button
            class="control-btn"
            :class="{ active: activePanel === 'transcript' }"
            @click="toggleTranscript"
            :title="t('controls.transcript')"
          >
            📝
          </button>
        </template>
      </DiagCallControlsV2>

      <!-- Transcript Panel (Bottom) -->
      <DiagTranscriptPanelV2
        v-if="activePanel === 'transcript'"
        :entries="callState.transcriptEntries"
        :is-enabled="callState.transcript.enabled"
        @toggle="onToggleTranscript"
        @close="activePanel = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  DiagTopBarV2,
  DiagVideoGridV2,
  DiagCallControlsV2,
  DiagParticipantsPanelV2,
  DiagChatPanelV2,
  DiagSettingsPanelV2,
  DiagTranscriptPanelV2,
  DiagBannerV2,
} from '@diagvn/video-call-ui-kit-v2';
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2';
import type {
  VideoCallAdapter,
  CallState,
  LayoutMode,
  VirtualBackgroundConfig,
  BeautyEffectsConfig,
  NoiseSuppressionLevel,
} from '@diagvn/video-call-core-v2';

const router = useRouter();
const { t } = useI18n();

// Form state
const appId = ref(import.meta.env.VITE_AGORA_APP_ID || '');
const channelName = ref('test-room');
const userName = ref('User-' + Math.floor(Math.random() * 1000));
const layout = ref<LayoutMode>('grid');

// Call state
const adapter = ref<VideoCallAdapter | null>(null);
const callState = reactive<CallState>({
  connectionState: 'disconnected',
  isConnected: false,
  participants: [],
  localParticipant: null,
  remoteParticipants: [],
  devices: { cameras: [], microphones: [], speakers: [] },
  selectedDevices: {},
  isScreenSharing: false,
  chatMessages: [],
  transcriptEntries: [],
  virtualBackground: { enabled: false, type: 'none' },
  beautyEffects: { enabled: false },
  noiseSuppression: { enabled: false, level: 'medium' },
  recording: { state: 'stopped' },
  streaming: { state: 'stopped' },
  transcript: { enabled: false },
  waitingRoom: { enabled: false, participants: [] },
});

// UI state
const activePanel = ref<'participants' | 'chat' | 'settings' | 'transcript' | null>(null);
const pinnedId = ref<string | null>(null);

const canStart = computed(() => {
  return appId.value && channelName.value && userName.value;
});

const startCall = async () => {
  if (!canStart.value) return;

  // Create adapter
  adapter.value = createAgoraAdapter({
    appId: appId.value,
  });

  // Subscribe to state changes
  adapter.value.onStateChange((newState) => {
    Object.assign(callState, newState);
  });

  // Join the call
  try {
    await adapter.value.join({
      channelName: channelName.value,
      userId: `user-${Date.now()}`,
      displayName: userName.value,
    });
  } catch (error) {
    console.error('Failed to join:', error);
    alert('Failed to join call: ' + (error as Error).message);
  }
};

// Panel toggles
const toggleParticipants = () => {
  activePanel.value = activePanel.value === 'participants' ? null : 'participants';
};

const toggleChat = () => {
  activePanel.value = activePanel.value === 'chat' ? null : 'chat';
};

const toggleSettings = () => {
  activePanel.value = activePanel.value === 'settings' ? null : 'settings';
};

const toggleTranscript = () => {
  activePanel.value = activePanel.value === 'transcript' ? null : 'transcript';
};

// Control handlers
const onToggleAudio = () => {
  if (callState.localParticipant?.isAudioEnabled) {
    adapter.value?.muteAudio();
  } else {
    adapter.value?.unmuteAudio();
  }
};

const onToggleVideo = () => {
  if (callState.localParticipant?.isVideoEnabled) {
    adapter.value?.muteVideo();
  } else {
    adapter.value?.unmuteVideo();
  }
};

const onToggleScreenShare = async () => {
  if (callState.isScreenSharing) {
    await adapter.value?.stopScreenShare();
  } else {
    await adapter.value?.startScreenShare();
  }
};

const onToggleRecording = async () => {
  if (callState.recording?.state === 'recording') {
    await adapter.value?.stopRecording();
  } else {
    await adapter.value?.startRecording({});
  }
};

const onToggleTranscript = (enabled: boolean) => {
  if (enabled) {
    adapter.value?.startTranscription({ language: 'en-US' });
  } else {
    adapter.value?.stopTranscription();
  }
};

const onChangeLayout = (newLayout: LayoutMode) => {
  layout.value = newLayout;
};

const onLeave = async () => {
  await adapter.value?.leave();
  adapter.value = null;
};

// Participant handlers
const onPinParticipant = (participantId: string | null) => {
  pinnedId.value = participantId;
};

const onMuteParticipant = async (participantId: string, type: 'audio' | 'video') => {
  await adapter.value?.muteRemoteParticipant(participantId, type);
};

const onRemoveParticipant = async (participantId: string) => {
  await adapter.value?.removeParticipant(participantId);
};

// Chat handler
const onSendMessage = async (message: string) => {
  await adapter.value?.sendChatMessage({ content: message });
};

// Device handlers
const onChangeDevice = async (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => {
  if (type === 'camera') {
    await adapter.value?.switchCamera(deviceId);
  } else if (type === 'microphone') {
    await adapter.value?.switchMicrophone(deviceId);
  } else if (type === 'speaker') {
    await adapter.value?.switchSpeaker(deviceId);
  }
};

const onChangeVirtualBackground = async (config: VirtualBackgroundConfig) => {
  await adapter.value?.setVirtualBackground(config);
};

const onApplyVirtualBackground = async () => {
  await adapter.value?.applyVirtualBackground();
};

const onChangeBeautyEffects = async (config: BeautyEffectsConfig) => {
  await adapter.value?.setBeautyEffects(config);
};

const onChangeNoiseSuppression = async (level: NoiseSuppressionLevel) => {
  await adapter.value?.setNoiseSuppression({ enabled: true, level });
};

const goHome = () => {
  router.push('/');
};

onUnmounted(() => {
  adapter.value?.leave();
  adapter.value = null;
});
</script>

<style scoped>
.custom-call-view {
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
  max-width: 600px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group select option {
  background: #242442;
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
  margin-top: 8px;
}

.start-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Call Container */
.call-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.video-area {
  flex: 1;
  position: relative;
  background: #0f0f1a;
}

.side-panel {
  width: 320px;
  background: #242442;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn.active {
  background: #667eea;
}
</style>
