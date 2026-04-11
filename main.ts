import App from './App.vue'

// #ifndef VUE3
import * as Vue from 'vue'
import './uni.promisify.adaptor'
;(Vue as any).config.productionTip = false
;(App as any).mpType = 'app'
const app = new (Vue as any)({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import pinia from './stores'
// @ts-ignore
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import SafeArea from '@/components/safe-area/safe-area.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  app.component('UniIcons', UniIcons)
  app.component('CustomNavbar', CustomNavbar)
  app.component('SafeArea', SafeArea)
  return {
    app
  }
}
// #endif
