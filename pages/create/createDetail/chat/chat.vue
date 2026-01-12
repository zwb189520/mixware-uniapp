<template>
	<view class="chat-page">
		<safe-area />
		<view class="navbar">
			<view class="navbar-left" @tap="goBack">
				<uni-icons type="left" size="24"></uni-icons>
			</view>
			<view class="navbar-title">
				<text>AI 对话</text>
			</view>
			<view class="navbar-right"></view>
		</view>

		<!-- 消息区 -->
		<scroll-view
			class="message-list"
			scroll-y
			:scroll-with-animation="true"
			:scroll-into-view="scrollIntoView"
		>
			<!-- 加载中提示 -->
			<view v-if="loadingSession" class="loading-session">
				<text class="loading-text">加载中...</text>
			</view>
			
			<!-- 消息列表 -->
			<view
				v-for="(msg, index) in messages"
				:key="msg.id"
				:id="`msg-${msg.id}`"
				class="message-row"
				:class="msg.role === 'user' ? 'from-user' : 'from-ai'"
			>
				<view class="avatar">{{ msg.role === 'user' ? '我' : 'AI' }}</view>
				<view class="bubble">
					<!-- AI 消息用 mp-html 渲染 markdown/html；用户消息保持文本 -->
					<mp-html
						v-if="msg.role !== 'user'"
						:content="msg.html || msg.content || (loading && index === messages.length - 1 ? '正在回复…' : '')"
					/>
					<text v-else class="bubble-text">
						{{ msg.content || (loading && index === messages.length - 1 ? '正在回复…' : '') }}
					</text>
				</view>
			</view>
			
			<!-- 示例问题卡片（只在没有历史消息时显示） -->
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

		<!-- 输入区 -->
		<view class="input-bar">
			<input
				class="input"
				type="text"
				v-model="inputValue"
				placeholder="请输入你的问题"
				@confirm="sendMessage"
				confirm-type="send"
				:disabled="loading"
				:adjust-position="false"
			/>
			<button
				v-if="loading"
				class="stop-btn"
				@tap="stopStream"
			>停止</button>
			<button
				v-else
				class="send-btn"
				:disabled="!inputValue.trim()"
				@tap="sendMessage"
			>发送</button>
		</view>
	</view>
</template>

<script>
	import streamRequest from '@/api/streamRequest.js'
	import { post } from '@/api/request.js'
	import MarkdownIt from 'markdown-it'
	import mpHtml from '@/components/mp-html/mp-html.vue'
	import SafeArea from '@/components/safe-area/safe-area.vue'

	export default {
		components: {
			mpHtml,
			SafeArea
		},
		data() {
			return {
				inputValue: '',
				messages: [],
				loading: false,
				scrollIntoView: '',
				bottomAnchorId: 'chat-bottom-anchor',
				streamController: null,
				sessionId: '',
				partialBuffer: '',
				sessionTitle: '',
				sessionDescribe: '',
				examples: [],
				loadingSession: true,
				md: null,
				// 节流控制
				lastRenderTime: 0,
				renderThrottle: 100, // 100ms 节流间隔
				pendingRender: false,
				renderTimer: null
			}
		},
		async onLoad() {
			this.md = new MarkdownIt({
				html: false,
				linkify: true,
				breaks: true
			})
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
			// 从本地存储加载 session 信息
			loadSessionFromStorage() {
				try {
					const storedSessionId = uni.getStorageSync('aiChatSessionId')
					const storedSessionData = uni.getStorageSync('aiChatSessionData')
					
					if (storedSessionId && storedSessionData) {
						this.sessionId = storedSessionId
						this.sessionTitle = storedSessionData.title || ''
						this.sessionDescribe = storedSessionData.describe || ''
						this.examples = storedSessionData.examples || []
						return true
					}
				} catch (e) {
					console.warn('从本地存储加载 session 失败:', e)
				}
				return false
			},
			
			// 保存 session 信息到本地存储
			saveSessionToStorage(sessionId, sessionData) {
				try {
					uni.setStorageSync('aiChatSessionId', sessionId)
					uni.setStorageSync('aiChatSessionData', {
						title: sessionData.title || '',
						describe: sessionData.describe || '',
						examples: sessionData.examples || []
					})
				} catch (e) {
					console.warn('保存 session 到本地存储失败:', e)
				}
			},
			
			// 加载历史会话
			async loadHistory() {
				if (!this.sessionId) {
					this.messages = []
					return
				}
				
				try {
					const res = await post('/chat/history', {
						sessionId: this.sessionId
					})
					
					// 处理响应数据，兼容不同的响应格式
					const data = res.data || res
					const historyList = data?.list || data?.history || data || []
					
					if (Array.isArray(historyList) && historyList.length > 0) {
						// 将历史消息转换为消息格式
						this.messages = historyList.map((item, index) => ({
							id: item.id || `msg-${Date.now()}-${index}`,
							role: item.role || item.type || 'assistant',
							content: item.content || item.message || '',
							html: this.md ? this.md.render(item.content || item.message || '') : (item.content || item.message || '')
						}))
					} else {
						// 如果没有历史消息，显示空列表
						this.messages = []
					}
				} catch (err) {
					console.error('加载历史会话失败:', err)
					// 加载失败时显示空列表
					this.messages = []
				}
			},
			
			async fetchSession() {
				this.loadingSession = true
				
				// 先尝试从本地存储加载
				if (this.loadSessionFromStorage()) {
					// 如果本地有 sessionId，加载历史会话
					await this.loadHistory()
					this.loadingSession = false
					return
				}
				
				// 如果本地没有，才请求接口
				try {
					const res = await post('/session')
					// 处理响应数据，兼容不同的响应格式
					const data = res.data || res
					
					if (data && data.sessionId) {
						this.sessionId = data.sessionId
						this.sessionTitle = data.title || ''
						this.sessionDescribe = data.describe || ''
						this.examples = data.examples || []
						
						// 保存到本地存储
						this.saveSessionToStorage(this.sessionId, {
							title: this.sessionTitle,
							describe: this.sessionDescribe,
							examples: this.examples
						})
						
						// 加载历史会话（首次可能为空）
						await this.loadHistory()
					} else {
						// 如果接口返回失败，显示空列表
						this.messages = []
					}
				} catch (err) {
					console.error('获取 session 失败:', err)
					// 请求失败时显示空列表
					this.messages = []
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
			// 节流渲染函数：避免频繁重渲染导致卡顿
			throttledRender(aiMsg) {
				const now = Date.now()
				const timeSinceLastRender = now - this.lastRenderTime
				
				// 如果距离上次渲染时间超过节流间隔，立即渲染
				if (timeSinceLastRender >= this.renderThrottle) {
					this.lastRenderTime = now
					// 更新 markdown 渲染
					if (this.md && aiMsg) {
						aiMsg.html = this.md.render(aiMsg.content || '')
					}
					this.$forceUpdate()
					this.scrollToBottom()
					this.pendingRender = false
				} else {
					// 否则，标记为待渲染，并设置延迟渲染
					this.pendingRender = true
					
					// 清除之前的定时器
					if (this.renderTimer) {
						clearTimeout(this.renderTimer)
					}
					
					// 设置新的定时器，在节流间隔后渲染
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
				// 停止流式请求
				if (this.streamController && typeof this.streamController.abort === 'function') {
					this.streamController.abort()
				}
				this.loading = false
				
				// 调用停止对话接口
				if (this.sessionId) {
					try {
						await post('/chat/stop', {
							sessionId: this.sessionId
						})
						console.log('对话已停止')
					} catch (err) {
						console.error('停止对话接口调用失败:', err)
						// 即使接口调用失败，也不影响前端的停止操作
					}
				}
			},
			useExample(example) {
				// 使用示例问题作为输入
				if (example && example.describe) {
					this.inputValue = example.describe
					// 自动发送
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
				this.messages.push(userMsg)
				this.inputValue = ''

				const aiMsg = {
					id: `ai-${Date.now()}`,
					role: 'assistant',
					content: '',
					html: ''
				}
				this.messages.push(aiMsg)
				this.loading = true
				this.scrollToBottom()

				const history = this.messages
					.slice(0, this.messages.length - 1) // 不包含正在生成的最后一条 AI
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
						// 兼容 }{ 拼接的情况，先插入换行分隔
						this.partialBuffer = this.partialBuffer.replace(/\}\s*\{/g, '}\n{')
						const parts = this.partialBuffer.split('\n')
						// 最后一段可能不完整，先留着
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
								// 忽略解析失败，走兜底
							}
							if (!appended) {
								aiMsg.content += text
								hasNewContent = true
							}
						})
						
						// 只在有新内容时才触发节流渲染
						if (hasNewContent) {
							this.throttledRender(aiMsg)
						}
					},
					onError: (err) => {
						this.loading = false
						uni.showToast({
							title: err?.message || '对话失败，请稍后重试',
							icon: 'none'
						})
					},
					onComplete: () => {
						// 清除节流定时器
						if (this.renderTimer) {
							clearTimeout(this.renderTimer)
							this.renderTimer = null
						}
						
						// 把剩余缓冲尝试消费
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
						
						// 结束时立即最终渲染一次（确保完整显示）
						if (this.md) {
							aiMsg.html = this.md.render(aiMsg.content || '')
						}
						this.$forceUpdate()
						this.scrollToBottom()
						
						this.loading = false
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
	background: #f7f8fa;
	overflow: hidden;
}

.chat-page::before {
	content: '';
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: #f7f8fa;
	z-index: -1;
}

.navbar {
	display: flex;
	align-items: center;
	height: 88rpx;
	padding: 0 30rpx;
	background-color: #fff;
	border-bottom: 1rpx solid #eee;
}

.navbar-left {
	width: 60rpx;
}

.navbar-right {
	width: 60rpx;
}

.navbar-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
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
	background: #2a7fff;
	color: #fff;
	font-size: 14px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 8px;
}

.from-user .avatar {
	background: #10b981;
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
	background: #10b981;
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
	background: #2a7fff;
	color: #fff;
}

.send-btn:disabled {
	opacity: 0.6;
}

.stop-btn {
	background: #f59e0b;
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
	color: #2a7fff;
}

.example-desc {
	font-size: 14px;
	color: #666;
	line-height: 1.5;
}
</style>

