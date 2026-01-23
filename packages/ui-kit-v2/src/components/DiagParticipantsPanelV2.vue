<template>
  <div class="vc-participants-panel">
    <!-- Header -->
    <div class="vc-participants-panel__header">
      <h3 class="vc-participants-panel__title">
        {{ $t('vc.title.participants') }} ({{ participants.length }})
      </h3>
      <button class="vc-participants-panel__close" @click="$emit('close')">
        <VcIcon name="close" size="sm" />
      </button>
    </div>

    <!-- Search -->
    <div v-if="showSearch" class="vc-participants-panel__search">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('vc.placeholder.searchParticipants')"
        class="vc-participants-panel__search-input"
      />
    </div>

    <!-- Waiting room section (host only) -->
    <div v-if="isHost && waitingRoomParticipants.length > 0" class="vc-participants-panel__section">
      <div class="vc-participants-panel__section-header">
        <span>{{ $t('vc.title.waitingRoom') }} ({{ waitingRoomParticipants.length }})</span>
        <button
          v-if="waitingRoomParticipants.length > 1"
          class="vc-participants-panel__action-btn"
          @click="$emit('admit-all')"
        >
          {{ $t('vc.action.admitAll') }}
        </button>
      </div>
      <div class="vc-participants-panel__list">
        <div
          v-for="p in waitingRoomParticipants"
          :key="p.id"
          class="vc-participants-panel__item vc-participants-panel__item--waiting"
        >
          <div class="vc-participants-panel__avatar">{{ getInitials(p) }}</div>
          <div class="vc-participants-panel__info">
            <span class="vc-participants-panel__name">{{ p.name || p.id }}</span>
            <span class="vc-participants-panel__status">{{ $t('vc.status.waiting') }}</span>
          </div>
          <div class="vc-participants-panel__actions">
            <button
              class="vc-participants-panel__btn vc-participants-panel__btn--primary"
              @click="$emit('admit', p.id)"
            >
              {{ $t('vc.action.admit') }}
            </button>
            <button
              class="vc-participants-panel__btn vc-participants-panel__btn--danger"
              @click="$emit('deny', p.id)"
            >
              {{ $t('vc.action.deny') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- In call participants -->
    <div class="vc-participants-panel__section">
      <div class="vc-participants-panel__section-header">
        {{ $t('vc.title.inCall') }} ({{ filteredParticipants.length }})
      </div>
      <div class="vc-participants-panel__list">
        <div
          v-for="p in filteredParticipants"
          :key="p.id"
          class="vc-participants-panel__item"
          :class="{
            'vc-participants-panel__item--local': p.isLocal,
            'vc-participants-panel__item--speaking': p.audioLevel > 0.1
          }"
        >
          <div class="vc-participants-panel__avatar" :class="avatarClass(p)">
            {{ getInitials(p) }}
          </div>
          <div class="vc-participants-panel__info">
            <span class="vc-participants-panel__name">
              {{ p.name || p.id }}
              <span v-if="p.isLocal" class="vc-participants-panel__you">({{ $t('vc.label.you') }})</span>
              <span v-if="p.role === 'host'" class="vc-participants-panel__role">Host</span>
            </span>
            <span class="vc-participants-panel__indicators">
              <VcIcon v-if="!p.audioEnabled" name="mic-off" size="xs" class="vc-participants-panel__indicator" title="Muted" />
              <VcIcon v-if="!p.videoEnabled" name="camera-off" size="xs" class="vc-participants-panel__indicator" title="Camera off" />
              <VcIcon v-if="p.isScreenSharing" name="screen-share" size="xs" class="vc-participants-panel__indicator" title="Sharing" />
              <VcIcon v-if="p.isHandRaised" name="hand-raised" size="xs" class="vc-participants-panel__indicator vc-participants-panel__indicator--hand" title="Hand raised" />
            </span>
          </div>

          <!-- Host actions -->
          <div v-if="isHost && !p.isLocal" class="vc-participants-panel__actions">
            <button
              v-if="p.audioEnabled"
              class="vc-participants-panel__btn"
              :title="$t('vc.action.muteParticipant')"
              @click="$emit('mute', p.id)"
            >
              <VcIcon name="mic-off" size="sm" />
            </button>
            <button
              class="vc-participants-panel__btn"
              :title="$t('vc.action.pin')"
              @click="$emit('pin', p.id)"
            >
              <VcIcon name="pin" size="sm" />
            </button>
            <div class="vc-participants-panel__menu">
              <button
                class="vc-participants-panel__btn"
                @click="openMenu(p.id)"
              >
                <VcIcon name="more" size="sm" />
              </button>
              <div v-if="menuOpenId === p.id" class="vc-participants-panel__menu-dropdown">
                <button @click="$emit('make-host', p.id); closeMenu()">
                  {{ $t('vc.action.makeHost') }}
                </button>
                <button @click="$emit('make-cohost', p.id); closeMenu()">
                  {{ $t('vc.action.makeCoHost') }}
                </button>
                <button @click="$emit('spotlight', p.id); closeMenu()">
                  {{ $t('vc.action.spotlight') }}
                </button>
                <button class="vc-participants-panel__menu-item--danger" @click="$emit('remove', p.id); closeMenu()">
                  {{ $t('vc.action.remove') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer actions -->
    <div v-if="isHost" class="vc-participants-panel__footer">
      <button class="vc-participants-panel__footer-btn" @click="$emit('mute-all')">
        {{ $t('vc.action.muteAll') }}
      </button>
      <button class="vc-participants-panel__footer-btn" @click="$emit('invite')">
        {{ $t('vc.action.invite') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Participant } from '@diagvn/video-call-core-v2'
import VcIcon from './icons/VcIcon.vue'

export interface DiagParticipantsPanelV2Props {
  participants: readonly Participant[]
  waitingRoomParticipants?: readonly Participant[]
  isHost?: boolean
  showSearch?: boolean
}

export interface DiagParticipantsPanelV2Emits {
  (e: 'close'): void
  (e: 'admit', uid: string): void
  (e: 'deny', uid: string): void
  (e: 'admit-all'): void
  (e: 'mute', uid: string): void
  (e: 'pin', uid: string): void
  (e: 'spotlight', uid: string): void
  (e: 'make-host', uid: string): void
  (e: 'make-cohost', uid: string): void
  (e: 'remove', uid: string): void
  (e: 'mute-all'): void
  (e: 'invite'): void
}

const props = withDefaults(defineProps<DiagParticipantsPanelV2Props>(), {
  waitingRoomParticipants: () => [],
  isHost: false,
  showSearch: true
})

defineEmits<DiagParticipantsPanelV2Emits>()

// State
const searchQuery = ref('')
const menuOpenId = ref<string | null>(null)

// Computed
const filteredParticipants = computed(() => {
  if (!searchQuery.value) return props.participants

  const query = searchQuery.value.toLowerCase()
  return props.participants.filter(p =>
    (p.name?.toLowerCase().includes(query)) ||
    p.id.includes(query)
  )
})

// Methods
function getInitials(p: Participant): string {
  const name = p.name || p.id
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function avatarClass(p: Participant) {
  return {
    'vc-participants-panel__avatar--host': p.role === 'host',
    'vc-participants-panel__avatar--speaking': p.audioLevel > 0.1
  }
}

function openMenu(id: string) {
  menuOpenId.value = menuOpenId.value === id ? null : id
}

function closeMenu() {
  menuOpenId.value = null
}
</script>

<style scoped>
.vc-participants-panel {
  display: flex;
  flex-direction: column;
  width: 320px;
  max-width: 100%;
  height: 100%;
  background: var(--vc-bg);
  border-left: 1px solid var(--vc-border);
}

/* Header */
.vc-participants-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-md);
  border-bottom: 1px solid var(--vc-border);
}

.vc-participants-panel__title {
  margin: 0;
  font-size: var(--vc-text-md);
  font-weight: 600;
}

.vc-participants-panel__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--vc-text-secondary);
  cursor: pointer;
  border-radius: var(--vc-radius-sm);
  transition: background 0.2s ease;
}

.vc-participants-panel__close:hover {
  background: var(--vc-bg-hover);
}

/* Search */
.vc-participants-panel__search {
  padding: var(--vc-space-sm) var(--vc-space-md);
}

.vc-participants-panel__search-input {
  width: 100%;
  padding: var(--vc-space-sm);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-sm);
  background: var(--vc-bg-secondary);
  color: var(--vc-text);
  font-size: var(--vc-text-sm);
}

.vc-participants-panel__search-input:focus {
  outline: none;
  border-color: var(--vc-primary);
}

/* Section */
.vc-participants-panel__section {
  flex: 1;
  overflow-y: auto;
}

.vc-participants-panel__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--vc-space-sm) var(--vc-space-md);
  font-size: var(--vc-text-sm);
  font-weight: 500;
  color: var(--vc-text-secondary);
  background: var(--vc-bg-secondary);
}

.vc-participants-panel__action-btn {
  border: none;
  background: transparent;
  color: var(--vc-primary);
  font-size: var(--vc-text-xs);
  cursor: pointer;
}

/* List */
.vc-participants-panel__list {
  padding: var(--vc-space-xs) 0;
}

/* Item */
.vc-participants-panel__item {
  display: flex;
  align-items: center;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-sm) var(--vc-space-md);
  transition: background 0.2s ease;
}

.vc-participants-panel__item:hover {
  background: var(--vc-bg-hover);
}

.vc-participants-panel__item--waiting {
  background: rgba(241, 196, 15, 0.1);
}

.vc-participants-panel__item--speaking {
  background: rgba(39, 174, 96, 0.1);
}

/* Avatar */
.vc-participants-panel__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--vc-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--vc-text-sm);
  font-weight: 600;
  flex-shrink: 0;
}

.vc-participants-panel__avatar--host {
  border: 2px solid var(--vc-warning);
}

.vc-participants-panel__avatar--speaking {
  border: 2px solid var(--vc-success);
}

/* Info */
.vc-participants-panel__info {
  flex: 1;
  min-width: 0;
}

.vc-participants-panel__name {
  display: flex;
  align-items: center;
  gap: var(--vc-space-xs);
  font-size: var(--vc-text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vc-participants-panel__you {
  color: var(--vc-text-secondary);
  font-size: var(--vc-text-xs);
}

.vc-participants-panel__role {
  font-size: var(--vc-text-xs);
  background: var(--vc-warning);
  color: #000;
  padding: 1px 6px;
  border-radius: var(--vc-radius-sm);
}

.vc-participants-panel__status {
  font-size: var(--vc-text-xs);
  color: var(--vc-text-secondary);
}

.vc-participants-panel__indicators {
  display: flex;
  gap: var(--vc-space-xs);
  font-size: 12px;
}

.vc-participants-panel__indicator {
  opacity: 0.6;
}

.vc-participants-panel__indicator--hand {
  opacity: 1;
  animation: wave 0.5s ease infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

/* Actions */
.vc-participants-panel__actions {
  display: flex;
  gap: var(--vc-space-xs);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.vc-participants-panel__item:hover .vc-participants-panel__actions {
  opacity: 1;
}

.vc-participants-panel__btn {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--vc-bg-secondary);
  border-radius: var(--vc-radius-sm);
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.vc-participants-panel__btn:hover {
  background: var(--vc-bg-hover);
}

.vc-participants-panel__btn--primary {
  width: auto;
  padding: 0 var(--vc-space-sm);
  background: var(--vc-primary);
  color: white;
}

.vc-participants-panel__btn--danger {
  width: auto;
  padding: 0 var(--vc-space-sm);
  background: var(--vc-danger);
  color: white;
}

/* Menu */
.vc-participants-panel__menu {
  position: relative;
}

.vc-participants-panel__menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 160px;
  background: var(--vc-bg);
  border: 1px solid var(--vc-border);
  border-radius: var(--vc-radius-md);
  box-shadow: var(--vc-shadow-lg);
  z-index: 100;
  overflow: hidden;
}

.vc-participants-panel__menu-dropdown button {
  display: block;
  width: 100%;
  padding: var(--vc-space-sm) var(--vc-space-md);
  border: none;
  background: transparent;
  color: var(--vc-text);
  text-align: left;
  font-size: var(--vc-text-sm);
  cursor: pointer;
  transition: background 0.2s ease;
}

.vc-participants-panel__menu-dropdown button:hover {
  background: var(--vc-bg-hover);
}

.vc-participants-panel__menu-item--danger {
  color: var(--vc-danger) !important;
}

/* Footer */
.vc-participants-panel__footer {
  display: flex;
  gap: var(--vc-space-sm);
  padding: var(--vc-space-md);
  border-top: 1px solid var(--vc-border);
}

.vc-participants-panel__footer-btn {
  flex: 1;
  padding: var(--vc-space-sm);
  border: 1px solid var(--vc-border);
  background: transparent;
  color: var(--vc-text);
  border-radius: var(--vc-radius-sm);
  font-size: var(--vc-text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vc-participants-panel__footer-btn:hover {
  background: var(--vc-bg-hover);
}
</style>
