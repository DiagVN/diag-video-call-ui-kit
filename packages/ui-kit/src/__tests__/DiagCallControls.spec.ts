import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import DiagCallControls from '../components/DiagCallControls.vue'
import { createVideoCallI18n } from '../i18n'

describe('DiagCallControls', () => {
  const i18n = createI18n(createVideoCallI18n())

  it('renders correctly', () => {
    const wrapper = mount(DiagCallControls, {
      global: {
        plugins: [i18n]
      }
    })
    expect(wrapper.find('.vc-call-controls').exists()).toBe(true)
  })

  it('emits toggle-mic event when mic button clicked', async () => {
    const wrapper = mount(DiagCallControls, {
      global: {
        plugins: [i18n]
      }
    })

    const micButton = wrapper.findAll('button')[0]
    await micButton.trigger('click')

    expect(wrapper.emitted('toggle-mic')).toBeTruthy()
  })

  it('shows muted state correctly', () => {
    const wrapper = mount(DiagCallControls, {
      props: {
        isMuted: true
      },
      global: {
        plugins: [i18n]
      }
    })

    const micButton = wrapper.findAll('button')[0]
    expect(micButton.classes()).toContain('vc-call-controls__btn--active')
  })

  it('emits leave event when leave button clicked', async () => {
    const wrapper = mount(DiagCallControls, {
      global: {
        plugins: [i18n]
      }
    })

    const leaveButton = wrapper.find('.vc-call-controls__leave-btn')
    await leaveButton.trigger('click')

    expect(wrapper.emitted('leave')).toBeTruthy()
  })

  it('shows participant count badge', () => {
    const wrapper = mount(DiagCallControls, {
      props: {
        participantCount: 5
      },
      global: {
        plugins: [i18n]
      }
    })

    const badge = wrapper.find('.vc-call-controls__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('5')
  })

  it('emits screen share events correctly', async () => {
    const wrapper = mount(DiagCallControls, {
      props: {
        isScreenSharing: false
      },
      global: {
        plugins: [i18n]
      }
    })

    // Find screen share button (3rd button in center group)
    const screenShareButton = wrapper.findAll('.vc-call-controls__group--center button')[1]
    await screenShareButton.trigger('click')

    expect(wrapper.emitted('start-screen-share')).toBeTruthy()
  })
})
