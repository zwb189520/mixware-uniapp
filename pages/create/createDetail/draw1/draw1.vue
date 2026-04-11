<template>
  <view class="container">
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left">
        <view class="back-btn" @click="goBack">
          <uni-icons type="left" size="24" color="#333"></uni-icons>
        </view>
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

      <view class="nav-right">
        <template v-if="!is3DView">
          <view class="btn-save" @click="handleSave">{{ texts.saveEdit || '保存编辑' }}</view>
          <view class="btn-next" @click="handleNext">{{ texts.nextStep || '下一步' }}</view>
        </template>

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

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import { uploadModelFile, uploadImage } from '@/api/upload'
import { createModelTask } from '@/api/modelTasks.ts'
import { useLanguageStore } from '@/stores'
import { API } from '@/constants/index'

interface WebviewMessage {
  action?: string
  snapshot?: string
  stl?: string
  data?: any
  sketchData?: { data?: { spaces?: { objects: any[] }[] } }
  [key: string]: any
}

interface ModelDimensions {
  x: number
  y: number
  z: number
}

const languageStore = useLanguageStore()
const url = ref('http://app.mixwarebot.cn/?token=uniapp_user_123')
// const url = ref('http://192.168.0.43:8081/?token=uniapp_user_123')
const statusBarHeight = ref(0)
const postNumber = ref(0)
const webviewContext = ref<any>(null)
const modelName = ref('')
const isFocus = ref(false)
const isLoadDown3dView = ref(false)
const sketchData = ref(false)
const sketchDataJson = ref<any>(null)
const is3DView = ref(false)
const platform = ref<string | boolean>(false)
const isPrinting = ref(false)
const isUnloading = ref(false)
const plusMessageListener = ref<any>(null)
const webviewStyles = ref({
  width: '50px',
  height: '50px',
  progress: {
    color: '#FF3333'
  }
})

const texts = computed(() => (languageStore.texts as any).create?.draw1 || {})

onMounted(() => {
  languageStore.loadLanguage()

  const systemInfo = uni.getSystemInfoSync()
  if ((systemInfo as any).uniPlatform) {
    console.log('当前是运行环境是：' + (systemInfo as any).uniPlatform)
    platform.value = (systemInfo as any).uniPlatform
    if ((systemInfo as any).uniPlatform === 'web') {
      console.log('当前是 H5----------------------')
    } else {
      console.log('当前是 App-------------------')
    }
  } else {
    console.log('当前是运行环境是：' + systemInfo.platform)
    platform.value = systemInfo.platform
  }

  if (platform.value && platform.value != 'web') {
    plus.screen.lockOrientation('landscape-primary')
    plus.navigator.setFullscreen(true)
    statusBarHeight.value = 0
  } else {
    statusBarHeight.value = systemInfo.statusBarHeight || 0
  }

  if (platform.value && platform.value === 'web') {
    window.addEventListener('message', handleH5Message)
  }
})

onUnmounted(() => {
  isUnloading.value = true
  console.log('执行 onUnload 清理...')

  if (platform.value && platform.value != 'web') {
    if (typeof plus !== 'undefined' && plus.screen) {
      plus.screen.lockOrientation('portrait-primary')
      plus.navigator.setFullscreen(false)
    }

    if (webviewContext.value) {
      webviewContext.value.loadURL('about:blank')
      webviewContext.value.close()
      webviewContext.value = null
      console.log('Webview 已销毁')
    }
  }

  if (platform.value && platform.value === 'web') {
    try {
      window.removeEventListener('message', handleH5Message)
    } catch (e) {
      console.error('移除 H5 消息监听失败:', e)
    }
  }
})

onShow(() => {
  // 页面显示时强制设置为横屏
  if (platform.value && platform.value != 'web') {
    console.log('onShow 设置横屏')
    plus.screen.lockOrientation('landscape-primary')
    plus.navigator.setFullscreen(true)

    // 显示webview
    if (webviewContext.value) {
      console.log('onShow: 显示webview')
      webviewContext.value.show()
    }
  }
})

onMounted(() => {
  if (platform.value && platform.value != 'web') {
    console.log('onMounted 执行中...')

    const topOffset = statusBarHeight.value + 44
    const sysInfo = uni.getSystemInfoSync()
    const windowHeight = sysInfo.windowHeight
    const windowWidth = sysInfo.windowWidth
    const webviewHeight = windowHeight - topOffset
    const initWebviewHeight = webviewHeight > windowWidth ? windowWidth : webviewHeight

    const wvId = 'custom-webview-' + Date.now()

    const wv = plus.webview.create(url.value, wvId, {
      top: topOffset + 'px',
      height: initWebviewHeight + 'px',
      position: 'absolute',
      background: 'transparent',
      scalable: false,
      plusrequire: 'ahead'
    })

    const currentWebview = (getCurrentInstance() as any).proxy.$scope.$getAppWebview()
    currentWebview.append(wv)

    webviewContext.value = wv

    console.log(`手动创建 Webview 成功: top=${topOffset}px, height=${initWebviewHeight}px`)

    wv.addEventListener(
      'loaded',
      () => {
        console.log('Webview 加载完成')
        // 延迟通知 H5 初始化，确保消息通道就绪
        setTimeout(() => {
          wv.evalJS(`
          if (window.onUniAppMessageReady) {
            window.onUniAppMessageReady();
          }
        `)
        }, 200)
      },
      false
    )

    plusMessageListener.value = (msg: any) => {
      if (
        msg.data &&
        msg.data.args &&
        msg.data.args.data &&
        msg.data.args.data.name == 'postMessage'
      ) {
        const evt = {
          detail: {
            data: msg.data.args.data.arg
          }
        }
        handleWebviewMessage(evt)
      }
    }
    ;(plus as any).globalEvent.addEventListener('plusMessage', plusMessageListener.value)
  }
})

const sendMessage = (action: string, data: any = {}) => {
  if (platform.value && platform.value != 'web') {
    if (webviewContext.value) {
      webviewContext.value.evalJS(`
        window.postMessage({
          action: '${action}',
          data: ${JSON.stringify(data)}
        }, '*')
      `)
    }
  }

  if (platform.value && platform.value === 'web') {
    const iframe = document.querySelector('iframe')
    if (iframe) {
      ;(iframe as any).contentWindow.postMessage(
        {
          action: action,
          data: data
        },
        '*'
      )
    }
  }
}

const goBack = () => {
  console.log('goBack调用, is3DView:', is3DView.value)
  if (is3DView.value == true) {
    is3DView.value = false
    sendMessage('switchMobileView', { tab: '2d' })
  } else {
    if (webviewContext.value) {
      webviewContext.value.loadURL('about:blank')
      webviewContext.value.close()
      webviewContext.value = null
    }
    uni.reLaunch({ url: '/pages/create/create/create' })
  }
}

const uploadSnapshotAndExportSTL = async (base64: string) => {
  // 去掉 base64 前缀
  let pureBase64 = base64
  if (base64.includes(',')) {
    pureBase64 = base64.split(',')[1]
  }
  console.log('处理截图，base64长度:', pureBase64.length)

  // APP端使用plus
  // @ts-ignore
  if (typeof plus !== 'undefined') {
    try {
      const bitmap = new (plus.nativeObj as any).Bitmap('snapshot_' + Date.now())
      bitmap.loadBase64Data(
        pureBase64,
        async () => {
          const fileName = '_doc/snapshot_' + Date.now() + '.png'
          bitmap.save(
            fileName,
            { overwrite: true },
            async () => {
              // 上传图片
              try {
                const uploadRes = (await uploadImage(fileName, 'model', 'custom')) as any
                console.log('截图上传响应:', uploadRes)
                if (uploadRes.code === 1 && uploadRes.data) {
                  const url = uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.path
                  if (url) {
                    snapshotImageUrl.value = url
                    console.log('截图上传成功:', snapshotImageUrl.value)
                  } else {
                    console.log('截图上传响应无URL字段:', uploadRes.data)
                  }
                } else {
                  console.log('截图上传失败:', uploadRes)
                }
              } catch (err) {
                console.error('截图上传异常:', err)
              }
              bitmap.clear()
              // 继续导出STL
              sendMessage('exportSTL')
            },
            (err: any) => {
              console.error('保存截图文件失败:', err)
              bitmap.clear()
              sendMessage('exportSTL')
            }
          )
        },
        (err: any) => {
          console.error('加载base64图片失败:', err)
          sendMessage('exportSTL')
        }
      )
    } catch (error) {
      console.error('上传截图失败:', error)
      sendMessage('exportSTL')
    }
  } else {
    // H5端
    console.log('H5开始处理截图上传')
    try {
      const base64Data = pureBase64
      console.log('base64数据长度:', base64Data.length)
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const imageBlob = new Blob([byteArray], { type: 'image/png' })
      console.log('图片Blob大小:', imageBlob.size)

      const formData = new FormData()
      formData.append('file', imageBlob, 'snapshot.png')
      formData.append('type', 'model')
      formData.append('id', 'custom')

      const baseUrl = API.BASE_URL.endsWith('/') ? API.BASE_URL.slice(0, -1) : API.BASE_URL
      console.log('上传图片到:', baseUrl + '/upload/image')

      fetch(baseUrl + '/upload/image', {
        method: 'POST',
        headers: {
          Authorization: uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : ''
        },
        body: formData
      })
        .then(res => res.json())
        .then(res => {
          console.log('H5截图上传响应:', res)
          console.log('响应data:', res.data, 'data类型:', typeof res.data)
          if (res.code === 1 && res.data) {
            const url = res.data.url || res.data.fileUrl || res.data.path
            if (url) {
              snapshotImageUrl.value = url
              console.log('H5截图上传成功:', snapshotImageUrl.value)
            } else {
              console.log('响应中无URL字段:', res.data)
            }
          } else {
            console.log('H5截图上传失败:', res)
          }
          sendMessage('exportSTL')
        })
        .catch(err => {
          console.error('H5截图上传异常:', err)
          sendMessage('exportSTL')
        })
    } catch (err) {
      console.error('H5截图处理失败:', err)
      sendMessage('exportSTL')
    }
  }
}

const saveImageToPhotosAlbum = (base64: string) => {
  // #ifdef APP-PLUS
  const bitmap = new (plus.nativeObj as any).Bitmap('snapshot_' + Date.now())
  bitmap.loadBase64Data(
    base64,
    () => {
      const fileName = '_doc/' + Date.now() + '.png'
      bitmap.save(
        fileName,
        { overwrite: true },
        () => {
          uni.saveImageToPhotosAlbum({
            filePath: fileName,
            success: () => {
              uni.showToast({ title: texts.value.savedToAlbum || '已保存到相册', icon: 'success' })
              bitmap.clear()
            },
            fail: () => {
              uni.showToast({
                title: texts.value.saveToAlbumFailed || '保存到相册失败',
                icon: 'none'
              })
              bitmap.clear()
            }
          })
        },
        () => {
          uni.showToast({
            title: texts.value.saveImageFileFailed || '保存图片文件失败',
            icon: 'none'
          })
          bitmap.clear()
        }
      )
    },
    () => {
      uni.showToast({ title: texts.value.parseImageDataFailed || '解析图片数据失败', icon: 'none' })
      bitmap.clear()
    }
  )
  // #endif

  // #ifdef H5
  const link = document.createElement('a')
  link.href = base64
  link.download = 'model_snapshot.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // #endif
}

const handleIconClick = () => {
  isFocus.value = true
}

const handleSave = () => {
  if (
    modelName.value == (texts.value.placeholder || '为模型取名') ||
    modelName.value.trim() == ''
  ) {
    isFocus.value = true
  } else {
    console.log('保存编辑')
    uni.showToast({
      title: texts.value.saveSuccess || '保存成功',
      icon: 'success',
      duration: 2000
    })
  }
}

const handleNext = () => {
  console.log('下一步')
  is3DView.value = true
  sendMessage('handleNextPage', { id: 123, text: 'hello' })
}

const handleSnapshot = () => {
  console.log('拍照')
  sendMessage('snapshot')
}

const handleShare = () => {
  console.log('分享模型')
  sendMessage('exportSTL')
}

const snapshotImageUrl = ref('')

const handlePrint = () => {
  console.log('去打印')
  isPrinting.value = true
  snapshotImageUrl.value = ''
  uni.showLoading({
    title: languageStore.texts.create.generating3D || '生成3D模型中...',
    mask: true
  })
  // 先截图
  sendMessage('snapshot')
}

const handleWebviewMessage = (evt: any) => {
  if (isUnloading.value) return

  const msg: WebviewMessage = evt.detail.data
  // 只打印action，不打印完整数据
  console.log('消息action:', msg.action)

  if (msg.action == 'loadDown') {
    isLoadDown3dView.value = true
    if (postNumber.value === 0) {
      console.log('页面加载完成 初始化webview')
      postNumber.value++
    }
  }

  if (msg.action === 'snapshot') {
    console.log('接收3d快照数据成功, isPrinting:', isPrinting.value, 'hasSnapshot:', !!msg.snapshot)
    if (msg.snapshot) {
      if (isPrinting.value) {
        console.log('开始上传截图')
        uploadSnapshotAndExportSTL(msg.snapshot)
      } else {
        saveImageToPhotosAlbum(msg.snapshot)
      }
    } else {
      console.log('snapshot数据为空')
      if (isPrinting.value) {
        isPrinting.value = false
        uni.hideLoading()
        uni.showToast({ title: texts.value.noModelData || '请先绘制模型', icon: 'none' })
      }
    }
  }

  if (msg.stl) {
    console.log('接收到STL字符串')
    if (isPrinting.value) {
      uploadAndNavigateToPrint(msg.stl)
    } else {
      saveAndShareStl(msg.stl)
    }
  } else if (msg.action === 'stlData' && msg.data) {
    if (isPrinting.value) {
      uploadAndNavigateToPrint(msg.data)
    } else {
      saveAndShareStl(msg.data)
    }
  }

  if (msg.action === 'sketchData') {
    if ((msg.sketchData?.data?.spaces?.[0]?.objects as any)?.length > 0) {
      sketchData.value = true
      sketchDataJson.value = msg.sketchData
    }

    if (sketchData.value === true || modelName.value.trim() != '') {
      console.log('检测2d草图数据存在:' + sketchData.value + '，模型名为：' + modelName.value)
      showSaveModal()
    } else {
      console.log('检测2d草图数据不存在:' + sketchData.value + '，模型名为空：' + modelName.value)
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({
          url: '/pages/create/create/create'
        })
      }
    }
  }

  if (msg.action === 'modelDataForPrint') {
    const modelData = msg.data
    const modelId = modelData.id || 'custom_' + Date.now()
    const modelNameVal =
      modelData.name || modelName.value || texts.value.unnamedModel || '未命名模型'
    const modelUrl = modelData.url || ''
    const modelType = modelData.modelType || 'stl'
    const dimensions = modelData.dimensions || { x: 0, y: 0, z: 0 }

    uni.navigateTo({
      url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${modelId}&name=${encodeURIComponent(modelNameVal)}&url=${encodeURIComponent(modelUrl)}&modelType=${modelType}&dimensions=${encodeURIComponent(JSON.stringify(dimensions))}`
    })
  }
}

const handleH5Message = (event: MessageEvent) => {
  let msgData: any = null
  if ((event.data as any)?.data?.arg) {
    msgData = (event.data as any).data.arg
  } else if ((event.data as any)?.action) {
    msgData = event.data
  }
  if (msgData) {
    handleWebviewMessage({
      detail: {
        data: msgData
      }
    })
  }
}

const showSaveModal = () => {
  uni.showModal({
    title: '',
    content: texts.value.exitConfirm || '您有未保存的操作，确定要退出吗？',
    cancelText: texts.value.dontSave || '不保存',
    confirmText: texts.value.save || '保存',
    success: (res: { confirm: boolean; cancel: boolean }) => {
      if (res.confirm) {
        handleSave()
      } else if (res.cancel) {
        setTimeout(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            uni.navigateBack()
          } else {
            uni.reLaunch({
              url: '/pages/create/create/create'
            })
          }
        }, 100)
      }
    }
  })
}

const saveAndShareStl = (content: string) => {
  // #ifdef APP-PLUS
  const fileName = 'model_' + Date.now() + '.stl'

  plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => {
    fs.root?.getFile(fileName, { create: true }, entry => {
      entry.createWriter(writer => {
        writer.onwriteend = () => {
          console.log('写入成功')
          const filePath = entry.fullPath || ''

          plus.share.sendWithSystem(
            {
              content: texts.value.shareModel || '分享模型',
              href: filePath,
              pictures: [filePath]
            },
            () => {
              console.log('分享成功')
            },
            e => {
              console.log('分享失败: ' + JSON.stringify(e))
              uni.openDocument({
                filePath: filePath,
                showMenu: true,
                success: function () {
                  console.log('打开文档成功')
                }
              })
            }
          )
        }

        writer.onerror = e => {
          console.log('写入失败', e)
          uni.showToast({ title: texts.value.saveFileFailed || '保存文件失败', icon: 'none' })
        }

        writer.write(content)
      })
    })
  })
  return
  // #endif

  // #ifdef H5
  const blob = new Blob([content], { type: 'model/stl' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'model.stl'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // #endif
}

const uploadAndNavigateToPrint = async (stlContent: string) => {
  isPrinting.value = false
  uni.showLoading({ title: languageStore.texts.create.generating3D || '上传模型中...' })

  try {
    const systemInfo = uni.getSystemInfoSync()
    console.log('当前平台:', (systemInfo as any).uniPlatform)
    const isApp =
      (systemInfo as any).uniPlatform === 'app' || (systemInfo as any).uniPlatform === 'app-plus'
    const isH5 = (systemInfo as any).uniPlatform === 'web' || !isApp

    console.log('平台判断:', { isApp, isH5 })

    if (isApp) {
      console.log('执行App上传逻辑')
      await uploadAndNavigateApp(stlContent)
    } else if (isH5) {
      console.log('执行H5上传逻辑')
      await uploadAndNavigateH5(stlContent)
    }
  } catch (error) {
    uni.hideLoading()
    console.error('上传模型失败:', error)
    uni.showToast({ title: texts.value.uploadFailed || '上传失败', icon: 'none' })
  }
}

const uploadAndNavigateApp = async (stlContent: string) => {
  try {
    // 等待截图上传完成（最多等2秒）
    let waitCount = 0
    while (!snapshotImageUrl.value && waitCount < 20) {
      await new Promise(resolve => setTimeout(resolve, 100))
      waitCount++
    }
    console.log(
      '截图URL:',
      snapshotImageUrl.value,
      '等待次数:',
      waitCount,
      'isPrinting:',
      isPrinting.value
    )

    console.log('开始保存STL文件')
    const fileName = 'temp_model_' + Date.now() + '.stl'
    const filePath = await saveStlToFile(stlContent, fileName)
    console.log('STL文件保存成功:', filePath)

    console.log('开始上传模型文件')
    const uploadRes = (await uploadModelFile(filePath, {
      showLoading: false
    })) as any
    console.log('上传响应:', uploadRes)

    uni.hideLoading()

    if (uploadRes.code === 1 && uploadRes.data) {
      console.log('上传成功，data:', uploadRes.data)
      let modelUrl = uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.path
      modelUrl = modelUrl.replace(/[`\s]/g, '')
      console.log('modelUrl:', modelUrl)

      if (!modelUrl) {
        uni.showToast({ title: texts.value.getModelLinkFailed || '获取模型链接失败', icon: 'none' })
        return
      }

      const modelId = 'custom_' + Date.now()
      const modelNameVal = modelName.value || texts.value.unnamedModel || '未命名模型'

      console.log(
        '准备跳转，URL:',
        `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${modelId}&name=${encodeURIComponent(modelNameVal)}&url=${encodeURIComponent(modelUrl)}&modelType=stl`
      )

      if (webviewContext.value) {
        webviewContext.value.hide()
      }

      // #ifdef APP-PLUS
      plus.screen.lockOrientation('portrait-primary')
      // #endif

      const imageUrl = snapshotImageUrl.value || ''

      // 创建模型生成任务记录
      let modelTaskId = ''
      try {
        const taskRes = await createModelTask({
          sourceModelUrl: modelUrl,
          previewUrl: imageUrl,
          scaleFactor: 1
        })
        if ((taskRes as any).code === 1 && (taskRes as any).data) {
          modelTaskId = (taskRes as any).data.taskId || (taskRes as any).data.id || ''
        }
      } catch (e) {
        console.error('创建模型任务记录失败:', e)
      }

      uni.navigateTo({
        url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${modelTaskId || modelId}&name=${encodeURIComponent(modelNameVal)}&url=${encodeURIComponent(modelUrl)}&modelType=stl&dimensions=${encodeURIComponent(JSON.stringify({ x: 0, y: 0, z: 0 }))}&imageUrl=${encodeURIComponent(imageUrl)}`,
        success: () => {
          console.log('跳转成功')
        },
        fail: (err: any) => {
          console.error('跳转失败:', err)
          if (webviewContext.value) {
            webviewContext.value.show()
          }
          uni.showToast({ title: texts.value.navigationFailed || '跳转失败', icon: 'none' })
        }
      })
    } else {
      console.error('上传失败，响应:', uploadRes)
      uni.showToast({ title: texts.value.uploadFailed || '上传失败', icon: 'none' })
    }
  } catch (err: any) {
    console.error('uploadAndNavigateApp 错误:', err)
    uni.hideLoading()
    uni.showToast({
      title:
        (texts.value.uploadFailed || '上传失败') +
        ': ' +
        (err.message || texts.value.unknownError || '未知错误'),
      icon: 'none'
    })
  }
}

const uploadAndNavigateH5 = async (stlContent: string) => {
  // 等待截图上传完成（最多等5秒）
  let waitCount = 0
  while (!snapshotImageUrl.value && waitCount < 50) {
    await new Promise(resolve => setTimeout(resolve, 100))
    waitCount++
  }
  console.log('H5截图URL:', snapshotImageUrl.value, '等待次数:', waitCount)

  const blob = new Blob([stlContent], { type: 'model/stl' })
  const tempFilePath = URL.createObjectURL(blob)

  const h5UploadRes = await uploadBlobToServer(tempFilePath, blob)

  uni.hideLoading()

  if (h5UploadRes.code === 1 && h5UploadRes.data) {
    const h5ModelUrl = h5UploadRes.data.url || h5UploadRes.data.fileUrl

    const h5ModelId = 'custom_' + Date.now()
    const h5ModelName = modelName.value || texts.value.unnamedModel || '未命名模型'
    const h5ImageUrl = snapshotImageUrl.value || ''

    // 创建模型生成任务记录
    let modelTaskId = ''
    try {
      const taskRes = await createModelTask({
        sourceModelUrl: h5ModelUrl,
        previewUrl: h5ImageUrl,
        scaleFactor: 1
      })
      if ((taskRes as any).code === 1 && (taskRes as any).data) {
        modelTaskId = (taskRes as any).data.taskId || (taskRes as any).data.id || ''
      }
    } catch (e) {
      console.error('创建模型任务记录失败:', e)
    }

    uni.navigateTo({
      url: `/pages/explore/3Dpreviewdetail/preview3DDetail?id=${modelTaskId || h5ModelId}&name=${encodeURIComponent(h5ModelName)}&url=${encodeURIComponent(h5ModelUrl)}&modelType=stl&dimensions=${encodeURIComponent(JSON.stringify({ x: 0, y: 0, z: 0 }))}&imageUrl=${encodeURIComponent(h5ImageUrl)}`
    })
  } else {
    uni.showToast({ title: texts.value.uploadFailed || '上传失败', icon: 'none' })
  }
}

const uploadBlobToServer = (tempPath: string, blob: Blob): Promise<any> => {
  return new Promise((resolve, reject) => {
    const baseUrl = API.BASE_URL.endsWith('/') ? API.BASE_URL.slice(0, -1) : API.BASE_URL
    const url = baseUrl + '/upload/model'

    const formData = new FormData()
    formData.append('file', blob, 'model.stl')

    const token = uni.getStorageSync('token') || ''

    fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: formData
    })
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => reject(err))
  })
}

const saveStlToFile = (content: string, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    plus.io.requestFileSystem(
      plus.io.PRIVATE_DOC,
      fs => {
        fs.root?.getFile(
          fileName,
          { create: true },
          entry => {
            entry.createWriter(writer => {
              writer.onwriteend = () => {
                resolve(entry.fullPath || '')
              }
              writer.onerror = e => {
                reject(e)
              }
              writer.write(content)
            }, reject)
          },
          reject
        )
      },
      reject
    )
  })
}

import { getCurrentInstance } from 'vue'
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
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  box-sizing: content-box;
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
  flex: 1;
  position: relative;
  width: 100%;
}

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
  background: #007aff;
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
}

.btn-next {
  font-size: 14px;
  color: #fff;
  background: #007aff;
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
  background-color: #f0f0f0;
}
</style>
