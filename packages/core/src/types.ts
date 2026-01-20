/**
 * Call State Machine States
 */
export type CallState =
  | 'idle'
  | 'prejoin'
  | 'connecting'
  | 'in_call'
  | 'reconnecting'
  | 'ended'
  | 'error'

/**
 * Participant Role
 */
export type ParticipantRole = 'host' | 'speaker' | 'audience'

/**
 * Network Quality Level (0-5, where 0 is unknown)
 */
export type NetworkQuality = 0 | 1 | 2 | 3 | 4 | 5

/**
 * Participant in a call
 */
export interface Participant {
  /** Unique participant ID */
  id: string
  /** Display name */
  displayName: string
  /** Participant role */
  role: ParticipantRole
  /** Is this the local user */
  isLocal: boolean
  /** Audio enabled */
  audioEnabled: boolean
  /** Video enabled */
  videoEnabled: boolean
  /** Is currently speaking */
  isSpeaking: boolean
  /** Network quality (0-5) */
  networkQuality: NetworkQuality
  /** Optional avatar URL */
  avatarUrl?: string
  /** Is screen sharing */
  isScreenSharing?: boolean
  /** Join timestamp */
  joinedAt?: number
}

/**
 * Media Device
 */
export interface MediaDevice {
  /** Device ID */
  deviceId: string
  /** Device label/name */
  label: string
  /** Device kind */
  kind: 'audioinput' | 'videoinput' | 'audiooutput'
}

/**
 * Available Devices
 */
export interface Devices {
  /** Available microphones */
  microphones: MediaDevice[]
  /** Available cameras */
  cameras: MediaDevice[]
  /** Available speakers */
  speakers: MediaDevice[]
  /** Currently selected microphone ID */
  selectedMic?: string
  /** Currently selected camera ID */
  selectedCam?: string
  /** Currently selected speaker ID */
  selectedSpeaker?: string
}

/**
 * Call Error
 */
export interface CallError {
  /** Error code */
  code: string
  /** i18n message key (not raw text) */
  messageKey: string
  /** Optional additional detail */
  detail?: string
  /** Is this error recoverable */
  recoverable: boolean
}

/**
 * Video Quality Preset
 */
export type VideoQuality = 'auto' | '360p' | '720p' | '1080p'

/**
 * Join Options
 */
export interface JoinOptions {
  /** Channel/room name */
  channel: string
  /** User ID */
  uid: string | number
  /** Authentication token */
  token?: string
  /** Join with microphone muted */
  joinMuted?: boolean
  /** Join with video off */
  joinVideoOff?: boolean
  /** Display name */
  displayName?: string
}

/**
 * Device Selection
 */
export interface DeviceSelection {
  /** Microphone device ID */
  micId?: string
  /** Camera device ID */
  camId?: string
}

/**
 * Call Statistics
 */
export interface CallStats {
  /** Call duration in seconds */
  duration: number
  /** Outgoing bitrate (kbps) */
  sendBitrate?: number
  /** Incoming bitrate (kbps) */
  receiveBitrate?: number
  /** Round-trip time (ms) */
  rtt?: number
  /** Packet loss rate (0-1) */
  packetLoss?: number
}

/**
 * Toast/Banner Message
 */
export interface ToastMessage {
  /** Unique message ID */
  id: string
  /** Toast type */
  type: 'info' | 'success' | 'warn' | 'error'
  /** i18n message key */
  messageKey: string
  /** Optional duration in ms (0 for persistent) */
  duration?: number
  /** Optional action label key */
  actionLabelKey?: string
  /** Optional additional data */
  data?: Record<string, unknown>
}
