import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const sessionId = ref('')
  const sessionTitle = ref('')
  const sessionDescribe = ref('')
  const examples = ref([])
  const messages = ref([])
  const loading = ref(false)
  const inputValue = ref('')

  function setSessionId(id) {
    sessionId.value = id
  }

  function setSessionData(data) {
    sessionTitle.value = data.title || ''
    sessionDescribe.value = data.describe || ''
    examples.value = data.examples || []
  }

  function setMessages(msgs) {
    messages.value = msgs
  }

  function addMessage(msg) {
    messages.value.push(msg)
  }

  function setLoading(value) {
    loading.value = value
  }

  function setInputValue(value) {
    inputValue.value = value
  }

  function saveToStorage() {
    try {
      uni.setStorageSync('chatData', {
        sessionId: sessionId.value,
        sessionTitle: sessionTitle.value,
        sessionDescribe: sessionDescribe.value,
        examples: examples.value,
        messages: messages.value
      })
    } catch (e) {
      console.warn('保存聊天数据到本地存储失败:', e)
    }
  }

  function initFromStorage() {
    try {
      const storedData = uni.getStorageSync('chatData')
      if (storedData) {
        if (storedData.sessionId) sessionId.value = storedData.sessionId
        if (storedData.sessionTitle) sessionTitle.value = storedData.sessionTitle
        if (storedData.sessionDescribe) sessionDescribe.value = storedData.sessionDescribe
        if (storedData.examples) examples.value = storedData.examples
        if (storedData.messages) messages.value = storedData.messages
      }
    } catch (e) {
      console.warn('从本地存储加载聊天数据失败:', e)
    }
  }

  return {
    sessionId,
    sessionTitle,
    sessionDescribe,
    examples,
    messages,
    loading,
    inputValue,
    setSessionId,
    setSessionData,
    setMessages,
    addMessage,
    setLoading,
    setInputValue,
    initFromStorage
  }
})
