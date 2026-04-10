// @ts-nocheck
import App from './App.vue'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import pinia from './stores'
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
