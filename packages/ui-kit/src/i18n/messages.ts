/**
 * DIAG Video Call UI Kit - i18n Messages
 * Vietnamese and English translations
 */

export interface VideoCallMessages {
  vc: {
    // Buttons
    btn: {
      join: string
      leave: string
      mute: string
      unmute: string
      cameraOn: string
      cameraOff: string
      shareStart: string
      shareStop: string
      switchCamera: string
      devices: string
      participants: string
      chat: string
      settings: string
      more: string
      retry: string
      cancel: string
      close: string
      apply: string
      ok: string
    }
    // Call States
    state: {
      idle: string
      prejoin: string
      connecting: string
      in_call: string
      reconnecting: string
      ended: string
      error: string
    }
    // Errors
    err: {
      permissionDenied: string
      permissionDeniedDetail: string
      deviceNotFound: string
      deviceNotFoundDetail: string
      tokenExpired: string
      tokenExpiredDetail: string
      joinFailed: string
      joinFailedDetail: string
      networkLost: string
      networkLostDetail: string
      initFailed: string
      genericError: string
    }
    // Banners
    banner: {
      reconnecting: string
      poorNetwork: string
      recording: string
      lowBattery: string
    }
    // Labels
    label: {
      microphone: string
      camera: string
      speaker: string
      language: string
      theme: string
      quality: string
      participants: string
      duration: string
      you: string
      host: string
      audience: string
      speaking: string
      muted: string
      videoOff: string
      screenSharing: string
      networkQuality: string
      search: string
      noParticipants: string
      name: string
      role: string
      joinMuted: string
      joinVideoOff: string
      audioOnly: string
    }
    // Tooltips
    tooltip: {
      toggleMic: string
      toggleCamera: string
      switchCamera: string
      shareScreen: string
      stopSharing: string
      openDevices: string
      openParticipants: string
      openChat: string
      openSettings: string
      leaveCall: string
      toggleFullscreen: string
    }
    // Device Permission States
    permission: {
      blocked: string
      blockedDetail: string
      denied: string
      deniedDetail: string
      notFound: string
      notFoundDetail: string
      instructions: string
    }
    // Placeholders
    placeholder: {
      searchParticipants: string
      enterName: string
      selectDevice: string
    }
    // Actions
    action: {
      muteUser: string
      removeUser: string
      pinUser: string
      unpinUser: string
      makeHost: string
      allowToSpeak: string
    }
    // Quality Levels
    quality: {
      auto: string
      '360p': string
      '720p': string
      '1080p': string
    }
    // Network Quality
    network: {
      excellent: string
      good: string
      fair: string
      poor: string
      veryPoor: string
      down: string
      unknown: string
    }
    // Time
    time: {
      seconds: string
      minutes: string
      hours: string
    }
  }
}

/**
 * Vietnamese Translations
 */
export const vi: VideoCallMessages = {
  vc: {
    btn: {
      join: 'Tham gia',
      leave: 'Rời khỏi',
      mute: 'Tắt mic',
      unmute: 'Bật mic',
      cameraOn: 'Bật camera',
      cameraOff: 'Tắt camera',
      shareStart: 'Chia sẻ màn hình',
      shareStop: 'Dừng chia sẻ',
      switchCamera: 'Chuyển camera',
      devices: 'Thiết bị',
      participants: 'Người tham gia',
      chat: 'Trò chuyện',
      settings: 'Cài đặt',
      more: 'Thêm',
      retry: 'Thử lại',
      cancel: 'Hủy',
      close: 'Đóng',
      apply: 'Áp dụng',
      ok: 'Đồng ý'
    },
    state: {
      idle: 'Chưa kết nối',
      prejoin: 'Chuẩn bị tham gia',
      connecting: 'Đang kết nối...',
      in_call: 'Trong cuộc gọi',
      reconnecting: 'Đang kết nối lại...',
      ended: 'Đã kết thúc',
      error: 'Lỗi'
    },
    err: {
      permissionDenied: 'Quyền truy cập bị từ chối',
      permissionDeniedDetail:
        'Vui lòng cho phép truy cập microphone và camera trong cài đặt trình duyệt.',
      deviceNotFound: 'Không tìm thấy thiết bị',
      deviceNotFoundDetail: 'Không thể tìm thấy microphone hoặc camera. Vui lòng kiểm tra kết nối.',
      tokenExpired: 'Phiên làm việc đã hết hạn',
      tokenExpiredDetail: 'Phiên làm việc của bạn đã hết hạn. Vui lòng tham gia lại.',
      joinFailed: 'Không thể tham gia cuộc gọi',
      joinFailedDetail: 'Đã xảy ra lỗi khi tham gia. Vui lòng thử lại.',
      networkLost: 'Mất kết nối mạng',
      networkLostDetail: 'Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối internet.',
      initFailed: 'Khởi tạo thất bại',
      genericError: 'Đã xảy ra lỗi'
    },
    banner: {
      reconnecting: 'Đang kết nối lại...',
      poorNetwork: 'Kết nối mạng không ổn định',
      recording: 'Cuộc gọi đang được ghi âm',
      lowBattery: 'Pin yếu'
    },
    label: {
      microphone: 'Microphone',
      camera: 'Camera',
      speaker: 'Loa',
      language: 'Ngôn ngữ',
      theme: 'Giao diện',
      quality: 'Chất lượng',
      participants: 'Người tham gia',
      duration: 'Thời lượng',
      you: 'Bạn',
      host: 'Chủ trì',
      audience: 'Khán giả',
      speaking: 'Đang nói',
      muted: 'Đã tắt mic',
      videoOff: 'Đã tắt camera',
      screenSharing: 'Đang chia sẻ màn hình',
      networkQuality: 'Chất lượng mạng',
      search: 'Tìm kiếm',
      noParticipants: 'Chưa có người tham gia',
      name: 'Tên',
      role: 'Vai trò',
      joinMuted: 'Tắt mic khi tham gia',
      joinVideoOff: 'Tắt camera khi tham gia',
      audioOnly: 'Chỉ âm thanh'
    },
    tooltip: {
      toggleMic: 'Bật/Tắt microphone',
      toggleCamera: 'Bật/Tắt camera',
      switchCamera: 'Chuyển đổi camera',
      shareScreen: 'Chia sẻ màn hình',
      stopSharing: 'Dừng chia sẻ',
      openDevices: 'Cài đặt thiết bị',
      openParticipants: 'Danh sách người tham gia',
      openChat: 'Mở trò chuyện',
      openSettings: 'Cài đặt',
      leaveCall: 'Rời khỏi cuộc gọi',
      toggleFullscreen: 'Chế độ toàn màn hình'
    },
    permission: {
      blocked: 'Quyền truy cập bị chặn',
      blockedDetail: 'Trình duyệt đã chặn quyền truy cập microphone/camera.',
      denied: 'Quyền truy cập bị từ chối',
      deniedDetail: 'Bạn đã từ chối quyền truy cập microphone/camera.',
      notFound: 'Không tìm thấy thiết bị',
      notFoundDetail: 'Không phát hiện microphone hoặc camera nào được kết nối.',
      instructions: 'Để sử dụng cuộc gọi video, vui lòng cho phép truy cập trong cài đặt trình duyệt của bạn.'
    },
    placeholder: {
      searchParticipants: 'Tìm người tham gia...',
      enterName: 'Nhập tên của bạn',
      selectDevice: 'Chọn thiết bị'
    },
    action: {
      muteUser: 'Tắt mic',
      removeUser: 'Xóa khỏi cuộc gọi',
      pinUser: 'Ghim',
      unpinUser: 'Bỏ ghim',
      makeHost: 'Đặt làm chủ trì',
      allowToSpeak: 'Cho phép phát biểu'
    },
    quality: {
      auto: 'Tự động',
      '360p': '360p (Tiết kiệm)',
      '720p': '720p (Chuẩn HD)',
      '1080p': '1080p (Full HD)'
    },
    network: {
      excellent: 'Tuyệt vời',
      good: 'Tốt',
      fair: 'Trung bình',
      poor: 'Kém',
      veryPoor: 'Rất kém',
      down: 'Mạng ngừng hoạt động',
      unknown: 'Không xác định'
    },
    time: {
      seconds: 'giây',
      minutes: 'phút',
      hours: 'giờ'
    }
  }
}

/**
 * English Translations
 */
export const en: VideoCallMessages = {
  vc: {
    btn: {
      join: 'Join',
      leave: 'Leave',
      mute: 'Mute',
      unmute: 'Unmute',
      cameraOn: 'Turn on camera',
      cameraOff: 'Turn off camera',
      shareStart: 'Share screen',
      shareStop: 'Stop sharing',
      switchCamera: 'Switch camera',
      devices: 'Devices',
      participants: 'Participants',
      chat: 'Chat',
      settings: 'Settings',
      more: 'More',
      retry: 'Retry',
      cancel: 'Cancel',
      close: 'Close',
      apply: 'Apply',
      ok: 'OK'
    },
    state: {
      idle: 'Not connected',
      prejoin: 'Ready to join',
      connecting: 'Connecting...',
      in_call: 'In call',
      reconnecting: 'Reconnecting...',
      ended: 'Ended',
      error: 'Error'
    },
    err: {
      permissionDenied: 'Permission denied',
      permissionDeniedDetail: 'Please allow access to microphone and camera in browser settings.',
      deviceNotFound: 'Device not found',
      deviceNotFoundDetail: 'Could not find microphone or camera. Please check connections.',
      tokenExpired: 'Session expired',
      tokenExpiredDetail: 'Your session has expired. Please rejoin.',
      joinFailed: 'Failed to join call',
      joinFailedDetail: 'An error occurred while joining. Please try again.',
      networkLost: 'Network connection lost',
      networkLostDetail: 'Unable to connect to server. Please check your internet connection.',
      initFailed: 'Initialization failed',
      genericError: 'An error occurred'
    },
    banner: {
      reconnecting: 'Reconnecting...',
      poorNetwork: 'Poor network connection',
      recording: 'This call is being recorded',
      lowBattery: 'Low battery'
    },
    label: {
      microphone: 'Microphone',
      camera: 'Camera',
      speaker: 'Speaker',
      language: 'Language',
      theme: 'Theme',
      quality: 'Quality',
      participants: 'Participants',
      duration: 'Duration',
      you: 'You',
      host: 'Host',
      audience: 'Audience',
      speaking: 'Speaking',
      muted: 'Muted',
      videoOff: 'Video off',
      screenSharing: 'Screen sharing',
      networkQuality: 'Network quality',
      search: 'Search',
      noParticipants: 'No participants yet',
      name: 'Name',
      role: 'Role',
      joinMuted: 'Join muted',
      joinVideoOff: 'Join with video off',
      audioOnly: 'Audio only'
    },
    tooltip: {
      toggleMic: 'Toggle microphone',
      toggleCamera: 'Toggle camera',
      switchCamera: 'Switch camera',
      shareScreen: 'Share screen',
      stopSharing: 'Stop sharing',
      openDevices: 'Device settings',
      openParticipants: 'Participants list',
      openChat: 'Open chat',
      openSettings: 'Settings',
      leaveCall: 'Leave call',
      toggleFullscreen: 'Toggle fullscreen'
    },
    permission: {
      blocked: 'Permission blocked',
      blockedDetail: 'Browser has blocked access to microphone/camera.',
      denied: 'Permission denied',
      deniedDetail: 'You have denied access to microphone/camera.',
      notFound: 'Device not found',
      notFoundDetail: 'No microphone or camera detected.',
      instructions: 'To use video calls, please allow access in your browser settings.'
    },
    placeholder: {
      searchParticipants: 'Search participants...',
      enterName: 'Enter your name',
      selectDevice: 'Select device'
    },
    action: {
      muteUser: 'Mute',
      removeUser: 'Remove from call',
      pinUser: 'Pin',
      unpinUser: 'Unpin',
      makeHost: 'Make host',
      allowToSpeak: 'Allow to speak'
    },
    quality: {
      auto: 'Auto',
      '360p': '360p (Low)',
      '720p': '720p (HD)',
      '1080p': '1080p (Full HD)'
    },
    network: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      veryPoor: 'Very poor',
      down: 'Network down',
      unknown: 'Unknown'
    },
    time: {
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours'
    }
  }
}
