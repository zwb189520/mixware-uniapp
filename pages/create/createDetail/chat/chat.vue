<template>
  <view class="chat-page">
    <safe-area />
    <custom-navbar :title="texts.chat" @back="handleBack" />
    
    <scroll-view class="message-list" scroll-y :scroll-with-animation="true" :scroll-into-view="scrollIntoView">
      <view
        v-for="(msg, index) in messages"
        :key="msg.id"
        :id="`msg-${msg.id}`"
        class="message-row"
        :class="msg.role === 'user' ? 'from-user' : 'from-ai'"
      >
        <view class="avatar">{{ msg.role === 'user' ? texts.me : texts.ai }}</view>
        <view class="bubble">
          <text class="bubble-text">{{ msg.content }}</text>
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
        <uni-icons :type="isRecording ? 'mic-filled' : 'mic'" size="22" :color="isRecording ? '#FF5A00' : '#666'"></uni-icons>
      </view>
      <input
        class="input"
        type="text"
        v-model="promptText"
        :placeholder="texts.promptPlaceholder"
        @confirm="handleGenerate3D"
        confirm-type="send"
        :disabled="isGenerating"
        :adjust-position="false"
      />
      <button
        v-if="isGenerating"
        class="stop-btn"
        @tap="handleStop"
      >{{ texts.stop }}</button>
      <button
        v-else
        class="send-btn"
        :disabled="!promptText.trim()"
        @tap="handleGenerate3D"
      >{{ texts.send }}</button>
    </view>
  </view>
</template>

<script lang="ts">
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { textToModel } from '@/api/hunyuan3d.ts'
import { createModelTask, updateModelTask } from '@/api/modelTasks.ts'
import { audioOffline } from '@/api/audio.ts'
import { useLanguageStore } from '@/stores/index.ts'

export default {
  components: {
    CustomNavbar,
    SafeArea
  },
  data() {
    return {
      promptText: '',
      isGenerating: false,
      messages: [],
      scrollIntoView: '',
      bottomAnchorId: 'chat-bottom-anchor',
      isRecording: false,
      recorderManager: null
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.create
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleMore() {
      uni.showActionSheet({
        itemList: [this.texts.share, this.texts.report, this.texts.help],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              uni.showShareMenu()
              break
            case 1:
              uni.showToast({ title: this.texts.reportSuccess, icon: 'success' })
              break
            case 2:
              uni.showToast({ title: this.texts.helpInDev, icon: 'none' })
              break
          }
        }
      })
    },
    async handleGenerate3D() {
      const content = this.promptText.trim()
      if (!content) {
        uni.showToast({
          title: this.texts.pleaseInputPrompt,
          icon: 'none'
        })
        return
      }
      
      this.isGenerating = true
      
      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content
      }
      this.messages.push(userMsg)
      this.promptText = ''
      this.scrollToBottom()
      
      try {
        uni.showLoading({
          title: this.texts.generating3D
        })
        
        const res = await textToModel(content)
        
        uni.hideLoading()
        
        console.log('文生模型响应:', res)
        console.log('响应数据详情:', JSON.stringify(res))
        
        if ((res.code === 0 || res.code === 1) && res.data && (res.data.taskId || res.data.JobId || res.data.RequestId)) {
          const jobId = res.data.taskId || res.data.JobId || res.data.RequestId

          try {
            const taskRes = await createModelTask({
              sourceModelUrl: '',
              previewUrl: '',
              scaleFactor: 1
            })
            if ((taskRes as any).code === 1 && (taskRes as any).data?.taskId) {
              await updateModelTask({
                taskId: (taskRes as any).data.taskId,
                jobId: jobId,
                sourceModelUrl: '',
                previewUrl: '',
                scaleFactor: 1
              })
            }
          } catch (e) {
            console.error('创建模型任务记录失败:', e)
          }

          const aiMsg = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: this.texts.modelGenerating
          }
          this.messages.push(aiMsg)
          this.scrollToBottom()

          uni.showToast({
            title: this.texts.modelGenerating,
            icon: 'success'
          })

          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${jobId}&name=生成的3D模型&prompt=${encodeURIComponent(content)}&source=hunyuan3d`
            })
          }, 1500)
        } else {
          const errorMsg = res.data?.message || res.msg || this.texts.generateFailed
          console.error('生成失败:', errorMsg, '完整响应:', res)
          
          const aiMsg = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: errorMsg
          }
          this.messages.push(aiMsg)
          this.scrollToBottom()
          
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        
        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: error.message || this.texts.generate3DFailed
        }
        this.messages.push(aiMsg)
        this.scrollToBottom()
        
        uni.showToast({
          title: error.message || this.texts.generate3DFailed,
          icon: 'none'
        })
      } finally {
        this.isGenerating = false
      }
    },
    handleStop() {
      this.isGenerating = false
      uni.hideLoading()
    },
    initRecorder() {
      if (!this.recorderManager) {
        this.recorderManager = uni.getRecorderManager()
        this.recorderManager.onStop(async (res) => {
          if (res.duration < 500) {
            uni.showToast({ title: this.texts.recordingTooShort || '录音时间太短', icon: 'none' })
            return
          }
          uni.showLoading({ title: this.texts.recognizing || '识别中...' })
          try {
            const result = await audioOffline(res.tempFilePath)
            uni.hideLoading()
            if (result.code === 1 || result.code === 0) {
              this.promptText = result.data || ''
              if (this.promptText.trim()) {
                this.handleGenerate3D()
              }
            } else {
              uni.showToast({ title: result.msg || this.texts.recognitionFailed || '识别失败', icon: 'none' })
            }
          } catch (err) {
            uni.hideLoading()
            console.error('语音识别失败:', err)
            uni.showToast({ title: this.texts.recognitionFailed || '识别失败', icon: 'none' })
          }
        })
      }
    },
    startRecord() {
      this.initRecorder()
      this.recorderManager.start({
        format: 'mp3',
        duration: 60000
      })
      this.isRecording = true
    },
    stopRecord() {
      if (this.isRecording) {
        this.recorderManager.stop()
        this.isRecording = false
      }
    },
    cancelRecord() {
      if (this.isRecording) {
        this.recorderManager.stop()
        this.isRecording = false
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const anchor = `chat-bottom-anchor-${Date.now()}`
        this.bottomAnchorId = anchor
        this.scrollIntoView = anchor
      })
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
	background: #FFF9F5;
	overflow: hidden;
}

.chat-page::before {
	content: '';
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: #FFF9F5;
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
	background: #FF5A00;
	color: #fff;
	font-size: 14px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 8px;
}

.from-user .avatar {
	background: #7ED321;
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
	background: #7ED321;
	color: #fff;
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
	background: #FF5A00;
	color: #fff;
}

.send-btn:disabled {
	opacity: 0.6;
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

.stop-btn {
	background: #FFD600;
	color: #fff;
}

.loading-session {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20px;
}

.loading-text {
	font-size: 14px;
	color: #999;
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
	color: #FF5A00;
}

.example-desc {
	font-size: 14px;
	color: #666;
	line-height: 1.5;
}
</style>


