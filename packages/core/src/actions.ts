import type { EventBus } from './events'
import type {
  JoinOptions,
  DeviceSelection,
  VideoQuality,
  Devices,
  Participant,
  CallState,
  CallStats
} from './types'

export type {
  JoinOptions,
  DeviceSelection,
  VideoQuality,
  Devices,
  Participant,
  CallState,
  CallStats
}

/**
 * Actions Interface
 * SDK-agnostic contract that adapters must implement
 */
export interface Actions {
  /**
   * Initialize the adapter and enumerate devices
   */
  init(): Promise<void>

  /**
   * Join a call/channel
   */
  join(options: JoinOptions): Promise<void>

  /**
   * Leave the current call
   */
  leave(): Promise<void>

  /**
   * Toggle microphone on/off
   */
  toggleMic(): Promise<boolean>

  /**
   * Toggle camera on/off
   */
  toggleCam(): Promise<boolean>

  /**
   * Switch to next camera (for devices with multiple cameras)
   */
  switchCamera(): Promise<void>

  /**
   * Set input device (mic or camera)
   */
  setInputDevice(selection: DeviceSelection): Promise<void>

  /**
   * Set output device (speaker)
   */
  setOutputDevice(speakerId: string): Promise<void>

  /**
   * Start screen sharing
   */
  startScreenShare(): Promise<void>

  /**
   * Stop screen sharing
   */
  stopScreenShare(): Promise<void>

  /**
   * Refresh authentication token
   */
  refreshToken(newToken: string): Promise<void>

  /**
   * Set video quality
   */
  setQuality(quality: VideoQuality): Promise<void>

  /**
   * Enable/disable audio-only mode
   */
  setAudioOnly(audioOnly: boolean): Promise<void>

  /**
   * Get current devices
   */
  getDevices(): Promise<Devices>

  /**
   * Get current participants
   */
  getParticipants(): Participant[]

  /**
   * Get current call state
   */
  getCallState(): CallState

  /**
   * Get call statistics
   */
  getStats(): Promise<CallStats>

  /**
   * Cleanup and destroy adapter
   */
  destroy(): Promise<void>

  /**
   * Start real-time transcription (optional - adapter may not support)
   * @param language - Language code (e.g., 'en-US', 'vi-VN')
   * @returns true if transcription started, false if not supported
   */
  startTranscript?(language: string): Promise<boolean>

  /**
   * Stop real-time transcription (optional)
   */
  stopTranscript?(): Promise<void>

  /**
   * Check if transcription is supported by this adapter
   */
  isTranscriptSupported?(): boolean
}

/**
 * Adapter Configuration
 */
export interface AdapterConfig {
  /** Application/SDK ID */
  appId: string
  /** Event bus for adapter to emit events */
  eventBus: EventBus
  /** Enable debug logging */
  debug?: boolean
}

/**
 * Adapter Factory
 */
export type AdapterFactory = (config: AdapterConfig) => Actions
