<template>
  <view class="chat-page">
    <safe-area />
    <custom-navbar :title="texts.chat" @back="handleBack">
      <template #right>
        <uni-icons type="more-filled" size="24" @click="handleMore"></uni-icons>
      </template>
    </custom-navbar>
    
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

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { API } from '@/constants/index.js'
import { useLanguageStore } from '@/stores'

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
      bottomAnchorId: 'chat-bottom-anchor'
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
        
        const token = uni.getStorageSync('token') || ''
        const url = `http://app.mixwarebot.cn:8080/api/hunyuan3d/text-to-model?prompt=${encodeURIComponent(content)}`
        
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: url,
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            success: (response) => {
              resolve(response.data)
            },
            fail: (error) => {
              reject(error)
            }
          })
        })
        
        uni.hideLoading()
        
        console.log('文生模型响应:', res)
        console.log('响应数据详情:', JSON.stringify(res))
        
        if ((res.code === 0 || res.code === 1) && res.data && res.data.JobId) {
          const jobId = res.data.JobId
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
              url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${jobId}&name=生成的3D模型&prompt=${encodeURIComponent(content)}`
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
	min-width: 76px;
	height: 40px;
	padding: 0 12px;
	border: none;
	border-radius: 20px;
	font-size: 14px;
}

.send-btn {
	background: #FF5A00;
	color: #fff;
}

.send-btn:disabled {
	opacity: 0.6;
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
