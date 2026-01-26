/**
 * STT API Composable
 * Direct client-side Agora STT API calls for testing/demo purposes
 * 
 * WARNING: In production, you should call your backend instead of directly
 * calling Agora API from the client to protect your credentials.
 */

import { ref, computed } from 'vue'

// Types
export interface SttConfig {
  channelName: string
  uid: string
  token?: string
  language?: string
}

export interface SttTaskInfo {
  taskId: string
  status: 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error'
  error?: string
}

// Agora STT API configuration
const AGORA_API_BASE = 'https://api.agora.io/v1/projects'

export function useSttApi() {
  const taskInfo = ref<SttTaskInfo>({
    taskId: '',
    status: 'idle'
  })

  const isRunning = computed(() => taskInfo.value.status === 'running')
  const isLoading = computed(() => 
    taskInfo.value.status === 'starting' || taskInfo.value.status === 'stopping'
  )

  // Get credentials from env
  const appId = import.meta.env.VITE_AGORA_APP_ID
  const customerId = import.meta.env.VITE_AGORA_CUSTOMER_ID
  const customerSecret = import.meta.env.VITE_AGORA_CUSTOMER_SECRET

  /**
   * Generate Basic Auth header for Agora REST API
   */
  function getAuthHeader(): string {
    const credentials = btoa(`${customerId}:${customerSecret}`)
    return `Basic ${credentials}`
  }

  /**
   * Acquire a builder token for STT (required before starting)
   */
  async function acquireBuilderToken(instanceId: string): Promise<string> {
    const url = `${AGORA_API_BASE}/${appId}/rtsc/speech-to-text/builderTokens`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ instanceId })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to acquire builder token: ${error}`)
    }

    const data = await response.json()
    return data.tokenName
  }

  /**
   * Start STT service for a channel
   */
  async function startStt(config: SttConfig): Promise<string> {
    if (!customerId || !customerSecret) {
      throw new Error('Missing Agora customer credentials. Set VITE_AGORA_CUSTOMER_ID and VITE_AGORA_CUSTOMER_SECRET in .env')
    }

    taskInfo.value.status = 'starting'
    taskInfo.value.error = undefined

    try {
      // Generate unique instance ID
      const instanceId = `stt_${Date.now()}`

      // Step 1: Acquire builder token
      const builderToken = await acquireBuilderToken(instanceId)

      // Step 2: Start the STT task
      const url = `${AGORA_API_BASE}/${appId}/rtsc/speech-to-text/tasks?builderToken=${builderToken}`
      
      // Use a dedicated UID for the STT bot (should be different from users)
      const sttBotUid = config.uid || '999999'
      
      const requestBody = {
        audio: {
          subscribeSource: 'AGORARTC',
          agoraRtcConfig: {
            channelName: config.channelName,
            uid: sttBotUid,
            token: config.token || null, // Use null for testing without token
            channelType: 'LIVE_TYPE',
            subscribeConfig: {
              subscribeMode: 'CHANNEL_MODE'
            },
            maxIdleTime: 60
          }
        },
        config: {
          features: ['RECOGNIZE'],
          recognizeConfig: {
            language: config.language || 'en-US',
            model: 'Model',
            connectionTimeout: 60,
            output: {
              destinations: ['AgoraRTCDataStream'],
              agoraRTCDataStream: {
                channelName: config.channelName,
                uid: sttBotUid,
                token: config.token || null
              }
            }
          }
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to start STT: ${error}`)
      }

      const data = await response.json()
      taskInfo.value.taskId = data.taskId
      taskInfo.value.status = 'running'

      console.log('[STT] Started task:', data.taskId)
      return data.taskId

    } catch (error) {
      taskInfo.value.status = 'error'
      taskInfo.value.error = (error as Error).message
      console.error('[STT] Start failed:', error)
      throw error
    }
  }

  /**
   * Stop STT service
   */
  async function stopStt(): Promise<void> {
    if (!taskInfo.value.taskId) {
      console.warn('[STT] No active task to stop')
      return
    }

    taskInfo.value.status = 'stopping'

    try {
      const url = `${AGORA_API_BASE}/${appId}/rtsc/speech-to-text/tasks/${taskInfo.value.taskId}`
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader()
        }
      })

      if (!response.ok && response.status !== 404) {
        const error = await response.text()
        throw new Error(`Failed to stop STT: ${error}`)
      }

      console.log('[STT] Stopped task:', taskInfo.value.taskId)
      taskInfo.value.taskId = ''
      taskInfo.value.status = 'stopped'

    } catch (error) {
      taskInfo.value.status = 'error'
      taskInfo.value.error = (error as Error).message
      console.error('[STT] Stop failed:', error)
      throw error
    }
  }

  /**
   * Query STT task status
   */
  async function querySttStatus(): Promise<unknown> {
    if (!taskInfo.value.taskId) {
      return null
    }

    try {
      const url = `${AGORA_API_BASE}/${appId}/rtsc/speech-to-text/tasks/${taskInfo.value.taskId}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader()
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to query STT status`)
      }

      return await response.json()

    } catch (error) {
      console.error('[STT] Query failed:', error)
      throw error
    }
  }

  /**
   * Toggle STT on/off
   */
  async function toggleStt(config: SttConfig): Promise<void> {
    if (isRunning.value) {
      await stopStt()
    } else {
      await startStt(config)
    }
  }

  /**
   * Reset state
   */
  function reset() {
    taskInfo.value = {
      taskId: '',
      status: 'idle'
    }
  }

  return {
    // State
    taskInfo,
    isRunning,
    isLoading,

    // Actions
    startStt,
    stopStt,
    toggleStt,
    querySttStatus,
    reset
  }
}
