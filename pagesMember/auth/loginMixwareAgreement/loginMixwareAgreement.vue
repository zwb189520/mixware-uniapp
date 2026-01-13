<template>
  <view class="mixware-agreement-page">
    <custom-navbar title="mixware用户协议" @back="handleBack" />
    <view class="content">
      <view class="agreement-section">
        <text class="section-title">1. mixware服务说明</text>
        <text class="section-content">mixware是一款专业的3D打印管理应用，为用户提供模型浏览、创建、打印管理等全方位服务。本协议是您与mixware之间关于使用本服务的法律协议。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">2. 账号管理</text>
        <text class="section-content">用户在mixware注册的账号归用户所有，但mixware保留对账号的管理权。用户不得转让、出售或出借账号。如发现账号被盗用，应立即通知mixware。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">3. 3D模型版权</text>
        <text class="section-content">mixware平台上的3D模型版权归原作者所有。用户可以浏览、下载和使用模型，但不得用于商业用途或侵犯原作者权益。用户上传的模型应确保拥有合法版权。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">4. 打印机设备管理</text>
        <text class="section-content">用户可以通过mixware管理连接的3D打印机设备。用户应确保设备使用符合当地法律法规，不得用于打印违禁物品。mixware不对因设备使用不当造成的损失承担责任。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">5. 服务费用</text>
        <text class="section-content">mixware的基础服务免费提供，但某些高级功能可能需要付费。付费服务的价格和条款以mixware官方公布为准。用户购买付费服务后，不支持退款。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">6. 用户行为规范</text>
        <text class="section-content">用户在使用mixware服务时，应遵守以下规范：不得发布违法、有害、色情、暴力内容；不得侵犯他人知识产权；不得干扰或破坏服务正常运行；不得利用服务进行诈骗或其他违法活动。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">7. 知识产权</text>
        <text class="section-content">mixware平台上的所有内容，包括但不限于软件、设计、文字、图片、视频等，均受知识产权法保护。未经mixware书面许可，用户不得复制、传播、修改或用于商业目的。</text>
      </view>
      <view class="agreement-section">
        <text class="section-title">8. 免责条款</text>
        <text class="section-content">mixware不对以下情况承担责任：因用户操作不当导致的打印失败；因设备故障或网络问题导致的服务中断；第三方内容或服务的质量问题；不可抗力事件。</text>
      </view>
      
      <view class="agreement-section">
        <text class="section-title">9. 服务终止</text>
        <text class="section-content">mixware有权在以下情况下终止或暂停服务：用户违反本协议；用户行为损害mixware或其他用户利益；法律法规要求或其他必要情况。服务终止后，用户账号将被冻结或删除。</text>
      </view>
      
      <view class="agreement-section">
        <text class="section-title">10. 争议解决</text>
        <text class="section-content">因本协议引起的任何争议，双方应首先通过友好协商解决。协商不成的，任何一方可向mixware所在地人民法院提起诉讼。</text>
      </view>
      
      <view class="agreement-section">
        <text class="section-title">11. 联系方式</text>
        <text class="section-content">如您对本协议有任何疑问或建议，请通过以下方式联系我们：邮箱：support@mixware.com；电话：400-XXX-XXXX。</text>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'

export default {
  name: 'LoginMixwareAgreement',
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
.mixware-agreement-page {
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
