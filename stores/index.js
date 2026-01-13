import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

export { useUserStore } from './modules/user'
export { useExploreStore } from './modules/explore'
export { useChatStore } from './modules/chat'
