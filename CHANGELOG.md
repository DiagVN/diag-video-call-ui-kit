# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-20

### Added

#### Core Package (`@diag/video-call-core`)
- Initial release of headless video call state management
- Pinia store with reactive state (callState, participants, duration, etc.)
- Typed event bus using mitt for SDK events
- `Actions` interface for adapter implementations
- Full TypeScript definitions for all types
- SSR-safe implementation (no browser APIs in core)

#### UI Kit Package (`@diag/video-call-ui-kit`)
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

#### Agora Adapter (`@diag/agora-web-adapter`)
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
