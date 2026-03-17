// @ts-nocheck
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorageSync } from '../../composables/modules/useStorageSync'

export const useChatStore = defineStore('chat', () => {
  // 基础状态
  const sessionId = ref('')
  const sessionTitle = ref('')
  const sessionDescribe = ref('')
  const examples = ref([])
  const messages = ref([])
  const loading = ref(false)
  const inputValue = ref('')
  const sessionList = ref([])
  const currentSessionIndex = ref(-1)

  // 使用通用 Hook 管理存储
  const { state: storageState, initFromStorage, saveToStorage } = useStorageSync('chatData', {
    sessionId: '',
    sessionTitle: '',
    sessionDescribe: '',
    examples: [],
    messages: []
  })

  // 计算属性
  const currentSession = computed(() => {
    if (currentSessionIndex.value >= 0 && currentSessionIndex.value < sessionList.value.length) {
      return sessionList.value[currentSessionIndex.value]
    }
    return null
  })

  // 设置方法
  function setSessionId(id) {
    sessionId.value = id
    storageState.value.sessionId = id
  }

  function setSessionData(data) {
    sessionTitle.value = data.title || ''
    sessionDescribe.value = data.describe || ''
    examples.value = data.examples || []
    storageState.value.sessionTitle = sessionTitle.value
    storageState.value.sessionDescribe = sessionDescribe.value
    storageState.value.examples = examples.value
  }

  function setMessages(msgs) {
    messages.value = msgs
    storageState.value.messages = msgs
  }

  function setExamples(exs) {
    examples.value = exs
    storageState.value.examples = exs
  }

  function addMessage(msg) {
    messages.value.push(msg)
    storageState.value.messages = messages.value
  }

  function setLoading(value) {
    loading.value = value
  }

  function setInputValue(value) {
    inputValue.value = value
  }

  function setSessionList(list) {
    sessionList.value = list
  }

  function addSession(session) {
    sessionList.value.unshift(session)
    currentSessionIndex.value = 0
  }

  function removeSession(index) {
    if (index >= 0 && index < sessionList.value.length) {
      sessionList.value.splice(index, 1)
      if (currentSessionIndex.value === index) {
        currentSessionIndex.value = -1
        sessionId.value = ''
        messages.value = []
      } else if (currentSessionIndex.value > index) {
        currentSessionIndex.value--
      }
    }
  }

  function selectSession(index) {
    if (index >= 0 && index < sessionList.value.length) {
      currentSessionIndex.value = index
      const session = sessionList.value[index]
      sessionId.value = session.sessionId
      sessionTitle.value = session.title || ''
    }
  }

  function updateSessionTitle(index, title) {
    if (index >= 0 && index < sessionList.value.length) {
      sessionList.value[index].title = title
    }
  }

  function clearCurrentSession() {
    sessionId.value = ''
    sessionTitle.value = ''
    sessionDescribe.value = ''
    examples.value = []
    messages.value = []
    currentSessionIndex.value = -1
    storageState.value = {
      sessionId: '',
      sessionTitle: '',
      sessionDescribe: '',
      examples: [],
      messages: []
    }
  }

  // 保存到本地存储
  function persistToStorage() {
    storageState.value = {
      sessionId: sessionId.value,
      sessionTitle: sessionTitle.value,
      sessionDescribe: sessionDescribe.value,
      examples: examples.value,
      messages: messages.value
    }
    saveToStorage()
  }

  return {
    // 状态
    sessionId,
    sessionTitle,
    sessionDescribe,
    examples,
    messages,
    loading,
    inputValue,
    sessionList,
    currentSessionIndex,
    currentSession,
    // 方法
    setSessionId,
    setSessionData,
    setMessages,
    setExamples,
    addMessage,
    setLoading,
    setInputValue,
    setSessionList,
    addSession,
    removeSession,
    selectSession,
    updateSessionTitle,
    clearCurrentSession,
    persistToStorage,
    initFromStorage
  }
})

