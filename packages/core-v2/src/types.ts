/**
 * Video Call Core v2 - Comprehensive Types
 * Covers all features from Agora SDK including:
 * - Waiting room, Virtual background, Beauty effects
 * - Noise suppression, Recording, Live streaming
 * - Encryption, Active speaker, Multiple layouts
 */

// ============================================================================
// CALL STATE
// ============================================================================

/**
 * Extended Call State Machine
 */
export type CallState =
  | 'idle'           // Initial state
  | 'initializing'   // SDK initializing
  | 'prejoin'        // Precall screen (device selection)
  | 'waiting_room'   // In waiting room (awaiting approval)
  | 'connecting'     // Joining channel
  | 'in_call'        // Active call
  | 'reconnecting'   // Connection lost, attempting reconnect
  | 'ended'          // Call ended normally
  | 'error'          // Fatal error state

/**
 * Waiting Room Status
 */
export type WaitingRoomStatus =
  | 'none'           // No waiting room
  | 'pending'        // Waiting for host approval
  | 'approved'       // Approved to join
  | 'rejected'       // Rejected by host

/**
 * Participant Role
 */
export type ParticipantRole = 
  | 'host'           // Can control call, admit participants
  | 'co_host'        // Can admit participants, control features
  | 'speaker'        // Can publish audio/video
  | 'audience'       // Can only subscribe (live streaming)

/**
 * Client Role (Agora)
 */
export type ClientRole = 'broadcaster' | 'audience'

/**
 * Channel Profile
 */
export type ChannelProfile = 'communication' | 'live_broadcasting'

// ============================================================================
// PARTICIPANT
// ============================================================================

/**
 * Network Quality Level (0-6)
 * 0: unknown, 1: excellent, 2: good, 3: fair, 4: poor, 5: veryPoor, 6: down
 */
export type NetworkQuality = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Extended Participant
 */
export interface Participant {
  /** Unique participant ID (UID) */
  id: string
  /** Display name */
  displayName: string
  /** Optional short name (alias for displayName) */
  name?: string
  /** Participant role */
  role: ParticipantRole
  /** Is this the local user */
  isLocal: boolean
  /** Is host of the call */
  isHost: boolean
  /** Audio enabled/published */
  audioEnabled: boolean
  /** Video enabled/published */
  videoEnabled: boolean
  /** Is currently speaking (volume > threshold) */
  isSpeaking: boolean
  /** Speaking volume level (0-100) */
  speakingVolume: number
  /** Current audio level (0-1) for real-time visualization */
  audioLevel?: number
  /** Network quality (0-6) */
  networkQuality: NetworkQuality
  /** Optional avatar URL */
  avatarUrl?: string
  /** Is screen sharing */
  isScreenSharing: boolean
  /** Screen share track ID (if sharing) */
  screenShareTrackId?: string
  /** Is hand raised */
  isHandRaised: boolean
  /** Is pinned (by local user) */
  isPinned: boolean
  /** Is spotlight (by host) */
  isSpotlight: boolean
  /** Join timestamp */
  joinedAt: number
  /** Has virtual background enabled */
  hasVirtualBackground: boolean
  /** Has beauty effect enabled */
  hasBeautyEffect: boolean
  /** Has noise suppression enabled */
  hasNoiseSuppression: boolean
  /** Is a recording bot */
  isRecordingBot?: boolean
  /** Is a STT (Speech-to-Text) bot */
  isSTTBot?: boolean
  /** Connection state */
  connectionState?: 'connected' | 'connecting' | 'reconnecting' | 'disconnected'
  /** Custom user data */
  customData?: Record<string, unknown>
}

/**
 * Local Participant Extended
 */
export interface LocalParticipant extends Participant {
  isLocal: true
  /** Local audio level (0-100) */
  localAudioLevel: number
}

// ============================================================================
// DEVICES
// ============================================================================

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
  /** Is default device */
  isDefault?: boolean
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
  selectedMicId?: string
  /** Currently selected camera ID */
  selectedCamId?: string
  /** Currently selected speaker ID */
  selectedSpeakerId?: string
}

/**
 * Device Selection
 */
export interface DeviceSelection {
  micId?: string
  camId?: string
  speakerId?: string
}

/**
 * Device Permission Status
 */
export interface DevicePermissions {
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown'
  camera: 'granted' | 'denied' | 'prompt' | 'unknown'
}

// ============================================================================
// VIDEO QUALITY
// ============================================================================

/**
 * Video Quality Preset
 */
export type VideoQualityPreset = 
  | 'auto'
  | '120p'
  | '180p'
  | '240p'
  | '360p'
  | '480p'
  | '720p'
  | '1080p'

/**
 * Video Encoder Configuration
 */
export interface VideoEncoderConfig {
  width: number
  height: number
  frameRate: number
  bitrate: number
}

/**
 * Predefined Video Quality Configs
 */
export const VIDEO_QUALITY_CONFIGS: Record<VideoQualityPreset, VideoEncoderConfig | null> = {
  auto: null,
  '120p': { width: 160, height: 120, frameRate: 15, bitrate: 65 },
  '180p': { width: 320, height: 180, frameRate: 15, bitrate: 140 },
  '240p': { width: 320, height: 240, frameRate: 15, bitrate: 200 },
  '360p': { width: 640, height: 360, frameRate: 15, bitrate: 400 },
  '480p': { width: 640, height: 480, frameRate: 15, bitrate: 500 },
  '720p': { width: 1280, height: 720, frameRate: 30, bitrate: 1130 },
  '1080p': { width: 1920, height: 1080, frameRate: 30, bitrate: 2080 }
}

/**
 * Screen Share Quality
 */
export type ScreenShareQuality = 'auto' | '720p' | '1080p' | '1440p' | '4k'

// ============================================================================
// VIRTUAL BACKGROUND
// ============================================================================

/**
 * Virtual Background Type
 */
export type VirtualBackgroundType = 
  | 'none'
  | 'blur'
  | 'image'
  | 'video'
  | 'color'

/**
 * Virtual Background Config
 */
export interface VirtualBackgroundConfig {
  /** Background type */
  type: VirtualBackgroundType
  /** Blur strength (0-100) for blur type */
  blurStrength?: number
  /** Image URL for image type */
  imageUrl?: string
  /** Video URL for video type */
  videoUrl?: string
  /** Color hex for color type */
  color?: string
  /** Custom source (File, Blob) */
  source?: File | Blob | string
}

/**
 * Virtual Background Preset
 */
export interface VirtualBackgroundPreset {
  id: string
  name: string
  thumbnailUrl: string
  config: VirtualBackgroundConfig
}

// ============================================================================
// BEAUTY EFFECTS
// ============================================================================

/**
 * Beauty Effect Options
 */
export interface BeautyEffectOptions {
  /** Enable/disable beauty effects */
  enabled: boolean
  /** Smoothness (0-100) - skin smoothing */
  smoothness: number
  /** Lightening (0-100) - skin whitening/brightening */
  lightening: number
  /** Redness (0-100) - rosy cheeks */
  redness: number
  /** Sharpness (0-100) - image sharpening */
  sharpness: number
  /** Contrast level (0=low, 1=normal, 2=high) */
  contrastLevel?: 0 | 1 | 2
}

/**
 * Default beauty settings
 */
export const DEFAULT_BEAUTY_OPTIONS: BeautyEffectOptions = {
  enabled: false,
  smoothness: 50,
  lightening: 50,
  redness: 50,
  sharpness: 50,
  contrastLevel: 1
}

// ============================================================================
// NOISE SUPPRESSION
// ============================================================================

/**
 * Noise Suppression Level
 */
export type NoiseSuppressionLevel = 
  | 'off'
  | 'low'        // Minimal processing, low latency
  | 'medium'     // Balanced
  | 'high'       // Aggressive suppression
  | 'ai'         // AI-powered (if available)

/**
 * Audio Processing Options
 */
export interface AudioProcessingOptions {
  /** Noise suppression */
  noiseSuppression: NoiseSuppressionLevel
  /** Automatic Gain Control */
  agc: boolean
  /** Echo Cancellation */
  echoCancellation: boolean
  /** High-pass filter */
  highpassFilter: boolean
}

/**
 * Default audio processing
 */
export const DEFAULT_AUDIO_PROCESSING: AudioProcessingOptions = {
  noiseSuppression: 'medium',
  agc: true,
  echoCancellation: true,
  highpassFilter: true
}

// ============================================================================
// RECORDING
// ============================================================================

/**
 * Recording State
 */
export type RecordingState = 
  | 'idle'
  | 'starting'
  | 'recording'
  | 'paused'
  | 'stopping'
  | 'stopped'
  | 'error'

/**
 * Recording Mode
 */
export type RecordingMode = 
  | 'cloud'        // Cloud recording (Agora)
  | 'local'        // Local recording (browser MediaRecorder)
  | 'composite'    // Composite recording (mixed layout)
  | 'individual'   // Individual track recording

/**
 * Recording Layout
 */
export type RecordingLayout = 
  | 'floating'     // Small videos floating
  | 'bestFit'      // Auto-fit grid
  | 'vertical'     // Vertical layout
  | 'horizontal'   // Horizontal layout

/**
 * Recording Config
 */
export interface RecordingConfig {
  mode: RecordingMode
  layout?: RecordingLayout
  /** Max duration in seconds */
  maxDuration?: number
  /** Video width */
  width?: number
  /** Video height */
  height?: number
  /** Framerate */
  frameRate?: number
  /** Bitrate (kbps) */
  bitrate?: number
  /** Record audio only */
  audioOnly?: boolean
  /** Cloud storage config */
  storageConfig?: {
    vendor: 'aws' | 'azure' | 'gcp' | 'aliyun' | 'qiniu'
    bucket: string
    accessKey?: string
    secretKey?: string
    region?: string
  }
}

/**
 * Recording Info
 */
export interface RecordingInfo {
  state: RecordingState
  startTime?: number
  duration: number
  fileSize?: number
  resourceId?: string
  sid?: string
  error?: string
}

// ============================================================================
// LIVE STREAMING
// ============================================================================

/**
 * Live Stream State
 */
export type LiveStreamState = 
  | 'idle'
  | 'starting'
  | 'live'
  | 'stopping'
  | 'stopped'
  | 'error'

/**
 * Live Stream Config
 */
export interface LiveStreamConfig {
  /** RTMP URL */
  rtmpUrl: string
  /** Stream key */
  streamKey?: string
  /** Layout */
  layout?: RecordingLayout
  /** Width */
  width?: number
  /** Height */
  height?: number
  /** Bitrate (kbps) */
  bitrate?: number
  /** Enable transcoding */
  transcoding?: boolean
}

/**
 * Live Stream Info
 */
export interface LiveStreamInfo {
  state: LiveStreamState
  viewerCount: number
  startTime?: number
  duration: number
  url?: string
  error?: string
}

// ============================================================================
// ENCRYPTION
// ============================================================================

/**
 * Encryption Mode
 */
export type EncryptionMode = 
  | 'none'
  | 'aes-128-xts'
  | 'aes-256-xts'
  | 'aes-128-gcm'
  | 'aes-256-gcm'
  | 'aes-128-gcm2'  // Recommended
  | 'aes-256-gcm2'  // Most secure

/**
 * Encryption Config
 */
export interface EncryptionConfig {
  enabled: boolean
  mode: EncryptionMode
  key?: string
  salt?: Uint8Array
}

// ============================================================================
// LAYOUT
// ============================================================================

/**
 * Layout Mode
 */
export type LayoutMode = 
  | 'grid'         // Equal-sized grid
  | 'speaker'      // Active speaker large, others small
  | 'spotlight'    // Pinned/spotlight user large
  | 'sidebar'      // Main content + sidebar
  | 'pip'          // Picture-in-picture
  | 'presentation' // Screen share focused
  | 'filmstrip'    // Horizontal filmstrip

/**
 * Layout Config
 */
export interface LayoutConfig {
  mode: LayoutMode
  /** Max participants in view */
  maxParticipantsInView: number
  /** Show self view */
  showSelfView: boolean
  /** Self view position for PiP */
  selfViewPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Pinned participant ID */
  pinnedParticipantId?: string
  /** Hide participants with video off */
  hideVideoOff: boolean
  /** Aspect ratio */
  aspectRatio: '16:9' | '4:3' | '1:1'
}

/**
 * Default layout config
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  mode: 'grid',
  maxParticipantsInView: 9,
  showSelfView: true,
  hideVideoOff: false,
  aspectRatio: '16:9'
}

// ============================================================================
// CHAT
// ============================================================================

/**
 * Chat Message Type
 */
export type ChatMessageType = 'text' | 'image' | 'file' | 'system'

/**
 * Chat Message
 */
export interface ChatMessage {
  id: string
  type: ChatMessageType
  senderId: string
  senderName: string
  content: string
  /** File URL for image/file type */
  fileUrl?: string
  fileName?: string
  fileSize?: number
  timestamp: number
  /** Is message from local user */
  isLocal: boolean
  /** Read by participants */
  readBy?: string[]
  /** Reply to message ID */
  replyTo?: string
  /** Is deleted */
  isDeleted?: boolean
}

/**
 * Chat State
 */
export interface ChatState {
  enabled: boolean
  messages: ChatMessage[]
  unreadCount: number
  /** Chat is disabled by host */
  disabledByHost: boolean
  /** Only allow chat with host */
  hostOnlyMode: boolean
}

// ============================================================================
// TRANSCRIPT
// ============================================================================

/**
 * Transcript Entry
 */
export interface TranscriptEntry {
  id: string
  /** Speaker's UID */
  participantId: string
  /** @deprecated Use speakerName instead */
  participantName?: string
  /** Speaker's display name */
  speakerName: string
  /** Transcribed text */
  text: string
  /** Is final result (vs interim) */
  isFinal: boolean
  /** Unix timestamp */
  timestamp: number
  /** Language code (e.g., 'vi-VN') */
  language?: string
  /** Confidence score (0-1) */
  confidence?: number
  /** Is from local user */
  isLocal?: boolean
}

/**
 * Transcript State
 */
export interface TranscriptState {
  enabled: boolean
  entries: TranscriptEntry[]
  language: string
  autoLanguageDetect: boolean
}

// ============================================================================
// ERRORS
// ============================================================================

/**
 * Error Code Categories
 */
export type ErrorCategory = 
  | 'init'
  | 'join'
  | 'device'
  | 'network'
  | 'media'
  | 'permission'
  | 'token'
  | 'recording'
  | 'screen_share'
  | 'virtual_background'
  | 'unknown'

/**
 * Call Error
 */
export interface CallError {
  /** Error code */
  code: string
  /** Error category */
  category: ErrorCategory
  /** i18n message key */
  messageKey: string
  /** Optional detail */
  detail?: string
  /** Is recoverable */
  recoverable: boolean
  /** Suggested action key */
  actionKey?: string
  /** Timestamp */
  timestamp: number
}

// ============================================================================
// TOAST / NOTIFICATION
// ============================================================================

/**
 * Toast Type
 */
export type ToastType = 'info' | 'success' | 'warn' | 'error'

/**
 * Toast Message
 */
export interface ToastMessage {
  id: string
  type: ToastType
  messageKey: string
  messageParams?: Record<string, string | number>
  duration?: number
  actionLabelKey?: string
  onAction?: () => void
  timestamp: number
}

// ============================================================================
// STATS
// ============================================================================

/**
 * Call Statistics
 */
export interface CallStats {
  /** Call duration in seconds */
  duration: number
  /** Outgoing bitrate (kbps) */
  sendBitrate: number
  /** Incoming bitrate (kbps) */
  receiveBitrate: number
  /** Round-trip time (ms) */
  rtt: number
  /** Packet loss rate (0-1) */
  packetLoss: number
  /** Video send resolution */
  videoSendResolution?: { width: number; height: number }
  /** Video receive resolution */
  videoReceiveResolution?: { width: number; height: number }
  /** Send FPS */
  sendFrameRate?: number
  /** Receive FPS */
  receiveFrameRate?: number
  /** CPU usage (0-100) */
  cpuUsage?: number
  /** Memory usage (MB) */
  memoryUsage?: number
}

// ============================================================================
// JOIN OPTIONS
// ============================================================================

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
  /** RTM token (for messaging) */
  rtmToken?: string
  /** Display name */
  displayName?: string
  /** Avatar URL */
  avatarUrl?: string
  /** Join with microphone muted */
  joinMuted?: boolean
  /** Join with video off */
  joinVideoOff?: boolean
  /** Is host */
  isHost?: boolean
  /** Client role */
  clientRole?: ClientRole
  /** Channel profile */
  channelProfile?: ChannelProfile
  /** Encryption config */
  encryption?: EncryptionConfig
  /** Screen share UID */
  screenShareUid?: string | number
  /** Screen share token */
  screenShareToken?: string
  /** Enable dual stream */
  enableDualStream?: boolean
  /** Preferred camera ID */
  preferredCameraId?: string
  /** Preferred microphone ID */
  preferredMicrophoneId?: string
  /** Geo-fencing regions */
  geoFencing?: string[]
  /** Custom user data */
  customData?: Record<string, unknown>
}

// ============================================================================
// ROOM INFO
// ============================================================================

/**
 * Room Info
 */
export interface RoomInfo {
  /** Room ID */
  roomId: string
  /** Room name/title */
  title: string
  /** Host user ID */
  hostId: string
  /** Is waiting room enabled */
  waitingRoomEnabled: boolean
  /** Is recording enabled */
  recordingEnabled: boolean
  /** Is live streaming enabled */
  liveStreamEnabled: boolean
  /** Max participants */
  maxParticipants: number
  /** Scheduled start time */
  scheduledStart?: number
  /** Scheduled end time */
  scheduledEnd?: number
  /** Room password (if any) */
  hasPassword: boolean
  /** Custom room data */
  customData?: Record<string, unknown>
}

// ============================================================================
// WAITING ROOM
// ============================================================================

/**
 * Waiting Room Attendee
 */
export interface WaitingRoomAttendee {
  id: string
  displayName: string
  avatarUrl?: string
  joinRequestTime: number
}

/**
 * Waiting Room State
 */
export interface WaitingRoomState {
  enabled: boolean
  status: WaitingRoomStatus
  attendees: WaitingRoomAttendee[]
  message?: string
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Feature Flags - what's enabled/available
 */
export interface FeatureFlags {
  /** Allow toggling audio (mute/unmute) during call */
  audioToggle: boolean
  /** Allow toggling video (on/off) during call */
  videoToggle: boolean
  /** Waiting room feature */
  waitingRoom: boolean
  /** Virtual background */
  virtualBackground: boolean
  /** Beauty effects */
  beautyEffects: boolean
  /** Noise suppression */
  noiseSuppression: boolean
  /** Recording */
  recording: boolean
  /** Live streaming */
  liveStream: boolean
  /** Chat */
  chat: boolean
  /** Transcript / Speech-to-text */
  transcript: boolean
  /** Screen share */
  screenShare: boolean
  /** Raise hand */
  handRaise: boolean
  /** @deprecated Use handRaise instead */
  raiseHand?: boolean
  /** Participants list panel */
  participantsList: boolean
  /** Layout toggle (grid/speaker/etc) */
  layoutToggle: boolean
  /** Fullscreen mode */
  fullscreen: boolean
  /** Breakout rooms */
  breakoutRooms: boolean
  /** Polls */
  polls: boolean
  /** Whiteboard */
  whiteboard: boolean
}

/**
 * Default feature flags
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  audioToggle: true,
  videoToggle: true,
  waitingRoom: false,
  virtualBackground: true,
  beautyEffects: true,
  noiseSuppression: true,
  recording: false,
  liveStream: false,
  chat: true,
  transcript: false,
  screenShare: true,
  handRaise: true,
  participantsList: true,
  layoutToggle: true,
  fullscreen: true,
  breakoutRooms: false,
  polls: false,
  whiteboard: false
}
