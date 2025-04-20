<template>
  <el-menu
    class="h-full min-h-screen w-[80px] flex-shrink-0 z-10 flex flex-col"
    :default-active="activeIndex"
  >
    <!-- 主菜单部分 -->
    <div class="flex-1">
      <el-menu-item
        v-for="item in mainMenuItems"
        :key="item.index"
        :index="item.index"
        @click="goToPage(item.path)"
        class="!flex !flex-col !justify-center !items-center relative m-1"
      >
        <div class="menu-item-content">
          <el-icon class="mb-2 text-xl">
            <component :is="item.icon" />
          </el-icon>
          <span class="select-none text-md w-full text-center">{{ item.text }}</span>
        </div>
      </el-menu-item>
    </div>

    <!-- 底部设置菜单 -->
    <el-menu-item
      :index="settingItem.index"
      @click="goToPage(settingItem.path)"
      class="!flex !flex-col !justify-center !items-center relative m-1 mt-auto"
    >
      <div class="menu-item-content">
        <el-icon class="mb-2 text-xl">
          <component :is="settingItem.icon" />
        </el-icon>
        <span class="select-none text-md w-full text-center">{{ settingItem.text }}</span>
      </div>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ElMenu, ElMenuItem } from 'element-plus'
import { House, Image, Bolt, Crop, Search } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const mainMenuItems = [
  { index: '1', icon: House, text: '首页', path: '/' },
  { index: '2', icon: Image, text: '图库', path: '/gallery' },
  { index: '3', icon: Search, text: '搜索', path: '/search' },
  { index: '4', icon: Crop, text: '工具', path: '/tools' }
]

const settingItem = { index: '5', icon: Bolt, text: '设置', path: '/setting' }

// 合并所有菜单项用于查找
const allMenuItems = [...mainMenuItems, settingItem]

// 计算当前激活的菜单项index
const activeIndex = computed(() => {
  const matchedItem = allMenuItems.find((item) => item.path === route.path)
  return matchedItem?.index || '1' // 默认返回首页的index
})

const goToPage = (path) => {
  router.push(path)
}
</script>

<style scoped>
/* 重置菜单项样式 */
:deep(.el-menu-item) {
  height: auto !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  line-height: 1.3 !important;
  border-radius: 4px !important;
  margin: 4px !important;
}

/* 菜单项内容容器 */
.menu-item-content {
  @apply w-[70px] h-[70px] flex flex-col justify-center items-center rounded-[4px];
}

/* 菜单项悬停状态 */
:deep(.el-menu-item:hover) {
  background-color: rgba(var(--el-color-primary-rgb), 0.05) !important;
  border-radius: 4px !important;
}

/* 菜单项激活状态 */
:deep(.el-menu-item.is-active) {
  background-color: rgba(var(--el-color-primary-rgb), 0.1) !important;
  border-radius: 4px !important;
}

:deep(.el-menu-item [class^='el-icon']) {
  margin-right: 0 !important;
  font-size: 20px;
}

/* 菜单项文字容器 */
.menu-item-content > span {
  @apply w-full text-center px-1 text-[14px];
}

/* 激活状态指示条 */
:deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 28px;
  background-color: var(--el-color-primary);
  border-radius: 2px;
}

/* 确保 el-menu 使用 flex 布局 */
:deep(.el-menu) {
  @apply !flex !flex-col;
}
</style>
