import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorageSync } from '../../composables/modules/useStorageSync'

interface Message {
  role: string
  content: string
  [key: string]: any
}

interface Example {
  title?: string
  describe?: string
}

interface Session {
  sessionId: string
  title?: string
  describe?: string
  examples?: Example[]
  [key: string]: any
}

interface StorageState {
  sessionId: string
  sessionTitle: string
  sessionDescribe: string
  examples: Example[]
  messages: Message[]
}

export const useChatStore = defineStore('chat', () => {
  const sessionId = ref<string>('')
  const sessionTitle = ref<string>('')
  const sessionDescribe = ref<string>('')
  const examples = ref<Example[]>([])
  const messages = ref<Message[]>([])
  const loading = ref<boolean>(false)
  const inputValue = ref<string>('')
  const sessionList = ref<Session[]>([])
  const currentSessionIndex = ref<number>(-1)

  const {
    state: storageState,
    initFromStorage,
    saveToStorage
  } = useStorageSync<StorageState>('chatData', {
    sessionId: '',
    sessionTitle: '',
    sessionDescribe: '',
    examples: [],
    messages: []
  })

  const currentSession = computed(() => {
    if (currentSessionIndex.value >= 0 && currentSessionIndex.value < sessionList.value.length) {
      return sessionList.value[currentSessionIndex.value]
    }
    return null
  })

  function setSessionId(id: string): void {
    sessionId.value = id
    storageState.value.sessionId = id
  }

  function setSessionData(data: { title?: string; describe?: string; examples?: Example[] }): void {
    sessionTitle.value = data.title || ''
    sessionDescribe.value = data.describe || ''
    examples.value = data.examples || []
    storageState.value.sessionTitle = sessionTitle.value
    storageState.value.sessionDescribe = sessionDescribe.value
    storageState.value.examples = examples.value
  }

  function setMessages(msgs: Message[]): void {
    messages.value = msgs
    storageState.value.messages = msgs
  }

  function setExamples(exs: Example[]): void {
    examples.value = exs
    storageState.value.examples = exs
  }

  function addMessage(msg: Message): void {
    messages.value.push(msg)
    storageState.value.messages = messages.value
  }

  function setLoading(value: boolean): void {
    loading.value = value
  }

  function setInputValue(value: string): void {
    inputValue.value = value
  }

  function setSessionList(list: Session[]): void {
    sessionList.value = list
  }

  function addSession(session: Session): void {
    sessionList.value.unshift(session)
    currentSessionIndex.value = 0
  }

  function removeSession(index: number): void {
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

  function selectSession(index: number): void {
    if (index >= 0 && index < sessionList.value.length) {
      currentSessionIndex.value = index
      const session = sessionList.value[index]
      sessionId.value = session.sessionId
      sessionTitle.value = session.title || ''
    }
  }

  function updateSessionTitle(index: number, title: string): void {
    if (index >= 0 && index < sessionList.value.length) {
      sessionList.value[index].title = title
    }
  }

  function clearCurrentSession(): void {
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

  function persistToStorage(): void {
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
