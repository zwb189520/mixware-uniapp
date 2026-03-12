<template>
  <view class="container">
    <!-- 顶部导航栏容器 (不再悬浮覆盖，而是独占空间) -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 左侧操作区 -->
      <view class="nav-left">
        <view class="back-btn" @click="goBack">
          <uni-icons type="left" size="24" color="#333"></uni-icons>
        </view>
        <!-- 标题/输入框 -->
        <view class="input-wrapper">
          <input 
            class="title-input" 
            v-model="modelName" 
            :focus="isFocus"
            @blur="isFocus = false"
            :placeholder="texts.placeholder || '为模型取名'" 
            placeholder-style="color: #999;"
          />
          <view class="edit-icon-view" @click="handleIconClick">
            <image src="/static/images/edit.png" mode="aspectFit" class="edit-icon"></image>
          </view>
        </view>
      </view>

      <!-- 右侧操作区 -->
      <view class="nav-right">
        <!-- 绘画模式按钮 -->
        <template v-if="!is3DView">
          <view class="btn-save" @click="handleSave">{{ texts.saveEdit || '保存编辑' }}</view>
          <view class="btn-next" @click="handleNext">{{ texts.nextStep || '下一步' }}</view>
        </template>
        
        <!-- 3D预览模式按钮 -->
        <template v-else>
          <view class="icon-btn" @click="handleSnapshot">
            <uni-icons type="camera" size="24" color="#555"></uni-icons>
          </view>
          <view class="btn-white" @click="handleShare">{{ texts.shareModel || '分享模型' }}</view>
          <view class="btn-white" @click="handleSave">{{ texts.saveEdit || '保存编辑' }}</view>
          <view class="btn-blue" @click="handlePrint">{{ texts.goPrint || '去打印' }}</view>
        </template>
      </view>
    </view>
    
    <!-- Webview 区域 (占据剩余空间) -->
    <!-- #ifdef APP-PLUS -->
    <view class="webview-placeholder"></view>
    <!-- #endif -->

    <!-- #ifndef APP-PLUS -->
    <view class="webview-container">
      <web-view 
        class="webview-box"
        :src="url" 
        :webview-styles="webviewStyles"
        ref="webview"
        @onPostMessage="handleWebviewMessage"
        @message="handleWebviewMessage"
      ></web-view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import { uploadModelFile } from '@/api/upload.js'
import { useLanguageStore } from '@/stores'

export default {
  data() {
    return {
      // 替换为您部署的实际地址，本地调试可用局域网 IP
      // url: 'http://192.168.0.43:8081/?token=uniapp_user_123',
      url: 'http://app.mixwarebot.cn/?token=uniapp_user_123',
      statusBarHeight: 0,
      postNumber: 0,
      webviewContext: null, // 这里将存储手动创建的 Webview 对象
      modelName: '',
      isFocus: false,
      isLoadDown3dView: false,//是否加载完成3d模型页面
      sketchData: false, // 是否存在2d草图数据
      sketchDataJson: null, // 2d草图数据
      is3DView: false, // 是否处于3D预览模式
      platform: false,//当前系统环境 web/
      isPrinting: false, // 是否正在去打印流程
      webviewStyles: {
        width: '50px',
        height: '50px',
        progress: {
          color: '#FF3333'
        }
      }
    }
  },
  computed: {
    languageStore() {
      return useLanguageStore()
    },
    texts() {
      return this.languageStore.texts.create.draw1 || {}
    }
  },
  onLoad() {
    this.languageStore.loadLanguage()
    
    const systemInfo = uni.getSystemInfoSync();
    if(systemInfo.uniPlatform){
      console.log('当前是运行环境是：'+systemInfo.uniPlatform)
      this.platform = systemInfo.uniPlatform
      // 判断是否为 H5
      if (systemInfo.uniPlatform === 'web') {
        console.log('当前是 H5----------------------');
      }else{
        console.log('当前是 App-------------------');
      }
    }else{
      console.log('当前是运行环境是：'+systemInfo.platform)
      this.platform = systemInfo.platform
      // 判断是否为 App (Android/iOS)
      // 注意：uniPlatform 在较新版本才支持，老版本可以用 platform
      if (systemInfo.platform === 'android' || systemInfo.platform === 'ios') {
        console.log('当前是 App-------------------');
      }else{
        console.log('当前是 H5----------------------');
      }
    }

    if(this.platform && this.platform != 'web'){
      // 锁定横屏
      plus.screen.lockOrientation('landscape-primary');
      // 设置全屏 (隐藏状态栏)
      plus.navigator.setFullscreen(true);
      // 全屏模式下状态栏高度视为 0
      this.statusBarHeight = 0;
    } else {
       // 获取状态栏高度
       this.statusBarHeight = systemInfo.statusBarHeight || 0
    }

    if(this.platform && this.platform === 'web'){
      // H5 端：监听 window 的 message 事件
      window.addEventListener('message', this.handleH5Message);
    }
   
  },
  onBackPress() {
    console.log('onBackPress触发, platform:', this.platform);
    if(this.platform && this.platform != 'web'){
      console.log('调用goBack');
      this.goBack();
      return true;
    }
    return false;
  },
  onShow() {
    // 返回页面时恢复横屏
    if(this.platform && this.platform != 'web'){
      plus.screen.lockOrientation('landscape-primary');
      plus.navigator.setFullscreen(true);
      // 显示WebView
      if (this.webviewContext) {
        this.webviewContext.show();
      }
    }
  },
  onUnload() {
    this.isUnloading = true; // 标记正在卸载，拦截后续消息
    console.log('执行 onUnload 清理...');

    if(this.platform && this.platform != 'web'){
      // 2. 恢复竖屏和状态栏
      if (typeof plus !== 'undefined' && plus.screen) {
          plus.screen.lockOrientation('portrait-primary');
          plus.navigator.setFullscreen(false);
      }

      // 3. 销毁 Webview
      if (this.webviewContext) {
          this.webviewContext.loadURL('about:blank');
          this.webviewContext.close(); 
          this.webviewContext = null;
          console.log('Webview 已销毁');
      }
    }

    if(this.platform && this.platform === 'web'){
      try {
          window.removeEventListener('message', this.handleH5Message);
      } catch (e) {
          console.error('移除 H5 消息监听失败:', e);
      }
    }

  },
  onReady() {
    if(this.platform &&this.platform != 'web'){
      console.log('onReady 执行中...')
      
      // 计算导航栏高度
      // 状态栏高度 + 导航栏内容高度(44px)
      const topOffset = this.statusBarHeight + 44; 
      const sysInfo = uni.getSystemInfoSync();
      console.log(JSON.stringify(sysInfo))
      const windowHeight = sysInfo.windowHeight;
      const windowWidth = sysInfo.windowWidth;
      const webviewHeight = windowHeight - topOffset;
      const initWebviewHeight = webviewHeight > windowWidth ? windowWidth : webviewHeight;

      // 创建原生 Webview
      // 使用当前时间戳作为 id 后缀，避免 ID 冲突
      const wvId = 'custom-webview-' + Date.now();
      
      // 创建 Webview 实例
      const wv = plus.webview.create(this.url, wvId, {
          top: topOffset + 'px',      // 顶部避开导航栏
          height: initWebviewHeight + 'px', // 明确高度
          position: 'absolute',       // 绝对定位
          background: 'transparent',  // 透明背景
          scalable: false,            // 禁止缩放
          plusrequire: 'ahead'        // 【关键】允许 H5 页面直接访问 plus 对象
      });
      
      // 将新创建的 Webview 追加到当前页面
      const currentWebview = this.$scope.$getAppWebview(); 
      currentWebview.append(wv);
      
      // 保存引用
      this.webviewContext = wv;
      
      console.log(`手动创建 Webview 成功: top=${topOffset}px, height=${initWebviewHeight}px`);
      
      // 监听 Webview 加载完成
      wv.addEventListener('loaded', () => {
          console.log('Webview 加载完成');
      }, false);

      // 监听 plusMessage 事件 (来自 Webview 的 postMessage)
      // 使用箭头函数绑定 this，并赋值给实例变量以便移除
      this.plusMessageListener = (msg) => {
          if (msg.data && msg.data.args && msg.data.args.data && msg.data.args.data.name == 'postMessage') {
              // 构造符合 handleWebviewMessage 预期的事件对象
              const evt = {
                  detail: {
                      data: msg.data.args.data.arg
                  }
              };
              this.handleWebviewMessage(evt);
          }
      };
      plus.globalEvent.addEventListener('plusMessage', this.plusMessageListener);
    }
   
    
  },
  methods: {
    // 通用发送消息方法
    sendMessage(action, data = {}) {
      if(this.platform && this.platform != 'web'){
       // uniapp 向 webview 发消息
        // 获取到 webviewContext 后 App 环境
        if (this.webviewContext) {
          this.webviewContext.evalJS(`
              window.postMessage({
                  action: '${action}',
                  data: ${JSON.stringify(data)}
              }, '*')
          `);
        }
      }

      if(this.platform && this.platform === 'web'){
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.contentWindow.postMessage({
            action: action,
            data: data
          }, '*');
        }
      }
    },
    goBack() {
      console.log('goBack调用, is3DView:', this.is3DView);
      if(this.is3DView == true){
        this.is3DView = false;
        this.sendMessage('switchMobileView',{'tab':'2d'});
      }else{
        if (this.webviewContext) {
          this.webviewContext.loadURL('about:blank');
          this.webviewContext.close();
          this.webviewContext = null;
        }
        uni.reLaunch({ url: '/pages/create/create/create' });
      }
    },
    saveImageToPhotosAlbum(base64) {
      // #ifdef APP-PLUS
      const bitmap = new plus.nativeObj.Bitmap("snapshot_" + Date.now());
      bitmap.loadBase64Data(base64, () => {
        const fileName = "_doc/" + Date.now() + ".png";
        bitmap.save(fileName, { overwrite: true }, () => {
          uni.saveImageToPhotosAlbum({
            filePath: fileName,
            success: () => {
              uni.showToast({ title: '已保存到相册', icon: 'success' });
              bitmap.clear();
            },
            fail: () => {
              uni.showToast({ title: '保存到相册失败', icon: 'none' });
              bitmap.clear();
            }
          });
        }, () => {
          uni.showToast({ title: '保存图片文件失败', icon: 'none' });
          bitmap.clear();
        });
      }, () => {
        uni.showToast({ title: '解析图片数据失败', icon: 'none' });
        bitmap.clear();
      });
      // #endif

      // #ifdef H5
      const link = document.createElement('a');
      link.href = base64;
      link.download = 'model_snapshot.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    saveAndShareStl(base64) {
      // #ifdef APP-PLUS
      const fileName = "model_" + Date.now() + ".stl";
      // 去除可能存在的头部
      const base64Str = base64.replace(/^data:.*;base64,/, '');
      
      plus.io.resolveLocalFileSystemURL("_doc/", (entry) => {
          let fsPath = entry.fullPath;
          if (fsPath.startsWith('file://')) {
              fsPath = fsPath.substring(7);
          }
          const finalPath = fsPath + fileName;
          
          if (plus.os.name === 'Android') {
              try {
                  const Base64 = plus.android.importClass("android.util.Base64");
                  const File = plus.android.importClass("java.io.File");
                  const FileOutputStream = plus.android.importClass("java.io.FileOutputStream");
                  
                  const file = new File(finalPath);
                  const bytes = Base64.decode(base64Str, Base64.DEFAULT);
                  const fos = new FileOutputStream(file);
                  fos.write(bytes);
                  fos.close();
                  
                  // 调用系统分享
                  plus.share.sendWithSystem({
                      content: '分享模型',
                      pictures: [finalPath], // 虽然参数名是pictures，但支持文件路径
                      type: 'file'
                  }, () => {
                      console.log('分享成功');
                  }, (e) => {
                      console.log('分享失败: ' + JSON.stringify(e));
                      uni.showToast({ title: this.texts.shareFailed || '分享失败', icon: 'none' });
                  });
              } catch (e) {
                  console.error("保存或分享失败", e);
                  uni.showToast({ title: this.texts.saveFailed || '保存失败', icon: 'none' });
              }
          } else {
             // iOS 或其他平台暂未实现 Native 写入
             uni.showToast({ title: this.texts.notSupportShareSTL || '当前平台暂不支持分享STL', icon: 'none' });
          }
      }, (e) => {
          console.error("Resolve _doc failed", e);
      });
      // #endif
    },
    showSaveModal(){
      uni.showModal({
        title: '',
        content: this.texts.exitConfirm || '您有未保存的操作，确定要退出吗？',
        cancelText: this.texts.dontSave || '不保存',
        confirmText: this.texts.save || '保存',
        success: (res) => {
          if (res.confirm) {
            // 用户点击保存
            this.handleSave();
          } else if (res.cancel) {
            // 用户点击不保存
            setTimeout(() => {
              // 判断页面栈长度
              const pages = getCurrentPages();
              if (pages.length > 1) {
                  // 如果有上一页，正常流程
                  uni.navigateBack();
              } else {
                  // 如果没有上一页，直接跳转回首页
                  uni.reLaunch({
                      url: '/pages/create/create/create'
                  });
              }
              // uni.navigateBack();
            }, 100);
          }
        }
      });
    },
    handleIconClick() {
      this.isFocus = true
    },
    handleSave() {
      if(this.modelName == '为模型取名' || this.modelName.trim() == ''){
        this.isFocus = true
      }else{
        console.log('保存编辑')
        // TODO: 调用保存逻辑
        uni.showToast({
          title: this.texts.saveSuccess || '保存成功',
          icon: 'success', // 或者 'none' (不显示图标)
          duration: 2000   // 持续时间，默认1500ms
        });
      }
     
    },
    handleNext() {
      console.log('下一步')
      this.is3DView = true; // 切换到 3D 模式 UI
      this.sendMessage('handleNextPage', { id: 123, text: 'hello' });
    },
    handleSnapshot() {
      console.log('拍照');
      this.sendMessage('snapshot');
    },
    handleShare() {
      console.log('分享模型');
      this.sendMessage('exportSTL');
    },
    handlePrint() {
      console.log('去打印');
      this.isPrinting = true;
      // 发送消息导出STL文件
      this.sendMessage('exportSTL');
    },
    handleWebviewMessage(evt) {
      // 增加防抖标志位，页面卸载后不再处理消息
      if (this.isUnloading) return;

      console.log('接收到来自 Doodle3D 的消息:', evt.detail.data);
      const msg = evt.detail.data;
      //页面加载完成 初始化webview
      if(msg.action == 'loadDown'){
        this.isLoadDown3dView = true;
        if (this.postNumber === 0) {
          console.log('页面加载完成 初始化webview')
          // this.loadDownInitWebview()
          this.postNumber++;
        }
      }

      // 接收截图数据并保存到相册
      if (msg.action === 'snapshot') {
        console.log('接收3d快照数据成功');
        if (msg.snapshot) {
          this.saveImageToPhotosAlbum(msg.snapshot);
        }
      }

      // 接收STL数据并分享或上传
      if (msg.stl) {
        console.log('接收到STL字符串');
        if (this.isPrinting) {
          this.uploadAndNavigateToPrint(msg.stl);
        } else {
          this.saveAndShareStl(msg.stl);
        }
      } else if (msg.action === 'stlData' && msg.data) {
        if (this.isPrinting) {
          this.uploadAndNavigateToPrint(msg.data);
        } else {
          this.saveAndShareStl(msg.data);
        }
      }

      // 2d草图数据接收并且修改sketchData
      if (msg.action === 'sketchData') {
        if(msg.sketchData.data && msg.sketchData.data.spaces && msg.sketchData.data.spaces[0].objects.length > 0){
          this.sketchData = true;
          this.sketchDataJson = msg.sketchData;
        }

        //如果草图存在 或者 模型已取名 就弹窗
        if(this.sketchData === true || this.modelName.trim() != ''){
          console.log('检测2d草图数据存在:'+this.sketchData+'，模型名为：'+ this.modelName);
          this.showSaveModal()
          
        }else{
           console.log('检测2d草图数据不存在:'+this.sketchData+'，模型名为空：'+ this.modelName);
          // 判断页面栈长度
          const pages = getCurrentPages();
          if (pages.length > 1) {
              // 如果有上一页，正常流程
              uni.navigateBack();
          } else {
              // 如果没有上一页，直接跳转回首页
              uni.reLaunch({
                  url: '/pages/create/create/create'
              });
          }
        }

      }

      // 接收模型数据并跳转到3D预览页面
      if (msg.action === 'modelDataForPrint') {
        const modelData = msg.data;
        const modelId = modelData.id || ('custom_' + Date.now());
        const modelName = modelData.name || this.modelName || '未命名模型';
        const modelUrl = modelData.url || '';
        const modelType = modelData.modelType || 'stl';
        const dimensions = modelData.dimensions || { x: 0, y: 0, z: 0 };
        
        uni.navigateTo({
          url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${modelId}&name=${encodeURIComponent(modelName)}&url=${encodeURIComponent(modelUrl)}&modelType=${modelType}&dimensions=${encodeURIComponent(JSON.stringify(dimensions))}`
        });
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
    saveAndShareStl(content) {
      // #ifdef APP-PLUS
      const fileName = "model_" + Date.now() + ".stl";
      
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
        fs.root.getFile(fileName, {create: true}, (entry) => {
          entry.createWriter((writer) => {
            writer.onwriteend = () => {
              console.log('写入成功');
              const filePath = entry.fullPath;
              
              // 调用系统分享
              plus.share.sendWithSystem({
                content: '分享模型',
                href: filePath,
                pictures: [filePath] // Android 往往需要这个参数来传递文件
              }, () => {
                console.log('分享成功');
              }, (e) => {
                console.log('分享失败: ' + JSON.stringify(e));
                // 备用方案：尝试打开文件
                uni.openDocument({
                  filePath: filePath,
                  showMenu: true,
                  success: function () {
                    console.log('打开文档成功');
                  }
                });
              });
            };
            
            writer.onerror = (e) => {
              console.log('写入失败', e);
              uni.showToast({ title: this.texts.saveFileFailed || '保存文件失败', icon: 'none' });
            };
            
            // 写入内容
            writer.write(content);
          }, (e) => {
             console.log('创建writer失败', e);
          });
        }, (e) => {
           console.log('创建文件失败', e);
        });
      });
      // #endif

      // #ifdef H5
      const blob = new Blob([content], {type: 'model/stl'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "model.stl";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // #endif
    },
    async uploadAndNavigateToPrint(stlContent) {
      this.isPrinting = false;
      uni.showLoading({ title: this.languageStore.texts.create.generating3D || '上传模型中...' });
      
      try {
        const systemInfo = uni.getSystemInfoSync();
        console.log('当前平台:', systemInfo.uniPlatform);
        const isApp = systemInfo.uniPlatform === 'app' || systemInfo.uniPlatform === 'app-plus';
        const isH5 = systemInfo.uniPlatform === 'web' || !isApp;
        
        console.log('平台判断:', { isApp, isH5 });
        
        if (isApp) {
          console.log('执行App上传逻辑');
          await this.uploadAndNavigateApp(stlContent);
        } else if (isH5) {
          console.log('执行H5上传逻辑');
          await this.uploadAndNavigateH5(stlContent);
        }
      } catch (error) {
        uni.hideLoading();
        console.error('上传模型失败:', error);
        uni.showToast({ title: '上传失败', icon: 'none' });
      }
    },
    async uploadAndNavigateApp(stlContent) {
      try {
        console.log('开始保存STL文件');
        // 将STL内容保存为临时文件
        const fileName = "temp_model_" + Date.now() + ".stl";
        const filePath = await this.saveStlToFile(stlContent, fileName);
        console.log('STL文件保存成功:', filePath);
        
        // 上传模型文件
        console.log('开始上传模型文件');
        const uploadRes = await uploadModelFile(filePath, {
          showLoading: false
        });
        console.log('上传响应:', uploadRes);
        
        uni.hideLoading();
        
        if (uploadRes.code === 1 && uploadRes.data) {
          console.log('上传成功，data:', uploadRes.data);
          let modelUrl = uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.path;
          // 清理URL中的反引号和空格
          modelUrl = modelUrl.replace(/[`\s]/g, '');
          console.log('modelUrl:', modelUrl);
          
          if (!modelUrl) {
            uni.showToast({ title: '获取模型链接失败', icon: 'none' });
            return;
          }
          
          // 跳转到3D预览页面
          const modelId = 'custom_' + Date.now();
          const modelName = this.modelName || '未命名模型';
          
          console.log('准备跳转，URL:', `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${modelId}&name=${encodeURIComponent(modelName)}&url=${encodeURIComponent(modelUrl)}&modelType=stl`);
          
          // 隐藏WebView避免覆盖跳转页面
          if (this.webviewContext) {
            this.webviewContext.hide();
          }
          
          // 设置屏幕方向为竖屏
          // #ifdef APP-PLUS
          plus.screen.lockOrientation('portrait-primary');
          // #endif
          
          uni.navigateTo({
            url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${modelId}&name=${encodeURIComponent(modelName)}&url=${encodeURIComponent(modelUrl)}&modelType=stl&dimensions=${encodeURIComponent(JSON.stringify({x:0,y:0,z:0}))}`,
            success: () => {
              console.log('跳转成功');
            },
            fail: (err) => {
              console.error('跳转失败:', err);
              // 显示WebView
              if (this.webviewContext) {
                this.webviewContext.show();
              }
              uni.showToast({ title: '跳转失败', icon: 'none' });
            }
          });
        } else {
          console.error('上传失败，响应:', uploadRes);
          uni.showToast({ title: '上传失败', icon: 'none' });
        }
      } catch (err) {
        console.error('uploadAndNavigateApp 错误:', err);
        uni.hideLoading();
        uni.showToast({ title: '上传失败: ' + (err.message || '未知错误'), icon: 'none' });
      }
    },
    async uploadAndNavigateH5(stlContent) {
      // H5环境：将STL内容转为Blob并创建临时文件路径
      const blob = new Blob([stlContent], { type: 'model/stl' });
      const tempFilePath = URL.createObjectURL(blob);
      
      // 使用fetch上传Blob
      const h5UploadRes = await this.uploadBlobToServer(tempFilePath, blob);
      
      uni.hideLoading();
      
      if (h5UploadRes.code === 1 && h5UploadRes.data) {
        const h5ModelUrl = h5UploadRes.data.url || h5UploadRes.data.fileUrl;
        
        const h5ModelId = 'custom_' + Date.now();
        const h5ModelName = this.modelName || '未命名模型';
        
        uni.navigateTo({
          url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${h5ModelId}&name=${encodeURIComponent(h5ModelName)}&url=${encodeURIComponent(h5ModelUrl)}&modelType=stl&dimensions=${encodeURIComponent(JSON.stringify({x:0,y:0,z:0}))}`
        });
      } else {
        uni.showToast({ title: '上传失败', icon: 'none' });
      }
    },
    uploadBlobToServer(tempPath, blob) {
      return new Promise((resolve, reject) => {
        const { BASE_URL } = require('@/constants/index.js');
        const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
        const url = baseUrl + '/api/upload/model';
        
        const formData = new FormData();
        formData.append('file', blob, 'model.stl');
        
        const token = uni.getStorageSync('token') || '';
        
        fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: formData
        })
        .then(res => res.json())
        .then(data => resolve(data))
        .catch(err => reject(err));
      });
    },
    saveStlToFile(content, fileName) {
      return new Promise((resolve, reject) => {
        plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
          fs.root.getFile(fileName, { create: true }, (entry) => {
            entry.createWriter((writer) => {
              writer.onwriteend = () => {
                resolve(entry.fullPath);
              };
              writer.onerror = (e) => {
                reject(e);
              };
              writer.write(content);
            }, reject);
          }, reject);
        }, reject);
      });
    },
    loadDownInitWebview(){
      if(!this.webviewContext){
        const pages = getCurrentPages();
        if(pages && pages[pages.length - 1] && pages[pages.length - 1].$getAppWebview){
          this.webviewContext = pages[pages.length - 1].$getAppWebview().children()[0];      
        }
      }
      

    },
  }
}
</script>

<style>
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  width: 100%;
  height: 44px; /* 标准导航栏高度 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* padding: 0 10px; */
  background-color: #fff; /* 必须有背景色 */
  box-sizing: content-box; /* 让 padding 不计入 height，或者自行调整 */
  z-index: 999;
  
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 20px;
  flex: 1;
  min-width: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  padding-right: 20px;
}

.webview-container {
  flex: 1; /* 占据剩余空间 */
  position: relative;
  width: 100%;
}

/* 移除旧的悬浮样式 */
/* .float-header { ... } */
/* .float-right-header { ... } */

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.title-input {
  font-size: 18px;
  font-weight: 500;
  color: #555;
  margin: 0;
  padding: 0;
  background: transparent;
  height: 32px;
  line-height: 32px;
  width: 150px;
  min-width: 50px;
  display: inline-block;
}

.edit-icon-view {
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  flex-shrink: 0;
  margin-left: 4px;
}

.edit-icon {
  width: 20px;
  height: 20px;
  margin-top: 0;
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

.btn-white {
  font-size: 14px;
  color: #555;
  background: #fff;
  border: 1px solid #999;
  border-radius: 20px;
  padding: 0 12px;
  height: 32px;
  line-height: 30px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-blue {
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

.icon-btn {
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
.webview-placeholder {
    flex: 1;
    background-color: #f0f0f0; /* 占位背景色 */
}
</style>