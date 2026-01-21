# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
