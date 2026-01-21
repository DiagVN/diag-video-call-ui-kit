/* eslint-disable @typescript-eslint/no-explicit-any */
import type { I18nOptions } from 'vue-i18n'
import { vi, en } from './messages'
import type { VideoCallMessages } from './messages'

export type { VideoCallMessages }
export { vi, en }

/**
 * Create vue-i18n configuration for Video Call UI Kit
 * 
 * @param customMessages Optional custom messages to merge with defaults
 * @param defaultLocale Default locale (defaults to 'vi')
 * @returns I18nOptions for createI18n
 * 
 * @example
 * ```ts
 * import { createI18n } from 'vue-i18n'
 * import { createVideoCallI18n } from '@diagvn/video-call-ui-kit'
 * 
 * const i18n = createI18n(createVideoCallI18n())
 * app.use(i18n)
 * ```
 */
export function createVideoCallI18n(
  customMessages?: {
    vi?: Partial<VideoCallMessages>
    en?: Partial<VideoCallMessages>
  },
  defaultLocale: 'vi' | 'en' = 'vi'
): I18nOptions {
  // Deep merge custom messages with defaults
  const mergeMessages = (
    base: VideoCallMessages,
    custom?: Partial<VideoCallMessages>
  ): VideoCallMessages => {
    if (!custom) return base
    return {
      vc: {
        ...base.vc,
        ...custom.vc,
        btn: { ...base.vc.btn, ...(custom.vc?.btn || {}) },
        state: { ...base.vc.state, ...(custom.vc?.state || {}) },
        err: { ...base.vc.err, ...(custom.vc?.err || {}) },
        banner: { ...base.vc.banner, ...(custom.vc?.banner || {}) },
        label: { ...base.vc.label, ...(custom.vc?.label || {}) },
        tooltip: { ...base.vc.tooltip, ...(custom.vc?.tooltip || {}) },
        permission: { ...base.vc.permission, ...(custom.vc?.permission || {}) },
        placeholder: { ...base.vc.placeholder, ...(custom.vc?.placeholder || {}) },
        action: { ...base.vc.action, ...(custom.vc?.action || {}) },
        quality: { ...base.vc.quality, ...(custom.vc?.quality || {}) },
        network: { ...base.vc.network, ...(custom.vc?.network || {}) },
        time: { ...base.vc.time, ...(custom.vc?.time || {}) }
      }
    }
  }

  return {
    legacy: false,
    locale: defaultLocale,
    fallbackLocale: 'en',
    messages: {
      vi: mergeMessages(vi, customMessages?.vi) as any,
      en: mergeMessages(en, customMessages?.en) as any
    }
  }
}
