# DIAG Video Call UI Kit - Complete File Structure

## ✅ Implementation Complete

This document shows the complete project structure with all files created.

```
diag-video-call-ui-kit/
│
├── 📄 Root Configuration Files
│   ├── package.json                    # Monorepo root with scripts
│   ├── pnpm-workspace.yaml             # Workspace configuration
│   ├── tsconfig.json                   # Shared TypeScript config
│   ├── vitest.config.ts                # Test configuration
│   ├── .eslintrc.cjs                   # ESLint rules
│   ├── .prettierrc.json                # Code formatting
│   ├── .gitignore                      # Git ignore patterns
│   ├── README.md                       # Main documentation
│   └── QUICKSTART.md                   # Quick start guide
│
├── 📦 packages/core/ (Headless State Machine - SSR Safe)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.build.json
│   └── src/
│       ├── types.ts                    # CallState, Participant, Devices, etc.
│       ├── events.ts                   # Event bus interface
│       ├── eventBus.ts                 # Mitt-based event bus
│       ├── actions.ts                  # Actions interface (SDK-agnostic)
│       ├── store.ts                    # Pinia store wrapper
│       ├── index.ts                    # Public API exports
│       └── __tests__/
│           └── store.spec.ts           # State machine tests
│
├── 📦 packages/ui-kit/ (Vue 3 Components with DIAG Styling)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.build.json
│   └── src/
│       ├── styles/
│       │   ├── tokens.css              # DIAG color tokens & CSS vars
│       │   └── base.css                # Base styles & utilities
│       ├── components/
│       │   ├── DiagCallShell.vue       # Layout with status bar
│       │   ├── DiagPreJoinPanel.vue    # Device picker + join options
│       │   ├── DiagCallControls.vue    # Mic/cam/screen share buttons
│       │   ├── DiagVideoGrid.vue       # Responsive grid layout
│       │   ├── DiagVideoTile.vue       # Video tile with renderer contract
│       │   ├── DiagToasts.vue          # Toast notifications
│       │   └── DiagBanner.vue          # Status banners
│       ├── i18n/
│       │   ├── messages.ts             # Vi/En translations (comprehensive)
│       │   └── index.ts                # createVideoCallI18n() helper
│       ├── index.ts                    # Public API exports
│       └── __tests__/
│           └── DiagCallControls.spec.ts # Component tests
│
├── 📦 packages/adapters/agora-web/ (Agora Web SDK Integration)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.build.json
│   └── src/
│       ├── adapter.ts                  # AgoraWebAdapter class
│       │                               # - Implements Actions interface
│       │                               # - Event mapping
│       │                               # - Token renewal
│       │                               # - Screen share
│       │                               # - Device management
│       │                               # - AgoraVideoRenderer class
│       └── index.ts                    # Public API exports
│
└── 🎮 apps/playground/ (Demo Application)
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    ├── .env.example                    # Environment template
    └── src/
        ├── main.ts                     # App entry with i18n setup
        ├── App.vue                     # Root component
        └── views/
            ├── PreJoinView.vue         # Mock/Agora mode switcher + prejoin
            └── InCallView.vue          # In-call UI with video grid

```

---

## 🎯 Key Features Implemented

### 1. **Core Package** (`@diag/video-call-core`)
- ✅ SSR-safe headless state machine
- ✅ TypeScript types: CallState, Participant, Devices, CallError
- ✅ Typed event bus with mitt
- ✅ SDK-agnostic Actions interface
- ✅ Pinia store with reactive state
- ✅ Token expiry handling
- ✅ Network quality tracking
- ✅ Speaking detection support
- ✅ Vitest unit tests

### 2. **UI Kit Package** (`@diag/video-call-ui-kit`)
- ✅ DIAG brand styling (CSS variables)
  - Blue gradient: `#2B85C5 → #024473`
  - Clean clinical design
  - Light/dark theme support
- ✅ 7 Vue 3 components with Composition API:
  - DiagCallShell (layout wrapper)
  - DiagPreJoinPanel (device picker + language switcher)
  - DiagCallControls (action buttons)
  - DiagVideoGrid (responsive grid)
  - DiagVideoTile (with renderer contract)
  - DiagToasts (notifications)
  - DiagBanner (status banners)
- ✅ Complete Vietnamese & English i18n
- ✅ Renderer contract (SDK-agnostic video attachment)
- ✅ A11y: ARIA labels, focus rings
- ✅ Component tests with Vue Test Utils

### 3. **Agora Adapter** (`@diag/agora-web-adapter`)
- ✅ Full Actions interface implementation
- ✅ Event mapping (Agora → core events)
- ✅ Token renewal flow
- ✅ Screen share via track publishing
- ✅ Device enumeration & switching
- ✅ Network quality monitoring
- ✅ AgoraVideoRenderer for DOM attachment
- ✅ Optional peer dependency (agora-rtc-sdk-ng)

### 4. **Playground App**
- ✅ Mock mode (no Agora needed)
- ✅ Agora mode (real SDK integration)
- ✅ Mode switcher UI
- ✅ PreJoin → InCall flow
- ✅ Language switcher (Vi/En)
- ✅ Theme toggle (light/dark)
- ✅ Environment variables (.env.example)

---

## 🚀 How to Run

```bash
# 1. Install dependencies
pnpm install

# 2. Create environment file (optional for mock mode)
cp apps/playground/.env.example apps/playground/.env.local
# Edit .env.local with your Agora App ID if using Agora mode

# 3. Start dev server
pnpm dev

# 4. Open browser
# http://localhost:5173
```

---

## 📝 Usage Example

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useVideoCallStore, createEventBus } from '@diag/video-call-core'
import {
  DiagPreJoinPanel,
  DiagCallShell,
  DiagVideoGrid,
  DiagCallControls
} from '@diag/video-call-ui-kit'
import { createAgoraAdapter } from '@diag/agora-web-adapter'

const store = useVideoCallStore()

onMounted(async () => {
  const adapter = createAgoraAdapter({
    appId: 'YOUR_APP_ID',
    eventBus: createEventBus(),
    debug: true
  })
  
  store.setAdapter(adapter)
  await store.init()
})
</script>

<template>
  <DiagPreJoinPanel
    v-if="store.callState === 'prejoin'"
    :devices="store.devices"
    @join="handleJoin"
  />

  <DiagCallShell
    v-else-if="store.isInCall"
    :call-state="store.callState"
    :duration="store.stats.duration"
  >
    <DiagVideoGrid :participants="store.participants" />
    
    <template #bottombar>
      <DiagCallControls
        :is-muted="store.isMuted"
        :is-video-off="store.isVideoOff"
        @toggle-mic="store.toggleMic"
        @toggle-cam="store.toggleCam"
        @leave="store.leave"
      />
    </template>
  </DiagCallShell>
</template>
```

---

## 🎨 Theming

Override CSS variables:

```css
:root {
  --vc-primary: #YOUR_COLOR;
  --vc-radius: 8px;
}

.vc-theme-dark {
  --vc-bg: #0B1B2B;
}
```

---

## 🌍 i18n Keys

All UI text uses i18n keys. Sample keys:

```
vc.btn.join, vc.btn.leave, vc.btn.mute
vc.state.connecting, vc.state.inCall
vc.err.permissionDenied, vc.err.tokenExpired
vc.label.microphone, vc.label.camera
```

Full list in `packages/ui-kit/src/i18n/messages.ts`

---

## 🧪 Testing

```bash
pnpm test          # Run all tests
pnpm test:ui       # Run with UI
pnpm typecheck     # Type checking
pnpm lint          # Lint code
```

---

## 📦 Build

```bash
pnpm build                    # Build all packages
pnpm build:playground         # Build demo app
```

Outputs:
- `packages/*/dist/` - ESM + CJS + types
- `apps/playground/dist/` - Static site

---

## ✨ Production Ready

✅ **TypeScript** - Full type safety  
✅ **SSR Safe** - No window refs in core  
✅ **Tree-shakeable** - ESM exports  
✅ **Tested** - Unit & component tests  
✅ **i18n** - Vi/En with runtime switching  
✅ **A11y** - ARIA labels & focus management  
✅ **Themed** - CSS variables for customization  
✅ **Documented** - README + QUICKSTART + inline docs  

---

## 📄 License

MIT © DIAG

---

**🎉 Implementation Complete - Ready for Production Use!**
