<template>
  <div class="vc-chat-panel">
    <!-- Header -->
    <div class="vc-chat-panel__header">
      <h3 class="vc-chat-panel__title">{{ $t('vc.title.chat') }}</h3>
      <button class="vc-chat-panel__close" @click="$emit('close')">
        <VcIcon name="close" size="sm" />
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesRef" class="vc-chat-panel__messages">
      <div v-if="messages.length === 0" class="vc-chat-panel__empty">
        {{ $t('vc.placeholder.noMessages') }}
      </div>

      <template v-else>
        <div
          v-for="(msg, index) in messagesWithDividers"
          :key="msg.id || `divider-${index}`"
          :class="[
            'vc-chat-panel__item',
            msg.type === 'divider' ? 'vc-chat-panel__divider' : 'vc-chat-panel__message'
          ]"
        >
          <!-- Date divider -->
          <template v-if="msg.type === 'divider'">
            <span class="vc-chat-panel__divider-text">{{ msg.text }}</span>
          </template>

          <!-- Message -->
          <template v-else>
            <div class="vc-chat-panel__message-content" :class="messageClasses(msg)">
              <!-- Avatar -->
              <div v-if="!msg.isLocal" class="vc-chat-panel__avatar">
                {{ getInitials(msg) }}
              </div>

              <!-- Body -->
              <div class="vc-chat-panel__body">
                <!-- Sender info -->
                <div v-if="!msg.isLocal" class="vc-chat-panel__sender">
                  <span class="vc-chat-panel__sender-name">{{ msg.senderName }}</span>
                  <span class="vc-chat-panel__time">{{ formatTime(msg.timestamp) }}</span>
                </div>

                <!-- Text -->
                <div class="vc-chat-panel__text" v-html="formatMessage(msg.text)" />

                <!-- Attachments -->
                <div v-if="msg.attachments?.length" class="vc-chat-panel__attachments">
                  <div
                    v-for="(att, i) in msg.attachments"
                    :key="i"
                    class="vc-chat-panel__attachment"
                    @click="$emit('download-attachment', att)"
                  >
                    <VcIcon name="attachment" size="sm" class="vc-chat-panel__attachment-icon" />
                    <span class="vc-chat-panel__attachment-name">{{ att.name }}</span>
                  </div>
                </div>

                <!-- Local message time -->
                <div v-if="msg.isLocal" class="vc-chat-panel__local-time">
                  {{ formatTime(msg.timestamp) }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- Typing indicator -->
    <div v-if="typingUsers.length > 0" class="vc-chat-panel__typing">
      <span class="vc-chat-panel__typing-dots">
        <span /><span /><span />
      </span>
      {{ typingText }}
    </div>

    <!-- Input area -->
    <div class="vc-chat-panel__input-area">
      <!-- Recipients (for private messages) -->
      <div v-if="showRecipientSelector" class="vc-chat-panel__recipients">
        <select v-model="selectedRecipient" class="vc-chat-panel__recipient-select">
          <option value="">{{ $t('vc.option.everyone') }}</option>
          <option
            v-for="p in availableRecipients"
            :key="p.id"
            :value="p.id"
          >
            {{ p.name || p.id }}
          </option>
        </select>
      </div>

      <!-- Input -->
      <div class="vc-chat-panel__input-wrapper">
        <textarea
          ref="inputRef"
          v-model="inputText"
          class="vc-chat-panel__input"
          :placeholder="$t('vc.placeholder.typeMessage')"
          :disabled="!enabled"
          rows="1"
          @keydown.enter.exact.prevent="sendMessage"
          @input="handleInput"
        />

        <div class="vc-chat-panel__input-actions">
          <!-- Emoji picker trigger -->
          <button
            v-if="showEmoji"
            class="vc-chat-panel__action-btn"
            :title="$t('vc.action.emoji')"
            @click="$emit('open-emoji')"
          >
            <VcIcon name="emoji" size="md" />
          </button>

          <!-- File attachment -->
          <button
            v-if="showAttachment"
            class="vc-chat-panel__action-btn"
            :title="$t('vc.action.attach')"
            @click="triggerFileInput"
          >
            <VcIcon name="attachment" size="md" />
          </button>

          <!-- Send button -->
          <button
            class="vc-chat-panel__send-btn"
            :disabled="!canSend"
            @click="sendMessage"
          >
            {{ $t('vc.action.send') }}
          </button>
        </div>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        hidden
        multiple
        @change="handleFileSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { ChatMessage, Participant } from '@diagvn/video-call-core-v2'
import VcIcon from './icons/VcIcon.vue'

export interface DiagChatPanelV2Props {
  messages: readonly ChatMessage[]
  participants?: readonly Participant[]
  typingUsers?: readonly string[]
  localUserId?: string
  enabled?: boolean
  showRecipientSelector?: boolean
  showEmoji?: boolean
  showAttachment?: boolean
}

export interface DiagChatPanelV2Emits {
  (e: 'close'): void
  (e: 'send', message: { text: string; recipientId?: string }): void
  (e: 'typing', isTyping: boolean): void
  (e: 'open-emoji'): void
  (e: 'attach-file', files: FileList): void
  (e: 'download-attachment', attachment: { url: string; name: string }): void
}

const props = withDefaults(defineProps<DiagChatPanelV2Props>(), {
  participants: () => [],
  typingUsers: () => [],
  localUserId: '',
  enabled: true,
  showRecipientSelector: false,
  showEmoji: true,
  showAttachment: false
})

const emit = defineEmits<DiagChatPanelV2Emits>()

// Refs
const messagesRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// State
const inputText = ref('')
const selectedRecipient = ref('')
let typingTimeout: ReturnType<typeof setTimeout> | null = null

// Computed
const availableRecipients = computed(() =>
  props.participants.filter(p => p.id !== props.localUserId)
)

const canSend = computed(() =>
  props.enabled && inputText.value.trim().length > 0
)

const typingText = computed(() => {
  const count = props.typingUsers.length
  if (count === 0) return ''
  if (count === 1) return `${props.typingUsers[0]} is typing...`
  if (count === 2) return `${props.typingUsers[0]} and ${props.typingUsers[1]} are typing...`
  return `${props.typingUsers[0]} and ${count - 1} others are typing...`
})

interface MessageWithDivider extends ChatMessage {
  type?: 'message' | 'divider'
}

const messagesWithDividers = computed((): MessageWithDivider[] => {
  const result: MessageWithDivider[] = []
  let lastDate = ''

  for (const msg of props.messages) {
    const msgDate = new Date(msg.timestamp).toDateString()
    if (msgDate !== lastDate) {
      result.push({
        id: `divider-${msgDate}`,
        type: 'divider',
        text: formatDate(msg.timestamp),
        senderId: '',
        senderName: '',
        timestamp: msg.timestamp,
        isLocal: false
      })
      lastDate = msgDate
    }
    result.push({ ...msg, type: 'message' })
  }

  return result
})

// Methods
function getInitials(msg: ChatMessage): string {
  const name = msg.senderName || msg.senderId
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function messageClasses(msg: ChatMessage) {
  return {
    'vc-chat-panel__message-content--local': msg.isLocal,
    'vc-chat-panel__message-content--private': msg.isPrivate
  }
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
}

function formatMessage(text: string): string {
  // Convert URLs to links
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>')
}

function sendMessage() {
  if (!canSend.value) return

  emit('send', {
    text: inputText.value.trim(),
    recipientId: selectedRecipient.value || undefined
  })

  inputText.value = ''
  emit('typing', false)
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
}

function handleInput() {
  // Auto-resize textarea
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 100)}px`
  }

  // Emit typing status
  emit('typing', true)
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  typingTimeout = setTimeout(() => {
    emit('typing', false)
  }, 2000)
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    emit('attach-file', input.files)
    input.value = ''
  }
}

// Auto-scroll to bottom on new messages
watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })
  }
)
</script>

<style scoped>
.vc-chat-panel {
  display: flex;
  flex-direction: column;
  width: 320px;
  max-width: 100%;
  height: 100%;
  background: var(--vc-bg);
  border-left: 1px solid var(--vc-border);
}

/* Header */
.vc-chat-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-md);
  border-bottom: 1px solid var(--vc-border);
}

.vc-chat-panel__title {
  margin: 0;
  font-size: var(--vc-text-md);
  font-weight: 600;
}

.vc-chat-panel__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--vc-text-secondary);
  cursor: pointer;
  border-radius: var(--vc-radius-sm);
}

.vc-chat-panel__close:hover {
  background: var(--vc-bg-hover);
}

/* Messages */
.vc-chat-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--vc-space-md);
}

.vc-chat-panel__empty {
  text-align: center;
  color: var(--vc-text-secondary);
  padding: var(--vc-space-xl);
  font-size: var(--vc-text-sm);
}

/* Divider */
.vc-chat-panel__divider {
  text-align: center;
  margin: var(--vc-space-md) 0;
}

.vc-chat-panel__divider-text {
  font-size: var(--vc-text-xs);
  color: var(--vc-text-secondary);
  background: var(--vc-bg);
  padding: 0 var(--vc-space-sm);
}

/* Message */
.vc-chat-panel__message {
  margin-bottom: var(--vc-space-md);
}

.vc-chat-panel__message-content {
  display: flex;
  gap: var(--vc-space-sm);
}

.vc-chat-panel__message-content--local {
  flex-direction: row-reverse;
}

.vc-chat-panel__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--vc-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--vc-text-xs);
  font-weight: 600;
  flex-shrink: 0;
}

.vc-chat-panel__body {
  max-width: 75%;
}

.vc-chat-panel__sender {
  display: flex;
  align-items: baseline;
  gap: var(--vc-space-xs);
  margin-bottom: var(--vc-space-xs);
}

.vc-chat-panel__sender-name {
  font-size: var(--vc-text-sm);
  font-weight: 500;
}

.vc-chat-panel__time {
  font-size: var(--vc-text-xs);
  color: var(--vc-text-secondary);
}

.vc-chat-panel__text {
  padding: var(--vc-space-sm) var(--vc-space-md);
  background: var(--vc-bg-secondary);
  border-radius: var(--vc-radius-md);
  font-size: var(--vc-text-sm);
  line-height: 1.4;
  word-wrap: break-word;
}

.vc-chat-panel__message-content--local .vc-chat-panel__text {
  background: var(--vc-primary);
  color: white;
}

.vc-chat-panel__message-content--private .vc-chat-panel__text {
  border: 1px dashed var(--vc-warning);
}

.vc-chat-panel__text :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.vc-chat-panel__local-time {
  text-align: right;
  font-size: var(--vc-text-xs);
  color: var(--vc-text-secondary);
  margin-top: var(--vc-space-xs);
}

/* Attachments */
.vc-chat-panel__attachments {
  margin-top: var(--vc-space-xs);
}

.vc-chat-panel__attachment {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
  padding: var(--vc-space-xs) var(--vc-space-sm);
  background: var(--vc-bg);
  border-radius: var(--vc-radius-sm);
  cursor: pointer;
  font-size: var(--vc-text-sm);
}

.vc-chat-panel__attachment:hover {
  background: var(--vc-bg-hover);
}

/* Typing indicator */
.vc-chat-panel__typing {
  display: flex;
  align-items: center;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-sm) var(--vc-space-md);
  font-size: var(--vc-text-xs);
  color: var(--vc-text-secondary);
}

.vc-chat-panel__typing-dots {
  display: flex;
  gap: 2px;
}

.vc-chat-panel__typing-dots span {
  width: 4px;
  height: 4px;
  background: var(--vc-text-secondary);
  border-radius: 50%;
  animation: typing-dot 1.4s infinite ease-in-out;
}

.vc-chat-panel__typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.vc-chat-panel__typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-dot {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Input area */
.vc-chat-panel__input-area {
  padding: var(--vc-space-sm) var(--vc-space-md);
  border-top: 1px solid var(--vc-border);
}

.vc-chat-panel__recipients {
  margin-bottom: var(--vc-space-sm);
}

.vc-chat-panel__recipient-select {
  width: 100%;
  padding: var(--vc-space-xs) var(--vc-space-sm);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-sm);
  background: var(--vc-bg-secondary);
  color: var(--vc-text);
  font-size: var(--vc-text-sm);
}

.vc-chat-panel__input-wrapper {
  display: flex;
  gap: var(--vc-space-sm);
  align-items: flex-end;
}

.vc-chat-panel__input {
  flex: 1;
  min-height: 36px;
  max-height: 100px;
  padding: var(--vc-space-sm);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-md);
  background: var(--vc-bg-secondary);
  color: var(--vc-text);
  font-size: var(--vc-text-sm);
  resize: none;
  line-height: 1.4;
}

.vc-chat-panel__input:focus {
  outline: none;
  border-color: var(--vc-primary);
}

.vc-chat-panel__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vc-chat-panel__input-actions {
  display: flex;
  gap: var(--vc-space-xs);
}

.vc-chat-panel__action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: var(--vc-radius-sm);
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s ease;
}

.vc-chat-panel__action-btn:hover {
  background: var(--vc-bg-hover);
}

.vc-chat-panel__send-btn {
  padding: var(--vc-space-sm) var(--vc-space-md);
  border: none;
  background: var(--vc-primary);
  color: white;
  border-radius: var(--vc-radius-md);
  font-size: var(--vc-text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vc-chat-panel__send-btn:hover:not(:disabled) {
  background: var(--vc-primary-dark, #2980b9);
}

.vc-chat-panel__send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
