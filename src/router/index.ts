import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  //在需要的时候才加载相应的模块或组件
  //而不是在应用启动时一次性加载所有组件
  //显著提高应用的初始加载速度
  routes: [
    {
      path: '/',
      component: () => import('@/views/home.vue'),
    },
    {
      path: '/login',
      component: () => import('@/views/login.vue'),
    },
  ],
})

export default router
