<template>
  <div class="incall-view">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>{{ t('call.connecting') }}...</p>
    </div>

    <!-- Call Shell -->
    <DiagCallShellV2
      v-else
      :connection-state="callState.connectionState"
      :layout="layout"
    >
      <!-- Top Bar -->
      <template #topbar>
        <DiagTopBarV2
          :channel-name="settings.channelName"
          :participant-count="callState.participants.length"
          :is-recording="callState.recording?.state === 'recording'"
          :duration="callDuration"
          @toggle-participants="togglePanel('participants')"
          @toggle-chat="togglePanel('chat')"
          @toggle-settings="togglePanel('settings')"
        />
      </template>

      <!-- Main Video Area -->
      <template #main>
        <DiagVideoGridV2
          :participants="callState.participants"
          :local-participant="callState.localParticipant"
          :layout="layout"
          :pinned-participant-id="pinnedId"
          @pin-participant="pinnedId = $event"
        />

        <!-- Reconnecting Banner -->
        <DiagBannerV2
          v-if="callState.connectionState === 'reconnecting'"
          type="warning"
          :message="t('banner.reconnecting')"
          :dismissible="false"
        />

        <!-- Screen Share Banner -->
        <DiagBannerV2
          v-if="callState.isScreenSharing"
          type="info"
          :message="t('banner.screenSharing')"
          @dismiss="stopScreenShare"
        />
      </template>

      <!-- Side Panel -->
      <template #sidepanel v-if="activePanel">
        <DiagParticipantsPanelV2
          v-if="activePanel === 'participants'"
          :participants="callState.participants"
          :local-participant="callState.localParticipant"
          :waiting-room-participants="callState.waitingRoom.participants"
          :is-host="true"
          @close="activePanel = null"
          @mute-participant="onMuteParticipant"
          @remove-participant="onRemoveParticipant"
          @admit-participant="onAdmitParticipant"
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
          @toggle-noise-suppression="onToggleNoiseSuppression"
        />
      </template>

      <!-- Controls -->
      <template #controls>
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
          @change-layout="layout = $event"
          @leave="onLeave"
        >
          <template #extra>
            <button
              class="control-btn"
              :class="{ active: showTranscript }"
              @click="showTranscript = !showTranscript"
              :title="t('controls.transcript')"
            >
              📝
            </button>
          </template>
        </DiagCallControlsV2>
      </template>

      <!-- Bottom Panel (Transcript) -->
      <template #bottom v-if="showTranscript">
        <DiagTranscriptPanelV2
          :entries="callState.transcriptEntries"
          :is-enabled="callState.transcript.enabled"
          @toggle="onToggleTranscript"
          @close="showTranscript = false"
        />
      </template>
    </DiagCallShellV2>

    <!-- Call Ended Modal -->
    <DiagCallEndedV2
      v-if="showCallEnded"
      :reason="callEndReason"
      :duration="callDuration"
      @rejoin="rejoinCall"
      @leave="goHome"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  DiagCallShellV2,
  DiagTopBarV2,
  DiagVideoGridV2,
  DiagCallControlsV2,
  DiagParticipantsPanelV2,
  DiagChatPanelV2,
  DiagSettingsPanelV2,
  DiagTranscriptPanelV2,
  DiagBannerV2,
  DiagCallEndedV2,
} from '@diagvn/video-call-ui-kit-v2';
import { createAgoraAdapter } from '@diagvn/agora-web-adapter-v2';
import type {
  VideoCallAdapter,
  CallState,
  LayoutMode,
  VirtualBackgroundConfig,
  BeautyEffectsConfig,
} from '@diagvn/video-call-core-v2';

const router = useRouter();
const { t } = useI18n();

// Settings from prejoin
interface CallSettings {
  mode: 'mock' | 'agora';
  appId: string;
  tokenServer: string;
  channelName: string;
  displayName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  selectedDevices: Record<string, string>;
}

const settings = reactive<CallSettings>({
  mode: 'agora',
  appId: '',
  tokenServer: '',
  channelName: '',
  displayName: '',
  audioEnabled: true,
  videoEnabled: true,
  selectedDevices: {},
});

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
const isLoading = ref(true);
const layout = ref<LayoutMode>('grid');
const activePanel = ref<'participants' | 'chat' | 'settings' | null>(null);
const pinnedId = ref<string | null>(null);
const showTranscript = ref(false);
const showCallEnded = ref(false);
const callEndReason = ref('');
const callDuration = ref(0);
const callStartTime = ref<number | null>(null);
let durationInterval: ReturnType<typeof setInterval> | null = null;

const togglePanel = (panel: 'participants' | 'chat' | 'settings') => {
  activePanel.value = activePanel.value === panel ? null : panel;
};

// Media controls
const onToggleAudio = async () => {
  if (callState.localParticipant?.isAudioEnabled) {
    await adapter.value?.muteAudio();
  } else {
    await adapter.value?.unmuteAudio();
  }
};

const onToggleVideo = async () => {
  if (callState.localParticipant?.isVideoEnabled) {
    await adapter.value?.muteVideo();
  } else {
    await adapter.value?.unmuteVideo();
  }
};

const onToggleScreenShare = async () => {
  if (callState.isScreenSharing) {
    await adapter.value?.stopScreenShare();
  } else {
    await adapter.value?.startScreenShare();
  }
};

const stopScreenShare = async () => {
  await adapter.value?.stopScreenShare();
};

const onToggleRecording = async () => {
  if (callState.recording?.state === 'recording') {
    await adapter.value?.stopRecording();
  } else {
    await adapter.value?.startRecording({});
  }
};

const onToggleTranscript = async (enabled: boolean) => {
  if (enabled) {
    await adapter.value?.startTranscription({ language: 'en-US' });
  } else {
    await adapter.value?.stopTranscription();
  }
};

// Participant actions
const onMuteParticipant = async (participantId: string, type: 'audio' | 'video') => {
  await adapter.value?.muteRemoteParticipant(participantId, type);
};

const onRemoveParticipant = async (participantId: string) => {
  await adapter.value?.removeParticipant(participantId);
};

const onAdmitParticipant = async (participantId: string) => {
  await adapter.value?.admitFromWaitingRoom(participantId);
};

// Chat
const onSendMessage = async (message: string) => {
  await adapter.value?.sendChatMessage({ content: message });
};

// Device & effects
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adapter.value as any)?.applyVirtualBackground?.();
};

const onChangeBeautyEffects = async (config: BeautyEffectsConfig) => {
  await adapter.value?.setBeautyEffects(config);
};

const onToggleNoiseSuppression = async (enabled: boolean) => {
  await adapter.value?.setNoiseSuppression({
    enabled,
    level: 'medium',
  });
};

// Call lifecycle
const onLeave = async () => {
  await adapter.value?.leave();
  showCallEnded.value = true;
  callEndReason.value = 'left';
};

const rejoinCall = async () => {
  showCallEnded.value = false;
  await joinCall();
};

const goHome = () => {
  router.push('/');
};

const joinCall = async () => {
  isLoading.value = true;

  try {
    // Create adapter based on mode
    if (settings.mode === 'agora') {
      adapter.value = createAgoraAdapter({
        appId: settings.appId,
        tokenServer: settings.tokenServer || undefined,
      });
    } else {
      // Mock mode - use a dummy adapter
      // In real implementation, you'd have a mock adapter
      console.log('Mock mode - using mock adapter');
      isLoading.value = false;
      return;
    }

    // Subscribe to state changes
    adapter.value.onStateChange((newState) => {
      Object.assign(callState, newState);
    });

    // Join
    await adapter.value.join({
      channelName: settings.channelName,
      userId: `user-${Date.now()}`,
      displayName: settings.displayName,
    });

    // Apply initial settings
    if (!settings.audioEnabled) {
      await adapter.value.muteAudio();
    }
    if (!settings.videoEnabled) {
      await adapter.value.muteVideo();
    }

    // Start duration timer
    callStartTime.value = Date.now();
    durationInterval = setInterval(() => {
      if (callStartTime.value) {
        callDuration.value = Math.floor((Date.now() - callStartTime.value) / 1000);
      }
    }, 1000);

    isLoading.value = false;
  } catch (error) {
    console.error('Failed to join call:', error);
    isLoading.value = false;
    showCallEnded.value = true;
    callEndReason.value = (error as Error).message;
  }
};

onMounted(() => {
  // Load settings from session storage
  const savedSettings = sessionStorage.getItem('v2-call-settings');
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings));
    joinCall();
  } else {
    // No settings, redirect to prejoin
    router.push('/prejoin');
  }
});

onUnmounted(() => {
  if (durationInterval) {
    clearInterval(durationInterval);
  }
  adapter.value?.leave();
  adapter.value = null;
});
</script>

<style scoped>
.incall-view {
  width: 100%;
  height: 100vh;
  background: #0f0f1a;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: white;
  z-index: 100;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
