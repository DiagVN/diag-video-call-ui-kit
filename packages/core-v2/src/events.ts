/**
 * Video Call Core v2 - Event System
 * Comprehensive events for all features
 */

import type {
  CallState,
  CallError,
  ToastMessage,
  CallStats,
  Participant,
  NetworkQuality,
  RecordingInfo,
  LiveStreamInfo,
  ChatMessage,
  TranscriptEntry,
  WaitingRoomAttendee,
  WaitingRoomStatus,
  VirtualBackgroundConfig,
  BeautyEffectOptions,
  NoiseSuppressionLevel,
  LayoutMode,
  Devices
} from './types'

// ============================================================================
// EVENT MAP
// ============================================================================

/**
 * Complete Event Map for Video Call
 */
export interface EventMap {
  // -------------------------------------------------------------------------
  // Call State Events
  // -------------------------------------------------------------------------
  /** Call state changed */
  'call-state-changed': { from: CallState; to: CallState; reason?: string }
  /** Call connected successfully */
  'call-connected': { channelId: string; uid: string }
  /** Call ended */
  'call-ended': { reason: 'user' | 'host' | 'timeout' | 'error'; duration: number }
  /** Connection state change */
  'connection-state-changed': { 
    state: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTING'
    prevState: string
    reason?: string
  }

  // -------------------------------------------------------------------------
  // Participant Events
  // -------------------------------------------------------------------------
  /** Participant joined */
  'participant-joined': Participant
  /** Participant left */
  'participant-left': { id: string; reason?: 'quit' | 'kicked' | 'banned' | 'offline' }
  /** Participant updated */
  'participant-updated': Participant
  /** Speaking state changed */
  'speaking-changed': { uid: string; isSpeaking: boolean; volume: number }
  /** Network quality changed */
  'network-quality-changed': { uid: string; quality: NetworkQuality; uplink: NetworkQuality; downlink: NetworkQuality }
  /** Participant role changed */
  'role-changed': { uid: string; oldRole: string; newRole: string }
  /** Hand raised/lowered */
  'hand-raised-changed': { uid: string; isRaised: boolean }
  /** User banned */
  'user-banned': { uid: string; bannedBy: string }
  /** Active speaker changed */
  'active-speaker-changed': { uid: string; previousUid?: string }

  // -------------------------------------------------------------------------
  // Media Events
  // -------------------------------------------------------------------------
  /** Local audio enabled/disabled */
  'local-audio-changed': { enabled: boolean; deviceId?: string }
  /** Local video enabled/disabled */
  'local-video-changed': { enabled: boolean; deviceId?: string }
  /** Remote audio state changed */
  'remote-audio-changed': { uid: string; enabled: boolean }
  /** Remote video state changed */
  'remote-video-changed': { uid: string; enabled: boolean }
  /** Audio track created */
  'audio-track-created': { track: unknown }
  /** Video track created */
  'video-track-created': { track: unknown }
  /** Track ended */
  'track-ended': { trackType: 'audio' | 'video' | 'screen'; reason?: string }
  /** Volume indicator */
  'volume-indicator': Array<{ uid: string; level: number }>

  // -------------------------------------------------------------------------
  // Device Events
  // -------------------------------------------------------------------------
  /** Devices updated (new device connected/disconnected) */
  'devices-updated': Devices
  /** Device changed */
  'device-changed': { kind: 'audioinput' | 'videoinput' | 'audiooutput'; deviceId: string }
  /** Device error */
  'device-error': { kind: 'audioinput' | 'videoinput' | 'audiooutput'; error: string }
  /** Permission changed */
  'permission-changed': { kind: 'microphone' | 'camera'; state: 'granted' | 'denied' }

  // -------------------------------------------------------------------------
  // Screen Share Events
  // -------------------------------------------------------------------------
  /** Screen share started */
  'screen-share-started': { uid: string; trackId?: string }
  /** Screen share stopped */
  'screen-share-stopped': { uid: string; reason?: 'user' | 'error' | 'browser' }
  /** Screen share error */
  'screen-share-error': { code: string; message: string }

  // -------------------------------------------------------------------------
  // Token Events
  // -------------------------------------------------------------------------
  /** Token will expire soon */
  'token-will-expire': { expiresIn: number }
  /** Token expired */
  'token-expired': undefined
  /** Token refreshed */
  'token-refreshed': undefined

  // -------------------------------------------------------------------------
  // Virtual Background Events
  // -------------------------------------------------------------------------
  /** Virtual background enabled/disabled */
  'virtual-background-changed': { enabled: boolean; config?: VirtualBackgroundConfig; applied?: boolean }
  /** Virtual background error */
  'virtual-background-error': { code: string; message: string }

  // -------------------------------------------------------------------------
  // Beauty Effect Events
  // -------------------------------------------------------------------------
  /** Beauty effect changed */
  'beauty-effect-changed': { enabled: boolean; options?: BeautyEffectOptions }
  /** Beauty effect error */
  'beauty-effect-error': { code: string; message: string }

  // -------------------------------------------------------------------------
  // Noise Suppression Events
  // -------------------------------------------------------------------------
  /** Noise suppression changed */
  'noise-suppression-changed': { level: NoiseSuppressionLevel }
  /** Noise suppression error */
  'noise-suppression-error': { code: string; message: string }

  // -------------------------------------------------------------------------
  // Recording Events
  // -------------------------------------------------------------------------
  /** Recording state changed */
  'recording-state-changed': RecordingInfo
  /** Recording started */
  'recording-started': { resourceId?: string; sid?: string }
  /** Recording stopped */
  'recording-stopped': { duration: number; fileUrl?: string }
  /** Recording error */
  'recording-error': { code: string; message: string }

  // -------------------------------------------------------------------------
  // Live Stream Events
  // -------------------------------------------------------------------------
  /** Live stream state changed */
  'live-stream-state-changed': LiveStreamInfo
  /** Live stream started */
  'live-stream-started': { url: string }
  /** Live stream stopped */
  'live-stream-stopped': undefined
  /** Live stream viewer count */
  'live-stream-viewer-count': { count: number }
  /** Live stream error */
  'live-stream-error': { code: string; message: string }

  // -------------------------------------------------------------------------
  // Waiting Room Events
  // -------------------------------------------------------------------------
  /** Waiting room status changed */
  'waiting-room-status-changed': { status: WaitingRoomStatus; message?: string }
  /** Attendee joined waiting room (host receives this) */
  'waiting-room-attendee-joined': WaitingRoomAttendee
  /** Attendee left waiting room */
  'waiting-room-attendee-left': { id: string }
  /** Attendee admitted */
  'waiting-room-attendee-admitted': { id: string; admittedBy: string }
  /** Attendee rejected */
  'waiting-room-attendee-rejected': { id: string; rejectedBy: string }

  // -------------------------------------------------------------------------
  // Chat Events
  // -------------------------------------------------------------------------
  /** Chat message received */
  'chat-message-received': ChatMessage
  /** Chat message sent */
  'chat-message-sent': ChatMessage
  /** Chat message deleted */
  'chat-message-deleted': { messageId: string }
  /** Chat enabled/disabled */
  'chat-state-changed': { enabled: boolean; hostOnlyMode: boolean }

  // -------------------------------------------------------------------------
  // Transcript Events
  // -------------------------------------------------------------------------
  /** Transcript entry */
  'transcript-entry': TranscriptEntry
  /** Transcript started */
  'transcript-started': { language: string }
  /** Transcript stopped */
  'transcript-stopped': undefined
  /** Transcript error */
  'transcript-error': { code: string; message: string }
  /** Transcript language changed */
  'transcript-language-changed': { language: string }

  // -------------------------------------------------------------------------
  // Layout Events
  // -------------------------------------------------------------------------
  /** Layout mode changed */
  'layout-changed': { mode: LayoutMode; previousMode?: LayoutMode }
  /** Participant pinned */
  'participant-pinned': { uid: string | null }
  /** Participant spotlight */
  'participant-spotlight': { uid: string | null }

  // -------------------------------------------------------------------------
  // Stats Events
  // -------------------------------------------------------------------------
  /** Stats updated */
  'stats-updated': Partial<CallStats>
  /** Network stats */
  'network-stats': { uplink: number; downlink: number; rtt: number }

  // -------------------------------------------------------------------------
  // Error & Toast Events
  // -------------------------------------------------------------------------
  /** Error occurred */
  'error': CallError
  /** Toast notification */
  'toast': ToastMessage

  // -------------------------------------------------------------------------
  // RTM (Messaging) Events
  // -------------------------------------------------------------------------
  /** RTM connected */
  'rtm-connected': undefined
  /** RTM disconnected */
  'rtm-disconnected': { reason?: string }
  /** RTM message received */
  'rtm-message': { senderId: string; message: string; messageType: string }
  /** RTM channel message */
  'rtm-channel-message': { senderId: string; message: string; channelId: string }

  // -------------------------------------------------------------------------
  // Custom Events
  // -------------------------------------------------------------------------
  /** Custom event for extensibility */
  'custom': { type: string; payload: unknown }
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

/**
 * Event Handler Function
 */
export type EventHandler<T> = (data: T) => void

/**
 * Typed Event Bus Interface
 */
export interface EventBus {
  /** Subscribe to event */
  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void
  /** Subscribe once */
  once<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void
  /** Unsubscribe */
  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void
  /** Emit event */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void
  /** Clear all listeners */
  clear(): void
  /** Clear listeners for specific event */
  clearEvent<K extends keyof EventMap>(event: K): void
}

// ============================================================================
// EVENT BUS IMPLEMENTATION
// ============================================================================

/**
 * Create a typed event bus
 */
export function createEventBus(): EventBus {
  const listeners = new Map<keyof EventMap, Set<EventHandler<unknown>>>()
  const onceListeners = new Map<keyof EventMap, Set<EventHandler<unknown>>>()

  return {
    on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
      if (!listeners.has(event)) {
        listeners.set(event, new Set())
      }
      listeners.get(event)!.add(handler as EventHandler<unknown>)
      
      // Return unsubscribe function
      return () => {
        listeners.get(event)?.delete(handler as EventHandler<unknown>)
      }
    },

    once<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
      if (!onceListeners.has(event)) {
        onceListeners.set(event, new Set())
      }
      onceListeners.get(event)!.add(handler as EventHandler<unknown>)
      
      return () => {
        onceListeners.get(event)?.delete(handler as EventHandler<unknown>)
      }
    },

    off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
      listeners.get(event)?.delete(handler as EventHandler<unknown>)
      onceListeners.get(event)?.delete(handler as EventHandler<unknown>)
    },

    emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
      // Regular listeners
      listeners.get(event)?.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`[EventBus] Error in handler for "${String(event)}":`, error)
        }
      })

      // Once listeners
      const once = onceListeners.get(event)
      if (once && once.size > 0) {
        once.forEach(handler => {
          try {
            handler(data)
          } catch (error) {
            console.error(`[EventBus] Error in once handler for "${String(event)}":`, error)
          }
        })
        once.clear()
      }
    },

    clear(): void {
      listeners.clear()
      onceListeners.clear()
    },

    clearEvent<K extends keyof EventMap>(event: K): void {
      listeners.delete(event)
      onceListeners.delete(event)
    }
  }
}
