<template>
  <view class="agreement-page">
    <custom-navbar title="用户协议" @back="handleBack" />
    <view class="content">
      <view class="agreement-section">
        <text class="section-title">1. 服务条款</text>
        <text class="section-content">欢迎使用mixware服务。在使用本服务前，请您仔细阅读并理解本用户协议。使用本服务即表示您同意本协议的所有条款。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">2. 用户注册</text>
        <text class="section-content">用户在注册时必须提供真实、准确的个人资料。用户有责任维护账号和密码的保密性，并对在该账号下发生的所有活动承担责任。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">3. 服务使用</text>
        <text class="section-content">用户承诺不会利用本服务进行任何违法或不当活动，包括但不限于发布违法信息、侵犯他人知识产权等。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">4. 隐私保护</text>
        <text class="section-content">我们将采取合理的技术措施保护用户的个人信息安全，但不对因不可抗力或第三方原因导致的信息泄露承担责任。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">5. 免责声明</text>
        <text class="section-content">本服务按"现状"提供，不保证服务的连续性、及时性、安全性或无错误。用户使用本服务所产生的风险由用户自行承担。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">6. 协议修改</text>
        <text class="section-content">我们有权随时修改本协议，修改后的协议一经公布即生效。如用户不同意修改后的协议，应停止使用本服务。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">7. 适用法律</text>
        <text class="section-content">本协议的订立、执行和解释均适用中华人民共和国法律。如发生争议，双方应友好协商解决。</text>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'

export default {
  name: 'LoginUserAgreement',
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
.agreement-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 30rpx;
}

.agreement-section {
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
