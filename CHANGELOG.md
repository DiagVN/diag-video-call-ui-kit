# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.13] - 2026-01-27

### Fixed
- **Virtual Background Mirror Issue** - Background images are now pre-flipped horizontally before being applied to Agora VB
  - Users continue to see themselves mirrored (natural self-view experience)
  - Background images now display in correct orientation (not reversed/flipped)
  - Uses canvas-based image flipping to compensate for video mirror

---

## [2.0.12] - 2026-01-27

### Added
- **STT Language Selection Events** - New events on `DiagVideoCallV2` for client control:
  - `@transcript-language-selected` - Fired when user selects a language (BEFORE transcript starts)
  - `@transcript-started` - Fired when transcript successfully starts with selected language
  - `@transcript-stopped` - Fired when transcript is stopped
- **Set Transcript Language** - New `setTranscriptLanguage(language)` method in store to change STT language during active session
- **Language State Sync** - `selectedTranscriptLanguage` now syncs with store's transcript state

### Changed
- **Event Bus** - Added listener for `transcript-language-changed` event in store

---

## [2.0.11] - 2026-01-26

### Added
- **Language Selector** - Added `DiagLanguageSelectorV2` modal component for selecting STT language before starting transcription
  - Shows available Agora-supported languages (33 languages)
  - Integrated into `DiagVideoCallV2` to intercept transcript toggle
  - i18n translations for English and Vietnamese

### Fixed
- **Dark Mode Settings Panel** - Fixed visibility issues in dark theme:
  - Added missing CSS variables (`--vc-bg-secondary`, `--vc-bg-hover`, `--vc-text`, `--vc-text-secondary`)
  - Fixed slider track visibility with better contrast colors
  - Added Firefox slider support (`::-moz-range-thumb`, `::-moz-range-track`)
  - Improved close button visibility with border and background
  - Fixed blur icon visibility with proper color inheritance

- **Language Dropdown** - Replaced custom dropdown with native `<select>` for better UX and accessibility

- **Agora STT Languages** - Updated language list to official Agora Real-time STT supported languages (33 languages)

---

## [2.0.10] - 2026-01-26

### Added
- **Adapter methods** - Added missing methods to agora-web-v2 adapter:
  - `setHandRaised(raised: boolean)` - Emit hand raise event for UI handling
  - `startTranscript(language?: string)` - Start transcript/STT (emits event for external setup)
  - `stopTranscript()` - Stop transcript session

- **Event handling** - Added `hand-raised` event to core EventMap and store handler

- **Feature flags** - Added new flags to FeatureFlags:
  - `participantsList` - Control participants panel visibility
  - `layoutToggle` - Control layout switching capability
  - `fullscreen` - Control fullscreen mode availability

### Changed
- **BREAKING: FeatureFlags** - Renamed `raiseHand` to `handRaise` (old name deprecated but still works)
- **BREAKING: TranscriptEntry** - Added `speakerName` as primary field, deprecated `participantName`
- **TranscriptEntry** - Added `isLocal` boolean to identify local user entries

### Fixed
- **Type consistency** - Aligned FeatureFlags between core-v2 and UI components
- **Participant interface** - Added `isHandRaised` property to both core and core-v2

---

## [2.0.9] - 2026-01-26

### Fixed
- **Style export** - Fixed missing `style.css` export in ui-kit-v2 package.json

---

## [2.0.8] - 2026-01-26

### Added
- **Comprehensive documentation** - Updated all v2 package READMEs with complete API references
- **Root README update** - Added v2 quick start guide with separate views usage

### Fixed
- **STT_BACKEND_INTEGRATION.md** - Updated guide with v2 simple view examples

---

## [2.0.7] - 2026-01-26

### Fixed
- **Build configuration alignment** - Updated v2 packages build setup to match v1
  - Added CommonJS (`.cjs`) output format alongside ESM (`.js`)
  - Fixed package.json exports with proper `import`/`require` conditions
  - Aligned vite.config.ts with v1 dts plugin configuration
  - Consistent file naming: `index.js` (ESM) and `index.cjs` (CommonJS)

---

## [2.0.6] - 2026-01-26

### Changed
- **Updated vue-i18n dependency** - Upgraded vue-i18n from `^9.0.0` to `^11.2.8` in ui-kit-v2 to match v1

---

## [2.0.5] - 2026-01-26

### Changed
- **Updated Pinia dependency** - Upgraded pinia from `^2.1.x` to `^3.0.4` in v2 packages to match v1
  - Updated `core-v2` peerDependencies and devDependencies
  - Updated `ui-kit-v2` peerDependencies and devDependencies

---

## [2.0.4] - 2026-01-26

### Fixed
- **Lint cleanup** - Fixed lint errors in playground-v2 views
  - Removed unused `DeviceInfo` import in CustomCallView.vue
  - Removed unused `computed` import in InCallView.vue

---

## [2.0.3] - 2026-01-26

### Fixed
- **Lint cleanup** - Removed unused imports and variables in v2 packages
  - Cleaned up adapter.ts (removed unused type imports)
  - Cleaned up DiagCallControlsV2.vue (removed unused layoutIcon computed)
  - Cleaned up DiagCallShellV2.vue (removed unused inject import)

---

## [2.0.2] - 2026-01-26

### Added
- **Speech-to-Text (STT) / Transcript Support** - Client-side implementation for receiving and displaying transcript data
  - `isTranscriptSupported()` - Check if transcript feature is available
  - `startTranscript(language?)` - Start listening for transcript data with language selection
  - `stopTranscript()` - Stop transcript processing
  - `setTranscriptLanguage(language)` - Change transcript language
  - Stream message listener for receiving Agora STT data
  - Support for both JSON and protobuf message formats
  - Interim and final transcript handling with confidence scores
  - `transcript-entry`, `transcript-started`, `transcript-stopped` events

### Documentation
- **STT Backend Integration Guide** (`docs/STT_BACKEND_INTEGRATION.md`)
  - Complete guide for integrating Agora Real-time STT service
  - Backend API implementation examples (Node.js)
  - Agora REST API reference for starting/stopping STT
  - Supported languages: en-US, en-GB, zh-CN, vi-VN, ja-JP, ko-KR, and more
  - Data stream message format documentation (JSON and protobuf)
  - Multi-user notification patterns using RTM
  - Troubleshooting guide and pricing information

### Technical Notes
- Client-side listens for stream messages from Agora STT service
- Backend integration required to start/stop the Agora STT service
- See `docs/STT_BACKEND_INTEGRATION.md` for complete implementation guide

---

## [2.0.1] - 2026-01-26

### Fixed
- **Audio subscription** - Fixed remote audio not playing by simplifying subscription logic to match Agora React reference implementation
- **Audio/Video toggle buttons** - Removed disabled state, buttons are now always clickable when shown

### Added
- **New feature flags** for call controls:
  - `audioToggle` - Control whether audio mute/unmute button is shown (default: true)
  - `videoToggle` - Control whether video on/off button is shown (default: true)
- Allows teleconsultation apps to hide audio/video controls when needed for medical compliance

### Changed
- Audio subscription now follows React reference - immediate subscription without delay
- Control buttons use `v-if` to show/hide instead of `:disabled` state

---

## [2.0.0] - 2026-01-23

### 🎉 Major Release: V2 Architecture

This release introduces a completely redesigned v2 architecture with improved modularity, better TypeScript support, and new features like Virtual Background.

### Added

#### Virtual Background Support
- **Two-processor architecture** following Agora's reference implementation
  - `vbProcessor` - Main processor for actual call video
  - `vbPreviewProcessor` - Separate processor for settings preview
- **Preview/Apply separation** - Preview VB effects without affecting the main video
- **Background types supported**:
  - Blur (adjustable strength)
  - Solid color
  - Custom image
- **WASM-based processing** using `agora-extension-virtual-background@1.3.0`

#### New V2 Packages
- `@diagvn/video-call-core-v2` - Redesigned core with Pinia store integration
- `@diagvn/video-call-ui-kit-v2` - Vue 3 components with Composition API
- `@diagvn/agora-web-adapter-v2` - Minimal Agora adapter with VB support

#### New Components (V2)
- `DiagVideoCallV2` - Main call component
- `DiagPrejoinV2` - Pre-join screen with device preview
- `DiagCallShellV2` - Call layout shell
- `DiagVideoGridV2` - Responsive video grid
- `DiagVideoTileV2` - Individual video tile
- `DiagCallControlsV2` - Call control buttons
- `DiagSettingsPanelV2` - Settings with VB configuration
- `DiagTopBarV2` - Top bar with meeting info
- `DiagParticipantsPanelV2` - Participants list
- `DiagChatPanelV2` - Chat panel
- `DiagTranscriptPanelV2` - Transcript panel
- `DiagToastsV2` - Toast notifications
- `DiagBannerV2` - Banner notifications

#### API Improvements
- Extended `VideoRenderer` interface with `attachPreviewWithVB` method
- Added `applied` flag to `virtual-background-changed` event
- Sync `attachPreview` for normal preview, async `attachPreviewWithVB` for VB preview

### Technical Details
- Vue 3 Composition API throughout
- Full TypeScript support with strict typing
- Pinia store for state management
- Event-driven architecture with typed events
- Modular package structure for tree-shaking

---

## [1.0.18] - 2026-01-22

### Fixed
- **Agora Subscribe Race Condition**: Fixed "can not subscribe, this user is not in the channel" error
  - Root cause: The `user` object from `user-published` callback becomes stale before subscribe completes
  - Solution: Fetch fresh user reference from `client.remoteUsers` after delay instead of using callback object
  - Increased initial delay to 300ms to allow SDK internal state to synchronize
  - Increased max retries to 5 for better reliability on slower networks
  - Added smarter retry logic that continues if user isn't in `remoteUsers` yet
- Fixed issue where the first user to join couldn't see the second user's video

## [1.0.17] - 2026-01-22

### Documentation
- Added comprehensive guide for implementing separate Pre-Join and In-Call views
  - Explains how Pinia store persists adapter across route navigation
  - Two implementation options: join-before-navigate vs join-after-navigate
  - Router configuration examples with navigation guards
  - Tips for handling page refresh and troubleshooting common issues

## [1.0.16] - 2026-01-22

### Fixed
- **Video Playback**: Changed strategy to use native `<video>` element first, with Agora's `play()` as fallback
  - Eliminates "Cannot read properties of undefined (reading 'updateVideoTrack')" errors
  - Native video element is more reliable and doesn't depend on Agora's internal player timing
  - Faster video display as we don't wait for Agora's internal player to initialize
- Reduced retry delays for faster video attachment recovery (500ms → 300ms)

## [1.0.13] - 2026-01-22

### Fixed
- Fixed "INVALID_REMOTE_USER: user is not in the channel" error when second user joins
- Fixed "Cannot read properties of undefined (reading 'updateVideoTrack')" error
  - Added track readiness check before attempting to play video
  - Check `MediaStreamTrack.readyState === 'live'` before calling Agora's `play()` method
- Improved subscribe error handling to detect and abort when user has left the channel
- Added retry mechanism with exponential backoff for remote user subscription
- Improved remote video attachment with automatic retry when track isn't ready
- Added user presence verification before subscribing to remote streams
- Enhanced native video fallback for both local and remote video tracks

## [1.0.12] - 2026-01-21

### Added
- Automated dependency synchronization system
  - New `pnpm sync-deps` command to auto-sync root dependencies with packages
  - `scripts/sync-dependencies.js` script for dependency management
  - Syncs: `vue`, `vue-i18n`, `pinia`, `typescript`, `vite`, `@types/node`, `@vitejs/plugin-vue`

### Fixed
- Synchronized `vue-i18n` version across all packages (^11.2.8)
- Ensured consistent `pinia` version (^3.0.4) in all packages
- Aligned all package dependencies with root workspace

### Documentation
- Added `DEPENDENCY_SYNC.md` with complete sync system documentation

## [1.0.11] - 2026-01-21

### Changed
- **Updated Package Dependencies**
  - `@types/node`: ^20.11.19 → ^20.14.0
  - `vite`: ^5.1.4 → ^5.2.0
  - `typescript`: ~5.4.0 → ~5.5.0
  - `@vitejs/plugin-vue`: ^5.0.4 → ^5.2.0
- Updated `pnpm-lock.yaml` with resolved dependency versions

## [1.0.10] - 2026-01-21

### Added
- TypeScript type definitions for all packages
  - Automatic `.d.ts` generation using `vite-plugin-dts`
  - Full type support for TypeScript projects
  - Declaration source maps for better debugging

### Changed
- **Updated Dependencies**
  - Upgraded Pinia from 2.1.7 to 3.0.4 (latest major version)
  - Pinia 3 brings improved performance and new composable features

## [1.0.9] - 2026-01-21

### Changed
- **BREAKING**: Renamed package scope from `@diag` to `@diagvn` across all packages
  - `@diag/video-call-core` → `@diagvn/video-call-core`
  - `@diag/video-call-ui-kit` → `@diagvn/video-call-ui-kit`
  - `@diag/agora-web-adapter` → `@diagvn/agora-web-adapter`

### Fixed
- Fixed video not displaying after joining call due to Agora track initialization timing
- Fixed "Cannot read properties of undefined (reading 'updateVideoTrack')" error
- Added native MediaStream API fallback when Agora's internal player fails
- Improved video attachment retry logic with better error handling
- Fixed 3-dots menu not working in call controls
- Fixed i18n state key mismatch (`inCall` → `in_call`)

### Improved
- `AgoraVideoRenderer` now uses getter pattern for dynamic track access
- Store now exposes `adapter` for creating renderers in components
- Better logging for debugging video playback issues
- Increased delay for video attachment to allow track initialization

## [1.0.0] - 2026-01-20

### Added

#### Core Package (`@diagvn/video-call-core`)
- Initial release of headless video call state management
- Pinia store with reactive state (callState, participants, duration, etc.)
- Typed event bus using mitt for SDK events
- `Actions` interface for adapter implementations
- Full TypeScript definitions for all types
- SSR-safe implementation (no browser APIs in core)

#### UI Kit Package (`@diagvn/video-call-ui-kit`)
- DIAG brand styling with CSS custom properties
- Dark mode support via `.vc-theme-dark` class
- Vietnamese (`vi`) and English (`en`) translations
- `createVideoCallI18n()` helper for i18n setup

**Components:**
- `DiagPreJoinPanel` - Device picker with camera preview
- `DiagCallShell` - Layout wrapper with status bar
- `DiagCallControls` - Mic, camera, share, leave buttons
- `DiagVideoGrid` - Responsive participant grid
- `DiagVideoTile` - Individual video tile with overlays
- `DiagToasts` - Toast notification system
- `DiagBanner` - Status banners (reconnecting, poor network, etc.)

#### Agora Adapter (`@diagvn/agora-web-adapter`)
- Full `Actions` interface implementation for Agora Web SDK
- `createAgoraAdapter()` factory function
- `createAgoraRenderer()` for video tile rendering
- Device management (mic, camera, speaker switching)
- Screen sharing support
- Token refresh handling
- Network quality monitoring
- Speaking detection via volume indicator
- Video quality presets (360p, 720p, 1080p)

#### Playground App
- Demo app with Mock and Agora modes
- Camera preview in pre-join screen
- Language switching (vi/en)
- Theme toggle (light/dark)
- Full call flow demonstration

### Security
- Token-based authentication support for Agora
- No credentials stored in client code

---

## [Unreleased]

### Planned
- `DiagParticipantsPanel` - Participant list with search and host actions
- `DiagPermissionBanner` - Device permission guidance
- Additional adapters (Twilio, Daily.co)
- Recording indicator integration
- Virtual background support
- Noise cancellation integration
