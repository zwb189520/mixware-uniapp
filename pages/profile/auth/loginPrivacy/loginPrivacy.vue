<template>
  <view class="privacy-page">
    <custom-navbar title="隐私通知" @back="handleBack" />
    <view class="content">
      <view class="privacy-section">
        <text class="section-title">1. 信息收集</text>
        <text class="section-content">我们可能收集您的个人信息，包括但不限于：邮箱地址、设备信息、使用日志等。这些信息用于提供和改进我们的服务。</text>
      </view>
      <view class="privacy-section">
        <text class="section-title">2. 信息使用</text>
        <text class="section-content">我们使用收集的信息来：提供、维护和改进我们的服务；处理您的请求和交易；向您发送相关通知；保护我们的服务和用户。</text>
      </view>
      <view class="privacy-section">
        <text class="section-title">3. 信息共享</text>
        <text class="section-content">我们不会出售、交易或转让您的个人信息给第三方，除非获得您的明确同意或法律要求。我们可能与可信的第三方服务提供商共享必要的信息以提供服务。</text>
      </view>
      <view class="privacy-section">
        <text class="section-title">4. 信息安全</text>
        <text class="section-content">我们采取合理的技术和管理措施保护您的个人信息安全，包括数据加密、访问控制、安全审计等。但请注意，没有任何互联网传输或存储方法是100%安全的。</text>
      </view>
      <view class="privacy-section">
        <text class="section-title">5. Cookie使用</text>
        <text class="section-content">我们使用Cookie和类似技术来改善用户体验、分析使用情况、提供个性化内容。您可以通过浏览器设置管理Cookie偏好。</text>
      </view>
      <view class="privacy-section">
        <text class="section-title">6. 您的权利</text>
        <text class="section-content">您有权访问、更正、删除您的个人信息，以及反对或限制某些处理。您可以通过联系我们行使这些权利。</text>
      </view>
      <view class="privacy-section">
        <text class="section-title">7. 儿童隐私</text>
        <text class="section-content">我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。如发现此类情况，我们将立即删除。</text>
      </view>
      <view class="privacy-section">
        <text class="section-title">8. 隐私政策更新</text>
        <text class="section-content">我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，并标注修订日期。重大变更将通过其他方式通知您。</text>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'

export default {
  name: 'LoginPrivacy',
  components: {
    CustomNavbar
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 30rpx;
}

.privacy-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.section-content {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}
</style>
