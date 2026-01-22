// Styles
import './styles/base.css'

// Components
export { default as DiagCallShell } from './components/DiagCallShell.vue'
export { default as DiagPreJoinPanel } from './components/DiagPreJoinPanel.vue'
export { default as DiagCallControls } from './components/DiagCallControls.vue'
export { default as DiagVideoGrid } from './components/DiagVideoGrid.vue'
export { default as DiagVideoTile } from './components/DiagVideoTile.vue'
export { default as DiagToasts } from './components/DiagToasts.vue'
export { default as DiagBanner } from './components/DiagBanner.vue'
export { default as DiagTranscript } from './components/DiagTranscript.vue'

// Component Types
export type { DiagCallShellProps } from './components/DiagCallShell.vue'
export type { DiagPreJoinPanelProps, DiagPreJoinPanelEmits } from './components/DiagPreJoinPanel.vue'
export type { DiagCallControlsProps, DiagCallControlsEmits } from './components/DiagCallControls.vue'
export type { DiagVideoGridProps } from './components/DiagVideoGrid.vue'
export type { DiagVideoTileProps, VideoRenderer } from './components/DiagVideoTile.vue'
export type { DiagToastsProps, DiagToastsEmits } from './components/DiagToasts.vue'
export type { DiagBannerProps, DiagBannerEmits } from './components/DiagBanner.vue'
export type { DiagTranscriptProps, DiagTranscriptEmits } from './components/DiagTranscript.vue'

// i18n
export { createVideoCallI18n, vi, en } from './i18n'
export type { VideoCallMessages } from './i18n'
