// 导入router所需的方法
import { createRouter, createWebHistory } from 'vue-router'

// 导入路由页面的配置
import routes from './routes'

// 路由参数配置
const router = createRouter({
    // 使用hash(createWebHashHistory)模式，(createWebHistory是HTML5历史模式，支持SEO)
    history: createWebHistory(),
    routes: routes,
})

// 全局前置守卫，这里可以加入用户登录判断
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);   
  if (requiresAuth) {  
    // 检查是否已登录  
    // 假设你有一个全局状态变量或 Vuex store 来存储登录状态  
    // 这里使用 Vuex store 作为示例  
    if (!store.state.isLoggedIn) {  
      // 未登录，重定向到登录页面  
      next({  
        name: 'Login', // 假设你的登录页面路由名称是 'Login'  
        query: { redirect: to.fullPath } // 将当前路由的完整路径作为参数传递给登录页面，以便登录后重定向  
      });  
    } else {  
      // 已登录，继续导航  
      next();  
    }  
  } else {  
    // 不需要登录，直接导航  
    next();  
  }  
})

// 全局后置钩子，这里可以加入改变页面标题等操作
router.afterEach((to, from) => {
    const _title = to.meta.title
    if (_title) {
        window.document.title = _title
    }
})

// 导出默认值
export default router
