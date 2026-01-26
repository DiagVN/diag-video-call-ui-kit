<template>
  <span class="vc-icon" :class="iconClasses" v-html="iconSvg" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as icons from './index'

export type IconName = 
  | 'mic-on' | 'mic-off'
  | 'camera-on' | 'camera-off'
  | 'screen-share' | 'stop-share'
  | 'switch-camera'
  | 'pin' | 'unpin'
  | 'hand-raised'
  | 'close'
  | 'recording'
  | 'video-call'
  | 'chat'
  | 'participants'
  | 'settings'
  | 'more'
  | 'leave-call'
  | 'success' | 'warning' | 'error' | 'info'
  | 'network'
  | 'fullscreen' | 'exit-fullscreen'
  | 'lock'
  | 'phone'
  | 'blocked'
  | 'timeout'
  | 'wave'
  | 'download'
  | 'document'
  | 'blur'
  | 'attachment'
  | 'emoji'
  | 'signal-strong' | 'signal-weak' | 'no-signal'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface VcIconProps {
  name: IconName
  size?: IconSize
}

const props = withDefaults(defineProps<VcIconProps>(), {
  size: 'md'
})

const iconMap: Record<IconName, string> = {
  'mic-on': icons.MicOnIcon,
  'mic-off': icons.MicOffIcon,
  'camera-on': icons.CameraOnIcon,
  'camera-off': icons.CameraOffIcon,
  'screen-share': icons.ScreenShareIcon,
  'stop-share': icons.StopShareIcon,
  'switch-camera': icons.SwitchCameraIcon,
  'pin': icons.PinIcon,
  'unpin': icons.UnpinIcon,
  'hand-raised': icons.HandRaisedIcon,
  'close': icons.CloseIcon,
  'recording': icons.RecordingIcon,
  'video-call': icons.VideoCallIcon,
  'chat': icons.ChatIcon,
  'participants': icons.ParticipantsIcon,
  'settings': icons.SettingsIcon,
  'more': icons.MoreIcon,
  'leave-call': icons.LeaveCallIcon,
  'success': icons.SuccessIcon,
  'warning': icons.WarningIcon,
  'error': icons.ErrorIcon,
  'info': icons.InfoIcon,
  'network': icons.NetworkIcon,
  'fullscreen': icons.FullscreenIcon,
  'exit-fullscreen': icons.ExitFullscreenIcon,
  'lock': icons.LockIcon,
  'phone': icons.PhoneIcon,
  'blocked': icons.BlockedIcon,
  'timeout': icons.TimeoutIcon,
  'wave': icons.WaveIcon,
  'download': icons.DownloadIcon,
  'document': icons.DocumentIcon,
  'blur': icons.BlurIcon,
  'attachment': icons.AttachmentIcon,
  'emoji': icons.EmojiIcon,
  'signal-strong': icons.SignalStrong,
  'signal-weak': icons.SignalWeak,
  'no-signal': icons.NoSignal,
}

const iconSvg = computed(() => iconMap[props.name] || '')

const iconClasses = computed(() => [
  `vc-icon--${props.size}`
])
</script>

<style scoped>
.vc-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vc-icon :deep(svg) {
  display: block;
}

.vc-icon--xs :deep(svg) {
  width: 12px;
  height: 12px;
}

.vc-icon--sm :deep(svg) {
  width: 16px;
  height: 16px;
}

.vc-icon--md :deep(svg) {
  width: 20px;
  height: 20px;
}

.vc-icon--lg :deep(svg) {
  width: 24px;
  height: 24px;
}

.vc-icon--xl :deep(svg) {
  width: 32px;
  height: 32px;
}
</style>
