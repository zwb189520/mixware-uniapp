<template>
	<view class="chat-page">
		<safe-area />
		<custom-navbar :title="languageStore.texts.create.aiChat" @back="goBack" />
		<scroll-view
			class="message-list"
			scroll-y
		:scroll-with-animation="true"
		:scroll-into-view="scrollIntoView"
		>
			<view v-if="loadingSession" class="loading-session">
				<text class="loading-text">{{ texts.loading }}</text>
			</view>
			
			<view
				v-for="(msg, index) in messages"
				:key="msg.id"
				:id="`msg-${msg.id}`"
				class="message-row"
				:class="msg.role === 'user' ? 'from-user' : 'from-ai'"
			>
				<view class="avatar">{{ msg.role === 'user' ? texts.me : texts.ai }}</view>
				<view class="bubble">
					<mp-html
						v-if="msg.role !== 'user'"
						:content="msg.html || msg.content || (loading && index === messages.length - 1 ? texts.replying : '')"
					/>
					<text v-else class="bubble-text">
						{{ msg.content || (loading && index === messages.length - 1 ? texts.replying : '') }}
					</text>
				</view>
			</view>
			
			<view v-if="!loadingSession && examples.length > 0 && messages.length === 0" class="examples-section">
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
			<button
				v-if="loading"
				class="stop-btn"
				@tap="stopStream"
			>{{ texts.stop }}</button>
			<button
				v-else
				class="send-btn"
				:disabled="!inputValue.trim()"
				@tap="sendMessage"
			>{{ texts.send }}</button>
		</view>
	</view>
</template>

<script>
	import streamRequest from '@/api/streamRequest.js'
	import { post } from '@/api/request.js'
	import MarkdownIt from 'markdown-it'
	import mpHtml from '@/components/mp-html/mp-html.vue'
	import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
	import SafeArea from '@/components/safe-area/safe-area.vue'
	import { useChatStore } from '@/stores/index.js'
	import { storeToRefs } from 'pinia'
	import { useLanguageStore } from '@/stores'

	export default {
		components: {
			mpHtml,
			CustomNavbar,
			SafeArea
		},
		setup() {
			const chatStore = useChatStore()
			const languageStore = useLanguageStore()
			const {
				sessionId,
				sessionTitle,
				sessionDescribe,
				examples,
				messages,
				loading,
				inputValue
			} = storeToRefs(chatStore)
			
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
				scrollIntoView: '',
				bottomAnchorId: 'chat-bottom-anchor',
				streamController: null,
				partialBuffer: '',
				loadingSession: true,
				md: null,
				lastRenderTime: 0,
				renderThrottle: 100,
				pendingRender: false,
				renderTimer: null
			}
		},
		computed: {
			texts() {
				return this.languageStore.texts.create
			}
		},
		async onLoad() {
			this.md = new MarkdownIt({
				html: false,
				linkify: true,
				breaks: true
			})
			this.chatStore.initFromStorage()
			this.languageStore.loadLanguage()
			await this.fetchSession()
			this.scrollToBottom()
		},
		onUnload() {
			if (this.renderTimer) {
				clearTimeout(this.renderTimer)
				this.renderTimer = null
			}
		},
		methods: {
			loadSessionFromStorage() {
				try {
					const storedSessionId = uni.getStorageSync('aiChatSessionId')
					const storedSessionData = uni.getStorageSync('aiChatSessionData')
					
					if (storedSessionId && storedSessionData) {
						this.chatStore.setSessionId(storedSessionId)
						this.chatStore.setSessionData(storedSessionData)
						return true
					}
				} catch (e) {
					console.warn(this.texts.loadSessionFailed, e)
				}
				return false
			},
			
			saveSessionToStorage(sessionId, sessionData) {
				try {
					uni.setStorageSync('aiChatSessionId', sessionId)
					uni.setStorageSync('aiChatSessionData', {
						title: sessionData.title || '',
						describe: sessionData.describe || '',
						examples: sessionData.examples || []
					})
				} catch (e) {
					console.warn(this.texts.saveSessionFailed, e)
				}
			},
			
			async loadHistory() {
				if (!this.sessionId) {
					this.chatStore.setMessages([])
					return
				}
				
				try {
					const res = await post('/chat/history', {
						sessionId: this.sessionId
					})
					
					const data = res.data || res
					const historyList = data?.list || data?.history || data || []
					
					if (Array.isArray(historyList) && historyList.length > 0) {
						const messages = historyList.map((item, index) => ({
							id: item.id || `msg-${Date.now()}-${index}`,
							role: item.role || item.type || 'assistant',
							content: item.content || item.message || '',
							html: this.md ? this.md.render(item.content || item.message || '') : (item.content || item.message || '')
						}))
						this.chatStore.setMessages(messages)
					} else {
						this.chatStore.setMessages([])
					}
				} catch (err) {
					console.error(this.texts.loadHistoryFailed, err)
					this.chatStore.setMessages([])
				}
			},
			
			async fetchSession() {
				this.loadingSession = true
				
				if (this.loadSessionFromStorage()) {
					await this.loadHistory()
					this.loadingSession = false
					return
				}
				
				try {
					const res = await post('/session')
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
				} catch (err) {
					console.error(this.texts.fetchSessionFailed, err)
					this.chatStore.setMessages([])
				} finally {
					this.loadingSession = false
				}
			},
			goBack() {
				if (getCurrentPages().length > 1) {
					uni.navigateBack()
				} else {
					uni.switchTab({ url: '/pages/home/index' })
				}
			},
			scrollToBottom() {
				this.$nextTick(() => {
					const anchor = `chat-bottom-anchor-${Date.now()}`
					this.bottomAnchorId = anchor
					this.scrollIntoView = anchor
				})
			},
			throttledRender(aiMsg) {
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
			async stopStream() {
				if (this.streamController && typeof this.streamController.abort === 'function') {
					this.streamController.abort()
				}
				this.chatStore.setLoading(false)
				
				if (this.sessionId) {
					try {
						await post('/chat/stop', {
							sessionId: this.sessionId
						})
						console.log(this.texts.chatStopped)
					} catch (err) {
						console.error(this.texts.stopChatFailed, err)
					}
				}
			},
			useExample(example) {
				if (example && example.describe) {
					this.inputValue = example.describe
					this.sendMessage()
				}
			},
			sendMessage() {
				const content = (this.inputValue || '').trim()
				if (!content || this.loading) return

				const userMsg = {
					id: `user-${Date.now()}`,
					role: 'user',
					content
				}
				this.chatStore.addMessage(userMsg)
				this.chatStore.setInputValue('')

				const aiMsg = {
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
					.map(item => ({ role: item.role, content: item.content }))

				this.streamController = streamRequest({
					url: '/chat',
					method: 'POST',
					data: {
						question: content,
						sessionId: this.sessionId,
						history
					},
					onMessage: (chunk) => {
						this.partialBuffer += chunk || ''
						this.partialBuffer = this.partialBuffer.replace(/\}\s*\{/g, '}\n{')
						const parts = this.partialBuffer.split('\n')
						this.partialBuffer = parts.pop() || ''
						
						let hasNewContent = false
						parts.forEach(line => {
							const text = line.trim()
							if (!text) return
							let appended = false
							try {
								const obj = JSON.parse(text)
								if (obj && obj.eventData && (obj.eventType === 1001 || obj.eventType === '1001' || obj.eventType === undefined)) {
									aiMsg.content += obj.eventData
									appended = true
									hasNewContent = true
								}
							} catch (e) {
							}
							if (!appended) {
								aiMsg.content += text
								hasNewContent = true
							}
						})
						
						if (hasNewContent) {
							this.throttledRender(aiMsg)
						}
					},
					onError: (err) => {
						this.chatStore.setLoading(false)
						uni.showToast({
							title: err?.message || this.texts.chatFailed,
							icon: 'none'
						})
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
							} catch (e) {
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
