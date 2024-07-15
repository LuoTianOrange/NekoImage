<template>
    <el-menu class="h-full min-h-screen w-[200px]" :collapse="isCollapsed">
        <el-menu-item index="1" @click="isCollapsed = !isCollapsed">
            <el-icon class="transform animate-in" :class="isCollapsed ? '-rotate-90' : 'rotate-90'">
                <Download />
            </el-icon>
            <span class="select-none">折叠菜单</span>
        </el-menu-item>
        <el-menu-item index="2" @click="goToPage('/')">
            <el-icon>
                <Home />
            </el-icon>
            <span class="select-none">首页</span>
        </el-menu-item>
        <el-menu-item index="3" @click="goToPage('/gallery')">
            <el-icon>
                <Picture />
            </el-icon>
            <span class="select-none">图库管理</span>
        </el-menu-item>
        <el-menu-item index="4" @click="goToPage('/link')">
            <el-icon><Link /></el-icon>
            <span class="select-none">导入/导出</span>
        </el-menu-item>
        <el-menu-item index="9" @click="goToPage('/setting')">
            <el-icon><Tools /></el-icon>
            <span class="select-none">设置</span>
        </el-menu-item>
    </el-menu>
</template>

<script setup>
import { ref } from "vue"
import { ElButton, ElMenu, ElSubMenu, ElMenuItem } from "element-plus"
import { Home } from "@icon-park/vue-next"
import { useRouter } from "vue-router"
const isCollapsed = ref(true)
const router = useRouter()
const goToPage = (path) => {
  router.push(path)
}
</script>