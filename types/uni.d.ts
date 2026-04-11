// uni-app 全局类型定义
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
    }
  }

  interface Uni {
    // 网络请求
    request(options: any): any
    uploadFile(options: any): any
    downloadFile(options: any): any
    // 提示框
    showLoading(options: any): void
    hideLoading(): void
    showToast(options: any): void
    showModal(options: any): void
    showActionSheet(options: any): void
    // 存储
    getStorageSync(key: string): any
    setStorageSync(key: string, value: any): void
    removeStorageSync(key: string): void
    getStorageInfoSync(): any
    // 拦截器
    addInterceptor(name: string, interceptor: any): void
    // 导航
    reLaunch(options: any): void
    navigateTo(options: any): void
    navigateBack(options?: any): void
    switchTab(options: any): void
    redirectTo(options: any): void
    // 事件
    $emit(event: string, ...args: any[]): void
    $on(event: string, callback: (...args: any[]) => void): void
    $off(event: string, callback?: (...args: any[]) => void): void
    // 系统信息
    getSystemInfoSync(): any
    getSystemInfo(options: any): void
    upx2px(upx: number): number
    // TabBar
    setTabBarItem(options: any): void
    setTabBarBadge(options: any): void
    hideTabBarRedDot(options: any): void
    // 媒体
    chooseImage(options: any): void
    previewImage(options: any): void
    saveImageToPhotosAlbum(options: any): void
    getRecorderManager(): any
    createInnerAudioContext(): any
    chooseFile(options: any): void
    chooseVideo(options: any): void
    chooseMedia(options: any): void
    // 文件
    openDocument(options: any): void
    getFileSystemManager(): any
    // 蓝牙
    openBluetoothAdapter(options: any): void
    closeBluetoothAdapter(options: any): void
    getBluetoothAdapterState(options: any): void
    startBluetoothDevicesDiscovery(options: any): void
    stopBluetoothDevicesDiscovery(options: any): void
    getBluetoothDevices(options: any): void
    createBLEConnection(options: any): void
    closeBLEConnection(options: any): void
    getBLEDeviceServices(options: any): void
    getBLEDeviceCharacteristics(options: any): void
    writeBLECharacteristicValue(options: any): void
    notifyBLECharacteristicValueChange(options: any): void
    onBLECharacteristicValueChange(callback: (res: any) => void): void
    offBLECharacteristicValueChange(callback?: (res: any) => void): void
    onBluetoothDeviceFound(callback: (res: any) => void): void
    offBluetoothDeviceFound(callback?: (res: any) => void): void
    setBLEMTU(options: any): void
    // WiFi
    startWifi(options: any): void
    stopWifi(options: any): void
    getWifiList(options: any): void
    onGetWifiList(callback: (res: any) => void): void
    offGetWifiList(callback?: (res: any) => void): void
    connectWifi(options: any): void
    getConnectedWifi(options: any): void
    // 分享
    showShareMenu(options: any): void
    share(options: any): void
    // 选择器
    createSelectorQuery(): any
    // 键盘
    onKeyboardHeightChange(callback: (res: any) => void): void
    offKeyboardHeightChange(callback?: (res: any) => void): void
    // 扫码
    scanCode(options: any): void
    // 位置
    getLocation(options: any): void
    openLocation(options: any): void
    chooseLocation(options: any): void
    // 权限
    authorize(options: any): void
    openSetting(options: any): void
    getSetting(options: any): void
    // 剪贴板
    setClipboardData(options: any): void
    getClipboardData(options: any): void
    // 其他
    makePhoneCall(options: any): void
    vibrateLong(options?: any): void
    vibrateShort(options?: any): void
    pageScrollTo(options: any): void
    createAnimation(options?: any): any
    canvasToTempFilePath(options: any, component?: any): void
    getImageInfo(options: any): void
    clearStorage(options?: any): void
    clearStorageSync(): void
    login(options: any): void
    getUserInfo(options: any): void
    $http: any
  }

  const plus: any
  const wx: any
  const AppleID: any

  const uni: Uni
  function getCurrentPages(): any[]
  const process: NodeJS.Process
}

export {}

declare module '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}
