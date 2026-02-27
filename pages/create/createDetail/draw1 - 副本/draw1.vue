<template>
  <view class="container">
    <!-- 左上角悬浮操作区 -->
    <view class="float-header" :style="{ top: statusBarHeight + 10 + 'px' }">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333"></uni-icons>
      </view>
      <text class="page-title">为模型取名</text>
      <uni-icons type="compose" size="20" color="#999" class="edit-icon"></uni-icons>
    </view>
    
    <!-- 右上角悬浮操作区 -->
    <view class="float-right-header" :style="{ top: statusBarHeight + 10 + 'px' }">
      <view class="btn-save" @click="handleSave">保存编辑</view>
      <view class="btn-next" @click="handleNext">下一步</view>
    </view>
    
    <web-view 
      class="webview-box"
      :src="url" 
      ref="webview"
      @onPostMessage="handleWebviewMessage"
     @message="handleWebviewMessage"
    ></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 替换为您部署的实际地址，本地调试可用局域网 IP
      url: 'http://localhost:8080/?token=uniapp_user_123',
      statusBarHeight: 0,
      postNumber: 0,
      webviewContext: null
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0

    // #ifdef H5
    // H5 端：监听 window 的 message 事件
    window.addEventListener('message', this.handleH5Message);
    // #endif
  },
  onUnload() {
    // #ifdef H5
    window.removeEventListener('message', this.handleH5Message);
    // #endif
  },
  onReady() {
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    handleSave() {
      console.log('保存编辑')
      // TODO: 调用保存逻辑
    },
    handleNext() {
      console.log('下一步')

      // uniapp 向 webview 发消息
      // 获取到 webviewContext 后 App 环境 ( #ifdef APP-PLUS )
      if(this.webviewContext){
        this.webviewContext.evalJS(`
            window.postMessage({
                action: 'handleNextPage',
                data: { id: 123, text: 'hello' }
            }, '*')
        `);
      }

      // H5 环境 ( #ifdef H5 )
      const iframe = document.querySelector('iframe'); // 获取 web-view 渲染出的 iframe
      if (iframe) {
          iframe.contentWindow.postMessage({
              action: 'handleNextPage',
              data: { id: 123, text: 'hello' }
          }, '*');
      }

    },
    handleWebviewMessage(evt) {
      console.log('接收到来自 Doodle3D 的消息:', evt.detail.data);

      //页面加载完成 初始化webview
      if(evt.detail.data.action == 'loadDown'){
        if (this.postNumber === 0) {
          console.log('页面加载完成 初始化webview')
          this.loadDownInitWebview()
          this.postNumber++;
        }
      }
     
    },
    // H5 消息处理函数
    handleH5Message(event) {
      // 过滤来自 uni-webview-js 的消息
      let msgData = null;
      // 尝试解析数据
      if (event.data && event.data.data && event.data.data.arg) {
        msgData = event.data.data.arg;
      } else if (event.data && event.data.action) {
        msgData = event.data;
      }
      if (msgData) {
        // 模拟 App 端的事件结构，复用 handleWebviewMessage 逻辑
        this.handleWebviewMessage({ 
          detail: { 
            // data: [msgData] 
            data: msgData 
          } 
        });
      }
    },
    loadDownInitWebview(){
      console.log('11111111111111111111111')
      const pages = getCurrentPages();
      if(pages && pages[pages.length - 1] && pages[pages.length - 1].$getAppWebview){
        this.webviewContext = pages[pages.length - 1].$getAppWebview().children()[0];      
      }
    },
  }
}
</script>

<style>
.container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.float-header {
  position: absolute;
  left: 20px;
  z-index: 999; /* 确保悬浮在 webview 之上 (仅限非原生 webview 环境，原生环境需使用 cover-view) */
  display: flex;
  align-items: center;
  background-color: transparent; /* 透明背景 */
  pointer-events: auto; /* 允许点击 */
}

/* 如果是在 App 端运行，web-view 层级最高，普通 view 无法覆盖 */
/* 需要将 float-header 改为 cover-view */

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #555;
  margin-right: 8px;
}

.edit-icon {
  margin-top: 2px;
}

.float-right-header {
  position: absolute;
  right: 20px;
  z-index: 999;
  display: flex;
  align-items: center;
  background-color: transparent;
  pointer-events: auto;
}

.btn-save {
  font-size: 14px;
  color: #555;
  background: #fff;
  border: 1px solid #999;
  border-radius: 20px;
  padding: 0 16px;
  height: 32px;
  line-height: 30px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-next {
  font-size: 14px;
  color: #fff;
  background: #007AFF;
  border-radius: 20px;
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.webview-box {
  width: 100%;
  height: 100%;
}
</style>