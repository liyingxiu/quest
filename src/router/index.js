import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '../views/Main.vue'
// import HelloWorld from '../components/HelloWorld'

Vue.use(VueRouter)

const routes = [
  {
    path: '/main/:requestId',
    name: 'main',
    component: Main
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
