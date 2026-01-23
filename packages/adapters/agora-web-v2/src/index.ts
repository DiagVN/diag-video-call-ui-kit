/**
 * Agora Web SDK Adapter V2
 */

// Use minimal adapter for now (fewer type errors)
export { AgoraAdapterV2, registerAgoraExtensions } from './adapter-minimal'
export type { AgoraAdapterConfig, ExtensionRegistrationOptions } from './adapter-minimal'

// Factory function for creating the adapter
import { AgoraAdapterV2 as Adapter } from './adapter-minimal'
import type { AgoraAdapterConfig } from './adapter-minimal'

export interface CreateAgoraAdapterOptions {
  appId: string
  tokenServer?: string
  enableDualStream?: boolean
  enableCloudProxy?: boolean
  logLevel?: 0 | 1 | 2 | 3 | 4
}

export function createAgoraAdapter(options: CreateAgoraAdapterOptions): Adapter {
  const config: AgoraAdapterConfig = {
    appId: options.appId,
    enableDualStream: options.enableDualStream ?? true,
    enableCloudProxy: options.enableCloudProxy ?? false,
    logLevel: options.logLevel ?? 1
  }
  return new Adapter(config)
}

// Re-export core types
export type {
  Actions,
  CallState,
  Participant,
  JoinOptions,
  FeatureFlags,
  VideoRenderer,
  EventBus,
  EventMap,
} from '@diagvn/video-call-core-v2'

export { createEventBus } from '@diagvn/video-call-core-v2'
