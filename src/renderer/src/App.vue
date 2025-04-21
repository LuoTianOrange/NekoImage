<script setup>
import LeftMenu from './components/LeftMenu.vue'
import { RouterView } from 'vue-router'
import { KeepAlive, onMounted } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import icon from '../../../resources/icons/icon.png'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
})

onMounted(() => {
  // 初始化主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  }
})
</script>

<template>
  <div class="root min-h-screen flex flex-col font-[MiSans-Normal] bg-white dark:bg-zinc-900">
    <div class="custom-titlebar">
      <img :src="icon" class="w-[18px] h-[18px] mr-2" alt="" />
      <span class="text-[14px]">图片管理工具</span>
    </div>
    <div class="content flex flex-row">
      <LeftMenu class="!sticky top-0 left-0 flex-shrink-0" />
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <!-- <img src="../src/assets/bg.png" class="h-full w-full object-cover object-top z-[-1] fixed left-0 opacity-30"></img> -->
  </div>
</template>
<style>
html,
body {
  margin: 0;
  /* 禁止 html,body 滚动，避免滚动条出现在标题栏右边 */
  overflow: hidden;
  height: 100%;
}
.root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--el-bg-color);
}
.custom-titlebar {
  display: flex;
  flex-direction: row;
  align-items: center;
  /* 避免被收缩 */
  flex-shrink: 0;
  /* 高度与 main.js 中 titleBarOverlay.height 一致  */
  height: 35px;
  width: 100%;
  /* 标题栏始终在最顶层（避免后续被 Modal 之类的覆盖） */
  z-index: 9999;
  background-color: #23272e;
  color: white;
  /* background-color: white;
  color: #23272e; */
  padding-left: 12px;
  font-size: 14px;
  user-select: none;
  /* 设置该属性表明这是可拖拽区域，用来移动窗口 */
  -webkit-app-region: drag;
}

.content {
  /* 内容区需要设置可滚动 */
  overflow: auto;
  height: calc(100vh - 35px);
}

:root {
  --title-bar-height: 35px; /* 与标题栏高度一致 */
}

/* 基础位置调整 */
.el-message {
  top: calc(var(--title-bar-height) + 20px) !important;
}
</style>
