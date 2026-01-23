/**
 * Agora Web SDK Adapter V2 - Minimal Implementation
 * Implements the core Actions interface for basic video calling
 */

import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  UID,
  ScreenVideoTrackInitConfig,
  EncryptionMode as AgoraEncryptionMode,
  SDK_CODEC,
  SDK_MODE,
} from 'agora-rtc-sdk-ng'

// Optional extension imports - these may not be available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let VirtualBackgroundExtension: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let BeautyExtension: any = null  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AIDenoiserExtension: any = null

// Flag to track if we've attempted to load extensions
let extensionLoadAttempted = false

// Configured WASM directory path (set via registerAgoraExtensions or adapter config)
let configuredVBWasmDir: string | null = null

/**
 * Extension registration options
 */
export interface ExtensionRegistrationOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  VirtualBackgroundExtension?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BeautyExtension?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AIDenoiserExtension?: any
  /**
   * Directory path where WASM files are located
   * For Virtual Background: expects 'agora-virtual-background.wasm' in this directory
   * Example: '/wasms' or './agora-extension-virtual-background/wasms'
   */
  virtualBackgroundWasmDir?: string
}

/**
 * Manually register extension classes before creating adapter
 * This is useful when dynamic imports don't work (e.g., in bundled apps)
 * 
 * @example
 * import VirtualBackgroundExtension from 'agora-extension-virtual-background'
 * import BeautyExtension from 'agora-extension-beauty-effect'
 * registerAgoraExtensions({
 *   VirtualBackgroundExtension,
 *   BeautyExtension,
 *   virtualBackgroundWasmDir: '/wasms'
 * })
 */
export function registerAgoraExtensions(options: ExtensionRegistrationOptions) {
  if (options.VirtualBackgroundExtension) {
    VirtualBackgroundExtension = options.VirtualBackgroundExtension
    console.log('[AgoraAdapter] VirtualBackgroundExtension manually registered')
  }
  if (options.BeautyExtension) {
    BeautyExtension = options.BeautyExtension
    console.log('[AgoraAdapter] BeautyExtension manually registered')
  }
  if (options.AIDenoiserExtension) {
    AIDenoiserExtension = options.AIDenoiserExtension
    console.log('[AgoraAdapter] AIDenoiserExtension manually registered')
  }
  if (options.virtualBackgroundWasmDir) {
    configuredVBWasmDir = options.virtualBackgroundWasmDir
    console.log('[AgoraAdapter] Virtual Background WASM directory configured:', configuredVBWasmDir)
  }
  // Mark as attempted so loadExtensions won't overwrite
  extensionLoadAttempted = true
}

// Function to dynamically load extensions
async function loadExtensions() {
  if (extensionLoadAttempted) return
  extensionLoadAttempted = true
  
  try {
    const vbModule = await import('agora-extension-virtual-background')
    VirtualBackgroundExtension = vbModule.default
    console.log('[AgoraAdapter] VirtualBackgroundExtension loaded via dynamic import:', !!VirtualBackgroundExtension)
  } catch (e) { 
    console.log('[AgoraAdapter] Virtual background extension not available via dynamic import:', e)
  }

  try {
    const beautyModule = await import('agora-extension-beauty-effect')
    BeautyExtension = beautyModule.default
    console.log('[AgoraAdapter] BeautyExtension loaded via dynamic import:', !!BeautyExtension)
  } catch (e) { 
    console.log('[AgoraAdapter] Beauty extension not available:', e)
  }

  try {
    const denoiserModule = await import('agora-extension-ai-denoiser')
    AIDenoiserExtension = denoiserModule.AIDenoiserExtension
    console.log('[AgoraAdapter] AIDenoiserExtension loaded via dynamic import:', !!AIDenoiserExtension)
  } catch (e) { 
    console.log('[AgoraAdapter] AI Denoiser extension not available:', e)
  }
}

import type {
  Actions,
  Participant,
  ParticipantRole,
  DeviceSelection,
  VirtualBackgroundConfig,
  BeautyEffectOptions,
  RecordingConfig,
  JoinOptions,
  Devices,
  CallState,
  CallStats,
  VideoRenderer,
  VideoQualityPreset,
  ScreenShareQuality,
  NoiseSuppressionLevel,
  EncryptionConfig,
  EncryptionMode,
  ClientRole,
  ChannelProfile,
  EventMap,
  EventBus,
} from '@diagvn/video-call-core-v2'

import { createEventBus } from '@diagvn/video-call-core-v2'

// ============================================================================
// Types
// ============================================================================

export interface AgoraAdapterConfig {
  appId: string
  /** Enable dual stream for bandwidth optimization */
  enableDualStream?: boolean
  /** Enable cloud proxy for restricted networks */
  enableCloudProxy?: boolean
  /** SDK log level: 0=none, 1=error, 2=warn, 3=info, 4=debug */
  logLevel?: 0 | 1 | 2 | 3 | 4
  /** Enable debug logging */
  debug?: boolean
  /** Codec preference */
  codec?: 'vp8' | 'vp9' | 'h264' | 'av1'
  /** Channel mode: rtc for communication, live for broadcasting */
  mode?: 'rtc' | 'live'
  /** Channel profile: communication (default) or live_broadcasting */
  channelProfile?: ChannelProfile
  /** Geo-fencing regions */
  geoFencing?: ('CHINA' | 'ASIA' | 'EUROPE' | 'NORTH_AMERICA' | 'JAPAN' | 'INDIA' | 'GLOBAL')[]
  /**
   * Directory path where Virtual Background WASM files are located
   * Example: '/wasms' or './agora-extension-virtual-background/wasms'
   */
  virtualBackgroundWasmDir?: string
}

// Video quality encoder configurations
const VIDEO_QUALITY_MAP: Record<VideoQualityPreset, string | undefined> = {
  'auto': undefined,
  '120p': '120p',
  '180p': '180p',
  '240p': '240p',
  '360p': '360p_7',
  '480p': '480p',
  '720p': '720p_3',
  '1080p': '1080p_3'
}

// Screen share quality configurations
const SCREEN_QUALITY_MAP: Record<ScreenShareQuality, ScreenVideoTrackInitConfig> = {
  'auto': { encoderConfig: '720p_2' },
  '720p': { encoderConfig: '720p_2' },
  '1080p': { encoderConfig: '1080p_2' },
  '1440p': { encoderConfig: { width: 2560, height: 1440, frameRate: 15, bitrateMax: 4780 } },
  '4k': { encoderConfig: { width: 3840, height: 2160, frameRate: 15, bitrateMax: 8910 } }
}

// Encryption mode mapping
const ENCRYPTION_MODE_MAP: Record<EncryptionMode, AgoraEncryptionMode | null> = {
  'none': null,
  'aes-128-xts': 'aes-128-xts',
  'aes-256-xts': 'aes-256-xts',
  'aes-128-gcm': 'aes-128-gcm',
  'aes-256-gcm': 'aes-256-gcm',
  'aes-128-gcm2': 'aes-128-gcm2',
  'aes-256-gcm2': 'aes-256-gcm2',
}

// ============================================================================
// Minimal Adapter Implementation
// ============================================================================

export class AgoraAdapterV2 implements Actions {
  private config: AgoraAdapterConfig
  private eventBus: EventBus
  private debug: boolean
  
  // RTC State
  private rtcClient: IAgoraRTCClient | null = null
  private screenClient: IAgoraRTCClient | null = null // Separate client for screen share
  private localAudioTrack: IMicrophoneAudioTrack | null = null
  private localVideoTrack: ICameraVideoTrack | null = null
  private screenTrack: ILocalVideoTrack | null = null
  private screenAudioTrack: ILocalAudioTrack | null = null
  private localUid: UID | null = null
  private screenShareUid: UID | null = null // Separate UID for screen share
  private channelName: string = ''
  private joined: boolean = false
  private localUserName: string = ''
  private isScreenSharing: boolean = false
  private isHost: boolean = false
  private clientRole: ClientRole = 'broadcaster'
  private encryptionConfig: EncryptionConfig | null = null
  
  // Remote users
  private remoteUsers: Map<number, IAgoraRTCRemoteUser> = new Map()

  // Device state
  private currentMicId: string = ''
  private currentCamId: string = ''
  private currentSpeakerId: string = ''
  private deviceChangeHandler: (() => void) | null = null

  // Extension processors (for virtual background, beauty, noise suppression)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private vbExtension: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private vbProcessor: any = null  // Main view processor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private vbPreviewProcessor: any = null  // Preview processor (separate from main)
  private vbEnabled: boolean = false  // VB effect is enabled (for preview)
  private vbApplied: boolean = false  // VB is applied to main video (confirmed by user)
  private vbPiped: boolean = false  // Main view processor is piped
  private vbPreviewPiped: boolean = false  // Preview processor is piped
  private vbInitialized: boolean = false  // Track if main processor.init() has been called
  private vbPreviewInitialized: boolean = false  // Track if preview processor.init() has been called
  // Preview track - separate from main track
  private previewVideoTrack: ILocalVideoTrack | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private beautyExtension: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private beautyProcessor: any = null
  private beautyEnabled: boolean = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private denoiserExtension: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private denoiserProcessor: any = null
  private denoiserEnabled: boolean = false
  private extensionsInitialized: boolean = false

  // Getters for device IDs (aliases for compatibility)
  private get selectedMicrophoneId(): string { return this.currentMicId }
  private set selectedMicrophoneId(value: string) { this.currentMicId = value }
  private get selectedCameraId(): string { return this.currentCamId }
  private set selectedCameraId(value: string) { this.currentCamId = value }
  private get selectedSpeakerId(): string { return this.currentSpeakerId }
  private set selectedSpeakerId(value: string) { this.currentSpeakerId = value }

  // Media state
  private isMicEnabled: boolean = true
  private isCamEnabled: boolean = true

  // Join timestamp for duration calculation
  private joinTimestamp: number = 0

  // Video encoder configuration
  private videoEncoderConfig: {
    width?: number;
    height?: number;
    frameRate?: number;
    bitrateMin?: number;
    bitrateMax?: number;
  } = {
    width: 640,
    height: 480,
    frameRate: 30,
    bitrateMin: 400,
    bitrateMax: 1000
  }

  constructor(config: AgoraAdapterConfig) {
    this.config = config
    this.eventBus = createEventBus()
    this.debug = config.debug || false
    
    // Set log level
    if (config.logLevel !== undefined) {
      AgoraRTC.setLogLevel(config.logLevel)
    }
    
    // Initialize extensions asynchronously
    this.initializeExtensions()
  }

  // ============================================================================
  // Extension Initialization
  // ============================================================================

  private async initializeExtensions(): Promise<void> {
    if (this.extensionsInitialized) return
    
    // Load extensions dynamically first
    await loadExtensions()
    
    try {
      // Initialize Virtual Background Extension
      if (VirtualBackgroundExtension) {
        console.log('[VB] Creating VirtualBackgroundExtension...')
        this.vbExtension = new VirtualBackgroundExtension()
        
        // Check browser compatibility
        if (!this.vbExtension.checkCompatibility()) {
          console.error('[VB] Browser does not support Virtual Background!')
          this.vbExtension = null
        } else {
          console.log('[VB] Browser compatibility check passed')
          
          console.log('[VB] Registering extension with AgoraRTC...')
          AgoraRTC.registerExtensions([this.vbExtension])
          
          // Create TWO processors: one for main view, one for preview
          // This follows the reference implementation pattern
          console.log('[VB] Creating main view processor...')
          this.vbProcessor = this.vbExtension.createProcessor()
          
          console.log('[VB] Creating preview processor...')
          this.vbPreviewProcessor = this.vbExtension.createProcessor()
          
          // Listen for performance warnings on main processor
          this.vbProcessor.eventBus.on('PERFORMANCE_WARNING', () => {
            console.warn('[VB] Performance warning - VB may be causing performance issues')
          })
          
          console.log('[VB] ✓ Both processors created successfully')
          // NOTE: processor.init() will be called lazily when setVirtualBackground is first used
          // This avoids loading WASM files until actually needed
        }
      } else {
        console.log('[VB] VirtualBackgroundExtension class not available')
      }
      
      // Initialize Beauty Effect Extension
      if (BeautyExtension) {
        this.beautyExtension = new BeautyExtension()
        AgoraRTC.registerExtensions([this.beautyExtension])
        this.beautyProcessor = this.beautyExtension.createProcessor()
        this.log('Beauty Effect extension initialized')
      }
      
      // Initialize AI Denoiser Extension
      if (AIDenoiserExtension) {
        this.denoiserExtension = new AIDenoiserExtension()
        AgoraRTC.registerExtensions([this.denoiserExtension])
        this.denoiserProcessor = this.denoiserExtension.createProcessor()
        this.log('AI Denoiser extension initialized')
      }
      
      this.extensionsInitialized = true
    } catch (error) {
      this.log('Failed to initialize extensions:', error)
    }
  }

  // ============================================================================
  // Debug & Error Helpers
  // ============================================================================

  private log(...args: unknown[]): void {
    if (this.debug) {
      this.log('', ...args)
    }
  }

  private emitError(code: string, messageKey: string, detail?: string, recoverable = true): void {
    this.log('Error:', code, messageKey, detail)
    this.eventBus.emit('error', { 
      code, 
      message: messageKey,
      details: detail,
      recoverable 
    } as unknown as EventMap['error'])
  }

  // ============================================================================
  // Device Change Listeners (Hot-plug support)
  // ============================================================================

  private setupDeviceChangeListeners(): void {
    // Agora SDK device change handler
    this.deviceChangeHandler = async () => {
      this.log('Device change detected')
      const devices = await this.getDevices()
      this.eventBus.emit('devices-changed' as unknown as keyof EventMap, devices as unknown as EventMap[keyof EventMap])
      
      // Check if current devices are still available
      if (this.localVideoTrack) {
        const videoDevices = devices.cameras
        const currentCameraId = this.selectedCameraId
        if (currentCameraId && !videoDevices.find((d: { deviceId: string }) => d.deviceId === currentCameraId)) {
          this.log('Current camera disconnected, switching to default')
          if (videoDevices.length > 0) {
            await this.setInputDevice({ camId: videoDevices[0].deviceId })
          }
        }
      }
      
      if (this.localAudioTrack) {
        const audioDevices = devices.microphones
        const currentMicId = this.selectedMicrophoneId
        if (currentMicId && !audioDevices.find((d: { deviceId: string }) => d.deviceId === currentMicId)) {
          this.log('Current microphone disconnected, switching to default')
          if (audioDevices.length > 0) {
            await this.setInputDevice({ micId: audioDevices[0].deviceId })
          }
        }
      }
    }
    
    AgoraRTC.onMicrophoneChanged = this.deviceChangeHandler
    AgoraRTC.onCameraChanged = this.deviceChangeHandler
    AgoraRTC.onPlaybackDeviceChanged = this.deviceChangeHandler
  }

  private removeDeviceChangeListeners(): void {
    AgoraRTC.onMicrophoneChanged = undefined
    AgoraRTC.onCameraChanged = undefined
    AgoraRTC.onPlaybackDeviceChanged = undefined
    this.deviceChangeHandler = null
  }

  // ============================================================================
  // Local Track Creation with Fallback
  // ============================================================================

  private async createLocalTracksWithFallback(): Promise<[IMicrophoneAudioTrack | null, ICameraVideoTrack | null]> {
    let audioTrack: IMicrophoneAudioTrack | null = null
    let videoTrack: ICameraVideoTrack | null = null

    // Try to create audio track with fallback
    try {
      const microphoneId = this.selectedMicrophoneId || undefined
      audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        microphoneId
      })
      this.log('Audio track created with device:', microphoneId || 'default')
    } catch (error) {
      this.log('Failed to create audio track, trying default device:', error)
      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        this.log('Audio track created with default device')
      } catch (fallbackError) {
        this.log('Failed to create audio track even with default device:', fallbackError)
        // Try enumerating and using first available
        try {
          const devices = await AgoraRTC.getMicrophones()
          if (devices.length > 0) {
            audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
              microphoneId: devices[0].deviceId
            })
            this.log('Audio track created with enumerated device:', devices[0].label)
          }
        } catch {
          this.log('No audio device available')
        }
      }
    }

    // Try to create video track with fallback
    try {
      const cameraId = this.selectedCameraId || undefined
      videoTrack = await AgoraRTC.createCameraVideoTrack({
        cameraId,
        encoderConfig: this.videoEncoderConfig
      })
      this.log('Video track created with device:', cameraId || 'default')
    } catch (error) {
      this.log('Failed to create video track, trying default device:', error)
      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: this.videoEncoderConfig
        })
        this.log('Video track created with default device')
      } catch (fallbackError) {
        this.log('Failed to create video track even with default device:', fallbackError)
        // Try enumerating and using first available
        try {
          const devices = await AgoraRTC.getCameras()
          if (devices.length > 0) {
            videoTrack = await AgoraRTC.createCameraVideoTrack({
              cameraId: devices[0].deviceId,
              encoderConfig: this.videoEncoderConfig
            })
            this.log('Video track created with enumerated device:', devices[0].label)
          }
        } catch {
          this.log('No video device available')
        }
      }
    }

    return [audioTrack, videoTrack]
  }

  // ============================================================================
  // Encryption Support
  // ============================================================================

  async setEncryption(config: EncryptionConfig): Promise<void> {
    if (!this.rtcClient) {
      this.log('Cannot set encryption: no RTC client')
      return
    }

    this.encryptionConfig = config

    if (!config.enabled || config.mode === 'none' || !config.key) {
      this.log('Encryption disabled')
      return
    }

    const agoraMode = ENCRYPTION_MODE_MAP[config.mode]
    if (!agoraMode) {
      this.log('Unknown encryption mode:', config.mode)
      return
    }

    try {
      await this.rtcClient.setEncryptionConfig(agoraMode, config.key, config.salt)
      this.log('Encryption enabled:', agoraMode)
    } catch (error) {
      this.log('Failed to set encryption:', error)
      this.emitError('ENCRYPTION_FAILED', 'vc.err.encryptionFailed', (error as Error).message)
    }
  }

  // ============================================================================
  // Client Role (Live Streaming)
  // ============================================================================

  // Map core-v2 ClientRole to Agora SDK ClientRole
  private mapClientRoleToAgora(role: ClientRole): 'host' | 'audience' {
    return role === 'broadcaster' ? 'host' : 'audience'
  }

  async setClientRole(role: ClientRole): Promise<void> {
    const agoraRole = this.mapClientRoleToAgora(role)
    
    if (!this.rtcClient) {
      this.clientRole = role
      this.isHost = role === 'broadcaster'
      this.log('Client role set (before join):', role, '-> agora:', agoraRole)
      return
    }

    try {
      await this.rtcClient.setClientRole(agoraRole)
      this.clientRole = role
      this.isHost = role === 'broadcaster'
      this.log('Client role changed to:', role, '-> agora:', agoraRole)
    } catch (error) {
      this.log('Failed to set client role:', error)
      this.emitError('ROLE_CHANGE_FAILED', 'vc.err.roleChangeFailed', (error as Error).message)
    }
  }

  // ============================================================================
  // Speaker Device Control
  // ============================================================================

  async setOutputDevice(speakerId: string): Promise<void> {
    this.selectedSpeakerId = speakerId
    this.log('Setting output device:', speakerId)

    // Apply to all remote audio tracks
    for (const [uid, participant] of this.remoteUsers.entries()) {
      const audioTrack = participant.audioTrack as IRemoteAudioTrack | undefined
      if (audioTrack && typeof audioTrack.setPlaybackDevice === 'function') {
        try {
          await audioTrack.setPlaybackDevice(speakerId)
          this.log('Set playback device for user:', uid)
        } catch (error) {
          this.log('Failed to set playback device for user:', uid, error)
        }
      }
    }
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  async init(): Promise<void> {
    console.log('[AgoraAdapter] init() called')
    
    // IMPORTANT: Initialize extensions FIRST before creating any tracks
    if (!this.extensionsInitialized) {
      console.log('[AgoraAdapter] Initializing extensions in init()...')
      await this.initializeExtensions()
      console.log('[AgoraAdapter] Extensions initialized, vbProcessor:', !!this.vbProcessor)
    }
    
    // Pre-fetch devices
    await this.getDevices()
    
    // Setup device change listeners
    this.setupDeviceChangeListeners()
    
    // Create local tracks for preview (before joining)
    try {
      this.log('Creating local tracks for preview...')
      const [audioTrack, videoTrack] = await this.createLocalTracksWithFallback()
      
      this.localAudioTrack = audioTrack
      this.localVideoTrack = videoTrack
      this.isMicEnabled = true
      this.isCamEnabled = true
      
      this.log('Local tracks created for preview')
      
      // "Open" Virtual Background for the video track (pipe processor)
      // This must be done BEFORE enabling VB effects (like in Agora demo)
      if (this.localVideoTrack && this.vbProcessor) {
        await this.openVirtualBackgroundForTrack()
      }
    } catch (error) {
      this.log('WARN: Failed to create preview tracks:', error)
      // Don't fail init if tracks can't be created (user might have denied permissions)
      // The prejoin screen can still show device list
    }
    
    this.log('Initialized')
  }

  async join(options: JoinOptions): Promise<void> {
    try {
      this.log('Joining channel:', options.channel)
      
      // IMPORTANT: Extensions must be registered BEFORE creating the client
      if (!this.extensionsInitialized) {
        this.log('Initializing extensions before join...')
        await this.initializeExtensions()
      }
      
      // Determine channel profile (rtc for video call, live for streaming)
      const channelProfile = this.config.channelProfile || 'communication'
      const mode: SDK_MODE = channelProfile === 'live_broadcasting' ? 'live' : 'rtc'
      const codec: SDK_CODEC = this.config.codec || 'vp8'
      
      // Create RTC client with proper configuration
      this.rtcClient = AgoraRTC.createClient({
        mode,
        codec
      })
      
      this.log('Created client with mode:', mode, 'codec:', codec)

      // Set client role for live streaming mode
      if (mode === 'live') {
        const agoraRole = this.mapClientRoleToAgora(this.clientRole)
        await this.rtcClient.setClientRole(agoraRole)
        this.log('Set client role:', this.clientRole, '-> agora:', agoraRole)
      }

      // Apply encryption if configured
      if (this.encryptionConfig && this.encryptionConfig.enabled && this.encryptionConfig.mode !== 'none' && this.encryptionConfig.key) {
        const agoraMode = ENCRYPTION_MODE_MAP[this.encryptionConfig.mode]
        if (agoraMode) {
          await this.rtcClient.setEncryptionConfig(agoraMode, this.encryptionConfig.key, this.encryptionConfig.salt)
          this.log('Encryption enabled:', agoraMode)
        }
      }

      // Setup event listeners
      this.setupRtcEventListeners()

      // Join channel
      this.localUid = await this.rtcClient.join(
        this.config.appId,
        options.channel,
        options.token || null,
        options.uid ?? null
      )

      this.channelName = options.channel
      this.localUserName = options.displayName || `User-${this.localUid}`
      this.joined = true
      this.joinTimestamp = Date.now()

      // Create local tracks (only if host in live mode, or always in rtc mode)
      if (mode === 'rtc' || this.isHost) {
        await this.createLocalTracks(options)
      }

      // Emit connected
      this.eventBus.emit('call-state-changed', { 
        from: 'idle' as CallState, 
        to: 'in_call' as CallState 
      })
      this.eventBus.emit('participant-joined', this.getLocalParticipant())

      this.log('Joined channel successfully, uid:', this.localUid)
      
      // Schedule a check for any existing remote users that might have published
      // before we joined. This catches users that joined before us.
      setTimeout(() => {
        this.checkAllRemoteUsersForMissedSubscriptions()
      }, 500)
    } catch (error) {
      this.log('Join failed:', error)
      this.emitError('JOIN_FAILED', 'vc.err.joinFailed', (error as Error).message, true)
      this.eventBus.emit('call-state-changed', { 
        from: 'connecting' as CallState, 
        to: 'error' as CallState 
      })
      throw error
    }
  }

  async leave(): Promise<void> {
    try {
      this.log('Leaving channel')
      
      // Stop screen share if active
      if (this.isScreenSharing) {
        await this.stopScreenShare()
      }
      
      // Cleanup local tracks
      if (this.localAudioTrack) {
        this.localAudioTrack.stop()
        this.localAudioTrack.close()
        this.localAudioTrack = null
      }

      if (this.localVideoTrack) {
        this.localVideoTrack.stop()
        this.localVideoTrack.close()
        this.localVideoTrack = null
      }

      // Leave channel
      if (this.rtcClient) {
        await this.rtcClient.leave()
        this.rtcClient = null
      }

      this.joined = false
      this.remoteUsers.clear()
      this.joinTimestamp = 0

      this.eventBus.emit('call-state-changed', { 
        from: 'in_call' as CallState, 
        to: 'ended' as CallState 
      })
    } catch (error) {
      this.log('Leave failed:', error)
      throw error
    }
  }

  async destroy(): Promise<void> {
    // Remove device change listeners
    this.removeDeviceChangeListeners()
    
    await this.leave()
    this.log('Destroyed')
  }

  // ============================================================================
  // Media Controls
  // ============================================================================

  async toggleMic(): Promise<boolean> {
    if (!this.localAudioTrack) {
      // Create track if it doesn't exist
      try {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        if (this.rtcClient && this.joined) {
          await this.rtcClient.publish(this.localAudioTrack)
        }
        this.isMicEnabled = true
        this.eventBus.emit('local-audio-changed', { enabled: true })
        this.updateLocalParticipant({ audioEnabled: true })
        return true
      } catch (error) {
        this.log('ERROR: Failed to create audio track:', error)
        return false
      }
    }

    const newEnabled = !this.localAudioTrack.enabled
    await this.localAudioTrack.setEnabled(newEnabled)
    this.isMicEnabled = newEnabled
    this.eventBus.emit('local-audio-changed', { enabled: newEnabled })
    this.updateLocalParticipant({ audioEnabled: newEnabled })
    return newEnabled
  }

  async toggleCam(): Promise<boolean> {
    if (!this.localVideoTrack) {
      // Create track if it doesn't exist
      try {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
        if (this.rtcClient && this.joined) {
          await this.rtcClient.publish(this.localVideoTrack)
        }
        this.isCamEnabled = true
        this.eventBus.emit('local-video-changed', { enabled: true })
        this.updateLocalParticipant({ videoEnabled: true })
        return true
      } catch (error) {
        this.log('ERROR: Failed to create video track:', error)
        return false
      }
    }

    const newEnabled = !this.localVideoTrack.enabled
    await this.localVideoTrack.setEnabled(newEnabled)
    this.isCamEnabled = newEnabled
    this.eventBus.emit('local-video-changed', { enabled: newEnabled })
    this.updateLocalParticipant({ videoEnabled: newEnabled })
    return newEnabled
  }

  async setMicEnabled(enabled: boolean): Promise<void> {
    if (!this.localAudioTrack && enabled) {
      // Create track if enabling and doesn't exist
      try {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        if (this.rtcClient && this.joined) {
          await this.rtcClient.publish(this.localAudioTrack)
        }
      } catch (error) {
        this.log('ERROR: Failed to create audio track:', error)
        return
      }
    }
    
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(enabled)
    }
    this.isMicEnabled = enabled
    this.eventBus.emit('local-audio-changed', { enabled })
    this.updateLocalParticipant({ audioEnabled: enabled })
  }

  async setCamEnabled(enabled: boolean): Promise<void> {
    if (!this.localVideoTrack && enabled) {
      // Create track if enabling and doesn't exist
      try {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
        if (this.rtcClient && this.joined) {
          await this.rtcClient.publish(this.localVideoTrack)
        }
      } catch (error) {
        this.log('ERROR: Failed to create video track:', error)
        return
      }
    }
    
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(enabled)
    }
    this.isCamEnabled = enabled
    this.eventBus.emit('local-video-changed', { enabled })
    this.updateLocalParticipant({ videoEnabled: enabled })
  }

  async switchCamera(): Promise<void> {
    // For web, this would cycle through available cameras
    const devices = await this.getDevices()
    const currentIdx = devices.cameras.findIndex(d => d.deviceId === this.currentCamId)
    const nextIdx = (currentIdx + 1) % devices.cameras.length
    if (devices.cameras[nextIdx]) {
      await this.setInputDevice({ camId: devices.cameras[nextIdx].deviceId })
    }
  }

  async setInputDevice(selection: DeviceSelection): Promise<void> {
    if (selection.micId && this.localAudioTrack) {
      await (this.localAudioTrack as unknown as { setDevice(id: string): Promise<void> }).setDevice(selection.micId)
      this.currentMicId = selection.micId
    }
    if (selection.camId && this.localVideoTrack) {
      await (this.localVideoTrack as unknown as { setDevice(id: string): Promise<void> }).setDevice(selection.camId)
      this.currentCamId = selection.camId
    }
  }

  // ============================================================================
  // Screen Share
  // ============================================================================

  async startScreenShare(options?: { withAudio?: boolean; quality?: ScreenShareQuality }): Promise<void> {
    if (!this.rtcClient || !this.joined) {
      this.emitError('SCREEN_SHARE_ERROR', 'vc.err.notInCall', 'Not connected to a call')
      return
    }

    if (this.isScreenSharing) {
      this.log('Screen share already active')
      return
    }

    try {
      this.log('Starting screen share with separate client...')
      
      // Get quality config
      const quality = options?.quality || 'auto'
      const screenConfig = SCREEN_QUALITY_MAP[quality]
      
      // Create SEPARATE screen client (like reference implementation)
      const channelProfile = this.config.channelProfile || 'communication'
      const mode: SDK_MODE = channelProfile === 'live_broadcasting' ? 'live' : 'rtc'
      const codec: SDK_CODEC = this.config.codec || 'vp8'
      
      this.screenClient = AgoraRTC.createClient({ mode, codec })
      this.log('Created separate screen client')
      
      // Set client role for live mode
      if (mode === 'live') {
        const agoraRole = this.mapClientRoleToAgora(this.clientRole)
        await this.screenClient.setClientRole(agoraRole)
      }
      
      // Apply encryption to screen client if configured
      if (this.encryptionConfig && this.encryptionConfig.enabled && this.encryptionConfig.mode !== 'none' && this.encryptionConfig.key) {
        const agoraMode = ENCRYPTION_MODE_MAP[this.encryptionConfig.mode]
        if (agoraMode) {
          await this.screenClient.setEncryptionConfig(agoraMode, this.encryptionConfig.key, this.encryptionConfig.salt)
          this.log('Encryption enabled for screen client:', agoraMode)
        }
      }
      
      // Create screen share track(s)
      const withAudio = options?.withAudio ?? false
      
      if (withAudio) {
        // Create with audio - returns [videoTrack, audioTrack] or just videoTrack
        const result = await AgoraRTC.createScreenVideoTrack(screenConfig, 'auto')
        if (Array.isArray(result)) {
          this.screenTrack = result[0]
          this.screenAudioTrack = result[1]
        } else {
          this.screenTrack = result
        }
      } else {
        // Create without audio
        this.screenTrack = await AgoraRTC.createScreenVideoTrack(screenConfig, 'disable')
      }
      
      // Join channel with screen client (separate UID)
      // Use a generated screen UID or let Agora assign one
      const screenToken = null // In production, you'd get a separate token for screen share
      this.screenShareUid = await this.screenClient.join(
        this.config.appId,
        this.channelName,
        screenToken,
        null // Let Agora assign UID
      )
      this.log('Screen client joined with UID:', this.screenShareUid)

      // Publish screen track(s) via screen client
      const tracksToPublish: (ILocalVideoTrack | ILocalAudioTrack)[] = [this.screenTrack]
      if (this.screenAudioTrack) {
        tracksToPublish.push(this.screenAudioTrack)
      }
      
      await this.screenClient.publish(tracksToPublish)
      
      this.isScreenSharing = true
      this.eventBus.emit('screen-share-started', { uid: String(this.screenShareUid) })
      this.updateLocalParticipant({ isScreenSharing: true })
      this.log('Screen share started with separate client')

      // Handle browser's native stop (when user clicks "Stop sharing" in browser UI)
      this.screenTrack.on('track-ended', () => {
        this.log('Screen track ended by browser')
        this.stopScreenShare()
      })
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      
      if (err.code === 'PERMISSION_DENIED' || String(error).includes('Permission denied')) {
        this.emitError('SCREEN_SHARE_DENIED', 'vc.err.permissionDenied', err.message)
        this.eventBus.emit('screen-share-error', { code: 'PERMISSION_DENIED', message: 'Permission denied' })
      } else {
        this.emitError('SCREEN_SHARE_ERROR', 'vc.err.screenShareFailed', err.message)
        this.eventBus.emit('screen-share-error', { code: 'UNKNOWN', message: err.message || 'Unknown error' })
      }
      
      // Cleanup on error
      await this.cleanupScreenShare()
      
      throw error
    }
  }

  private async cleanupScreenShare(): Promise<void> {
    // Leave screen client channel
    if (this.screenClient) {
      try {
        await this.screenClient.leave()
      } catch (e) {
        this.log('Error leaving screen client:', e)
      }
      this.screenClient = null
    }
    
    // Close screen tracks
    if (this.screenTrack) {
      this.screenTrack.stop()
      this.screenTrack.close()
      this.screenTrack = null
    }
    if (this.screenAudioTrack) {
      this.screenAudioTrack.stop()
      this.screenAudioTrack.close()
      this.screenAudioTrack = null
    }
    
    this.screenShareUid = null
  }

  async stopScreenShare(): Promise<void> {
    if (!this.isScreenSharing) {
      return
    }

    try {
      this.log('Stopping screen share...')
      
      const screenUid = this.screenShareUid
      
      // Emit user offline for screen share UID (like reference)
      if (screenUid) {
        this.eventBus.emit('participant-left', { id: String(screenUid), reason: 'quit' })
      }
      
      // Cleanup screen client and tracks
      await this.cleanupScreenShare()

      this.isScreenSharing = false
      this.eventBus.emit('screen-share-stopped', { uid: String(this.localUid) })
      this.updateLocalParticipant({ isScreenSharing: false })
      this.log('Screen share stopped')
    } catch (error) {
      this.log('Error stopping screen share:', error)
      // Force cleanup
      this.screenClient = null
      this.screenTrack = null
      this.screenAudioTrack = null
      this.screenShareUid = null
      this.isScreenSharing = false
    }
  }

  // ============================================================================
  // Quality
  // ============================================================================

  async setVideoQuality(quality: VideoQualityPreset): Promise<void> {
    if (!this.localVideoTrack) {
      this.log('No video track to set quality')
      return
    }

    const preset = VIDEO_QUALITY_MAP[quality]
    if (preset) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.localVideoTrack as any).setEncoderConfiguration(preset)
        this.log('Video quality set to:', quality, preset)
      } catch (error) {
        this.log('Failed to set video quality:', error)
        this.emitError('QUALITY_ERROR', 'vc.err.qualityFailed', String(error))
      }
    }
  }

  async setAudioOnly(audioOnly: boolean): Promise<void> {
    if (audioOnly) {
      // Disable video
      if (this.localVideoTrack) {
        await this.localVideoTrack.setEnabled(false)
        this.isCamEnabled = false
        this.eventBus.emit('local-video-changed', { enabled: false })
        this.updateLocalParticipant({ videoEnabled: false })
      }
    } else {
      // Re-enable video
      if (this.localVideoTrack) {
        await this.localVideoTrack.setEnabled(true)
        this.isCamEnabled = true
        this.eventBus.emit('local-video-changed', { enabled: true })
        this.updateLocalParticipant({ videoEnabled: true })
      }
    }
  }

  async setDualStream(enabled: boolean): Promise<void> {
    if (this.rtcClient) {
      if (enabled) {
        await this.rtcClient.enableDualStream()
      } else {
        await this.rtcClient.disableDualStream()
      }
    }
  }

  async setRemoteVideoStreamType(uid: string, type: 'high' | 'low'): Promise<void> {
    if (this.rtcClient) {
      await this.rtcClient.setRemoteVideoStreamType(Number(uid), type === 'high' ? 0 : 1)
    }
  }

  // ============================================================================
  // Token
  // ============================================================================

  async refreshToken(newToken: string): Promise<void> {
    if (this.rtcClient) {
      await this.rtcClient.renewToken(newToken)
    }
  }

  // ============================================================================
  // Getters
  // ============================================================================

  async getDevices(): Promise<Devices> {
    const devices = await AgoraRTC.getDevices()
    
    const microphones = devices
      .filter(d => d.kind === 'audioinput')
      .map(d => ({ 
        deviceId: d.deviceId, 
        label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`,
        kind: 'audioinput' as const
      }))
    
    const cameras = devices
      .filter(d => d.kind === 'videoinput')
      .map(d => ({ 
        deviceId: d.deviceId, 
        label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
        kind: 'videoinput' as const
      }))
    
    const speakers = devices
      .filter(d => d.kind === 'audiooutput')
      .map(d => ({ 
        deviceId: d.deviceId, 
        label: d.label || `Speaker ${d.deviceId.slice(0, 8)}`,
        kind: 'audiooutput' as const
      }))
    
    // Get currently selected device IDs from local tracks
    const selectedMicId = this.localAudioTrack?.getTrackLabel() 
      ? microphones.find(m => m.label === this.localAudioTrack?.getTrackLabel())?.deviceId 
      : microphones[0]?.deviceId
    
    const selectedCamId = this.localVideoTrack?.getTrackLabel()
      ? cameras.find(c => c.label === this.localVideoTrack?.getTrackLabel())?.deviceId
      : cameras[0]?.deviceId
    
    return {
      microphones,
      cameras,
      speakers,
      selectedMicId,
      selectedCamId,
      selectedSpeakerId: speakers[0]?.deviceId,
    }
  }

  getParticipants(): Participant[] {
    const participants: Participant[] = []
    
    // Add local participant
    if (this.localUid) {
      participants.push(this.getLocalParticipant())
    }
    
    // Add remote participants
    for (const [uid, user] of this.remoteUsers) {
      participants.push(this.mapRemoteUserToParticipant(uid, user))
    }
    
    return participants
  }

  getCallState(): CallState {
    return this.joined ? 'in_call' : 'idle'
  }

  async getStats(): Promise<CallStats> {
    if (!this.rtcClient) {
      return {
        duration: 0,
        sendBitrate: 0,
        receiveBitrate: 0,
        rtt: 0,
        packetLoss: 0,
      }
    }

    try {
      // Get RTC stats from Agora client
      const rtcStats = this.rtcClient.getRTCStats()
      
      // Calculate duration
      const duration = this.joinTimestamp 
        ? Math.floor((Date.now() - this.joinTimestamp) / 1000) 
        : (rtcStats.Duration || 0)

      // Get local video stats
      let localVideoStats = null
      if (this.localVideoTrack) {
        const videoStats = this.rtcClient.getLocalVideoStats()
        localVideoStats = {
          sendBitrate: videoStats.sendBitrate || 0,
          sendFrameRate: videoStats.sendFrameRate || 0,
          targetSendBitrate: videoStats.targetSendBitrate || 0,
          captureResolutionWidth: videoStats.captureResolutionWidth || 0,
          captureResolutionHeight: videoStats.captureResolutionHeight || 0,
          sendResolutionWidth: videoStats.sendResolutionWidth || 0,
          sendResolutionHeight: videoStats.sendResolutionHeight || 0,
        }
      }

      // Get local audio stats
      let localAudioStats = null
      if (this.localAudioTrack) {
        const audioStats = this.rtcClient.getLocalAudioStats()
        localAudioStats = {
          sendBitrate: audioStats.sendBitrate || 0,
          sendVolumeLevel: audioStats.sendVolumeLevel || 0,
        }
      }

      // Get remote video stats
      const remoteVideoStats: Record<string, unknown> = {}
      const remoteVideoStatsObj = this.rtcClient.getRemoteVideoStats()
      for (const uid in remoteVideoStatsObj) {
        const stats = remoteVideoStatsObj[uid]
        remoteVideoStats[uid] = {
          receiveBitrate: stats.receiveBitrate || 0,
          receiveFrameRate: stats.receiveFrameRate || 0,
          receiveResolutionWidth: stats.receiveResolutionWidth || 0,
          receiveResolutionHeight: stats.receiveResolutionHeight || 0,
          packetLossRate: stats.packetLossRate || 0,
          totalFreezeTime: stats.totalFreezeTime || 0,
        }
      }

      // Get remote audio stats
      const remoteAudioStats: Record<string, unknown> = {}
      const remoteAudioStatsObj = this.rtcClient.getRemoteAudioStats()
      for (const uid in remoteAudioStatsObj) {
        const stats = remoteAudioStatsObj[uid]
        remoteAudioStats[uid] = {
          receiveBitrate: stats.receiveBitrate || 0,
          receiveLevel: stats.receiveLevel || 0,
          packetLossRate: stats.packetLossRate || 0,
          totalFreezeTime: stats.totalFreezeTime || 0,
        }
      }

      // Calculate total bitrates
      const sendBitrate = rtcStats.SendBitrate || 
        (localVideoStats?.sendBitrate || 0) + (localAudioStats?.sendBitrate || 0)
      const receiveBitrate = rtcStats.RecvBitrate || 0

      return {
        duration,
        sendBitrate,
        receiveBitrate,
        rtt: rtcStats.RTT || 0,
        packetLoss: rtcStats.OutgoingAvailableBandwidth ? 0 : 0, // Agora doesn't directly provide packet loss
        // Extended stats
        localVideoStats: localVideoStats as unknown as undefined,
        localAudioStats: localAudioStats as unknown as undefined,
        remoteVideoStats: Object.keys(remoteVideoStats).length > 0 ? remoteVideoStats as unknown as undefined : undefined,
        remoteAudioStats: Object.keys(remoteAudioStats).length > 0 ? remoteAudioStats as unknown as undefined : undefined,
        userCount: rtcStats.UserCount || this.remoteUsers.size + 1,
      } as CallStats
    } catch (error) {
      this.log('Failed to get stats:', error)
      return {
        duration: this.joinTimestamp ? Math.floor((Date.now() - this.joinTimestamp) / 1000) : 0,
        sendBitrate: 0,
        receiveBitrate: 0,
        rtt: 0,
        packetLoss: 0,
      }
    }
  }

  createRenderer(): VideoRenderer {
    const self = this
    
    // Debug-controlled logging helper for renderer
    const log = (...args: unknown[]) => {
      if (self.debug) {
        log('', ...args)
      }
    }
    const warn = (...args: unknown[]) => {
      if (self.debug) {
        warn('', ...args)
      }
    }
    
    // Helper to play video using native MediaStream API (preferred method - more reliable)
    // BUT: When VB is applied to main, we MUST use Agora's track.play() to show the processed output
    const playWithNativeVideo = async (track: ILocalVideoTrack, element: HTMLElement, options: { mirror?: boolean }): Promise<boolean> => {
      try {
        // If VB is applied to main video, DON'T use native video
        // We need to use track.play() which renders the processor output
        if (self.vbApplied && self.vbPiped) {
          console.log('[Renderer] VB applied to main, skipping native video - will use track.play()')
          return false
        }
        
        // Get the native MediaStreamTrack from Agora track
        const mediaStreamTrack = track.getMediaStreamTrack()
        
        if (!mediaStreamTrack || mediaStreamTrack.readyState !== 'live') {
          log(' MediaStreamTrack not ready:', mediaStreamTrack?.readyState)
          return false
        }

        // Create a video element and play the stream
        const videoElement = document.createElement('video')
        videoElement.srcObject = new MediaStream([mediaStreamTrack])
        videoElement.autoplay = true
        videoElement.playsInline = true
        videoElement.muted = true
        videoElement.style.width = '100%'
        videoElement.style.height = '100%'
        videoElement.style.objectFit = 'cover'
        if (options.mirror) {
          videoElement.style.transform = 'scaleX(-1)'
        }

        // Clear existing content and append video
        element.innerHTML = ''
        element.appendChild(videoElement)

        console.log('[Renderer] Playing with native video element (VB not applied to main)')
        return true
      } catch (error) {
        warn('ERROR: Native video playback failed:', error)
        return false
      }
    }

    // Helper to safely play a track with retries
    // Now that preview has its own separate track, we don't need to worry about conflicts
    const safePlayTrack = async (track: ILocalVideoTrack, element: HTMLElement, options: { fit: 'cover' | 'contain', mirror?: boolean }, retryCount = 0) => {
      const maxRetries = 3
      const retryDelay = 300

      // Check if track is enabled
      if (!track.enabled) {
        console.log('[Renderer] Track is disabled, skipping play')
        return
      }

      console.log('[Renderer] safePlayTrack attempt:', {
        retryCount,
        enabled: track.enabled,
        trackId: track.getTrackId(),
        vbPiped: self.vbPiped,
        vbApplied: self.vbApplied
      })

      // Try native video first - this works for both original and VB-processed video
      // because getMediaStreamTrack() returns the processed track when VB is piped
      if (await playWithNativeVideo(track, element, { mirror: options.mirror })) {
        return // Success!
      }

      // Fallback to Agora's play() method
      // Since preview now uses a separate track, this won't conflict
      try {
        console.log('[Renderer] Using Agora track.play()')
        track.play(element, options)
        console.log('[Renderer] Agora play() successful')
        return
      } catch (playError) {
        console.error('[Renderer] Agora play() failed:', playError)
      }

      // Retry if we have retries left
      if (retryCount < maxRetries) {
        setTimeout(() => {
          safePlayTrack(track, element, options, retryCount + 1)
        }, retryDelay * (retryCount + 1))
      } else {
        console.warn('[Renderer] All play attempts failed after', maxRetries, 'retries')
      }
    }

    // Helper for scheduling remote video retry
    const scheduleRemoteVideoRetry = (element: HTMLElement, participantId: string, retryCount: number) => {
      const maxRetries = 5
      const retryDelay = 300

      if (retryCount >= maxRetries) {
        warn(' Max retries reached for remote video:', participantId)
        return
      }

      setTimeout(() => {
        if (!self.rtcClient) return

        const user = self.rtcClient.remoteUsers.find(u => String(u.uid) === participantId)
        if (user && user.videoTrack) {
          const mediaStreamTrack = user.videoTrack.getMediaStreamTrack?.()
          if (mediaStreamTrack && mediaStreamTrack.readyState === 'live') {
            // Try native video first
            try {
              const videoElement = document.createElement('video')
              videoElement.srcObject = new MediaStream([mediaStreamTrack])
              videoElement.autoplay = true
              videoElement.playsInline = true
              videoElement.muted = true
              videoElement.style.width = '100%'
              videoElement.style.height = '100%'
              videoElement.style.objectFit = 'cover'
              element.innerHTML = ''
              element.appendChild(videoElement)
              log(' Retry remote video with native element successful')
              return
            } catch (_nativeError) {
              log(' Native element failed, trying Agora play')
            }
            
            // Fallback to Agora's play
            try {
              user.videoTrack.play(element, { fit: 'cover' })
              log(' Retry remote video with Agora player successful')
            } catch (_playError) {
              // Both failed, retry again
              scheduleRemoteVideoRetry(element, participantId, retryCount + 1)
            }
          } else {
            // Track not ready, retry again
            scheduleRemoteVideoRetry(element, participantId, retryCount + 1)
          }
        } else {
          // No track yet, retry
          scheduleRemoteVideoRetry(element, participantId, retryCount + 1)
        }
      }, retryDelay * (retryCount + 1))
    }

    return {
      attachVideo(element: HTMLElement, participantId: string, kind: 'camera' | 'screen') {
        const isLocal = participantId === 'local' || participantId === String(self.localUid)
        
        log(' attachVideo called:', {
          participantId,
          localUid: self.localUid,
          kind,
          isLocal,
          hasLocalVideoTrack: !!self.localVideoTrack,
          hasClient: !!self.rtcClient
        })

        try {
          if (isLocal) {
            // Local participant video
            if (kind === 'camera' && self.localVideoTrack) {
              log(' Playing local video track to element')
              safePlayTrack(self.localVideoTrack, element, { fit: 'cover', mirror: true })
            } else {
              log(' No track available for local participant')
            }
          } else if (self.rtcClient) {
            // Remote participant video
            const user = self.rtcClient.remoteUsers.find(u => String(u.uid) === participantId)
            log(' Looking for remote user:', participantId, 'Found:', !!user, 'Has video:', !!user?.videoTrack)
            
            if (user && user.videoTrack) {
              // Try native video first for remote users too
              const mediaStreamTrack = user.videoTrack.getMediaStreamTrack?.()
              if (mediaStreamTrack && mediaStreamTrack.readyState === 'live') {
                try {
                  const videoElement = document.createElement('video')
                  videoElement.srcObject = new MediaStream([mediaStreamTrack])
                  videoElement.autoplay = true
                  videoElement.playsInline = true
                  videoElement.muted = true
                  videoElement.style.width = '100%'
                  videoElement.style.height = '100%'
                  videoElement.style.objectFit = 'cover'
                  element.innerHTML = ''
                  element.appendChild(videoElement)
                  log(' Remote video playing with native element')
                  return
                } catch (_nativeError) {
                  // Fall through to Agora play
                }
              }
              
              // Fallback to Agora's play
              try {
                user.videoTrack.play(element, { fit: 'cover' })
                log(' Remote video playing with Agora player')
              } catch (_playError) {
                log(' Remote video not ready, scheduling retry')
                scheduleRemoteVideoRetry(element, participantId, 0)
              }
            } else if (user && !user.videoTrack) {
              log(' Remote user found but no video track yet, scheduling retry')
              scheduleRemoteVideoRetry(element, participantId, 0)
            } else {
              log(' Remote user not found:', participantId)
            }
          }
        } catch (error) {
          warn('ERROR: Error playing video:', error)
        }
      },
      
      detachVideo(_element: HTMLElement) {
        // Clear the element content
        _element.innerHTML = ''
      },
      
      // Alias methods used by DiagVideoTileV2
      renderVideo(element: HTMLElement, participantId: string, _isLocal: boolean) {
        this.attachVideo(element, participantId, 'camera')
      },
      
      renderScreenShare(element: HTMLElement, participantId: string) {
        this.attachVideo(element, participantId, 'screen')
      },
      
      clearVideo(element: HTMLElement) {
        this.detachVideo(element)
      },
      
      attachPreview(element: HTMLElement, _kind: 'camera' | 'screen') {
        console.log('[Renderer] attachPreview called - vbEnabled:', self.vbEnabled, 'hasLocalTrack:', !!self.localVideoTrack)
        
        // For simple preview (no VB), just use the main track
        // This works for PreJoin and when VB is not active
        if (self.localVideoTrack) {
          try {
            // Use native video element for preview so it doesn't conflict with main video
            const mediaStreamTrack = self.localVideoTrack.getMediaStreamTrack()
            if (mediaStreamTrack && mediaStreamTrack.readyState === 'live') {
              const videoElement = document.createElement('video')
              videoElement.srcObject = new MediaStream([mediaStreamTrack])
              videoElement.autoplay = true
              videoElement.playsInline = true
              videoElement.muted = true
              videoElement.style.width = '100%'
              videoElement.style.height = '100%'
              videoElement.style.objectFit = 'cover'
              videoElement.style.transform = 'scaleX(-1)'
              
              element.innerHTML = ''
              element.appendChild(videoElement)
              console.log('[Renderer] ✓ Preview attached using native video element')
              return
            }
          } catch (e) {
            console.warn('[Renderer] Native video failed, trying track.play():', e)
          }
          
          // Fallback to track.play()
          try {
            self.localVideoTrack.play(element, { fit: 'cover', mirror: true })
            console.log('[Renderer] ✓ Preview attached using track.play()')
          } catch (e) {
            console.error('[Renderer] Failed to play preview:', e)
          }
        } else {
          console.warn('[Renderer] No video track available for preview')
        }
      },
      
      // Async version for VB preview - creates separate track
      async attachPreviewWithVB(element: HTMLElement) {
        console.log('[Renderer] attachPreviewWithVB - creating separate preview track for VB')
        
        // Create a SEPARATE preview track for VB
        if (!self.previewVideoTrack) {
          try {
            console.log('[Renderer] Creating separate preview video track...')
            self.previewVideoTrack = await AgoraRTC.createCameraVideoTrack()
            console.log('[Renderer] ✓ Preview track created')
          } catch (e) {
            console.error('[Renderer] Failed to create preview track:', e)
            return
          }
        }
        
        // Pipe the preview processor to the preview track
        if (self.vbPreviewProcessor && !self.vbPreviewPiped) {
          console.log('[Renderer] Piping VB preview processor to preview track...')
          try {
            // Initialize preview processor if needed
            if (!self.vbPreviewInitialized) {
              const wasmDir = self.config.virtualBackgroundWasmDir || configuredVBWasmDir || '/wasms'
              await self.vbPreviewProcessor.init(wasmDir)
              self.vbPreviewInitialized = true
              console.log('[Renderer] ✓ Preview processor initialized')
            }
            
            // Pipe preview track to preview processor
            self.previewVideoTrack
              .pipe(self.vbPreviewProcessor)
              .pipe(self.previewVideoTrack.processorDestination)
            self.vbPreviewPiped = true
            console.log('[Renderer] ✓ Preview processor piped')
          } catch (e) {
            console.error('[Renderer] Failed to pipe preview processor:', e)
          }
        }
        
        // Play the preview track
        try {
          self.previewVideoTrack.play(element, { fit: 'cover', mirror: true })
          console.log('[Renderer] ✓ Preview track playing with VB')
        } catch (e) {
          console.error('[Renderer] Failed to play preview track:', e)
        }
      },
      
      detachPreview(element: HTMLElement) {
        console.log('[Renderer] detachPreview - cleaning up preview track')
        
        // Stop and close the preview track
        if (self.previewVideoTrack) {
          try {
            self.previewVideoTrack.stop()
            self.previewVideoTrack.close()
          } catch (e) {
            console.error('[Renderer] Error stopping preview track:', e)
          }
          self.previewVideoTrack = null
          self.vbPreviewPiped = false
        }
        
        // Clear the element
        element.innerHTML = ''
      }
    }
  }

  // ============================================================================
  // Optional Methods - Virtual Background, Beauty, Noise Suppression
  // ============================================================================

  isVirtualBackgroundSupported(): boolean {
    return this.vbExtension !== null && this.vbProcessor !== null
  }

  /**
   * "Open" Virtual Background for LocalVideoTrack
   * This initializes the WASM and pipes the processor to the video track.
   * Must be called BEFORE enabling VB effects (like in Agora demo).
   */
  async openVirtualBackgroundForTrack(): Promise<boolean> {
    console.log('[VB] openVirtualBackgroundForTrack called')
    
    if (!this.localVideoTrack) {
      console.warn('[VB] No video track available')
      return false
    }

    if (!this.vbProcessor) {
      console.warn('[VB] VB processor not available')
      return false
    }

    // Initialize WASM if not done
    if (!this.vbInitialized) {
      // Get WASM directory from: adapter config > global config > default
      const wasmDir = this.config.virtualBackgroundWasmDir || configuredVBWasmDir || '/wasms'
      console.log('[VB] Initializing processor with WASM directory:', wasmDir)
      try {
        await this.vbProcessor.init(wasmDir)
        this.vbInitialized = true
        console.log('[VB] ✓ Processor initialized with WASM from:', wasmDir)
      } catch (initError) {
        console.error('[VB] ✗ Processor init failed:', initError)
        console.error('[VB] Make sure the WASM file exists at:', wasmDir + '/agora-virtual-background.wasm')
        return false
      }
    }

    // Pipe video track through processor (this "opens" VB for the track)
    if (!this.vbPiped) {
      console.log('[VB] Piping video track through processor...')
      console.log('[VB] Track ID:', this.localVideoTrack.getTrackId())
      
      try {
        this.localVideoTrack.pipe(this.vbProcessor).pipe(this.localVideoTrack.processorDestination)
        this.vbPiped = true
        console.log('[VB] ✓ Video track piped successfully - VB is now "open" for this track')
        return true
      } catch (pipeError) {
        console.error('[VB] ✗ Pipe error:', pipeError)
        // If already piped, that's OK
        if (String(pipeError).includes('bindProcessor') || String(pipeError).includes('already')) {
          this.vbPiped = true
          console.log('[VB] Track was already piped')
          return true
        }
        return false
      }
    } else {
      console.log('[VB] Track already piped')
      return true
    }
  }

  // Store current VB config for applying to main
  private currentVBConfig: VirtualBackgroundConfig | null = null

  async setVirtualBackground(config: VirtualBackgroundConfig): Promise<void> {
    console.log('[VB] setVirtualBackground called with:', config)
    
    // Store the config for later apply
    this.currentVBConfig = config
    
    // Ensure extensions are initialized
    if (!this.extensionsInitialized) {
      console.log('[VB] Extensions not initialized, initializing now...')
      await this.initializeExtensions()
    }

    if (!this.vbPreviewProcessor) {
      console.error('[VB] Preview processor not available')
      this.emitError('VB_NOT_AVAILABLE', 'Virtual background extension not available')
      return
    }

    try {
      // Initialize preview processor if needed
      if (!this.vbPreviewInitialized) {
        const wasmDir = this.config.virtualBackgroundWasmDir || configuredVBWasmDir || '/wasms'
        console.log('[VB] Initializing preview processor with WASM directory:', wasmDir)
        await this.vbPreviewProcessor.init(wasmDir)
        this.vbPreviewInitialized = true
        console.log('[VB] ✓ Preview processor initialized')
      }

      // Apply VB to PREVIEW processor only
      if (config.type === 'none') {
        console.log('[VB] Disabling preview virtual background...')
        await this.vbPreviewProcessor.disable()
        this.vbEnabled = false
        console.log('[VB] ✓ Preview virtual background disabled')
      } else if (config.type === 'blur') {
        const blurStrength = config.blurStrength ?? 50
        const blurDegree = blurStrength >= 67 ? 3 : blurStrength >= 33 ? 2 : 1
        
        console.log('[VB] Setting preview blur, blurDegree:', blurDegree)
        this.vbPreviewProcessor.setOptions({ type: 'blur', blurDegree })
        await this.vbPreviewProcessor.enable()
        this.vbEnabled = true
        console.log('[VB] ✓ Preview blur enabled')
      } else if (config.type === 'image' && config.imageUrl) {
        console.log('[VB] Loading image for preview:', config.imageUrl)
        const img = document.createElement('img')
        img.crossOrigin = 'anonymous'
        img.src = config.imageUrl
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = (e) => reject(e)
        })
        
        this.vbPreviewProcessor.setOptions({ type: 'img', source: img })
        await this.vbPreviewProcessor.enable()
        this.vbEnabled = true
        console.log('[VB] ✓ Preview image background enabled')
      } else if (config.type === 'color' && config.color) {
        console.log('[VB] Setting preview color:', config.color)
        this.vbPreviewProcessor.setOptions({ type: 'color', color: config.color })
        await this.vbPreviewProcessor.enable()
        this.vbEnabled = true
        console.log('[VB] ✓ Preview color background enabled')
      }

      // Emit event to notify UI that VB preview changed
      console.log('[VB] Emitting virtual-background-changed event (preview only)')
      this.eventBus.emit('virtual-background-changed' as keyof EventMap, { 
        enabled: this.vbEnabled, 
        config,
        applied: this.vbApplied
      } as unknown as EventMap[keyof EventMap])
    } catch (error) {
      console.error('[VB] ✗ Failed to set preview virtual background:', error)
      this.emitError('VB_FAILED', 'Failed to apply virtual background', String(error))
    }
  }

  /**
   * Apply the current virtual background settings to the main video
   * Call this when user confirms/applies the VB selection
   */
  async applyVirtualBackground(): Promise<void> {
    if (!this.vbEnabled || !this.currentVBConfig) {
      console.warn('[VB] Cannot apply - VB is not enabled or no config. Call setVirtualBackground first.')
      return
    }

    const config = this.currentVBConfig
    console.log('[VB] Applying virtual background to main video with config:', config)

    try {
      // Initialize main processor if needed
      if (!this.vbInitialized) {
        const wasmDir = this.config.virtualBackgroundWasmDir || configuredVBWasmDir || '/wasms'
        console.log('[VB] Initializing main processor with WASM directory:', wasmDir)
        await this.vbProcessor.init(wasmDir)
        this.vbInitialized = true
        console.log('[VB] ✓ Main processor initialized')
      }

      // Pipe main video track to main processor if not done
      if (!this.vbPiped && this.localVideoTrack) {
        console.log('[VB] Piping main video track to main processor...')
        this.localVideoTrack.pipe(this.vbProcessor).pipe(this.localVideoTrack.processorDestination)
        this.vbPiped = true
        console.log('[VB] ✓ Main video track piped')
      }

      // Apply the same VB settings to main processor
      if (config.type === 'blur') {
        const blurStrength = config.blurStrength ?? 50
        const blurDegree = blurStrength >= 67 ? 3 : blurStrength >= 33 ? 2 : 1
        
        console.log('[VB] Applying blur to main, blurDegree:', blurDegree)
        this.vbProcessor.setOptions({ type: 'blur', blurDegree })
        await this.vbProcessor.enable()
      } else if (config.type === 'image' && config.imageUrl) {
        console.log('[VB] Applying image to main:', config.imageUrl)
        const img = document.createElement('img')
        img.crossOrigin = 'anonymous'
        img.src = config.imageUrl
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = (e) => reject(e)
        })
        
        this.vbProcessor.setOptions({ type: 'img', source: img })
        await this.vbProcessor.enable()
      } else if (config.type === 'color' && config.color) {
        console.log('[VB] Applying color to main:', config.color)
        this.vbProcessor.setOptions({ type: 'color', color: config.color })
        await this.vbProcessor.enable()
      }

      this.vbApplied = true
      console.log('[VB] ✓ Virtual background applied to main video')
      
      // Emit event to notify UI
      this.eventBus.emit('virtual-background-applied' as keyof EventMap, { 
        applied: true 
      } as unknown as EventMap[keyof EventMap])
      
      // Trigger main video re-render so it uses track.play() instead of native video
      // This ensures the VB effect is visible on the main video
      console.log('[VB] Triggering main video re-render...')
      this.eventBus.emit('local-video-changed', { enabled: false })
      setTimeout(() => {
        this.eventBus.emit('local-video-changed', { enabled: this.isCamEnabled })
        console.log('[VB] ✓ Main video re-render triggered')
      }, 100)
    } catch (error) {
      console.error('[VB] ✗ Failed to apply virtual background to main:', error)
      this.emitError('VB_FAILED', 'Failed to apply virtual background', String(error))
    }
  }

  async disableVirtualBackground(): Promise<void> {
    try {
      // Disable preview processor
      if (this.vbPreviewProcessor && this.vbEnabled) {
        await this.vbPreviewProcessor.disable()
      }
      
      // Disable main processor
      if (this.vbProcessor && this.vbApplied) {
        await this.vbProcessor.disable()
      }
      
      this.vbEnabled = false
      this.vbApplied = false
      this.currentVBConfig = null
      console.log('[VB] Virtual background disabled on both preview and main')
      
      // Emit event to notify UI
      this.eventBus.emit('virtual-background-changed' as keyof EventMap, { 
        enabled: false, 
        config: { type: 'none' },
        applied: false
      } as unknown as EventMap[keyof EventMap])
    } catch (error) {
      console.error('[VB] Failed to disable virtual background:', error)
    }
  }

  isBeautyEffectSupported(): boolean {
    return this.beautyExtension !== null && this.beautyProcessor !== null
  }

  async setBeautyEffect(options: BeautyEffectOptions): Promise<void> {
    if (!this.localVideoTrack) {
      this.log('No video track to apply beauty effects')
      return
    }

    if (!this.beautyProcessor) {
      this.emitError('BEAUTY_NOT_AVAILABLE', 'Beauty effect extension not available')
      return
    }

    try {
      // Pipe the video track through the processor if not done
      if (!this.beautyEnabled) {
        this.localVideoTrack.pipe(this.beautyProcessor).pipe(this.localVideoTrack.processorDestination)
      }

      // Normalize values (0-100 to 0-1)
      const beautyOptions: Record<string, number> = {
        smoothnessLevel: (options.smoothness ?? 50) / 100,
        lighteningLevel: (options.lightening ?? 30) / 100,
        rednessLevel: (options.redness ?? 10) / 100,
        sharpnessLevel: (options.sharpness ?? 30) / 100,
      }
      
      // Add contrast level if specified (0=low, 1=normal, 2=high)
      if (options.contrastLevel !== undefined) {
        beautyOptions.lighteningContrastLevel = options.contrastLevel
      }

      this.beautyProcessor.setOptions(beautyOptions)
      await this.beautyProcessor.enable()
      this.beautyEnabled = true
      this.log('Beauty effects enabled:', beautyOptions)

      this.eventBus.emit('beauty-effect-changed' as keyof EventMap, { options } as unknown as EventMap[keyof EventMap])
    } catch (error) {
      this.log('Failed to set beauty effect:', error)
      this.emitError('BEAUTY_FAILED', 'Failed to apply beauty effects', String(error))
    }
  }

  async disableBeautyEffect(): Promise<void> {
    if (this.beautyProcessor && this.beautyEnabled) {
      try {
        await this.beautyProcessor.disable()
        this.beautyEnabled = false
        this.log('Beauty effects disabled')
      } catch (error) {
        this.log('Failed to disable beauty effects:', error)
      }
    }
  }

  isNoiseSuppressionSupported(): boolean {
    return this.denoiserExtension !== null && this.denoiserProcessor !== null
  }

  async setNoiseSuppression(level: NoiseSuppressionLevel): Promise<void> {
    if (!this.localAudioTrack) {
      this.log('No audio track to apply noise suppression')
      return
    }

    if (!this.denoiserProcessor) {
      this.emitError('DENOISER_NOT_AVAILABLE', 'AI Denoiser extension not available')
      return
    }

    try {
      // Pipe the audio track through the processor if not done
      if (!this.denoiserEnabled) {
        this.localAudioTrack.pipe(this.denoiserProcessor).pipe(this.localAudioTrack.processorDestination)
      }

      if (level === 'off') {
        await this.denoiserProcessor.disable()
        this.denoiserEnabled = false
        this.log('Noise suppression disabled')
      } else {
        // Map level to mode: 'NSNG' for normal, 'STATIONARY_NS' for high/ai
        const mode = level === 'high' || level === 'ai' ? 'STATIONARY_NS' : 'NSNG'
        this.denoiserProcessor.setMode(mode)
        await this.denoiserProcessor.enable()
        this.denoiserEnabled = true
        this.log('Noise suppression enabled, mode:', mode)
      }

      this.eventBus.emit('noise-suppression-changed' as keyof EventMap, { level } as unknown as EventMap[keyof EventMap])
    } catch (error) {
      this.log('Failed to set noise suppression:', error)
      this.emitError('DENOISER_FAILED', 'Failed to apply noise suppression', String(error))
    }
  }

  async disableNoiseSuppression(): Promise<void> {
    if (this.denoiserProcessor && this.denoiserEnabled) {
      try {
        await this.denoiserProcessor.disable()
        this.denoiserEnabled = false
        this.log('Noise suppression disabled')
      } catch (error) {
        this.log('Failed to disable noise suppression:', error)
      }
    }
  }

  async startRecording(_config?: RecordingConfig): Promise<void> {
    // Recording requires backend API integration (Agora Cloud Recording)
    // This is not a client-side SDK feature
    this.log('WARN: Recording requires backend API integration with Agora Cloud Recording')
    this.emitError('RECORDING_NOT_AVAILABLE', 'Recording requires backend API integration')
  }

  async stopRecording(): Promise<void> {
    // Recording requires backend API integration
    this.log('WARN: Recording requires backend API integration')
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async createLocalTracks(options: JoinOptions): Promise<void> {
    const tracks: (ILocalAudioTrack | ILocalVideoTrack)[] = []

    // Handle audio track
    if (options.joinMuted !== true) {
      // Create audio track if it doesn't exist
      if (!this.localAudioTrack) {
        try {
          this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        } catch (error) {
          this.log('WARN: Failed to create audio track:', error)
        }
      }
      if (this.localAudioTrack) {
        tracks.push(this.localAudioTrack)
        this.localAudioTrack.setEnabled(true)
        this.isMicEnabled = true
      }
    } else {
      // Mute existing audio track if present
      if (this.localAudioTrack) {
        this.localAudioTrack.setEnabled(false)
      }
      this.isMicEnabled = false
    }

    // Handle video track  
    if (options.joinVideoOff !== true) {
      // Create video track if it doesn't exist
      if (!this.localVideoTrack) {
        try {
          this.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
          // NOTE: VB processor piping is done lazily in setVirtualBackground()
          // Reset vbPiped since we have a new track
          this.vbPiped = false
        } catch (error) {
          this.log('WARN: Failed to create video track:', error)
        }
      }
      if (this.localVideoTrack) {
        tracks.push(this.localVideoTrack)
        this.localVideoTrack.setEnabled(true)
        this.isCamEnabled = true
      }
    } else {
      // Disable existing video track if present
      if (this.localVideoTrack) {
        this.localVideoTrack.setEnabled(false)
      }
      this.isCamEnabled = false
    }

    // Publish tracks
    if (tracks.length > 0 && this.rtcClient) {
      await this.rtcClient.publish(tracks)
    }
  }

  private getLocalParticipant(): Participant {
    return {
      id: String(this.localUid),
      displayName: this.localUserName,
      role: 'speaker' as ParticipantRole,
      isLocal: true,
      isHost: false,
      audioEnabled: this.isMicEnabled,
      videoEnabled: this.isCamEnabled,
      isSpeaking: false,
      speakingVolume: 0,
      networkQuality: 1,
      isScreenSharing: false,
      isHandRaised: false,
      isPinned: false,
      isSpotlight: false,
      joinedAt: Date.now(),
      hasVirtualBackground: this.vbEnabled,
      hasBeautyEffect: this.beautyEnabled,
      hasNoiseSuppression: this.denoiserEnabled,
    }
  }

  private mapRemoteUserToParticipant(uid: number, user: IAgoraRTCRemoteUser): Participant {
    return {
      id: String(uid),
      displayName: `User-${uid}`,
      role: 'speaker' as ParticipantRole,
      isLocal: false,
      isHost: false,
      audioEnabled: user.hasAudio,
      videoEnabled: user.hasVideo,
      isSpeaking: false,
      speakingVolume: 0,
      networkQuality: 1,
      isScreenSharing: false,
      isHandRaised: false,
      isPinned: false,
      isSpotlight: false,
      joinedAt: Date.now(),
      hasVirtualBackground: false, // Remote user VB state not known
      hasBeautyEffect: false,
      hasNoiseSuppression: false,
    }
  }

  private updateLocalParticipant(updates: Partial<Participant>): void {
    const participant = this.getLocalParticipant()
    const updated = { ...participant, ...updates }
    this.eventBus.emit('participant-updated', updated)
  }

  private setupRtcEventListeners(): void {
    if (!this.rtcClient) return

    // User joined
    this.rtcClient.on('user-joined', (user: IAgoraRTCRemoteUser) => {
      this.log(' User joined:', user.uid)
      this.remoteUsers.set(user.uid as number, user)
      this.eventBus.emit('participant-joined', this.mapRemoteUserToParticipant(user.uid as number, user))
      
      // Check if user already has published tracks that we might have missed
      // This can happen if user-published fired before user-joined was processed
      setTimeout(() => {
        this.checkAndSubscribeToUser(user)
      }, 200)
    })

    // User left
    this.rtcClient.on('user-left', (user: IAgoraRTCRemoteUser, reason: string) => {
      this.log(' User left:', user.uid, reason)
      this.remoteUsers.delete(user.uid as number)
      this.eventBus.emit('participant-left', { id: String(user.uid), reason: 'quit' })
    })

    // User published - with retry logic for race conditions
    this.rtcClient.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      this.log(' User published:', user.uid, mediaType)
      
      // Store the user UID - we'll use this to get a fresh reference
      const userId = user.uid
      
      // Retry subscribe with exponential backoff
      const maxRetries = 5
      let retryCount = 0
      let subscribed = false
      
      while (!subscribed && retryCount < maxRetries) {
        try {
          // Verify client is still connected
          if (!this.rtcClient || this.rtcClient.connectionState !== 'CONNECTED') {
            this.log(' Client not connected, skipping subscribe for:', userId)
            return
          }
          
          // CRITICAL: Wait for SDK to synchronize its internal state
          // The user-published event can fire before remoteUsers is updated
          const delay = retryCount === 0 ? 300 : 500 * retryCount
          await new Promise(resolve => setTimeout(resolve, delay))
          
          // Double-check client is still valid after the delay
          if (!this.rtcClient || this.rtcClient.connectionState !== 'CONNECTED') {
            this.log(' Client disconnected during delay, aborting:', userId)
            return
          }
          
          // IMPORTANT: Get a FRESH user reference from remoteUsers
          // The user object from the callback can become stale
          const freshUser = this.rtcClient.remoteUsers.find(u => u.uid === userId)
          
          if (!freshUser) {
            // User not in remoteUsers yet - this is the race condition
            this.log(' User not yet in remoteUsers, retry:', userId, 'attempt:', retryCount + 1)
            retryCount++
            continue
          }
          
          this.log(' Found fresh user reference, attempting subscribe:', userId)
          await this.rtcClient.subscribe(freshUser, mediaType)
          subscribed = true
          this.log(' Successfully subscribed to:', userId, mediaType)
        } catch (error: unknown) {
          const errorString = String(error)
          
          // Check if it's a "user not in channel" error
          if (errorString.includes('not in the channel') || errorString.includes('USER_NOT_FOUND')) {
            const stillTracked = this.remoteUsers.has(userId as number)
            
            if (stillTracked && retryCount < maxRetries - 1) {
              this.log(' Subscribe failed but user still tracked, will retry:', userId)
              retryCount++
              continue
            }
            
            this.log(' User not in channel after retries, aborting subscribe:', userId)
            return
          }
          
          retryCount++
          this.log('Subscribe attempt', retryCount, 'failed for', userId, ':', errorString)
          
          if (retryCount >= maxRetries) {
            this.log(' Max retries reached for subscribing to:', userId, mediaType)
            return
          }
        }
      }

      // Update participant state after successful subscription
      this.remoteUsers.set(userId as number, user)
      
      if (mediaType === 'audio') {
        // Play audio track immediately after successful subscription
        const freshUser = this.rtcClient?.remoteUsers.find(u => u.uid === userId)
        if (freshUser?.audioTrack) {
          freshUser.audioTrack.play()
        }
        this.eventBus.emit('remote-audio-changed', { uid: String(userId), enabled: true })
      } else if (mediaType === 'video') {
        this.eventBus.emit('remote-video-changed', { uid: String(userId), enabled: true })
      }
      
      // Emit participant updated
      const participant = this.remoteUsers.get(userId as number)
      if (participant) {
        this.eventBus.emit('participant-updated', this.mapRemoteUserToParticipant(userId as number, participant))
      }
    })

    // User unpublished
    this.rtcClient.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      this.log(' User unpublished:', user.uid, mediaType)
      
      if (mediaType === 'audio') {
        this.eventBus.emit('remote-audio-changed', { uid: String(user.uid), enabled: false })
      } else if (mediaType === 'video') {
        this.eventBus.emit('remote-video-changed', { uid: String(user.uid), enabled: false })
      }
    })

    // Volume indicator for speaking detection
    this.rtcClient.on('volume-indicator', (volumes) => {
      volumes.forEach(volume => {
        const participant = this.remoteUsers.get(volume.uid as number)
        if (participant) {
          const isSpeaking = volume.level > 10
          this.eventBus.emit('speaking-changed', { 
            uid: String(volume.uid), 
            isSpeaking, 
            volume: volume.level 
          })
        }
      })
    })

    // Network quality
    this.rtcClient.on('network-quality', (stats) => {
      const quality = Math.min(stats.uplinkNetworkQuality, stats.downlinkNetworkQuality) as 0|1|2|3|4|5|6
      this.eventBus.emit('network-quality-changed', { 
        uid: String(this.localUid), 
        quality,
        uplink: stats.uplinkNetworkQuality as 0|1|2|3|4|5|6,
        downlink: stats.downlinkNetworkQuality as 0|1|2|3|4|5|6
      })
    })

    // Connection state change
    this.rtcClient.on('connection-state-change', (curState, prevState, reason) => {
      this.log(' Connection state change:', prevState, '->', curState, reason)
      
      // Map to call state
      if (curState === 'DISCONNECTED') {
        this.eventBus.emit('call-state-changed', { from: this.getCallState(), to: 'ended' as CallState })
      } else if (curState === 'RECONNECTING') {
        this.eventBus.emit('call-state-changed', { from: this.getCallState(), to: 'reconnecting' as CallState })
      } else if (curState === 'CONNECTED') {
        this.eventBus.emit('call-state-changed', { from: this.getCallState(), to: 'in_call' as CallState })
      }
      
      this.eventBus.emit('connection-state-changed', {
        state: curState.toUpperCase() as 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTING',
        prevState: prevState,
        reason: reason
      })
    })

    // Token expiring
    this.rtcClient.on('token-privilege-will-expire', () => {
      this.eventBus.emit('token-will-expire', { expiresIn: 30 })
    })

    // Token expired
    this.rtcClient.on('token-privilege-did-expire', () => {
      this.eventBus.emit('token-expired', undefined)
    })

    // Enable volume indicator for speaking detection
    this.rtcClient.enableAudioVolumeIndicator()
  }

  /**
   * Check if a user has published tracks and subscribe to them if we haven't already.
   * This handles race conditions where user-published might fire before we're ready.
   */
  private async checkAndSubscribeToUser(user: IAgoraRTCRemoteUser): Promise<void> {
    if (!this.rtcClient || this.rtcClient.connectionState !== 'CONNECTED') {
      return
    }

    const participant = this.remoteUsers.get(user.uid as number)
    if (!participant) {
      return
    }

    // Check if user has audio published but we haven't subscribed
    if (user.hasAudio && !user.audioTrack) {
      this.log(' Detected missed audio subscription for:', user.uid)
      try {
        await this.rtcClient.subscribe(user, 'audio')
        const updatedUser = this.rtcClient.remoteUsers.find(u => u.uid === user.uid)
        if (updatedUser?.audioTrack) {
          updatedUser.audioTrack.play()
        }
        this.eventBus.emit('remote-audio-changed', { uid: String(user.uid), enabled: true })
        this.log(' Successfully subscribed to missed audio for:', user.uid)
      } catch (error) {
        this.log(' Failed to subscribe to missed audio for:', user.uid, error)
      }
    }

    // Check if user has video published but we haven't subscribed
    if (user.hasVideo && !user.videoTrack) {
      this.log(' Detected missed video subscription for:', user.uid)
      try {
        await this.rtcClient.subscribe(user, 'video')
        this.eventBus.emit('remote-video-changed', { uid: String(user.uid), enabled: true })
        this.log(' Successfully subscribed to missed video for:', user.uid)
      } catch (error) {
        this.log(' Failed to subscribe to missed video for:', user.uid, error)
      }
    }
  }

  /**
   * Check all remote users for any missed subscriptions.
   * This is a safety net that runs after joining to catch any users
   * that might have published tracks before we were ready to subscribe.
   */
  private async checkAllRemoteUsersForMissedSubscriptions(): Promise<void> {
    if (!this.rtcClient || this.rtcClient.connectionState !== 'CONNECTED') {
      return
    }

    this.log(' Checking all remote users for missed subscriptions...')
    const remoteUsers = this.rtcClient.remoteUsers

    for (const user of remoteUsers) {
      // Make sure user is tracked as participant
      if (!this.remoteUsers.has(user.uid as number)) {
        this.log(' Found untracked user, adding:', user.uid)
        this.remoteUsers.set(user.uid as number, user)
        this.eventBus.emit('participant-joined', this.mapRemoteUserToParticipant(user.uid as number, user))
      }

      // Check for missed subscriptions
      await this.checkAndSubscribeToUser(user)
    }
  }

  // ============================================================================
  // Event Bus Access
  // ============================================================================

  getEventBus(): EventBus {
    return this.eventBus
  }

  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): void {
    this.eventBus.on(event, handler)
  }

  off<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): void {
    this.eventBus.off(event, handler)
  }
}
