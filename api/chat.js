import { postWithQuery, get } from './request'
import { streamRequest } from './streamRequest.js'

export const chatStream = (question, sessionId, callbacks) => {
	const { onMessage, onError, onComplete } = callbacks || {}
	
	return streamRequest({
		url: '/chat',
		method: 'POST',
		data: { question, sessionId },
		onMessage,
		onError,
		onComplete
	})
}

export const stopChat = (sessionId) => {
	return postWithQuery('/chat/stop', {}, { sessionId })
}

export const getChatHistory = (conversationId, current = 1, size = 20) => {
	return get(`/chat/history/${conversationId}?current=${current}&size=${size}`)
}

export default {
	chatStream,
	stopChat,
	getChatHistory
}