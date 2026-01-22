import type {
  CallState,
  Participant,
  CallError,
  MediaDevice,
  CallStats,
  ToastMessage,
  NetworkQuality,
  TranscriptEntry
} from './types'

/**
 * Event Bus Event Map
 * All events that can be emitted through the event bus
 */
export interface EventMap {
  /** A participant has joined the call */
  'participant-joined': Participant
  /** A participant has left the call */
  'participant-left': { id: string }
  /** A participant's state was updated */
  'participant-updated': Participant
  /** Call state has changed */
  'call-state-changed': { from: CallState; to: CallState }
  /** A device was changed */
  'device-changed': { kind: MediaDevice['kind']; deviceId: string }
  /** Device list was updated */
  'devices-updated': MediaDevice[]
  /** Display a toast message */
  toast: ToastMessage
  /** An error occurred */
  error: CallError
  /** Token will expire soon (e.g., 30s warning) */
  'token-will-expire': { expiresIn: number }
  /** Token has expired */
  'token-expired': void
  /** Call statistics updated */
  'stats-updated': CallStats
  /** Network quality changed */
  'network-quality-changed': { uid: string; quality: NetworkQuality }
  /** Speaking state changed */
  'speaking-changed': { uid: string; isSpeaking: boolean }
  /** Screen share started */
  'screen-share-started': { uid: string }
  /** Screen share stopped */
  'screen-share-stopped': { uid: string }
  /** Transcript entry received */
  'transcript-entry': TranscriptEntry
  /** Transcript started */
  'transcript-started': { language: string }
  /** Transcript stopped */
  'transcript-stopped': void
  /** Transcript error */
  'transcript-error': { code: string; message: string }
}

/**
 * Event handler type
 */
export type EventHandler<K extends keyof EventMap> = (payload: EventMap[K]) => void

/**
 * Event Bus Interface
 * SSR-safe typed event bus
 */
export interface EventBus {
  /** Subscribe to an event */
  on<K extends keyof EventMap>(type: K, handler: EventHandler<K>): void
  /** Unsubscribe from an event */
  off<K extends keyof EventMap>(type: K, handler: EventHandler<K>): void
  /** Emit an event */
  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void
  /** Clear all handlers (for cleanup) */
  clear(): void
}
