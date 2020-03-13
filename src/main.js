import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import vuetify from './plugins/vuetify'
import db from './server/dbstore'

Vue.config.productionTip = false

Vue.use(Antd)
Vue.prototype.$db = db

// use axios in main process, so no browser limit.
const axios = require('electron').remote.getGlobal('axios')
Vue.prototype.$axios = axios

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
