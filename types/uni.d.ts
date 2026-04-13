declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
    }
  }

  interface UniSuccessResult {
    errMsg: string
    errCode?: number
  }

  interface UniError {
    errMsg: string
    errCode: number
  }

  interface UniShowToastOptions {
    title: string
    icon?: 'success' | 'loading' | 'error' | 'none'
    image?: string
    duration?: number
    mask?: boolean
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniShowLoadingOptions {
    title: string
    mask?: boolean
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniShowModalOptions {
    title: string
    content: string
    showCancel?: boolean
    cancelText?: string
    confirmText?: string
    cancelColor?: string
    confirmColor?: string
    editable?: boolean
    placeholderText?: string
    success?: (res: { confirm: boolean; cancel: boolean }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniNavigateOptions {
    url: string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniNavigateBackOptions {
    delta?: number
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniRequestOptions<T = unknown> {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT'
    data?: unknown
    header?: Record<string, string>
    timeout?: number
    dataType?: string
    responseType?: 'text' | 'arraybuffer'
    enableHttp2?: boolean
    enableQuic?: boolean
    enableCache?: boolean
    enableHttpDNS?: boolean
    httpDNSServiceId?: string
    enableChunked?: boolean
    forceCellularNetwork?: boolean
    enableCookie?: boolean
    enableHttpTrace?: boolean
    enableSSLv3?: boolean
    sslVerifyType?: number
    success?: (res: { statusCode: number; data: T; header: Record<string, string>; cookies: string[] }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniUploadFileOptions {
    url: string
    filePath: string
    name: string
    header?: Record<string, string>
    formData?: Record<string, unknown>
    success?: (res: { statusCode: number; data: string }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniDownloadFileOptions {
    url: string
    header?: Record<string, string>
    success?: (res: { statusCode: number; tempFilePath: string }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniStorageInfo {
    keys: string[]
    currentSize: number
    limitSize: number
  }

  interface UniSystemInfo {
    brand: string
    model: string
    pixelRatio: number
    screenWidth: number
    screenHeight: number
    windowWidth: number
    windowHeight: number
    statusBarHeight: number
    language: string
    version: string
    storage: string
    platform: string
    system: string
    SDKVersion: string
    app: string
    fontSizeSetting: number
    safeArea: {
      left: number
      right: number
      top: number
      bottom: number
      width: number
      height: number
    }
    safeAreaInsets: {
      top: number
      bottom: number
      left: number
      right: number
    }
  }

  interface UniChooseImageOptions {
    count?: number
    sizeType?: ('original' | 'compressed')[]
    sourceType?: ('album' | 'camera')[]
    extension?: string[]
    success?: (res: { tempFilePaths: string[]; tempFiles: Array<{ path: string; size: number }> }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniPreviewImageOptions {
    urls: string[]
    current?: number | string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniSaveImageOptions {
    filePath: string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniOpenBluetoothAdapterOptions {
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniCloseBluetoothAdapterOptions {
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniStartBluetoothDiscoveryOptions {
    services?: string[]
    allowDuplicatesKey?: boolean
    interval?: number
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniBluetoothDevice {
    deviceId: string
    name?: string
    localName?: string
    RSSI?: number
    advertisData?: ArrayBuffer
    advertisServiceUUIDs?: string[]
  }

  interface UniGetBluetoothDevicesOptions {
    success?: (res: { devices: UniBluetoothDevice[]; errMsg: string; errCode?: number }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniCreateBLEConnectionOptions {
    deviceId: string
    timeout?: number
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniCloseBLEConnectionOptions {
    deviceId: string
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniBLEService {
    uuid: string
    isPrimary: boolean
  }

  interface UniGetBLEDeviceServicesOptions {
    deviceId: string
    success?: (res: { services: UniBLEService[]; errMsg: string; errCode?: number }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniBLECharacteristic {
    uuid: string
    properties: {
      read?: boolean
      write?: boolean
      writeNoResponse?: boolean
      notify?: boolean
      indicate?: boolean
    }
  }

  interface UniGetBLEDeviceCharacteristicsOptions {
    deviceId: string
    serviceId: string
    success?: (res: { characteristics: UniBLECharacteristic[]; errMsg: string; errCode?: number }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniWriteBLECharacteristicValueOptions {
    deviceId: string
    serviceId: string
    characteristicId: string
    value: ArrayBuffer
    writeType?: 'write' | 'writeNoResponse'
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniNotifyBLECharacteristicValueChangeOptions {
    deviceId: string
    serviceId: string
    characteristicId: string
    state: boolean
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniBLECharacteristicValueChangeResult {
    deviceId: string
    serviceId: string
    characteristicId: string
    value: ArrayBuffer
  }

  interface UniSetBLEMTUOptions {
    deviceId: string
    mtu: number
    success?: (res: { mtu: number; errMsg: string }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniStartWifiOptions {
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniStopWifiOptions {
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniGetWifiListOptions {
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniWifiInfo {
    SSID: string
    ssid?: string
    BSSID?: string
    secure?: boolean
    signalStrength?: number
    signal?: number
    frequency?: number
  }

  interface UniConnectWifiOptions {
    SSID: string
    BSSID?: string
    password?: string
    success?: (res: UniSuccessResult) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniGetConnectedWifiOptions {
    success?: (res: { wifi: UniWifiInfo; errMsg: string }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniScanCodeOptions {
    onlyFromCamera?: boolean
    scanType?: ('barCode' | 'qrCode' | 'datamatrix' | 'pdf417')[]
    autoDecodeCharSet?: boolean
    success?: (res: { result: string; scanType: string; charSet: string; path: string; rawData: string }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniGetLocationOptions {
    type?: 'wgs84' | 'gcj02'
    altitude?: boolean
    isHighAccuracy?: boolean
    highAccuracyExpireTime?: number
    success?: (res: { latitude: number; longitude: number; accuracy: number; altitude: number; verticalAccuracy: number; horizontalAccuracy: number }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniOpenLocationOptions {
    latitude: number
    longitude: number
    scale?: number
    name?: string
    address?: string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniChooseLocationOptions {
    latitude?: number
    longitude?: number
    success?: (res: { name: string; address: string; latitude: number; longitude: number }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniAuthorizeOptions {
    scope: string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniOpenSettingOptions {
    success?: (res: { authSetting: Record<string, boolean> }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniGetSettingOptions {
    success?: (res: { authSetting: Record<string, boolean> }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniSetClipboardDataOptions {
    data: string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniGetClipboardDataOptions {
    success?: (res: { data: string }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniMakePhoneCallOptions {
    phoneNumber: string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniVibrateOptions {
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniPageScrollToOptions {
    scrollTop?: number
    duration?: number
    selector?: string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniCreateAnimationOptions {
    duration?: number
    timingFunction?: string
    delay?: number
    transformOrigin?: string
  }

  interface UniCanvasToTempFilePathOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    destWidth?: number
    destHeight?: number
    canvasId: string
    fileType?: 'jpg' | 'png'
    quality?: number
    success?: (res: { tempFilePath: string }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniGetImageInfoOptions {
    src: string
    success?: (res: { width: number; height: number; path: string; type: string; orientation: string }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniChooseFileOptions {
    count?: number
    type?: 'all' | 'video' | 'image' | 'file'
    extension?: string[]
    success?: (res: { tempFilePaths: string[]; tempFiles: Array<{ path: string; size: number; name: string; type: string }> }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniChooseVideoOptions {
    sourceType?: ('album' | 'camera')[]
    compressed?: boolean
    maxDuration?: number
    camera?: 'back' | 'front'
    success?: (res: { tempFilePath: string; duration: number; size: number; height: number; width: number }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniChooseMediaOptions {
    count?: number
    mediaType?: ('image' | 'video')[]
    sourceType?: ('album' | 'camera')[]
    maxDuration?: number
    camera?: 'back' | 'front'
    success?: (res: { tempFiles: Array<{ tempFilePath: string; size: number; duration: number; width: number; height: number; fileType: 'image' | 'video' }> }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniOpenDocumentOptions {
    filePath: string
    fileType?: 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'pdf'
    showMenu?: boolean
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniShowActionSheetOptions {
    itemList: string[]
    itemColor?: string
    success?: (res: { tapIndex: number }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniSetTabBarItemOptions {
    index: number
    text?: string
    iconPath?: string
    selectedIconPath?: string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniSetTabBarBadgeOptions {
    index: number
    text: string
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniHideTabBarRedDotOptions {
    index: number
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniShareOptions {
    provider: string
    scene?: string
    type?: number
    title?: string
    summary?: string
    href?: string
    imageUrl?: string
    mediaUrl?: string
    miniProgram?: {
      id: string
      path: string
      type: number
      webUrl: string
    }
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniShowShareMenuOptions {
    withShareTicket?: boolean
    menus?: string[]
    success?: () => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniLoginOptions {
    provider?: string
    scopes?: string | string[]
    timeout?: number
    univerifyStyle?: Record<string, unknown>
    onlyAuthorize?: boolean
    success?: (res: { code: string; authResult: Record<string, unknown> }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface UniGetUserInfoOptions {
    provider?: string
    lang?: 'en' | 'zh_CN' | 'zh_TW'
    timeout?: number
    success?: (res: { userInfo: Record<string, unknown>; rawData: string; signature: string; encryptedData: string; iv: string; cloudID: string }) => void
    fail?: (err: UniError) => void
    complete?: () => void
  }

  interface Uni {
    request<T = unknown>(options: UniRequestOptions<T>): ReturnType<typeof setTimeout>
    uploadFile(options: UniUploadFileOptions): ReturnType<typeof setTimeout>
    downloadFile(options: UniDownloadFileOptions): ReturnType<typeof setTimeout>
    showLoading(options: UniShowLoadingOptions): void
    hideLoading(): void
    showToast(options: UniShowToastOptions): void
    showModal(options: UniShowModalOptions): void
    showActionSheet(options: UniShowActionSheetOptions): void
    getStorageSync<T = unknown>(key: string): T | undefined
    setStorageSync(key: string, value: unknown): void
    removeStorageSync(key: string): void
    getStorageInfoSync(): UniStorageInfo
    addInterceptor(name: string, interceptor: Record<string, unknown>): void
    reLaunch(options: UniNavigateOptions): void
    navigateTo(options: UniNavigateOptions): void
    navigateBack(options?: UniNavigateBackOptions): void
    switchTab(options: UniNavigateOptions): void
    redirectTo(options: UniNavigateOptions): void
    $emit(event: string, ...args: unknown[]): void
    $on(event: string, callback: (...args: unknown[]) => void): void
    $off(event: string, callback?: (...args: unknown[]) => void): void
    getSystemInfoSync(): UniSystemInfo
    getSystemInfo(options: { success?: (res: UniSystemInfo) => void; fail?: (err: UniError) => void; complete?: () => void }): void
    upx2px(upx: number): number
    setTabBarItem(options: UniSetTabBarItemOptions): void
    setTabBarBadge(options: UniSetTabBarBadgeOptions): void
    hideTabBarRedDot(options: UniHideTabBarRedDotOptions): void
    chooseImage(options: UniChooseImageOptions): void
    previewImage(options: UniPreviewImageOptions): void
    saveImageToPhotosAlbum(options: UniSaveImageOptions): void
    getRecorderManager(): unknown
    createInnerAudioContext(): unknown
    chooseFile(options: UniChooseFileOptions): void
    chooseVideo(options: UniChooseVideoOptions): void
    chooseMedia(options: UniChooseMediaOptions): void
    openDocument(options: UniOpenDocumentOptions): void
    getFileSystemManager(): unknown
    openBluetoothAdapter(options: UniOpenBluetoothAdapterOptions): void
    closeBluetoothAdapter(options: UniCloseBluetoothAdapterOptions): void
    getBluetoothAdapterState(options: { success?: (res: { available: boolean; discovering: boolean }) => void; fail?: (err: UniError) => void; complete?: () => void }): void
    startBluetoothDevicesDiscovery(options: UniStartBluetoothDiscoveryOptions): void
    stopBluetoothDevicesDiscovery(options: { success?: () => void; fail?: (err: UniError) => void; complete?: () => void }): void
    getBluetoothDevices(options: UniGetBluetoothDevicesOptions): void
    createBLEConnection(options: UniCreateBLEConnectionOptions): void
    closeBLEConnection(options: UniCloseBLEConnectionOptions): void
    getBLEDeviceServices(options: UniGetBLEDeviceServicesOptions): void
    getBLEDeviceCharacteristics(options: UniGetBLEDeviceCharacteristicsOptions): void
    writeBLECharacteristicValue(options: UniWriteBLECharacteristicValueOptions): void
    notifyBLECharacteristicValueChange(options: UniNotifyBLECharacteristicValueChangeOptions): void
    onBLECharacteristicValueChange(callback: (res: UniBLECharacteristicValueChangeResult) => void): void
    offBLECharacteristicValueChange(callback?: (res: UniBLECharacteristicValueChangeResult) => void): void
    onBluetoothDeviceFound(callback: (res: { devices: UniBluetoothDevice[] }) => void): void
    offBluetoothDeviceFound(callback?: (res: { devices: UniBluetoothDevice[] }) => void): void
    setBLEMTU(options: UniSetBLEMTUOptions): void
    startWifi(options: UniStartWifiOptions): void
    stopWifi(options: UniStopWifiOptions): void
    getWifiList(options: UniGetWifiListOptions): void
    onGetWifiList(callback: (res: { wifiList: UniWifiInfo[] }) => void): void
    offGetWifiList(callback?: (res: { wifiList: UniWifiInfo[] }) => void): void
    connectWifi(options: UniConnectWifiOptions): void
    getConnectedWifi(options: UniGetConnectedWifiOptions): void
    showShareMenu(options: UniShowShareMenuOptions): void
    share(options: UniShareOptions): void
    createSelectorQuery(): unknown
    onKeyboardHeightChange(callback: (res: { height: number; duration: number }) => void): void
    offKeyboardHeightChange(callback?: (res: { height: number; duration: number }) => void): void
    scanCode(options: UniScanCodeOptions): void
    getLocation(options: UniGetLocationOptions): void
    openLocation(options: UniOpenLocationOptions): void
    chooseLocation(options: UniChooseLocationOptions): void
    authorize(options: UniAuthorizeOptions): void
    openSetting(options: UniOpenSettingOptions): void
    getSetting(options: UniGetSettingOptions): void
    setClipboardData(options: UniSetClipboardDataOptions): void
    getClipboardData(options: UniGetClipboardDataOptions): void
    makePhoneCall(options: UniMakePhoneCallOptions): void
    vibrateLong(options?: UniVibrateOptions): void
    vibrateShort(options?: UniVibrateOptions): void
    pageScrollTo(options: UniPageScrollToOptions): void
    createAnimation(options?: UniCreateAnimationOptions): unknown
    canvasToTempFilePath(options: UniCanvasToTempFilePathOptions, component?: unknown): void
    getImageInfo(options: UniGetImageInfoOptions): void
    clearStorage(options?: { success?: () => void; fail?: (err: UniError) => void; complete?: () => void }): void
    clearStorageSync(): void
    login(options: UniLoginOptions): void
    getUserInfo(options: UniGetUserInfoOptions): void
    $http: unknown
  }

  interface PlusAndroidRuntimeActivity {
    requestPermissions(permissions: string[], success: (result: { granted: string[]; deniedPresent: string[]; deniedAlways: string[] }) => void, fail: (err: Error) => void): void
  }

  interface PlusAndroid {
    runtimeMainActivity(): PlusAndroidRuntimeActivity
    importClass(className: string): unknown
  }

  interface Plus {
    android: PlusAndroid
    runtime: {
      openURL(url: string): void
    }
    io: {
      resolveLocalFileSystemURL(url: string, success: (entry: unknown) => void, fail: (err: Error) => void): void
    }
    gallery: {
      save(url: string, success: () => void, fail: (err: Error) => void): void
    }
  }

  const plus: Plus
  const wx: unknown
  const AppleID: unknown

  const uni: Uni
  function getCurrentPages(): Array<{ route: string; options: Record<string, string> }>
  const process: NodeJS.Process
}

export {}

declare module '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, unknown, unknown>
  export default component
}
