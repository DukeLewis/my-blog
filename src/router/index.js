import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/layout'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home/index'),
        children: [
          {
            path: '',
            name: 'BlogList',
            component: () => import('@/views/blog/BlogList')
          },
          {
            path: ':id/blog-detail',
            name: 'BlogDetail',
            component: () => import('@/views/blog/BlogDetail')
          },
          {
            path: 'blog-edit',
            name: 'BlogEdit',
            component: () => import('@/views/blog/BlogDetail')
          }
        ]
      }
    ]
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
