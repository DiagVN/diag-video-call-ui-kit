import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalVideoTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  UID,
  ClientRole
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
} from '@diag/video-call-core'

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
  private currentChannel = ''

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
      await this.client!.subscribe(user, mediaType)

      const participant = this.participants.get(String(user.uid))
      if (participant) {
        if (mediaType === 'audio') {
          participant.audioEnabled = true
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
      const quality = Math.min(stats.uplinkNetworkQuality, stats.downlinkNetworkQuality) as NetworkQuality
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
      this.eventBus.emit('token-expired')
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

      this.currentChannel = options.channel
      this.localUid = options.uid

      await this.client.join(
        this.appId,
        options.channel,
        options.token || null,
        options.uid
      )

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
}

/**
 * Video Renderer for Agora tracks
 */
export class AgoraVideoRenderer {
  private client: IAgoraRTCClient | null = null
  private localVideoTrack: ICameraVideoTrack | null = null
  private screenTrack: ILocalVideoTrack | null = null

  constructor(client: IAgoraRTCClient | null, localVideoTrack: ICameraVideoTrack | null, screenTrack: ILocalVideoTrack | null) {
    this.client = client
    this.localVideoTrack = localVideoTrack
    this.screenTrack = screenTrack
  }

  attachVideo(el: HTMLElement, participantId: string, kind: 'camera' | 'screen'): void {
    if (!this.client) return

    // Find the track to play
    const remoteUsers = this.client.remoteUsers
    const user = remoteUsers.find(u => String(u.uid) === participantId)

    if (user && user.videoTrack) {
      user.videoTrack.play(el, { fit: 'cover' })
    } else if (this.localVideoTrack && kind === 'camera') {
      this.localVideoTrack.play(el, { fit: 'cover', mirror: true })
    } else if (this.screenTrack && kind === 'screen') {
      this.screenTrack.play(el, { fit: 'contain' })
    }
  }

  detachVideo(el: HTMLElement): void {
    // Agora automatically stops playback when the track is stopped or element is removed
    el.innerHTML = ''
  }

  updateTracks(localVideoTrack: ICameraVideoTrack | null, screenTrack: ILocalVideoTrack | null) {
    this.localVideoTrack = localVideoTrack
    this.screenTrack = screenTrack
  }
}

/**
 * Create Agora Web Adapter
 */
export function createAgoraAdapter(config: AdapterConfig): AgoraWebAdapter {
  return new AgoraWebAdapter(config)
}

/**
 * Create Agora Video Renderer
 */
export function createAgoraRenderer(
  client: IAgoraRTCClient | null,
  localVideoTrack: ICameraVideoTrack | null = null,
  screenTrack: ILocalVideoTrack | null = null
): AgoraVideoRenderer {
  return new AgoraVideoRenderer(client, localVideoTrack, screenTrack)
}
