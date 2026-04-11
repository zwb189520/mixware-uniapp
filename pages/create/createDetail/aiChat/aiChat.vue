<template>
  <view class="chat-page">
    <safe-area />
    <custom-navbar :title="languageStore.texts.create.aiChat" @back="goBack"> </custom-navbar>
    <scroll-view
      class="message-list"
      scroll-y
      :scroll-with-animation="true"
      :scroll-into-view="scrollIntoView"
    >
      <view
        v-for="(msg, index) in messages"
        :key="msg.id"
        :id="`msg-${msg.id}`"
        class="message-row"
        :class="msg.role === 'user' ? 'from-user' : 'from-ai'"
      >
        <view class="avatar">{{ msg.role === 'user' ? texts.me : texts.ai }}</view>
        <view class="bubble-wrapper">
          <view class="bubble">
            <mp-html
              v-if="msg.role !== 'user'"
              :content="
                msg.html ||
                msg.content ||
                (loading && index === messages.length - 1 ? texts.replying : '')
              "
            />
            <text v-else class="bubble-text">
              {{ msg.content || (loading && index === messages.length - 1 ? texts.replying : '') }}
            </text>
          </view>
          <view
            v-if="msg.role !== 'user' && msg.showSaveBtn && msg.images && msg.images.length > 0"
            class="save-btn"
            @tap="saveImages(msg.images)"
          >
            <uni-icons type="download" size="16" color="#fff"></uni-icons>
            <text>{{ texts.saveImage || '保存图片' }}</text>
          </view>
        </view>
      </view>

      <view
        v-if="!loadingSession && examples.length > 0 && messages.length === 0"
        class="examples-section"
      >
        <view
          v-for="(example, idx) in examples"
          :key="idx"
          class="example-card"
          @tap="useExample(example)"
        >
          <text class="example-title">{{ example.title }}</text>
          <text class="example-desc">{{ example.describe }}</text>
        </view>
      </view>

      <view :id="bottomAnchorId" class="bottom-anchor"></view>
    </scroll-view>

    <view class="input-bar">
      <view
        class="voice-btn"
        :class="{ recording: isRecording }"
        @touchstart="startRecord"
        @touchend="stopRecord"
        @touchcancel="cancelRecord"
      >
        <uni-icons
          :type="isRecording ? 'mic-filled' : 'mic'"
          size="22"
          :color="isRecording ? '#FF5A00' : '#666'"
        ></uni-icons>
      </view>
      <input
        class="input"
        type="text"
        v-model="inputValue"
        :placeholder="texts.placeholder"
        @confirm="sendMessage"
        confirm-type="send"
        :disabled="loading"
        :adjust-position="false"
      />
      <button v-if="loading" class="stop-btn" @tap="stopStream">{{ texts.stop }}</button>
      <button v-else class="send-btn" :disabled="!inputValue.trim()" @tap="sendMessage">
        {{ texts.send }}
      </button>
    </view>
  </view>
</template>

<script lang="ts">
import { chatStream, stopChat } from '@/api/chat.ts'
import { audioOffline } from '@/api/audio.ts'
import { post } from '@/api/request.ts'
import {
  getSessionMessages,
  setCurrentSession,
  getHotExamples,
  getSessionDetail
} from '@/api/session.ts'
import { asyncTextToImg, queryTextToImgTask } from '@/api/text2img.ts'
import MarkdownIt from 'markdown-it'
import mpHtml from '@/components/mp-html/mp-html.vue'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useChatStore } from '@/stores/index.ts'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/index.ts'

interface Message {
  id: string
  role: string
  content: string
  html?: string
  images?: string[]
  showSaveBtn?: boolean
}

interface Example {
  title?: string
  describe?: string
}

export default {
  components: {
    mpHtml,
    CustomNavbar,
    SafeArea
  },
  setup() {
    const chatStore = useChatStore()
    const languageStore = useLanguageStore()
    const { sessionId, sessionTitle, sessionDescribe, examples, messages, loading, inputValue } =
      storeToRefs(chatStore)

    return {
      chatStore,
      languageStore,
      sessionId,
      sessionTitle,
      sessionDescribe,
      examples,
      messages,
      loading,
      inputValue
    }
  },
  data() {
    return {
      scrollIntoView: '' as string,
      bottomAnchorId: 'chat-bottom-anchor' as string,
      streamController: null as any,
      partialBuffer: '' as string,
      loadingSession: false as boolean,
      md: null as any,
      lastRenderTime: 0 as number,
      renderThrottle: 50 as number,
      pendingRender: false as boolean,
      renderTimer: null as any,
      isRecording: false as boolean,
      recorderManager: null as any
    }
  },
  computed: {
    texts(): any {
      return this.languageStore.texts.create
    }
  },
  async onLoad(options: any): Promise<void> {
    this.md = new MarkdownIt({
      html: false,
      linkify: true,
      breaks: true
    })
    this.chatStore.initFromStorage()
    this.languageStore.loadLanguage()

    this.loadHotExamples()
    if (options && options.sessionId) {
      this.chatStore.setSessionId(options.sessionId)
      try {
        const res: any = await setCurrentSession(options.sessionId)
        console.log('设置当前会话结果:', res)
        if (res.code === 1 || res.code === 0) {
          await this.loadSessionDetail(options.sessionId)
          await this.loadHistory()
        } else {
          console.error('设置当前会话失败:', res.msg)
        }
      } catch (error: any) {
        console.error('设置当前会话失败:', error)
      }
    } else {
      await this.fetchSession()
    }
    this.scrollToBottom()
  },
  onUnload(): void {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer)
      this.renderTimer = null
    }
  },
  methods: {
    loadSessionFromStorage(): boolean {
      try {
        const storedSessionId = uni.getStorageSync('aiChatSessionId')
        const storedSessionData = uni.getStorageSync('aiChatSessionData')

        if (storedSessionId && storedSessionData) {
          this.chatStore.setSessionId(storedSessionId)
          this.chatStore.setSessionData(storedSessionData)
          return true
        }
      } catch (e: any) {
        console.warn(this.texts.loadSessionFailed, e)
      }
      return false
    },

    saveSessionToStorage(sessionId: string, sessionData: any): void {
      try {
        uni.setStorageSync('aiChatSessionId', sessionId)
        uni.setStorageSync('aiChatSessionData', {
          title: sessionData.title || '',
          describe: sessionData.describe || '',
          examples: sessionData.examples || []
        })
      } catch (e: any) {
        console.warn(this.texts.saveSessionFailed, e)
      }
    },

    async loadHistory(): Promise<void> {
      if (!this.sessionId) {
        this.chatStore.setMessages([])
        return
      }

      try {
        const res: any = await getSessionMessages(this.sessionId)

        const data = res.data || res
        const historyList = data?.list || data?.messages || data || []

        if (Array.isArray(historyList) && historyList.length > 0) {
          const messages: Message[] = historyList.map((item: any, index: number) => ({
            id: item.id || `msg-${Date.now()}-${index}`,
            role: item.role || item.type || 'assistant',
            content: item.content || item.message || '',
            html: this.md
              ? this.md.render(item.content || item.message || '')
              : item.content || item.message || ''
          }))
          this.chatStore.setMessages(messages)
        } else {
          this.chatStore.setMessages([])
        }
      } catch (err: any) {
        console.error(this.texts.loadHistoryFailed, err)
        this.chatStore.setMessages([])
      }
    },

    async fetchSession(): Promise<void> {
      if (this.loadSessionFromStorage()) {
        await this.loadHistory()
        return
      }

      try {
        const res: any = await post('/session')
        const data = res.data || res

        if (data && data.sessionId) {
          this.chatStore.setSessionId(data.sessionId)
          this.chatStore.setSessionData({
            title: data.title || '',
            describe: data.describe || '',
            examples: data.examples || []
          })

          this.saveSessionToStorage(data.sessionId, {
            title: data.title || '',
            describe: data.describe || '',
            examples: data.examples || []
          })

          await this.loadHistory()
        } else {
          this.chatStore.setMessages([])
        }
      } catch (err: any) {
        console.error(this.texts.fetchSessionFailed, err)
        this.chatStore.setMessages([])
      }
    },
    goBack(): void {
      uni.navigateBack({
        delta: 3
      })
    },
    goToSessionList(): void {
      uni.navigateTo({
        url: '/pages/create/createDetail/sessionList/sessionList'
      })
    },

    async loadSessionDetail(sessionId: string): Promise<void> {
      try {
        const res: any = await getSessionDetail(sessionId)
        if (res.code === 1 || res.code === 0) {
          const data = res.data || {}
          this.chatStore.sessionTitle = data.title || ''
          this.chatStore.sessionDescribe = data.describe || ''
        }
      } catch (error: any) {
        console.error('加载会话详情失败:', error)
      }
    },

    async loadHotExamples(): Promise<void> {
      try {
        const res: any = await getHotExamples(5)
        console.log('热门示例完整响应:', JSON.stringify(res))
        if (res.code === 1 || res.code === 0) {
          let data = res.data

          if (Array.isArray(data)) {
          } else if (data && Array.isArray(data.list)) {
            data = data.list
          } else if (data && Array.isArray(data.records)) {
            data = data.records
          } else if (data && Array.isArray(data.examples)) {
            data = data.examples
          } else if (data && Array.isArray(data.data)) {
            data = data.data
          } else {
            data = []
          }

          console.log('设置热门示例:', data)
          this.chatStore.setExamples(data)
        } else {
          console.warn('热门示例响应码异常:', res.code, res.msg)
          this.chatStore.setExamples([])
        }
      } catch (error: any) {
        console.error('加载热门示例失败:', error)
        this.chatStore.setExamples([])
      }
    },
    scrollToBottom(): void {
      this.$nextTick(() => {
        const anchor = `chat-bottom-anchor-${Date.now()}`
        this.bottomAnchorId = anchor
        this.scrollIntoView = anchor
      })
    },
    throttledRender(aiMsg: Message): void {
      const now = Date.now()
      const timeSinceLastRender = now - this.lastRenderTime

      if (timeSinceLastRender >= this.renderThrottle) {
        this.lastRenderTime = now
        if (this.md && aiMsg) {
          aiMsg.html = this.md.render(aiMsg.content || '')
        }
        this.$forceUpdate()
        this.scrollToBottom()
        this.pendingRender = false
      } else {
        this.pendingRender = true

        if (this.renderTimer) {
          clearTimeout(this.renderTimer)
        }

        this.renderTimer = setTimeout(() => {
          if (this.pendingRender && aiMsg) {
            this.lastRenderTime = Date.now()
            if (this.md) {
              aiMsg.html = this.md.render(aiMsg.content || '')
            }
            this.$forceUpdate()
            this.scrollToBottom()
            this.pendingRender = false
          }
        }, this.renderThrottle - timeSinceLastRender)
      }
    },
    async stopStream(): Promise<void> {
      if (this.streamController && typeof this.streamController.abort === 'function') {
        this.streamController.abort()
      }
      this.chatStore.setLoading(false)

      if (this.sessionId) {
        try {
          await stopChat(this.sessionId)
          console.log(this.texts.chatStopped)
        } catch (err: any) {
          console.error(this.texts.stopChatFailed, err)
        }
      }
    },
    useExample(example: Example): void {
      if (example && example.describe) {
        this.inputValue = example.describe
        this.sendMessage()
      }
    },
    sendMessage(): void {
      const content = (this.inputValue || '').trim()
      if (!content || this.loading) return

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content
      }
      this.chatStore.addMessage(userMsg)
      this.chatStore.setInputValue('')

      const imageKeywords = [
        '图片',
        '画',
        '画图',
        '生成图片',
        '文生图',
        '画一张',
        '画一个',
        '画一幅'
      ]
      const needImage = imageKeywords.some(keyword => content.includes(keyword))

      if (needImage) {
        this.generateImage(content)
        return
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: '',
        html: ''
      }
      this.chatStore.addMessage(aiMsg)
      this.chatStore.setLoading(true)
      this.scrollToBottom()

      const history = this.messages
        .slice(0, this.messages.length - 1)
        .map((item: any) => ({ role: item.role, content: item.content }))

      this.streamController = chatStream(content, this.sessionId, {
        onMessage: (chunk: string) => {
          this.partialBuffer += chunk || ''
          this.partialBuffer = this.partialBuffer.replace(/\}\s*\{/g, '}\n{')
          const parts = this.partialBuffer.split('\n')
          this.partialBuffer = parts.pop() || ''

          let hasNewContent = false
          parts.forEach((line: string) => {
            const text = line.trim()
            if (!text) return
            let appended = false
            try {
              const obj = JSON.parse(text)
              if (
                obj &&
                obj.eventData &&
                (obj.eventType === 1001 || obj.eventType === '1001' || obj.eventType === undefined)
              ) {
                aiMsg.content += obj.eventData
                appended = true
                hasNewContent = true
              }
            } catch (e: any) {}
            if (!appended) {
              aiMsg.content += text
              hasNewContent = true
            }
          })

          if (hasNewContent) {
            this.throttledRender(aiMsg)
          }
        },
        onError: (err: any) => {
          this.chatStore.setLoading(false)
        },
        onComplete: () => {
          if (this.renderTimer) {
            clearTimeout(this.renderTimer)
            this.renderTimer = null
          }

          if (this.partialBuffer.trim()) {
            try {
              const obj = JSON.parse(this.partialBuffer.trim())
              if (obj && obj.eventData) {
                aiMsg.content += obj.eventData
              } else {
                aiMsg.content += this.partialBuffer
              }
            } catch (e: any) {
              aiMsg.content += this.partialBuffer
            }
            this.partialBuffer = ''
          }

          if (this.md) {
            aiMsg.html = this.md.render(aiMsg.content || '')
          }
          this.$forceUpdate()
          this.scrollToBottom()

          this.chatStore.setLoading(false)
          this.streamController = null
          this.pendingRender = false
        }
      })
    },

    async generateImage(prompt: string): Promise<void> {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: this.texts.generatingImage || '正在生成图片...',
        html: ''
      }
      this.chatStore.addMessage(aiMsg)
      this.chatStore.setLoading(true)
      this.scrollToBottom()

      try {
        const res: any = await asyncTextToImg(prompt)
        if (res.code === 1 || res.code === 0) {
          const taskId = res.data?.taskId
          if (taskId) {
            await this.pollImageTask(taskId, aiMsg)
          } else {
            aiMsg.content = this.texts.imageGenerateFailed || '图片生成失败，请重试'
            aiMsg.html = aiMsg.content
          }
        } else {
          aiMsg.content = res.msg || this.texts.imageGenerateFailed || '图片生成失败'
          aiMsg.html = aiMsg.content
        }
      } catch (error: any) {
        console.error('生成图片失败:', error)
        aiMsg.content = this.texts.imageGenerateFailed || '图片生成失败，请重试'
        aiMsg.html = aiMsg.content
      } finally {
        this.chatStore.setLoading(false)
        this.$forceUpdate()
        this.scrollToBottom()
      }
    },

    async pollImageTask(taskId: string, aiMsg: Message): Promise<void> {
      const maxAttempts = 30
      const interval = 2000
      let attempts = 0

      while (attempts < maxAttempts) {
        try {
          const res: any = await queryTextToImgTask(taskId)
          if (res.code === 1 || res.code === 0) {
            const data = res.data
            console.log('任务状态:', data.status, 'images:', data.images)
            if (
              data.status &&
              (data.status === 'SUCCESS' ||
                data.status === 'success' ||
                data.status.startsWith('SUCC'))
            ) {
              const images = data.images || []
              if (images.length > 0) {
                aiMsg.images = images
                aiMsg.content = images
                  .map(
                    (img: string, idx: number) =>
                      `<img src="${img}" data-idx="${idx}" style="max-width:100%;border-radius:8px;margin:8px 0;">`
                  )
                  .join('')
                aiMsg.html = aiMsg.content
                aiMsg.showSaveBtn = true
              } else {
                aiMsg.content = '图片生成失败，请重试'
                aiMsg.html = aiMsg.content
              }
              return
            } else if (
              data.status &&
              (data.status === 'FAILED' ||
                data.status === 'failed' ||
                data.status.startsWith('FAIL'))
            ) {
              aiMsg.content = '图片生成失败，请重试'
              aiMsg.html = aiMsg.content
              return
            }
          }
        } catch (error: any) {
          console.error('查询任务状态失败:', error)
        }
        attempts++
        if (attempts < maxAttempts) {
          await new Promise<void>(resolve => setTimeout(resolve, interval))
        }
      }
      aiMsg.content = '图片生成超时，请重试'
      aiMsg.html = aiMsg.content
    },

    async saveImages(images: string[]): Promise<void> {
      if (!images || images.length === 0) return

      uni.showLoading({ title: this.texts.saving || '保存中...' })

      try {
        for (let i = 0; i < images.length; i++) {
          const imgUrl = images[i]
          const downloadRes: any = await uni.downloadFile({ url: imgUrl })
          if (downloadRes.statusCode === 200) {
            await uni.saveImageToPhotosAlbum({ filePath: downloadRes.tempFilePath })
          }
        }
        uni.hideLoading()
        uni.showToast({ title: this.texts.saveSuccess || '保存成功', icon: 'success' })
      } catch (error: any) {
        uni.hideLoading()
        console.error('保存图片失败:', error)
        uni.showToast({ title: this.texts.saveFailed || '保存失败', icon: 'none' })
      }
    },
    initRecorder(): void {
      if (!this.recorderManager) {
        this.recorderManager = uni.getRecorderManager()
        this.recorderManager.onStop(async (res: any) => {
          if (res.duration < 500) {
            uni.showToast({ title: this.texts.recordingTooShort || '录音时间太短', icon: 'none' })
            return
          }
          uni.showLoading({ title: this.texts.recognizing || '识别中...' })
          try {
            const result: any = await audioOffline(res.tempFilePath)
            uni.hideLoading()
            if (result.code === 1 || result.code === 0) {
              this.inputValue = result.data || ''
              if (this.inputValue.trim()) {
                this.sendMessage()
              }
            } else {
              uni.showToast({
                title: result.msg || this.texts.recognitionFailed || '识别失败',
                icon: 'none'
              })
            }
          } catch (err: any) {
            uni.hideLoading()
            console.error('语音识别失败:', err)
            uni.showToast({ title: this.texts.recognitionFailed || '识别失败', icon: 'none' })
          }
        })
      }
    },
    startRecord(): void {
      this.initRecorder()
      this.recorderManager.start({
        format: 'mp3',
        duration: 60000
      })
      this.isRecording = true
    },
    stopRecord(): void {
      if (this.isRecording) {
        this.recorderManager.stop()
        this.isRecording = false
      }
    },
    cancelRecord(): void {
      if (this.isRecording) {
        this.recorderManager.stop()
        this.isRecording = false
      }
    }
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  background: #fff9f5;
  overflow: hidden;
}

.chat-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff9f5;
  z-index: -1;
}

.message-list {
  flex: 1;
  padding: 12px 12px 80px;
  box-sizing: border-box;
  background: transparent;
  overflow-y: auto;
}

.message-row {
  display: flex;
  margin-bottom: 12px;
}

.message-row.from-user {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #ff5a00;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
  flex-shrink: 0;
}

.from-user .avatar {
  background: #7ed321;
}

.bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
  align-items: flex-start;
}

.from-user .bubble-wrapper {
  align-items: flex-end;
}

.bubble {
  max-width: 75%;
  padding: 10px 12px;
  border-radius: 12px;
  background: #ffffff;
  font-size: 15px;
  line-height: 1.5;
  color: #222;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  white-space: pre-wrap;
}

.from-user .bubble {
  background: #7ed321;
  color: #fff;
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #ff5a00;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #fff;
  margin-top: 12rpx;
  align-self: flex-start;
}

.bottom-anchor {
  height: 1px;
}

.input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #ffffff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  gap: 8px;
  z-index: 2;
}

.voice-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
}

.voice-btn.recording {
  background: #fff0e6;
}

.input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #f8fafc;
  font-size: 14px;
}

.send-btn,
.stop-btn {
  width: 68px;
  height: 40px;
  line-height: 40px;
  padding: 0;
  border-radius: 20px;
  font-size: 14px;
  margin: 0;
}

.send-btn::after,
.stop-btn::after {
  border: none;
}

.send-btn {
  background: #ff5a00;
  color: #fff;
}

.send-btn:disabled {
  opacity: 0.6;
}

.stop-btn {
  background: #ffd600;
  color: #fff;
}

.examples-section {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.example-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s;
}

.example-card:active {
  background: #f8fafc;
  transform: scale(0.98);
}

.example-title {
  font-size: 15px;
  font-weight: 600;
  color: #ff5a00;
}

.example-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.session-list-btn {
  padding: 10rpx 20rpx;
}
</style>
