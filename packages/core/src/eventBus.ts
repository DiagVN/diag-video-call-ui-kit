import mitt from 'mitt'
import type { EventBus, EventMap } from './events'

/**
 * Create a typed event bus instance
 * SSR-safe implementation using mitt
 */
export function createEventBus(): EventBus {
  const emitter = mitt() as mitt.Emitter<EventMap>

  return {
    on: emitter.on,
    off: emitter.off,
    emit: emitter.emit,
    clear: () => {
      emitter.all.clear()
    }
  }
}
