/**
 * Agora Web SDK Adapter V2
 * Full-featured adapter supporting all Agora capabilities
 */

import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  ILocalVideoTrack,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  UID,
  ConnectionState,
  NetworkQuality,
  ScreenVideoTrackInitConfig,
  CameraVideoTrackInitConfig,
  MicrophoneAudioTrackInitConfig,
  EncryptionMode
} from 'agora-rtc-sdk-ng'

import type {
  Actions,
  CallConfig,
  Participant,
  ParticipantRole,
  DeviceInfo,
  VirtualBackgroundConfig,
  BeautyEffectOptions,
  NoiseSuppressionLevel,
  RecordingConfig,
  RecordingInfo,
  LiveStreamConfig,
  LiveStreamInfo,
  EncryptionConfig,
  ChatMessage,
  TranscriptEntry,
  VideoQuality,
  LayoutMode,
  NetworkQuality as NetworkQualityLevel,
  VideoRenderer,
  JoinOptions
} from '@diagvn/video-call-core-v2'

import type { EventBus, EventMap } from '@diagvn/video-call-core-v2'
import { createEventBus } from '@diagvn/video-call-core-v2'

// ============================================================================
// Types
// ============================================================================

export interface AgoraAdapterConfig {
  appId: string
  enableDualStream?: boolean
  enableCloudProxy?: boolean
  logLevel?: 0 | 1 | 2 | 3 | 4
}

// ============================================================================
// Agora Adapter V2 Implementation
// ============================================================================

export class AgoraAdapterV2 implements Actions {
  // Configuration
  private config: AgoraAdapterConfig
  private eventBus: EventBus

  // Agora clients
  private rtcClient: IAgoraRTCClient | null = null
  private screenClient: IAgoraRTCClient | null = null

  // Local tracks
  private localAudioTrack: IMicrophoneAudioTrack | null = null
  private localVideoTrack: ICameraVideoTrack | null = null
  private localScreenTrack: ILocalVideoTrack | null = null
  private localScreenAudioTrack: ILocalAudioTrack | null = null

  // State
  private joined = false
  private channelName = ''
  private localUid: UID = 0
  private localUserName = ''
  private localRole: ParticipantRole = 'host'
  private remoteUsers: Map<UID, IAgoraRTCRemoteUser> = new Map()
  private remoteUserNames: Map<UID, string> = new Map()
  
  // Feature state
  private virtualBackgroundEnabled = false
  private beautyEffectEnabled = false
  private noiseSuppressionLevel: NoiseSuppressionLevel = 'off'
  private recordingInfo: RecordingInfo | null = null
  private liveStreamInfo: LiveStreamInfo | null = null
  private encryptionEnabled = false

  // Audio level monitoring
  private audioLevelInterval: ReturnType<typeof setInterval> | null = null
  private audioLevels: Map<UID, number> = new Map()

  constructor(config: AgoraAdapterConfig, eventBus?: EventBus) {
    this.config = config
    this.eventBus = eventBus || createEventBus()

    // Set log level
    AgoraRTC.setLogLevel(config.logLevel ?? 1)

    // Enable dual stream for better quality adaptation
    if (config.enableDualStream) {
      AgoraRTC.enableDualStream = true
    }
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  async init(): Promise<void> {
    // Agora SDK doesn't require explicit initialization
    // Just verify the app ID is valid
    if (!this.config.appId) {
      throw new Error('Agora App ID is required')
    }
    console.log('[AgoraAdapter] Initialized with appId:', this.config.appId.slice(0, 8) + '...')
  }

  async destroy(): Promise<void> {
    await this.leave()
    this.rtcClient = null
    this.screenClient = null
  }

  createRenderer(): VideoRenderer {
    return {
      attachVideo: (el: HTMLElement, participantId: string, kind: 'camera' | 'screen') => {
        if (participantId === 'local' || participantId === String(this.localUid)) {
          // Local video
          if (kind === 'screen' && this.localScreenTrack) {
            this.localScreenTrack.play(el)
          } else if (this.localVideoTrack) {
            this.localVideoTrack.play(el)
          }
        } else {
          // Remote video
          const numericUid = parseInt(participantId, 10)
          const remoteUser = this.remoteUsers.get(numericUid)
          if (kind === 'screen') {
            // Screen share tracks are published as separate users or special tracks
            remoteUser?.videoTrack?.play(el)
          } else if (remoteUser?.videoTrack) {
            remoteUser.videoTrack.play(el)
          }
        }
      },
      detachVideo: (el: HTMLElement) => {
        // Remove all video elements from container
        const videos = el.querySelectorAll('video')
        videos.forEach(v => v.remove())
      },
      attachPreview: (el: HTMLElement, kind: 'camera' | 'screen') => {
        if (kind === 'screen' && this.localScreenTrack) {
          this.localScreenTrack.play(el)
        } else if (this.localVideoTrack) {
          this.localVideoTrack.play(el)
        }
      },
      detachPreview: (el: HTMLElement) => {
        const videos = el.querySelectorAll('video')
        videos.forEach(v => v.remove())
      }
    }
  }

  // ============================================================================
  // Core Methods
  // ============================================================================

  async join(options: JoinOptions): Promise<void> {
    try {
      this.eventBus.emit('connectionStateChanged', { state: 'connecting' })

      // Create RTC client
      const mode = options.channelProfile === 'LIVE_BROADCASTING' ? 'live' : 'rtc'
      this.rtcClient = AgoraRTC.createClient({
        mode,
        codec: 'vp8'
      })

      // Set role for live mode
      if (mode === 'live' && options.clientRole) {
        await this.rtcClient.setClientRole(options.clientRole === 'BROADCASTER' ? 'host' : 'audience')
        this.localRole = options.clientRole === 'BROADCASTER' ? 'host' : 'audience'
      }

      // Enable cloud proxy if configured
      if (this.config.enableCloudProxy) {
        this.rtcClient.startProxyServer(3) // Force TCP proxy
      }

      // Setup encryption if provided
      if (options.encryption) {
        await this.setEncryption(options.encryption)
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

      // Create and publish local tracks based on options
      await this.initializeLocalTracksFromOptions(options)

      // Start audio level monitoring
      this.startAudioLevelMonitoring()

      // Emit events
      this.eventBus.emit('connectionStateChanged', { state: 'connected' })
      this.eventBus.emit('localUserJoined', {
        participant: this.getLocalParticipant()
      })

    } catch (error) {
      this.eventBus.emit('connectionStateChanged', { state: 'failed' })
      this.eventBus.emit('error', {
        code: 'JOIN_FAILED',
        message: (error as Error).message
      })
      throw error
    }
  }

  async leave(): Promise<void> {
    try {
      // Stop audio monitoring
      this.stopAudioLevelMonitoring()

      // Cleanup local tracks
      await this.cleanupLocalTracks()

      // Leave screen share client
      if (this.screenClient) {
        await this.screenClient.leave()
        this.screenClient = null
      }

      // Leave main client
      if (this.rtcClient) {
        await this.rtcClient.leave()
        this.rtcClient = null
      }

      // Reset state
      this.joined = false
      this.channelName = ''
      this.remoteUsers.clear()
      this.remoteUserNames.clear()

      this.eventBus.emit('connectionStateChanged', { state: 'disconnected' })

    } catch (error) {
      this.eventBus.emit('error', {
        code: 'LEAVE_FAILED',
        message: (error as Error).message
      })
      throw error
    }
  }

  // ============================================================================
  // Audio/Video Controls
  // ============================================================================

  async setAudioEnabled(enabled: boolean): Promise<void> {
    if (!this.localAudioTrack) {
      if (enabled) {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        if (this.rtcClient && this.joined) {
          await this.rtcClient.publish(this.localAudioTrack)
        }
      }
      return
    }

    await this.localAudioTrack.setEnabled(enabled)
    this.eventBus.emit('localAudioStateChanged', { enabled, muted: !enabled })
  }

  async setVideoEnabled(enabled: boolean): Promise<void> {
    if (!this.localVideoTrack) {
      if (enabled) {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
        if (this.rtcClient && this.joined) {
          await this.rtcClient.publish(this.localVideoTrack)
        }
      }
      return
    }

    await this.localVideoTrack.setEnabled(enabled)
    this.eventBus.emit('localVideoStateChanged', { enabled })
  }

  async setAudioInputDevice(deviceId: string): Promise<void> {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setDevice(deviceId)
      this.eventBus.emit('audioInputDeviceChanged', { deviceId })
    }
  }

  async setAudioOutputDevice(deviceId: string): Promise<void> {
    // Audio output is set on the remote audio tracks
    for (const user of this.remoteUsers.values()) {
      if (user.audioTrack) {
        await (user.audioTrack as IRemoteAudioTrack).setPlaybackDevice(deviceId)
      }
    }
    this.eventBus.emit('audioOutputDeviceChanged', { deviceId })
  }

  async setVideoInputDevice(deviceId: string): Promise<void> {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setDevice(deviceId)
      this.eventBus.emit('videoInputDeviceChanged', { deviceId })
    }
  }

  async getDevices(): Promise<{
    audioInputs: DeviceInfo[]
    audioOutputs: DeviceInfo[]
    videoInputs: DeviceInfo[]
  }> {
    const devices = await AgoraRTC.getDevices()
    
    return {
      audioInputs: devices
        .filter(d => d.kind === 'audioinput')
        .map(d => ({ deviceId: d.deviceId, label: d.label, kind: 'audioinput' as const })),
      audioOutputs: devices
        .filter(d => d.kind === 'audiooutput')
        .map(d => ({ deviceId: d.deviceId, label: d.label, kind: 'audiooutput' as const })),
      videoInputs: devices
        .filter(d => d.kind === 'videoinput')
        .map(d => ({ deviceId: d.deviceId, label: d.label, kind: 'videoinput' as const }))
    }
  }

  // ============================================================================
  // Screen Sharing
  // ============================================================================

  async startScreenShare(options?: { withAudio?: boolean }): Promise<void> {
    try {
      // Create screen share client if not exists
      if (!this.screenClient) {
        this.screenClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        
        // Join with a different UID
        const screenUid = this.localUid + 1000000
        await this.screenClient.join(
          this.config.appId,
          this.channelName,
          null, // Token should be handled separately for screen share
          screenUid
        )
      }

      // Create screen track
      const config: ScreenVideoTrackInitConfig = {
        encoderConfig: '1080p_2'
      }

      if (options?.withAudio) {
        const [screenTrack, audioTrack] = await AgoraRTC.createScreenVideoTrack(
          config,
          'enable'
        ) as [ILocalVideoTrack, ILocalAudioTrack]
        
        this.localScreenTrack = screenTrack
        this.localScreenAudioTrack = audioTrack

        await this.screenClient.publish([screenTrack, audioTrack])
      } else {
        this.localScreenTrack = await AgoraRTC.createScreenVideoTrack(config, 'disable') as ILocalVideoTrack
        await this.screenClient.publish(this.localScreenTrack)
      }

      // Listen for screen share end (user clicks stop in browser)
      this.localScreenTrack.on('track-ended', () => {
        this.stopScreenShare()
      })

      this.eventBus.emit('screenShareStateChanged', { 
        active: true,
        participantId: String(this.localUid)
      })

    } catch (error) {
      this.eventBus.emit('error', {
        code: 'SCREEN_SHARE_FAILED',
        message: (error as Error).message
      })
      throw error
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.localScreenTrack) {
      this.localScreenTrack.close()
      this.localScreenTrack = null
    }

    if (this.localScreenAudioTrack) {
      this.localScreenAudioTrack.close()
      this.localScreenAudioTrack = null
    }

    if (this.screenClient) {
      await this.screenClient.leave()
      this.screenClient = null
    }

    this.eventBus.emit('screenShareStateChanged', { 
      active: false,
      participantId: String(this.localUid)
    })
  }

  // ============================================================================
  // Virtual Background
  // ============================================================================

  async setVirtualBackground(config: VirtualBackgroundConfig): Promise<void> {
    if (!this.localVideoTrack) return

    try {
      // Note: This requires the Agora Virtual Background extension
      // @ts-ignore - Extension API
      const extension = AgoraRTC.createVirtualBackgroundExtension?.()
      if (!extension) {
        throw new Error('Virtual background extension not available')
      }

      // @ts-ignore
      const processor = extension.createProcessor()

      if (config.type === 'none') {
        await processor.disable()
        this.virtualBackgroundEnabled = false
      } else if (config.type === 'blur') {
        await processor.enable()
        await processor.setOptions({
          type: 'blur',
          blurDegree: config.blurLevel === 'high' ? 3 : config.blurLevel === 'medium' ? 2 : 1
        })
        this.virtualBackgroundEnabled = true
      } else if (config.type === 'image' && config.url) {
        const img = new Image()
        img.src = config.url
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })
        await processor.enable()
        await processor.setOptions({ type: 'img', source: img })
        this.virtualBackgroundEnabled = true
      }

      this.eventBus.emit('virtualBackgroundChanged', { config })
    } catch (error) {
      this.eventBus.emit('error', {
        code: 'VIRTUAL_BACKGROUND_FAILED',
        message: (error as Error).message
      })
    }
  }

  // ============================================================================
  // Beauty Effects
  // ============================================================================

  async setBeautyEffect(options: BeautyEffectOptions): Promise<void> {
    if (!this.localVideoTrack) return

    try {
      // @ts-ignore - Beauty effect API
      await this.localVideoTrack.setBeautyEffect(true, {
        smoothnessLevel: (options.smoothing ?? 50) / 100,
        lighteningLevel: (options.lightening ?? 30) / 100,
        rednessLevel: (options.redness ?? 10) / 100,
        sharpnessLevel: (options.sharpness ?? 30) / 100
      })
      this.beautyEffectEnabled = true
      this.eventBus.emit('beautyEffectChanged', { options, enabled: true })
    } catch (error) {
      this.eventBus.emit('error', {
        code: 'BEAUTY_EFFECT_FAILED',
        message: (error as Error).message
      })
    }
  }

  async disableBeautyEffect(): Promise<void> {
    if (!this.localVideoTrack) return

    try {
      // @ts-ignore
      await this.localVideoTrack.setBeautyEffect(false)
      this.beautyEffectEnabled = false
      this.eventBus.emit('beautyEffectChanged', { options: {}, enabled: false })
    } catch (error) {
      // Ignore errors when disabling
    }
  }

  // ============================================================================
  // Noise Suppression
  // ============================================================================

  async setNoiseSuppression(level: NoiseSuppressionLevel): Promise<void> {
    if (!this.localAudioTrack) return

    try {
      // @ts-ignore - AI Denoiser extension
      const extension = AgoraRTC.createAIDenoiserExtension?.()
      if (!extension) {
        // Fallback to basic noise suppression
        // @ts-ignore
        await this.localAudioTrack.setAINSEnabled(level !== 'off')
        this.noiseSuppressionLevel = level
        this.eventBus.emit('noiseSuppressionChanged', { level })
        return
      }

      // @ts-ignore
      const processor = extension.createProcessor()
      
      if (level === 'off') {
        await processor.disable()
      } else {
        await processor.enable()
        await processor.setLevel(level === 'high' ? 2 : level === 'medium' ? 1 : 0)
      }

      this.noiseSuppressionLevel = level
      this.eventBus.emit('noiseSuppressionChanged', { level })
    } catch (error) {
      this.eventBus.emit('error', {
        code: 'NOISE_SUPPRESSION_FAILED',
        message: (error as Error).message
      })
    }
  }

  // ============================================================================
  // Recording
  // ============================================================================

  async startRecording(config: RecordingConfig): Promise<RecordingInfo> {
    // Note: Cloud recording requires server-side implementation
    // This is a placeholder that would integrate with Agora Cloud Recording
    const recordingId = `rec_${Date.now()}`
    
    this.recordingInfo = {
      id: recordingId,
      startedAt: Date.now(),
      type: config.type,
      status: 'recording'
    }

    this.eventBus.emit('recordingStateChanged', {
      active: true,
      info: this.recordingInfo
    })

    return this.recordingInfo
  }

  async stopRecording(): Promise<void> {
    if (this.recordingInfo) {
      this.recordingInfo.status = 'stopped'
      this.recordingInfo.endedAt = Date.now()

      this.eventBus.emit('recordingStateChanged', {
        active: false,
        info: this.recordingInfo
      })

      this.recordingInfo = null
    }
  }

  // ============================================================================
  // Live Streaming
  // ============================================================================

  async startLiveStream(config: LiveStreamConfig): Promise<LiveStreamInfo> {
    if (!this.rtcClient) throw new Error('Not connected')

    try {
      // Add RTMP URL for live streaming
      await this.rtcClient.startLiveStreaming(config.rtmpUrl!, {
        audioOnly: false
      })

      this.liveStreamInfo = {
        id: `live_${Date.now()}`,
        startedAt: Date.now(),
        status: 'live',
        viewerCount: 0
      }

      this.eventBus.emit('liveStreamStateChanged', {
        active: true,
        info: this.liveStreamInfo
      })

      return this.liveStreamInfo
    } catch (error) {
      this.eventBus.emit('error', {
        code: 'LIVE_STREAM_FAILED',
        message: (error as Error).message
      })
      throw error
    }
  }

  async stopLiveStream(): Promise<void> {
    if (!this.rtcClient || !this.liveStreamInfo) return

    try {
      await this.rtcClient.stopLiveStreaming('')
      
      this.liveStreamInfo.status = 'ended'
      this.liveStreamInfo.endedAt = Date.now()

      this.eventBus.emit('liveStreamStateChanged', {
        active: false,
        info: this.liveStreamInfo
      })

      this.liveStreamInfo = null
    } catch (error) {
      // Ignore errors when stopping
    }
  }

  // ============================================================================
  // Encryption
  // ============================================================================

  async setEncryption(config: EncryptionConfig): Promise<void> {
    if (!this.rtcClient) throw new Error('Not connected')

    const modeMap: Record<string, EncryptionMode> = {
      'aes-128-xts': 'aes-128-xts',
      'aes-256-xts': 'aes-256-xts',
      'aes-128-gcm': 'aes-128-gcm',
      'aes-256-gcm': 'aes-256-gcm',
      'aes-128-gcm2': 'aes-128-gcm2',
      'aes-256-gcm2': 'aes-256-gcm2'
    }

    await this.rtcClient.setEncryptionConfig(
      modeMap[config.mode] || 'aes-128-gcm2',
      config.secret,
      config.salt
    )

    this.encryptionEnabled = true
    this.eventBus.emit('encryptionStateChanged', { enabled: true })
  }

  // ============================================================================
  // Video Quality
  // ============================================================================

  async setVideoQuality(quality: VideoQuality): Promise<void> {
    if (!this.localVideoTrack) return

    const profiles: Record<VideoQuality, string> = {
      'auto': '480p_1',
      '360p': '360p_1',
      '480p': '480p_1',
      '720p': '720p_1',
      '1080p': '1080p_1'
    }

    await this.localVideoTrack.setEncoderConfiguration(profiles[quality] || '480p_1')
    this.eventBus.emit('videoQualityChanged', { quality })
  }

  // ============================================================================
  // Video Rendering
  // ============================================================================

  renderVideo(container: HTMLElement, participantId: string, isLocal: boolean): void {
    if (isLocal) {
      if (this.localVideoTrack) {
        this.localVideoTrack.play(container)
      }
    } else {
      const uid = parseInt(participantId, 10)
      const user = this.remoteUsers.get(uid)
      if (user?.videoTrack) {
        user.videoTrack.play(container)
      }
    }
  }

  renderScreenShare(container: HTMLElement, participantId: string): void {
    // For local screen share
    if (participantId === String(this.localUid) && this.localScreenTrack) {
      this.localScreenTrack.play(container)
      return
    }

    // For remote screen share
    const uid = parseInt(participantId, 10)
    const user = this.remoteUsers.get(uid)
    if (user?.videoTrack) {
      user.videoTrack.play(container)
    }
  }

  renderLocalPreview(container: HTMLElement): void {
    if (this.localVideoTrack) {
      this.localVideoTrack.play(container)
    }
  }

  clearVideo(container: HTMLElement): void {
    // Clear any playing track in this container
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
  }

  // ============================================================================
  // Participants
  // ============================================================================

  getParticipants(): Participant[] {
    const participants: Participant[] = []

    // Add local participant
    participants.push(this.getLocalParticipant())

    // Add remote participants
    for (const [uid, user] of this.remoteUsers) {
      participants.push(this.mapRemoteUserToParticipant(uid, user))
    }

    return participants
  }

  getLocalParticipant(): Participant {
    return {
      id: String(this.localUid),
      name: this.localUserName,
      isLocal: true,
      role: this.localRole,
      isAudioEnabled: this.localAudioTrack?.enabled ?? false,
      isVideoEnabled: this.localVideoTrack?.enabled ?? false,
      isScreenSharing: !!this.localScreenTrack,
      isHandRaised: false,
      connectionState: 'connected',
      audioLevel: this.audioLevels.get(this.localUid) ?? 0,
      networkQuality: 5
    }
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async initializeLocalTracksFromOptions(options: JoinOptions): Promise<void> {
    const tracks: (ILocalAudioTrack | ILocalVideoTrack)[] = []

    // Create audio track - enabled by default unless joinMuted is true
    const enableAudio = options.joinMuted !== true
    if (enableAudio) {
      try {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        tracks.push(this.localAudioTrack)
      } catch (error) {
        console.warn('Failed to create audio track:', error)
      }
    }

    // Create video track - enabled by default unless joinVideoOff is true
    const enableVideo = options.joinVideoOff !== true
    if (enableVideo) {
      try {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
        tracks.push(this.localVideoTrack)
      } catch (error) {
        console.warn('Failed to create video track:', error)
      }
    }

    // Publish tracks
    if (tracks.length > 0 && this.rtcClient) {
      await this.rtcClient.publish(tracks)
    }
  }

  private async initializeLocalTracks(config: CallConfig): Promise<void> {
    const tracks: (ILocalAudioTrack | ILocalVideoTrack)[] = []

    // Create audio track
    if (config.audio !== false) {
      try {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        tracks.push(this.localAudioTrack)
      } catch (error) {
        console.warn('Failed to create audio track:', error)
      }
    }

    // Create video track
    if (config.video !== false) {
      try {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
        tracks.push(this.localVideoTrack)
      } catch (error) {
        console.warn('Failed to create video track:', error)
      }
    }

    // Publish tracks
    if (tracks.length > 0 && this.rtcClient) {
      await this.rtcClient.publish(tracks)
    }
  }

  private async cleanupLocalTracks(): Promise<void> {
    if (this.localAudioTrack) {
      this.localAudioTrack.close()
      this.localAudioTrack = null
    }

    if (this.localVideoTrack) {
      this.localVideoTrack.close()
      this.localVideoTrack = null
    }

    if (this.localScreenTrack) {
      this.localScreenTrack.close()
      this.localScreenTrack = null
    }

    if (this.localScreenAudioTrack) {
      this.localScreenAudioTrack.close()
      this.localScreenAudioTrack = null
    }
  }

  private setupRtcEventListeners(): void {
    if (!this.rtcClient) return

    // User joined
    this.rtcClient.on('user-joined', (user: IAgoraRTCRemoteUser) => {
      this.remoteUsers.set(user.uid as number, user)
      this.eventBus.emit('participantJoined', {
        participant: this.mapRemoteUserToParticipant(user.uid as number, user)
      })
    })

    // User left
    this.rtcClient.on('user-left', (user: IAgoraRTCRemoteUser, reason: string) => {
      this.remoteUsers.delete(user.uid as number)
      this.eventBus.emit('participantLeft', {
        participantId: String(user.uid),
        reason
      })
    })

    // User published
    this.rtcClient.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await this.rtcClient!.subscribe(user, mediaType)
      this.remoteUsers.set(user.uid as number, user)

      if (mediaType === 'audio') {
        user.audioTrack?.play()
        this.eventBus.emit('remoteAudioStateChanged', {
          participantId: String(user.uid),
          enabled: true
        })
      } else {
        this.eventBus.emit('remoteVideoStateChanged', {
          participantId: String(user.uid),
          enabled: true
        })
      }
    })

    // User unpublished
    this.rtcClient.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      if (mediaType === 'audio') {
        this.eventBus.emit('remoteAudioStateChanged', {
          participantId: String(user.uid),
          enabled: false
        })
      } else {
        this.eventBus.emit('remoteVideoStateChanged', {
          participantId: String(user.uid),
          enabled: false
        })
      }
    })

    // Connection state change
    this.rtcClient.on('connection-state-change', (
      curState: ConnectionState,
      revState: ConnectionState,
      reason?: string
    ) => {
      const stateMap: Record<ConnectionState, string> = {
        'DISCONNECTED': 'disconnected',
        'CONNECTING': 'connecting',
        'CONNECTED': 'connected',
        'RECONNECTING': 'reconnecting',
        'DISCONNECTING': 'disconnected'
      }

      this.eventBus.emit('connectionStateChanged', {
        state: stateMap[curState] as any,
        reason
      })
    })

    // Network quality
    this.rtcClient.on('network-quality', (stats: NetworkQuality) => {
      this.eventBus.emit('networkQualityChanged', {
        participantId: String(this.localUid),
        quality: Math.min(stats.uplinkNetworkQuality, stats.downlinkNetworkQuality) as NetworkQualityLevel
      })
    })

    // Token privilege will expire
    this.rtcClient.on('token-privilege-will-expire', () => {
      this.eventBus.emit('tokenWillExpire', {
        channel: this.channelName
      })
    })

    // Token expired
    this.rtcClient.on('token-privilege-did-expire', () => {
      this.eventBus.emit('tokenExpired', {
        channel: this.channelName
      })
    })

    // Exception
    this.rtcClient.on('exception', (event: any) => {
      this.eventBus.emit('error', {
        code: event.code,
        message: event.msg
      })
    })
  }

  private mapRemoteUserToParticipant(uid: UID, user: IAgoraRTCRemoteUser): Participant {
    return {
      id: String(uid),
      name: this.remoteUserNames.get(uid as number) || `User-${uid}`,
      isLocal: false,
      role: 'host',
      isAudioEnabled: user.hasAudio,
      isVideoEnabled: user.hasVideo,
      isScreenSharing: false, // Would need to detect screen share UIDs
      isHandRaised: false,
      connectionState: 'connected',
      audioLevel: this.audioLevels.get(uid as number) ?? 0,
      networkQuality: 5
    }
  }

  private startAudioLevelMonitoring(): void {
    this.audioLevelInterval = setInterval(() => {
      // Local audio level
      if (this.localAudioTrack) {
        const level = this.localAudioTrack.getVolumeLevel()
        this.audioLevels.set(this.localUid as number, level)
        
        if (level > 0.1) {
          this.eventBus.emit('activeSpeakerChanged', {
            participantId: String(this.localUid)
          })
        }
      }

      // Remote audio levels
      for (const [uid, user] of this.remoteUsers) {
        if (user.audioTrack) {
          const level = user.audioTrack.getVolumeLevel()
          this.audioLevels.set(uid, level)
          
          if (level > 0.1) {
            this.eventBus.emit('activeSpeakerChanged', {
              participantId: String(uid)
            })
          }
        }
      }

      // Emit audio levels
      this.eventBus.emit('audioLevelsChanged', {
        levels: Object.fromEntries(
          Array.from(this.audioLevels.entries()).map(([k, v]) => [String(k), v])
        )
      })
    }, 200)
  }

  private stopAudioLevelMonitoring(): void {
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval)
      this.audioLevelInterval = null
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
