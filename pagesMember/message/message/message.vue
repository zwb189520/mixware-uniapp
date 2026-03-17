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
// @ts-nocheck
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import MessageList from '../components/messageList.vue'
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
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore?.texts?.message || {}
    }
  },
  mounted() {
    this.languageStore.loadLanguage()
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    },
    handleClear() {
      uni.showModal({
        title: this.texts.prompt,
        content: this.texts.clearConfirm,
        success: (res) => {
          if (res.confirm) {
            const messageListComponent = this.$refs.messageList
            if (messageListComponent) {
              messageListComponent.clearAllMessages()
            }
          }
        }
      })
    },
    handleSettings() {
      uni.navigateTo({
        url: '/pagesMember/message/messageSettings/messageSettings'
      })
    }
  }
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.safe-area-top {
  background: #fff;
}
</style>


