<template>
    <el-menu class="h-full min-h-screen w-[200px] flex-shrink-0 z-10" :collapse="isCollapsed">
        <el-menu-item index="1" @click="isCollapsed = !isCollapsed" class="index-1">
            <el-icon class="transform animate-in" :class="isCollapsed ? '-rotate-90' : 'rotate-90'">
                <Download />
            </el-icon>
            <span class="select-none">折叠菜单</span>
        </el-menu-item>
        <el-menu-item index="2" @click="goToPage('/')">
            <el-icon>
                <Home />
            </el-icon>
            <!-- <span class="select-none">首页</span> -->
            <template #title class="select-none">首页</template>
        </el-menu-item>
        <el-menu-item index="3" @click="goToPage('/gallery')">
            <el-icon>
                <Picture />
            </el-icon>
            <!-- <span class="select-none">图库管理</span> -->
            <template #title class="select-none">图库管理</template>
        </el-menu-item>
        <el-menu-item index="4" @click="goToPage('/export')">
            <el-icon>
                <Link />
            </el-icon>
            <!-- <span class="select-none">导出</span> -->
            <template #title class="select-none">导出</template>
        </el-menu-item>
        <el-menu-item index="5" @click="goToPage('/tools')">
            <el-icon>
                <Crop />
            </el-icon>
            <!-- <span class="select-none">工具</span> -->
            <template #title class="select-none">工具</template>
        </el-menu-item>
        <el-menu-item index="9" @click="goToPage('/setting')">
            <el-icon>
                <Tools />
            </el-icon>
            <!-- <span class="select-none">设置</span> -->
            <template #title class="select-none">设置</template>
        </el-menu-item>
    </el-menu>
</template>

<script setup>
import { ref, watchEffect } from "vue"
import { ElButton, ElMenu, ElSubMenu, ElMenuItem } from "element-plus"
import { Home } from "@icon-park/vue-next"
import { useRouter, useRoute } from "vue-router"
const isCollapsed = ref(true)
const router = useRouter()
const route = useRoute()
//跳转页面
const goToPage = (routerpath) => {
  router.push({
    path: routerpath,
    query: {
      data: new Date().getTime()
    },
  })
}

</script>
<style scoped>
:deep(.el-menu-item.is-active)::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: var(--el-color-primary);
}

:deep(.el-menu-item.index-1.is-active)::before {
    content: none;
}
</style>