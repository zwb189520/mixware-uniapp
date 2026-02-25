export default {
  data() {
    return {
      statusBarHeight: 0
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  }
}