/**
 * Video Call Core v2 - Actions Interface
 * Defines the adapter contract for all video call operations
 */

import type {
  CallState,
  Participant,
  Devices,
  DeviceSelection,
  JoinOptions,
  CallStats,
  VideoQualityPreset,
  ScreenShareQuality,
  VirtualBackgroundConfig,
  BeautyEffectOptions,
  NoiseSuppressionLevel,
  RecordingConfig,
  RecordingInfo,
  LiveStreamConfig,
  LiveStreamInfo,
  EncryptionConfig,
  WaitingRoomAttendee
} from './types'
import type { EventBus } from './events'

// ============================================================================
// ADAPTER CONFIG
// ============================================================================

/**
 * Adapter Configuration
 */
export interface AdapterConfig {
  /** App ID (Agora, etc.) */
  appId: string
  /** Event bus for communication */
  eventBus: EventBus
  /** Debug mode */
  debug?: boolean
  /** Log level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none'
  /** Geo-fencing regions */
  geoFencing?: string[]
  /** Enable dual stream by default */
  enableDualStream?: boolean
  /** Codec preference */
  codec?: 'vp8' | 'vp9' | 'h264' | 'av1'
  /** Mode */
  mode?: 'rtc' | 'live'
}

// ============================================================================
// VIDEO RENDERER
// ============================================================================

/**
 * Video Renderer Interface
 * Used by UI components to attach/detach video
 */
export interface VideoRenderer {
  /** Attach video to element */
  attachVideo(el: HTMLElement, participantId: string, kind: 'camera' | 'screen'): void
  /** Detach video from element */
  detachVideo(el: HTMLElement): void
  /** Attach local preview (before joining) */
  attachPreview?(el: HTMLElement, kind: 'camera' | 'screen'): void
  /** Attach local preview with VB (creates separate track for VB preview) */
  attachPreviewWithVB?(el: HTMLElement): Promise<void>
  /** Detach local preview */
  detachPreview?(el: HTMLElement): void
  
  // Alias methods used by UI components
  /** Render participant video (alias for attachVideo) */
  renderVideo?(el: HTMLElement, participantId: string, isLocal: boolean): void
  /** Render screen share (alias for attachVideo with screen) */
  renderScreenShare?(el: HTMLElement, participantId: string): void
  /** Clear video from element (alias for detachVideo) */
  clearVideo?(el: HTMLElement): void
}

// ============================================================================
// ACTIONS INTERFACE
// ============================================================================

/**
 * Complete Actions Interface
 * Adapters must implement this interface
 */
export interface Actions {
  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------
  
  /** Initialize the adapter */
  init(): Promise<void>
  
  /** Join a call/channel */
  join(options: JoinOptions): Promise<void>
  
  /** Leave the call */
  leave(): Promise<void>
  
  /** Destroy and clean up */
  destroy(): Promise<void>

  // -------------------------------------------------------------------------
  // Media Controls
  // -------------------------------------------------------------------------
  
  /** Toggle microphone */
  toggleMic(): Promise<boolean>
  
  /** Toggle camera */
  toggleCam(): Promise<boolean>
  
  /** Set microphone enabled */
  setMicEnabled(enabled: boolean): Promise<void>
  
  /** Set camera enabled */
  setCamEnabled(enabled: boolean): Promise<void>
  
  /** Switch camera (mobile) */
  switchCamera(): Promise<void>
  
  /** Set input devices */
  setInputDevice(selection: DeviceSelection): Promise<void>
  
  /** Set output device (speaker) */
  setOutputDevice(speakerId: string): Promise<void>

  // -------------------------------------------------------------------------
  // Screen Share
  // -------------------------------------------------------------------------
  
  /** Start screen share */
  startScreenShare(options?: { 
    withAudio?: boolean
    quality?: ScreenShareQuality
  }): Promise<void>
  
  /** Stop screen share */
  stopScreenShare(): Promise<void>

  // -------------------------------------------------------------------------
  // Quality
  // -------------------------------------------------------------------------
  
  /** Set video quality */
  setVideoQuality(quality: VideoQualityPreset): Promise<void>
  
  /** Set audio only mode */
  setAudioOnly(audioOnly: boolean): Promise<void>
  
  /** Enable/disable dual stream */
  setDualStream(enabled: boolean): Promise<void>
  
  /** Set remote video stream type */
  setRemoteVideoStreamType(uid: string, type: 'high' | 'low'): Promise<void>

  // -------------------------------------------------------------------------
  // Token
  // -------------------------------------------------------------------------
  
  /** Refresh token */
  refreshToken(newToken: string): Promise<void>

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------
  
  /** Get available devices */
  getDevices(): Promise<Devices>
  
  /** Get all participants */
  getParticipants(): Participant[]
  
  /** Get current call state */
  getCallState(): CallState
  
  /** Get call statistics */
  getStats(): Promise<CallStats>
  
  /** Create video renderer */
  createRenderer(): VideoRenderer

  // -------------------------------------------------------------------------
  // Virtual Background (Optional)
  // -------------------------------------------------------------------------
  
  /** Check if virtual background is supported */
  isVirtualBackgroundSupported?(): boolean
  
  /** Set virtual background (preview only) */
  setVirtualBackground?(config: VirtualBackgroundConfig): Promise<void>
  
  /** Apply virtual background to main video */
  applyVirtualBackground?(): Promise<void>
  
  /** Disable virtual background */
  disableVirtualBackground?(): Promise<void>

  // -------------------------------------------------------------------------
  // Beauty Effects (Optional)
  // -------------------------------------------------------------------------
  
  /** Check if beauty effects are supported */
  isBeautyEffectSupported?(): boolean
  
  /** Set beauty effect options */
  setBeautyEffect?(options: BeautyEffectOptions): Promise<void>
  
  /** Disable beauty effects */
  disableBeautyEffect?(): Promise<void>

  // -------------------------------------------------------------------------
  // Noise Suppression (Optional)
  // -------------------------------------------------------------------------
  
  /** Check if noise suppression is supported */
  isNoiseSuppressionSupported?(): boolean
  
  /** Set noise suppression level */
  setNoiseSuppression?(level: NoiseSuppressionLevel): Promise<void>

  // -------------------------------------------------------------------------
  // Recording (Optional)
  // -------------------------------------------------------------------------
  
  /** Check if recording is supported */
  isRecordingSupported?(): boolean
  
  /** Start recording */
  startRecording?(config?: RecordingConfig): Promise<void>
  
  /** Stop recording */
  stopRecording?(): Promise<void>
  
  /** Pause recording */
  pauseRecording?(): Promise<void>
  
  /** Resume recording */
  resumeRecording?(): Promise<void>
  
  /** Get recording info */
  getRecordingInfo?(): RecordingInfo

  // -------------------------------------------------------------------------
  // Live Streaming (Optional)
  // -------------------------------------------------------------------------
  
  /** Check if live streaming is supported */
  isLiveStreamSupported?(): boolean
  
  /** Start live stream */
  startLiveStream?(config: LiveStreamConfig): Promise<void>
  
  /** Stop live stream */
  stopLiveStream?(): Promise<void>
  
  /** Update live stream layout */
  updateLiveStreamLayout?(layout: LiveStreamConfig['layout']): Promise<void>
  
  /** Get live stream info */
  getLiveStreamInfo?(): LiveStreamInfo

  // -------------------------------------------------------------------------
  // Waiting Room (Optional)
  // -------------------------------------------------------------------------
  
  /** Get waiting room attendees (host only) */
  getWaitingRoomAttendees?(): WaitingRoomAttendee[]
  
  /** Admit attendee from waiting room */
  admitFromWaitingRoom?(attendeeId: string): Promise<void>
  
  /** Reject attendee from waiting room */
  rejectFromWaitingRoom?(attendeeId: string): Promise<void>
  
  /** Admit all attendees */
  admitAllFromWaitingRoom?(): Promise<void>

  // -------------------------------------------------------------------------
  // Participant Management (Optional - Host)
  // -------------------------------------------------------------------------
  
  /** Mute participant */
  muteParticipant?(uid: string, mediaType: 'audio' | 'video'): Promise<void>
  
  /** Unmute participant (request) */
  requestUnmute?(uid: string, mediaType: 'audio' | 'video'): Promise<void>
  
  /** Remove participant */
  removeParticipant?(uid: string): Promise<void>
  
  /** Promote to co-host */
  promoteToCoHost?(uid: string): Promise<void>
  
  /** Demote from co-host */
  demoteFromCoHost?(uid: string): Promise<void>
  
  /** Spotlight participant */
  spotlightParticipant?(uid: string | null): Promise<void>

  // -------------------------------------------------------------------------
  // Raise Hand (Optional)
  // -------------------------------------------------------------------------
  
  /** Raise/lower hand */
  setHandRaised?(raised: boolean): Promise<void>
  
  /** Lower all hands (host) */
  lowerAllHands?(): Promise<void>

  // -------------------------------------------------------------------------
  // Chat (Optional)
  // -------------------------------------------------------------------------
  
  /** Send chat message */
  sendChatMessage?(message: string, options?: { 
    replyTo?: string
    mentions?: string[]
  }): Promise<void>
  
  /** Delete chat message (host/sender) */
  deleteChatMessage?(messageId: string): Promise<void>
  
  /** Enable/disable chat (host) */
  setChatEnabled?(enabled: boolean): Promise<void>
  
  /** Set host-only chat mode */
  setChatHostOnly?(hostOnly: boolean): Promise<void>

  // -------------------------------------------------------------------------
  // Transcript (Optional)
  // -------------------------------------------------------------------------
  
  /** Check if transcript is supported */
  isTranscriptSupported?(): boolean
  
  /** Start transcript */
  startTranscript?(language?: string): Promise<boolean>
  
  /** Stop transcript */
  stopTranscript?(): Promise<void>
  
  /** Set transcript language */
  setTranscriptLanguage?(language: string): Promise<void>

  // -------------------------------------------------------------------------
  // Encryption (Optional)
  // -------------------------------------------------------------------------
  
  /** Set encryption */
  setEncryption?(config: EncryptionConfig): Promise<void>

  // -------------------------------------------------------------------------
  // Preview (Optional - before joining)
  // -------------------------------------------------------------------------
  
  /** Start camera preview */
  startPreview?(options?: { 
    videoElementId?: string
    deviceId?: string
  }): Promise<void>
  
  /** Stop camera preview */
  stopPreview?(): Promise<void>
  
  /** Test microphone */
  testMicrophone?(callback: (level: number) => void): Promise<() => void>
  
  /** Test speaker */
  testSpeaker?(audioUrl?: string): Promise<void>
}

// ============================================================================
// ADAPTER FACTORY
// ============================================================================

/**
 * Adapter Factory Function
 */
export type AdapterFactory = (config: AdapterConfig) => Actions
