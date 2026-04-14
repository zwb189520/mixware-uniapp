<template>
  <view class="message-page">
    <safe-area />
    <custom-navbar :title="texts.title" @back="handleBack">
      <template #right>
        <uni-icons type="gear" size="24" @click="handleSettings"></uni-icons>
        <uni-icons type="trash" size="24" @click="handleClear"></uni-icons>
      </template>
    </custom-navbar>
    <message-list ref="messageList" />
  </view>
</template>

<script lang="ts">
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import MessageList from './components/list.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'
import { useLanguageStore } from '@/stores/index.ts'

export default {
  name: 'Message',
  components: {
    CustomNavbar,
    MessageList,
    SafeArea
  },
  computed: {
    languageStore(): ReturnType<typeof useLanguageStore> {
      return useLanguageStore()
    },
    texts(): Record<string, string> {
      return this.languageStore?.texts?.message || {}
    }
  },
  mounted(): void {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleBack(): void {
      uni.navigateBack()
    },
    handleClear(): void {
      uni.showModal({
        title: this.texts.prompt,
        content: this.texts.clearConfirm,
        success: (res: UniApp.ShowModalRes) => {
          if (res.confirm) {
            const messageListComponent = this.$refs.messageList as unknown as { clearAllMessages: () => void }
            if (messageListComponent) {
              messageListComponent.clearAllMessages()
            }
          }
        }
      })
    },
    handleSettings(): void {
      uni.navigateTo({
        url: '/pagesMember/message/settings'
      })
    }
  }
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background-color: #fff9f5;
}

.safe-area-top {
  background: #fff;
}
</style>
