import { ref, onUnmounted } from 'vue'
import { cancelRequest, generateRequestId } from '@/api/request'

export const useRequestCancel = () => {
  const pendingRequestIds = ref<Set<string>>(new Set())

  const createRequestId = (url: string, method: string): string => {
    const id = generateRequestId(url, method)
    pendingRequestIds.value.add(id)
    return id
  }

  const cancelPendingRequests = (): void => {
    pendingRequestIds.value.forEach(id => {
      cancelRequest(id)
    })
    pendingRequestIds.value.clear()
  }

  const removeRequestId = (id: string): void => {
    pendingRequestIds.value.delete(id)
  }

  onUnmounted(() => {
    cancelPendingRequests()
  })

  return {
    createRequestId,
    cancelPendingRequests,
    removeRequestId
  }
}