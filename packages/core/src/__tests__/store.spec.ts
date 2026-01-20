import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useVideoCallStore } from '../store'
import { createEventBus } from '../eventBus'
import type { Actions, JoinOptions } from '../actions'

// Mock adapter for testing
class MockAdapter implements Actions {
  eventBus: any

  constructor(eventBus?: any) {
    this.eventBus = eventBus || createEventBus()
  }

  async init(): Promise<void> {
    this.eventBus.emit('call-state-changed', { from: 'idle', to: 'prejoin' })
  }

  async join(options: JoinOptions): Promise<void> {
    this.eventBus.emit('call-state-changed', { from: 'prejoin', to: 'connecting' })
    
    // Simulate successful join
    setTimeout(() => {
      this.eventBus.emit('call-state-changed', { from: 'connecting', to: 'in_call' })
      
      // Add local participant
      this.eventBus.emit('participant-joined', {
        id: String(options.uid),
        displayName: options.displayName || 'Test User',
        role: 'host',
        isLocal: true,
        audioEnabled: !options.joinMuted,
        videoEnabled: !options.joinVideoOff,
        isSpeaking: false,
        networkQuality: 4,
        joinedAt: Date.now()
      })
    }, 100)
  }

  async leave(): Promise<void> {
    this.eventBus.emit('call-state-changed', { from: 'in_call', to: 'ended' })
  }

  async toggleMic(): Promise<boolean> { return true }
  async toggleCam(): Promise<boolean> { return true }
  async switchCamera(): Promise<void> {}
  async setInputDevice(): Promise<void> {}
  async setOutputDevice(): Promise<void> {}
  async startScreenShare(): Promise<void> {}
  async stopScreenShare(): Promise<void> {}
  async refreshToken(): Promise<void> {}
  async setQuality(): Promise<void> {}
  async setAudioOnly(): Promise<void> {}
  async getDevices(): Promise<any> {
    return {
      microphones: [],
      cameras: [],
      speakers: []
    }
  }
  getParticipants(): any[] { return [] }
  getCallState(): any { return 'idle' }
  async getStats(): Promise<any> { return { duration: 0 } }
  async destroy(): Promise<void> {}
}

describe('Video Call Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with idle state', () => {
    const store = useVideoCallStore()
    expect(store.callState).toBe('idle')
    expect(store.participants.length).toBe(0)
  })

  it('transitions to prejoin after init', async () => {
    const store = useVideoCallStore()
    const adapter = new MockAdapter(store.eventBus.value)
    
    store.setAdapter(adapter)
    await store.init()
    
    expect(store.callState).toBe('prejoin')
  })

  it('transitions to in_call after join', async () => {
    const store = useVideoCallStore()
    const adapter = new MockAdapter(store.eventBus.value)
    
    store.setAdapter(adapter)
    await store.init()
    
    const joinPromise = store.join({
      channel: 'test-channel',
      uid: 12345,
      displayName: 'Test User'
    })

    // Wait for async state changes
    await new Promise(resolve => setTimeout(resolve, 150))
    
    expect(store.callState).toBe('in_call')
    expect(store.participants.length).toBe(1)
    expect(store.localParticipant?.displayName).toBe('Test User')
  })

  it('adds participant when user joins', async () => {
    const store = useVideoCallStore()
    const adapter = new MockAdapter(store.eventBus)
    
    store.setAdapter(adapter)
    await store.init()
    await store.join({ channel: 'test', uid: 123 })
    
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Simulate remote participant joining
    store.eventBus.emit('participant-joined', {
      id: '456',
      displayName: 'Remote User',
      role: 'audience',
      isLocal: false,
      audioEnabled: true,
      videoEnabled: true,
      isSpeaking: false,
      networkQuality: 3
    })
    
    expect(store.participants.length).toBe(2)
    expect(store.remoteParticipants.length).toBe(1)
  })

  it('removes participant when user leaves', async () => {
    const store = useVideoCallStore()
    const adapter = new MockAdapter(store.eventBus)
    
    store.setAdapter(adapter)
    await store.init()
    await store.join({ channel: 'test', uid: 123 })
    
    await new Promise(resolve => setTimeout(resolve, 150))
    
    store.eventBus.emit('participant-joined', {
      id: '456',
      displayName: 'Remote User',
      role: 'audience',
      isLocal: false,
      audioEnabled: true,
      videoEnabled: true,
      isSpeaking: false,
      networkQuality: 3
    })
    
    expect(store.participants.length).toBe(2)
    
    store.eventBus.emit('participant-left', { id: '456' })
    
    expect(store.participants.length).toBe(1)
  })

  it('handles token expiry events', async () => {
    const store = useVideoCallStore()
    const adapter = new MockAdapter(store.eventBus)
    
    let willExpireTriggered = false
    let expiredTriggered = false
    
    store.eventBus.on('token-will-expire', () => { willExpireTriggered = true })
    store.eventBus.on('token-expired', () => { expiredTriggered = true })
    
    store.setAdapter(adapter)
    
    store.eventBus.emit('token-will-expire', { expiresIn: 30 })
    store.eventBus.emit('token-expired')
    
    expect(willExpireTriggered).toBe(true)
    expect(expiredTriggered).toBe(true)
  })
})
