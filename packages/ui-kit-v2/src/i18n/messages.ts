/**
 * Video Call UI Kit V2 - i18n Messages
 * English and Vietnamese translations
 */

export const messages = {
  en: {
    vc: {
      // Prejoin screen
      prejoin: {
        title: 'Join Meeting',
        subtitle: 'Configure your audio and video settings before joining',
        advancedSettings: 'Advanced Settings'
      },
      // States
      state: {
        initializing: 'Initializing...',
        connecting: 'Connecting...',
        reconnecting: 'Reconnecting...',
        in_call: 'In Call',
        ended: 'Call Ended',
        error: 'Error'
      },
      // Banners
      banner: {
        reconnecting: 'Connection lost. Reconnecting...'
      },
      // Buttons
      btn: {
        join: 'Join',
        joining: 'Joining...',
        leave: 'Leave',
        mute: 'Mute',
        unmute: 'Unmute',
        cameraOn: 'Turn camera on',
        cameraOff: 'Turn camera off'
      },
      // Titles
      title: {
        videoCall: 'Video Call',
        prejoin: 'Join Meeting',
        participants: 'Participants',
        chat: 'Chat',
        settings: 'Settings',
        waitingRoom: 'Waiting Room',
        inCall: 'In Call',
        transcript: 'Transcript',
        recording: 'Recording',
        selectLanguage: 'Select Language',
        changeLanguage: 'Change Language'
      },
      // Labels
      label: {
        you: 'You',
        host: 'Host',
        coHost: 'Co-Host',
        guest: 'Guest',
        audience: 'Audience',
        meeting: 'Meeting',
        participants: 'Participants',
        position: 'Position',
        duration: 'Duration',
        messages: 'Messages',
        more: 'more',
        microphone: 'Microphone',
        speaker: 'Speaker',
        camera: 'Camera',
        microphoneLevel: 'Microphone Level',
        noiseSuppression: 'Noise Suppression',
        videoQuality: 'Video Quality',
        mirrorVideo: 'Mirror my video',
        virtualBackground: 'Virtual Background',
        blurLevel: 'Blur Level',
        enableBeauty: 'Enable Beauty Effect',
        smoothing: 'Smoothing',
        lightening: 'Lightening',
        redness: 'Redness',
        sharpness: 'Sharpness',
        contrastLevel: 'Contrast Level',
        preview: 'Preview',
        language: 'Language',
        theme: 'Theme',
        notifications: 'Notifications',
        rateCall: 'How was your call?',
        enterName: 'Enter your name',
        joinWithAudio: 'Join with audio',
        joinWithVideo: 'Join with video',
        joinMuted: 'Join with microphone muted',
        joinVideoOff: 'Join with camera off',
        transcriptLanguage: 'Transcription Language'
      },
      // Actions
      action: {
        join: 'Join',
        leave: 'Leave',
        mute: 'Mute',
        unmute: 'Unmute',
        startVideo: 'Start Video',
        stopVideo: 'Stop Video',
        shareScreen: 'Share Screen',
        stopShare: 'Stop Sharing',
        chat: 'Chat',
        participants: 'Participants',
        settings: 'Settings',
        more: 'More',
        layout: 'Change Layout',
        fullscreen: 'Fullscreen',
        exitFullscreen: 'Exit Fullscreen',
        startRecording: 'Start Recording',
        stopRecording: 'Stop Recording',
        startStream: 'Start Live Stream',
        stopStream: 'Stop Live Stream',
        virtualBackground: 'Virtual Background',
        beautyEffects: 'Beauty Effects',
        noiseSuppression: 'Noise Suppression',
        testSpeaker: 'Test Speaker',
        pin: 'Pin',
        unpin: 'Unpin',
        spotlight: 'Spotlight',
        muteParticipant: 'Mute Participant',
        makeHost: 'Make Host',
        makeCoHost: 'Make Co-Host',
        remove: 'Remove',
        admit: 'Admit',
        deny: 'Deny',
        admitAll: 'Admit All',
        muteAll: 'Mute All',
        invite: 'Invite',
        send: 'Send',
        emoji: 'Emoji',
        attach: 'Attach File',
        close: 'Close',
        rejoin: 'Rejoin',
        newCall: 'New Call',
        downloadRecording: 'Download Recording',
        requestAgain: 'Request Again',
        leaveQueue: 'Leave Queue',
        upload: 'Upload',
        download: 'Download',
        startTranscript: 'Start Transcription',
        stopTranscript: 'Stop Transcription',
        raiseHand: 'Raise Hand',
        lowerHand: 'Lower Hand',
        switchCamera: 'Switch Camera',
        apply: 'Apply',
        cancel: 'Cancel'
      },
      // Status
      status: {
        connecting: 'Connecting...',
        connected: 'Connected',
        reconnecting: 'Reconnecting...',
        disconnected: 'Disconnected',
        waitingForHost: 'Waiting for host to let you in',
        accessDenied: 'Access Denied',
        readyToJoin: 'Ready to Join',
        recording: 'Recording',
        live: 'LIVE',
        encrypted: 'Encrypted',
        transcriptOff: 'Transcription is off',
        transcribing: 'Transcribing',
        startingTranscript: 'Starting transcription...'
      },
      // Messages
      message: {
        pleaseWait: 'The host will let you in soon',
        hostDenied: 'The host has denied your request to join',
        waitingRoomNote: 'Please wait. The meeting host will let you in soon.',
        listening: 'Listening...',
        noMessages: 'No messages yet',
        noPreview: 'No preview available',
        participantJoined: '{name} joined the meeting',
        participantLeft: '{name} left the meeting',
        youAreMuted: 'You are muted',
        recordingStarted: 'Recording has started',
        recordingStopped: 'Recording has stopped',
        liveStreamStarted: 'Live stream has started',
        liveStreamStopped: 'Live stream has stopped',
        screenShareStarted: '{name} started sharing screen',
        screenShareStopped: '{name} stopped sharing screen',
        networkUnstable: 'Your network connection is unstable',
        poorConnection: 'Poor connection quality',
        selectLanguageHint: 'Choose the language for speech-to-text transcription',
        languageInfo: 'The transcript will be generated in the selected language. All participants will see the same transcript.'
      },
      // Placeholders
      placeholder: {
        searchParticipants: 'Search participants',
        typeMessage: 'Type a message...',
        feedback: 'Tell us about your experience (optional)'
      },
      // Options
      option: {
        everyone: 'Everyone',
        none: 'None',
        blur: 'Blur',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        low: 'Low',
        normal: 'Normal',
        high: 'High'
      },
      // Errors
      error: {
        joinFailed: 'Failed to join the call',
        connectionLost: 'Connection lost',
        mediaAccessDenied: 'Camera/microphone access denied',
        screenShareFailed: 'Failed to share screen',
        recordingFailed: 'Failed to start recording',
        unknown: 'An error occurred'
      }
    }
  },
  vi: {
    vc: {
      // Prejoin screen
      prejoin: {
        title: 'Tham gia cuộc họp',
        subtitle: 'Cấu hình âm thanh và video trước khi tham gia',
        advancedSettings: 'Cài đặt nâng cao'
      },
      // States
      state: {
        initializing: 'Đang khởi tạo...',
        connecting: 'Đang kết nối...',
        reconnecting: 'Đang kết nối lại...',
        in_call: 'Đang gọi',
        ended: 'Cuộc gọi đã kết thúc',
        error: 'Lỗi'
      },
      // Banners
      banner: {
        reconnecting: 'Mất kết nối. Đang kết nối lại...'
      },
      // Buttons
      btn: {
        join: 'Tham gia',
        joining: 'Đang tham gia...',
        leave: 'Rời đi',
        mute: 'Tắt tiếng',
        unmute: 'Bật tiếng',
        cameraOn: 'Bật camera',
        cameraOff: 'Tắt camera'
      },
      // Tiêu đề
      title: {
        videoCall: 'Cuộc gọi video',
        prejoin: 'Tham gia cuộc họp',
        participants: 'Người tham gia',
        chat: 'Trò chuyện',
        settings: 'Cài đặt',
        waitingRoom: 'Phòng chờ',
        inCall: 'Trong cuộc gọi',
        transcript: 'Bản ghi',
        recording: 'Ghi âm',
        selectLanguage: 'Chọn ngôn ngữ',
        changeLanguage: 'Đổi ngôn ngữ'
      },
      // Nhãn
      label: {
        you: 'Bạn',
        host: 'Chủ phòng',
        coHost: 'Đồng chủ phòng',
        guest: 'Khách',
        audience: 'Khán giả',
        meeting: 'Cuộc họp',
        participants: 'Người tham gia',
        position: 'Vị trí',
        duration: 'Thời lượng',
        messages: 'Tin nhắn',
        more: 'thêm',
        microphone: 'Micro',
        speaker: 'Loa',
        camera: 'Camera',
        microphoneLevel: 'Mức độ micro',
        noiseSuppression: 'Khử tiếng ồn',
        videoQuality: 'Chất lượng video',
        mirrorVideo: 'Lật video',
        virtualBackground: 'Nền ảo',
        blurLevel: 'Độ mờ',
        enableBeauty: 'Bật hiệu ứng làm đẹp',
        smoothing: 'Làm mịn',
        lightening: 'Làm sáng',
        redness: 'Hồng hào',
        sharpness: 'Độ nét',
        contrastLevel: 'Độ tương phản',
        preview: 'Xem trước',
        language: 'Ngôn ngữ',
        theme: 'Giao diện',
        notifications: 'Thông báo',
        rateCall: 'Cuộc gọi của bạn thế nào?',
        enterName: 'Nhập tên của bạn',
        joinWithAudio: 'Tham gia với âm thanh',
        joinWithVideo: 'Tham gia với video',
        joinMuted: 'Tham gia với micro tắt',
        joinVideoOff: 'Tham gia với camera tắt',
        transcriptLanguage: 'Ngôn ngữ phiên âm'
      },
      // Hành động
      action: {
        join: 'Tham gia',
        leave: 'Rời đi',
        mute: 'Tắt tiếng',
        unmute: 'Bật tiếng',
        startVideo: 'Bật video',
        stopVideo: 'Tắt video',
        shareScreen: 'Chia sẻ màn hình',
        stopShare: 'Dừng chia sẻ',
        chat: 'Trò chuyện',
        participants: 'Người tham gia',
        settings: 'Cài đặt',
        more: 'Thêm',
        layout: 'Đổi bố cục',
        fullscreen: 'Toàn màn hình',
        exitFullscreen: 'Thoát toàn màn hình',
        startRecording: 'Bắt đầu ghi',
        stopRecording: 'Dừng ghi',
        startStream: 'Bắt đầu phát trực tiếp',
        stopStream: 'Dừng phát trực tiếp',
        virtualBackground: 'Nền ảo',
        beautyEffects: 'Hiệu ứng làm đẹp',
        noiseSuppression: 'Khử tiếng ồn',
        testSpeaker: 'Kiểm tra loa',
        pin: 'Ghim',
        unpin: 'Bỏ ghim',
        spotlight: 'Nổi bật',
        muteParticipant: 'Tắt tiếng người này',
        makeHost: 'Đặt làm chủ phòng',
        makeCoHost: 'Đặt làm đồng chủ phòng',
        remove: 'Xóa',
        admit: 'Cho vào',
        deny: 'Từ chối',
        admitAll: 'Cho tất cả vào',
        muteAll: 'Tắt tiếng tất cả',
        invite: 'Mời',
        send: 'Gửi',
        emoji: 'Biểu cảm',
        attach: 'Đính kèm',
        close: 'Đóng',
        rejoin: 'Tham gia lại',
        newCall: 'Cuộc gọi mới',
        downloadRecording: 'Tải bản ghi',
        requestAgain: 'Yêu cầu lại',
        leaveQueue: 'Rời hàng chờ',
        upload: 'Tải lên',
        download: 'Tải xuống',
        startTranscript: 'Bắt đầu ghi chép',
        stopTranscript: 'Dừng ghi chép',
        raiseHand: 'Giơ tay',
        lowerHand: 'Hạ tay',
        switchCamera: 'Đổi camera',
        apply: 'Áp dụng',
        cancel: 'Hủy'
      },
      // Trạng thái
      status: {
        connecting: 'Đang kết nối...',
        connected: 'Đã kết nối',
        reconnecting: 'Đang kết nối lại...',
        disconnected: 'Đã ngắt kết nối',
        waitingForHost: 'Đang chờ chủ phòng cho vào',
        accessDenied: 'Bị từ chối truy cập',
        readyToJoin: 'Sẵn sàng tham gia',
        recording: 'Đang ghi',
        live: 'TRỰC TIẾP',
        encrypted: 'Đã mã hóa',
        transcriptOff: 'Chức năng ghi chép đang tắt',
        transcribing: 'Đang ghi chép',
        startingTranscript: 'Đang khởi tạo phiên âm...'
      },
      // Thông báo
      message: {
        pleaseWait: 'Chủ phòng sẽ cho bạn vào sớm',
        hostDenied: 'Chủ phòng đã từ chối yêu cầu tham gia của bạn',
        waitingRoomNote: 'Vui lòng chờ. Chủ phòng sẽ cho bạn vào sớm.',
        listening: 'Đang nghe...',
        noMessages: 'Chưa có tin nhắn',
        noPreview: 'Không có bản xem trước',
        participantJoined: '{name} đã tham gia cuộc họp',
        participantLeft: '{name} đã rời cuộc họp',
        youAreMuted: 'Bạn đang bị tắt tiếng',
        recordingStarted: 'Đã bắt đầu ghi',
        recordingStopped: 'Đã dừng ghi',
        liveStreamStarted: 'Đã bắt đầu phát trực tiếp',
        liveStreamStopped: 'Đã dừng phát trực tiếp',
        screenShareStarted: '{name} đã bắt đầu chia sẻ màn hình',
        screenShareStopped: '{name} đã dừng chia sẻ màn hình',
        networkUnstable: 'Kết nối mạng của bạn không ổn định',
        poorConnection: 'Chất lượng kết nối kém',
        selectLanguageHint: 'Chọn ngôn ngữ để phiên âm cuộc gọi',
        languageInfo: 'Bản phiên âm sẽ được tạo bằng ngôn ngữ đã chọn. Tất cả người tham gia sẽ thấy cùng một bản phiên âm.'
      },
      // Placeholder
      placeholder: {
        searchParticipants: 'Tìm người tham gia',
        typeMessage: 'Nhập tin nhắn...',
        feedback: 'Chia sẻ trải nghiệm của bạn (tùy chọn)'
      },
      // Tùy chọn
      option: {
        everyone: 'Mọi người',
        none: 'Không',
        blur: 'Làm mờ',
        light: 'Sáng',
        dark: 'Tối',
        system: 'Hệ thống',
        low: 'Thấp',
        normal: 'Bình thường',
        high: 'Cao'
      },
      // Lỗi
      error: {
        joinFailed: 'Không thể tham gia cuộc gọi',
        connectionLost: 'Mất kết nối',
        mediaAccessDenied: 'Quyền truy cập camera/micro bị từ chối',
        screenShareFailed: 'Không thể chia sẻ màn hình',
        recordingFailed: 'Không thể bắt đầu ghi',
        unknown: 'Đã xảy ra lỗi'
      }
    }
  }
}

export default messages
