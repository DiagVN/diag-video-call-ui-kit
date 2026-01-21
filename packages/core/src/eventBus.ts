/* eslint-disable @typescript-eslint/no-explicit-any */
import mitt from 'mitt'
import type { EventBus } from './events'

/**
 * Create a typed event bus instance
 * SSR-safe implementation using mitt
 */
export function createEventBus(): EventBus {
  const emitter = mitt<Record<string, any>>()

  return {
    on: emitter.on,
    off: emitter.off,
    emit: emitter.emit,
    clear: () => {
      emitter.all.clear()
    }
  }
}
