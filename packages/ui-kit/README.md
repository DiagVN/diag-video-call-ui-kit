# @diagvn/video-call-ui-kit

Vue 3 UI components for video calls with DIAG brand styling and Vietnamese/English i18n.

## Features

- 🎨 **DIAG Brand Styling** - Clinical design with DIAG blue gradients
- 🌍 **i18n Ready** - Vietnamese and English built-in
- 🌙 **Dark Mode** - Light and dark theme support
- ♿ **Accessible** - ARIA labels and keyboard navigation
- 📦 **Tree-Shakeable** - Import only what you need

## Installation

```bash
pnpm add @diagvn/video-call-ui-kit
```

### Peer Dependencies

```bash
pnpm add vue@^3.4.0 vue-i18n@^9.9.0 @diagvn/video-call-core
```

## Setup

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVideoCallI18n } from '@diagvn/video-call-ui-kit'

// Import styles
import '@diagvn/video-call-ui-kit/style.css'

const app = createApp(App)
app.use(createPinia())
app.use(createI18n(createVideoCallI18n({}, 'vi')))
app.mount('#app')
```

## Components

### DiagPreJoinPanel

Device picker with camera preview and join options.

```vue
<DiagPreJoinPanel
  :devices="devices"
  :has-video-preview="true"
  @join="handleJoin"
  @device-change="handleDeviceChange"
  @language-change="handleLanguageChange"
/>
```

### DiagCallShell

Layout wrapper with status bar.

```vue
<DiagCallShell
  mode="grid"
  :call-state="callState"
  :duration="duration"
  :network-quality="networkQuality"
  theme="light"
>
  <template #topbar>...</template>
  <template #default>...</template>
  <template #bottombar>...</template>
  <template #sidebar>...</template>
</DiagCallShell>
```

### DiagCallControls

Control buttons for call actions.

```vue
<DiagCallControls
  :is-muted="isMuted"
  :is-video-off="isVideoOff"
  :is-screen-sharing="isScreenSharing"
  :participant-count="5"
  @toggle-mic="handleToggleMic"
  @toggle-cam="handleToggleCam"
  @share-screen="handleShareScreen"
  @leave="handleLeave"
/>
```

### DiagVideoGrid

Responsive grid of video tiles.

```vue
<DiagVideoGrid
  :participants="participants"
  :renderer="renderer"
  :show-network-quality="true"
/>
```

### DiagVideoTile

Individual video tile.

```vue
<DiagVideoTile
  :participant="participant"
  :renderer="renderer"
  :video-kind="'camera'"
/>
```

### DiagToasts

Toast notifications.

```vue
<DiagToasts :toasts="toasts" @dismiss="handleDismiss" />
```

### DiagBanner

Status banners.

```vue
<DiagBanner type="reconnecting" :dismissible="false" />
```

## i18n

### Setup with Custom Messages

```ts
import { createVideoCallI18n } from '@diagvn/video-call-ui-kit'

const i18n = createI18n(createVideoCallI18n({
  vi: {
    vc: { custom: { myLabel: 'Nhãn' } }
  },
  en: {
    vc: { custom: { myLabel: 'Label' } }
  }
}, 'vi'))
```

### Available Messages

Access raw messages:

```ts
import { vi, en, type VideoCallMessages } from '@diagvn/video-call-ui-kit'
```

## Theming

### CSS Variables

```css
:root {
  --vc-primary: #0066CC;
  --vc-bg: #F5F7FA;
  --vc-surface: #FFFFFF;
  --vc-fg: #1A2C3E;
  --vc-radius: 12px;
}
```

### Dark Theme

```vue
<DiagCallShell theme="dark">...</DiagCallShell>
```

Or globally:

```ts
document.documentElement.classList.add('vc-theme-dark')
```

## Exports

```ts
// Components
export {
  DiagCallShell,
  DiagPreJoinPanel,
  DiagCallControls,
  DiagVideoGrid,
  DiagVideoTile,
  DiagToasts,
  DiagBanner
} from '@diagvn/video-call-ui-kit'

// i18n
export {
  createVideoCallI18n,
  vi,
  en,
  type VideoCallMessages
} from '@diagvn/video-call-ui-kit'
```

## License

MIT © DIAG
