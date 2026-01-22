import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalVideoTrack
} from 'agora-rtc-sdk-ng'

import type {
  Actions,
  AdapterConfig,
  CallState,
  Devices,
  JoinOptions,
  DeviceSelection,
  VideoQuality,
  CallStats,
  Participant,
  NetworkQuality,
  MediaDevice
} from '@diagvn/video-call-core'

/**
 * Agora Web SDK Adapter
 * Implements the Actions interface for Agora RTC
 */
export class AgoraWebAdapter implements Actions {
  private client: IAgoraRTCClient | null = null
  private localAudioTrack: IMicrophoneAudioTrack | null = null
  private localVideoTrack: ICameraVideoTrack | null = null
  private screenTrack: ILocalVideoTrack | null = null
  private appId: string
  private eventBus: AdapterConfig['eventBus']
  private debug: boolean
  private callState: CallState = 'idle'
  private localUid: string | number = ''
  private participants = new Map<string, Participant>()

  constructor(config: AdapterConfig) {
    this.appId = config.appId
    this.eventBus = config.eventBus
    this.debug = config.debug || false

    if (this.debug) {
      AgoraRTC.setLogLevel(0)
    }
  }

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log('[AgoraWebAdapter]', ...args)
    }
  }

  private emitStateChange(to: CallState) {
    const from = this.callState
    this.callState = to
    this.eventBus.emit('call-state-changed', { from, to })
  }

  private emitError(code: string, messageKey: string, detail?: string, recoverable = true) {
    this.eventBus.emit('error', { code, messageKey, detail, recoverable })
  }

  private setupClientEvents() {
    if (!this.client) return

    this.client.on('user-joined', async user => {
      this.log('User joined:', user.uid)
      const participant: Participant = {
        id: String(user.uid),
        displayName: `User ${user.uid}`,
        role: 'audience',
        isLocal: false,
        audioEnabled: false,
        videoEnabled: false,
        isSpeaking: false,
        networkQuality: 0,
        joinedAt: Date.now()
      }
      this.participants.set(String(user.uid), participant)
      this.eventBus.emit('participant-joined', participant)
    })

    this.client.on('user-left', user => {
      this.log('User left:', user.uid)
      this.participants.delete(String(user.uid))
      this.eventBus.emit('participant-left', { id: String(user.uid) })
    })

    this.client.on('user-published', async (user, mediaType) => {
      this.log('User published:', user.uid, mediaType)
      
      // Retry subscribe with exponential backoff
      const maxRetries = 3
      let retryCount = 0
      let subscribed = false
      
      while (!subscribed && retryCount < maxRetries) {
        try {
          // Verify user is still in channel before subscribing
          const remoteUsers = this.client!.remoteUsers
          const isUserInChannel = remoteUsers.some(u => u.uid === user.uid)
          
          if (!isUserInChannel) {
            this.log('User not yet in remoteUsers list, waiting...', user.uid)
            await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1)))
            retryCount++
            continue
          }
          
          await this.client!.subscribe(user, mediaType)
          subscribed = true
          this.log('Successfully subscribed to:', user.uid, mediaType)
        } catch (error) {
          retryCount++
          this.log(`Subscribe attempt ${retryCount} failed for ${user.uid}:`, error)
          
          if (retryCount < maxRetries) {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 300 * retryCount))
          } else {
            this.log('Max retries reached for subscribing to:', user.uid, mediaType)
            this.emitError('SUBSCRIBE_FAILED', 'vc.err.subscribeFailed', String(error))
            return
          }
        }
      }

      const participant = this.participants.get(String(user.uid))
      if (participant) {
        if (mediaType === 'audio') {
          participant.audioEnabled = true
          // Play audio track immediately after successful subscription
          if (user.audioTrack) {
            user.audioTrack.play()
          }
        } else if (mediaType === 'video') {
          participant.videoEnabled = true
        }
        this.eventBus.emit('participant-updated', participant)
      }
    })

    this.client.on('user-unpublished', (user, mediaType) => {
      this.log('User unpublished:', user.uid, mediaType)
      const participant = this.participants.get(String(user.uid))
      if (participant) {
        if (mediaType === 'audio') {
          participant.audioEnabled = false
        } else if (mediaType === 'video') {
          participant.videoEnabled = false
        }
        this.eventBus.emit('participant-updated', participant)
      }
    })

    this.client.on('volume-indicator', volumes => {
      volumes.forEach(volume => {
        if (volume.level > 10) {
          const participant = this.participants.get(String(volume.uid))
          if (participant && !participant.isSpeaking) {
            participant.isSpeaking = true
            this.eventBus.emit('speaking-changed', { uid: String(volume.uid), isSpeaking: true })
          }
        } else {
          const participant = this.participants.get(String(volume.uid))
          if (participant && participant.isSpeaking) {
            participant.isSpeaking = false
            this.eventBus.emit('speaking-changed', { uid: String(volume.uid), isSpeaking: false })
          }
        }
      })
    })

    this.client.on('network-quality', stats => {
      const quality = Math.min(
        stats.uplinkNetworkQuality,
        stats.downlinkNetworkQuality
      ) as NetworkQuality
      const participant = this.participants.get(String(this.localUid))
      if (participant) {
        participant.networkQuality = quality
        this.eventBus.emit('network-quality-changed', { uid: String(this.localUid), quality })
      }
    })

    this.client.on('connection-state-change', (curState, prevState, reason) => {
      this.log('Connection state changed:', prevState, '->', curState, 'reason:', reason)

      if (curState === 'DISCONNECTED') {
        this.emitStateChange('ended')
      } else if (curState === 'RECONNECTING') {
        this.emitStateChange('reconnecting')
      } else if (curState === 'CONNECTED') {
        this.emitStateChange('in_call')
      }
    })

    this.client.on('token-privilege-will-expire', () => {
      this.eventBus.emit('token-will-expire', { expiresIn: 30 })
    })

    this.client.on('token-privilege-did-expire', () => {
      this.eventBus.emit('token-expired', undefined)
    })

    this.client.enableAudioVolumeIndicator()
  }

  async init(): Promise<void> {
    try {
      this.log('Initializing adapter...')
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      this.setupClientEvents()
      this.emitStateChange('prejoin')
    } catch (error) {
      this.log('Init failed:', error)
      this.emitError('INIT_FAILED', 'vc.err.initFailed', String(error), false)
      throw error
    }
  }

  async join(options: JoinOptions): Promise<void> {
    if (!this.client) throw new Error('Client not initialized')

    try {
      this.log('Joining channel:', options.channel)
      this.emitStateChange('connecting')

      this.localUid = options.uid

      await this.client.join(this.appId, options.channel, options.token || null, options.uid)

      // Create and publish local tracks
      try {
        if (!options.joinMuted) {
          this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        }
        if (!options.joinVideoOff) {
          this.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
        }

        const tracksToPublish = [this.localAudioTrack, this.localVideoTrack].filter(Boolean) as (
          | IMicrophoneAudioTrack
          | ICameraVideoTrack
        )[]

        if (tracksToPublish.length > 0) {
          await this.client.publish(tracksToPublish)
        }
      } catch (error) {
        this.log('Failed to create/publish tracks:', error)
        this.emitError('DEVICE_ERROR', 'vc.err.deviceNotFound', String(error))
      }

      // Add local participant
      const localParticipant: Participant = {
        id: String(options.uid),
        displayName: options.displayName || 'You',
        role: 'host',
        isLocal: true,
        audioEnabled: !!this.localAudioTrack,
        videoEnabled: !!this.localVideoTrack,
        isSpeaking: false,
        networkQuality: 0,
        joinedAt: Date.now()
      }

      this.participants.set(String(options.uid), localParticipant)
      this.eventBus.emit('participant-joined', localParticipant)

      this.emitStateChange('in_call')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.log('Join failed:', error)
      this.emitError('JOIN_FAILED', 'vc.err.joinFailed', error.message, true)
      this.emitStateChange('error')
      throw error
    }
  }

  async leave(): Promise<void> {
    if (!this.client) return

    try {
      this.log('Leaving channel...')

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

      if (this.screenTrack) {
        this.screenTrack.stop()
        this.screenTrack.close()
        this.screenTrack = null
      }

      await this.client.leave()
      this.participants.clear()
      this.emitStateChange('ended')
    } catch (error) {
      this.log('Leave failed:', error)
    }
  }

  async toggleMic(): Promise<boolean> {
    if (!this.localAudioTrack) {
      // Create track if it doesn't exist
      try {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        if (this.client) {
          await this.client.publish(this.localAudioTrack)
        }
        this.updateLocalParticipant({ audioEnabled: true })
        return true
      } catch (error) {
        this.emitError('DEVICE_ERROR', 'vc.err.deviceNotFound', String(error))
        return false
      }
    }

    const enabled = this.localAudioTrack.enabled
    await this.localAudioTrack.setEnabled(!enabled)
    this.updateLocalParticipant({ audioEnabled: !enabled })
    return !enabled
  }

  async toggleCam(): Promise<boolean> {
    if (!this.localVideoTrack) {
      try {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
        if (this.client) {
          await this.client.publish(this.localVideoTrack)
        }
        this.updateLocalParticipant({ videoEnabled: true })
        return true
      } catch (error) {
        this.emitError('DEVICE_ERROR', 'vc.err.deviceNotFound', String(error))
        return false
      }
    }

    const enabled = this.localVideoTrack.enabled
    await this.localVideoTrack.setEnabled(!enabled)
    this.updateLocalParticipant({ videoEnabled: !enabled })
    return !enabled
  }

  async switchCamera(): Promise<void> {
    if (!this.localVideoTrack) return

    const devices = await AgoraRTC.getCameras()
    const currentDeviceId = this.localVideoTrack.getTrackLabel()
    const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId)
    const nextIndex = (currentIndex + 1) % devices.length
    const nextDevice = devices[nextIndex]

    if (nextDevice) {
      await this.localVideoTrack.setDevice(nextDevice.deviceId)
      this.eventBus.emit('device-changed', { kind: 'videoinput', deviceId: nextDevice.deviceId })
    }
  }

  async setInputDevice(selection: DeviceSelection): Promise<void> {
    if (selection.micId && this.localAudioTrack) {
      await this.localAudioTrack.setDevice(selection.micId)
      this.eventBus.emit('device-changed', { kind: 'audioinput', deviceId: selection.micId })
    }

    if (selection.camId && this.localVideoTrack) {
      await this.localVideoTrack.setDevice(selection.camId)
      this.eventBus.emit('device-changed', { kind: 'videoinput', deviceId: selection.camId })
    }
  }

  async setOutputDevice(speakerId: string): Promise<void> {
    // Note: Output device selection is not supported in all browsers
    this.eventBus.emit('device-changed', { kind: 'audiooutput', deviceId: speakerId })
  }

  async startScreenShare(): Promise<void> {
    if (!this.client) return

    try {
      this.screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable')
      await this.client.publish(this.screenTrack as ILocalVideoTrack)
      this.eventBus.emit('screen-share-started', { uid: String(this.localUid) })

      this.screenTrack.on('track-ended', () => {
        this.stopScreenShare()
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === 'PERMISSION_DENIED') {
        this.emitError('SCREEN_SHARE_DENIED', 'vc.err.permissionDenied', error.message)
      }
      throw error
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.screenTrack || !this.client) return

    await this.client.unpublish(this.screenTrack as ILocalVideoTrack)
    this.screenTrack.stop()
    this.screenTrack.close()
    this.screenTrack = null
    this.eventBus.emit('screen-share-stopped', { uid: String(this.localUid) })
  }

  async refreshToken(newToken: string): Promise<void> {
    if (!this.client) return
    await this.client.renewToken(newToken)
  }

  async setQuality(quality: VideoQuality): Promise<void> {
    if (!this.localVideoTrack) return

    const qualityMap = {
      auto: undefined,
      '360p': '360p_7',
      '720p': '720p_3',
      '1080p': '1080p_3'
    }

    const preset = qualityMap[quality]
    if (preset) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.localVideoTrack.setEncoderConfiguration(preset as any)
    }
  }

  async setAudioOnly(audioOnly: boolean): Promise<void> {
    if (audioOnly && this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(false)
    } else if (!audioOnly && this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(true)
    }
  }

  async getDevices(): Promise<Devices> {
    const [microphones, cameras, speakers] = await Promise.all([
      AgoraRTC.getMicrophones(),
      AgoraRTC.getCameras(),
      AgoraRTC.getPlaybackDevices()
    ])

    const mapDevice = (device: MediaDeviceInfo): MediaDevice => ({
      deviceId: device.deviceId,
      label: device.label,
      kind: device.kind as MediaDevice['kind']
    })

    return {
      microphones: microphones.map(mapDevice),
      cameras: cameras.map(mapDevice),
      speakers: speakers.map(mapDevice),
      selectedMic: this.localAudioTrack?.getTrackLabel(),
      selectedCam: this.localVideoTrack?.getTrackLabel()
    }
  }

  getParticipants(): Participant[] {
    return Array.from(this.participants.values())
  }

  getCallState(): CallState {
    return this.callState
  }

  async getStats(): Promise<CallStats> {
    if (!this.client) {
      return { duration: 0 }
    }

    const stats = this.client.getRTCStats()
    return {
      duration: stats.Duration,
      sendBitrate: stats.SendBitrate,
      receiveBitrate: stats.RecvBitrate,
      rtt: stats.RTT
    }
  }

  async destroy(): Promise<void> {
    await this.leave()
    this.client = null
  }

  private updateLocalParticipant(updates: Partial<Participant>) {
    const participant = this.participants.get(String(this.localUid))
    if (participant) {
      Object.assign(participant, updates)
      this.eventBus.emit('participant-updated', participant)
    }
  }

  // Getters for renderer access
  getClient(): IAgoraRTCClient | null {
    return this.client
  }

  getLocalVideoTrack(): ICameraVideoTrack | null {
    return this.localVideoTrack
  }

  getScreenTrack(): ILocalVideoTrack | null {
    return this.screenTrack
  }

  getLocalUid(): string | number {
    return this.localUid
  }

  createRenderer(): AgoraVideoRenderer {
    return new AgoraVideoRenderer(
      () => this.client,
      () => this.localVideoTrack,
      () => this.screenTrack,
      () => this.localUid
    )
  }
}

/**
 * Video Renderer for Agora tracks
 */
export class AgoraVideoRenderer {
  private getClient: () => IAgoraRTCClient | null
  private getLocalVideoTrack: () => ICameraVideoTrack | null
  private getScreenTrack: () => ILocalVideoTrack | null
  private localUidGetter: () => string | number

  constructor(
    getClient: () => IAgoraRTCClient | null,
    getLocalVideoTrack: () => ICameraVideoTrack | null,
    getScreenTrack: () => ILocalVideoTrack | null,
    localUidGetter: () => string | number
  ) {
    this.getClient = getClient
    this.getLocalVideoTrack = getLocalVideoTrack
    this.getScreenTrack = getScreenTrack
    this.localUidGetter = localUidGetter
  }

  attachVideo(el: HTMLElement, participantId: string, kind: 'camera' | 'screen'): void {
    const client = this.getClient()
    const localVideoTrack = this.getLocalVideoTrack()
    const screenTrack = this.getScreenTrack()
    const localUid = String(this.localUidGetter())

    console.log('[AgoraVideoRenderer] attachVideo called:', {
      participantId,
      localUid,
      kind,
      hasClient: !!client,
      hasLocalVideoTrack: !!localVideoTrack,
      hasScreenTrack: !!screenTrack,
      isLocal: participantId === localUid
    })

    // Check if this is the local participant
    const isLocal = participantId === localUid

    // Helper to play video using native MediaStream API as fallback
    const playWithNativeVideo = (track: ICameraVideoTrack | ILocalVideoTrack, options: { mirror?: boolean }) => {
      try {
        // Get the native MediaStreamTrack from Agora track
        const mediaStreamTrack = track.getMediaStreamTrack()
        if (!mediaStreamTrack) {
          console.warn('[AgoraVideoRenderer] No MediaStreamTrack available')
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
        el.innerHTML = ''
        el.appendChild(videoElement)

        console.log('[AgoraVideoRenderer] Playing with native video element')
        return true
      } catch (error) {
        console.error('[AgoraVideoRenderer] Native video playback failed:', error)
        return false
      }
    }

    // Helper to safely play a track with retry and fallback
    const safePlayTrack = (track: ICameraVideoTrack | ILocalVideoTrack, options: { fit: 'cover' | 'contain', mirror?: boolean }, retryCount = 0) => {
      const maxRetries = 3
      const retryDelay = 500

      // Check if track is enabled
      if (!track.enabled) {
        console.log('[AgoraVideoRenderer] Track is disabled')
        return
      }

      console.log('[AgoraVideoRenderer] safePlayTrack attempt:', {
        retryCount,
        enabled: track.enabled,
        trackId: track.getTrackId()
      })

      try {
        // Try Agora's native play method
        track.play(el, options)
        console.log('[AgoraVideoRenderer] Track play() called successfully')
      } catch (playError) {
        console.warn('[AgoraVideoRenderer] Agora play() failed:', playError)
        
        // Fallback to native video element
        if (playWithNativeVideo(track, { mirror: options.mirror })) {
          console.log('[AgoraVideoRenderer] Fallback to native video successful')
          return
        }

        // Retry if we have retries left
        if (retryCount < maxRetries) {
          console.log(`[AgoraVideoRenderer] Retrying ${retryCount + 1}/${maxRetries}...`)
          setTimeout(() => {
            safePlayTrack(track, options, retryCount + 1)
          }, retryDelay)
        } else {
          console.error('[AgoraVideoRenderer] All play attempts failed')
        }
      }
    }

    try {
      if (isLocal) {
        // Local participant video
        if (kind === 'camera' && localVideoTrack) {
          console.log('[AgoraVideoRenderer] Playing local video track to element')
          safePlayTrack(localVideoTrack, { fit: 'cover', mirror: true })
        } else if (kind === 'screen' && screenTrack) {
          safePlayTrack(screenTrack, { fit: 'contain' })
        } else {
          console.log('[AgoraVideoRenderer] No track available for local participant')
        }
      } else if (client) {
        // Remote participant video
        const remoteUsers = client.remoteUsers
        const user = remoteUsers.find(u => String(u.uid) === participantId)
        console.log('[AgoraVideoRenderer] Looking for remote user:', participantId, 'Found:', !!user, 'Has video:', !!user?.videoTrack)
        
        if (user && user.videoTrack) {
          try {
            user.videoTrack.play(el, { fit: 'cover' })
          } catch (playError) {
            console.warn('[AgoraVideoRenderer] Remote video play failed, will retry:', playError)
            // Schedule retry - the track might not be ready yet
            setTimeout(() => {
              const retryUser = client.remoteUsers.find(u => String(u.uid) === participantId)
              if (retryUser && retryUser.videoTrack) {
                try {
                  retryUser.videoTrack.play(el, { fit: 'cover' })
                  console.log('[AgoraVideoRenderer] Retry remote video play successful')
                } catch (retryError) {
                  console.error('[AgoraVideoRenderer] Retry remote video play failed:', retryError)
                }
              }
            }, 500)
          }
        } else if (user && !user.videoTrack) {
          console.log('[AgoraVideoRenderer] Remote user found but no video track yet, scheduling retry')
          // Schedule retry - subscription might not be complete
          setTimeout(() => {
            const retryUser = client.remoteUsers.find(u => String(u.uid) === participantId)
            if (retryUser && retryUser.videoTrack) {
              try {
                retryUser.videoTrack.play(el, { fit: 'cover' })
                console.log('[AgoraVideoRenderer] Delayed remote video play successful')
              } catch (retryError) {
                console.error('[AgoraVideoRenderer] Delayed remote video play failed:', retryError)
              }
            }
          }, 500)
        }
      }
    } catch (error) {
      console.error('[AgoraVideoRenderer] Error playing video:', error)
    }
  }

  detachVideo(el: HTMLElement): void {
    // Clear the element content - Agora will clean up when track is stopped
    el.innerHTML = ''
  }
}

/**
 * Create Agora Web Adapter
 */
export function createAgoraAdapter(config: AdapterConfig): AgoraWebAdapter {
  return new AgoraWebAdapter(config)
}

/**
 * Create Agora Video Renderer from an adapter
 * This is the recommended way to create a renderer
 */
export function createAgoraRenderer(adapter: AgoraWebAdapter): AgoraVideoRenderer {
  return adapter.createRenderer()
}
