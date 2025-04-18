import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import {install} from '@icon-park/vue-next/es/all';
import '@icon-park/vue-next/styles/index.css';
import router from '../src/routers/index'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import { createPinia } from 'pinia'

// import '@renderer/assets/output.css'
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
install(app, 'park')

app.use(ElementPlus)
app.use(router)
app.use(VueViewer)
app.use(createPinia())
app.mount('#app')
