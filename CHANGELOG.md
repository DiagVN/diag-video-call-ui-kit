# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
