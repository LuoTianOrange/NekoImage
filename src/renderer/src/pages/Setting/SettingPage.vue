<template>
  <div class="flex flex-col w-full min-h-scree">
    <div class="p-[20px]">
      <div class="text-[20px]">设置</div>
      <div class="mt-5">
        <el-tabs v-model="tabActiveItem" type="card">
          <el-tab-pane label="默认" name="默认">
            <div class="text-[22px] font-bold">软件信息</div>
            <div class="flex flex-col px-2 text-[14px]">
              <div class="flex flex-col">
                <div class="font-bold">当前版本</div>
                <div>{{ version }}</div>
              </div>
              <div class="flex flex-col">
                <div class="font-bold">最新版本</div>
                <div>{{ NewVersion }}</div>
              </div>
              <!-- <div class="flex flex-col">
                <div class="font-bold">项目地址</div>
                <div>{{ GithubUrl }}</div>
              </div> -->
            </div>
            <div class="flex flex-col">
              <div class="text-[22px] mt-2 font-bold">图库设置</div>
              <div class="flex flex-col px-2 text-[14px]">
                <div class="font-bold">图库路径</div>
                <div class="flex flex-row items-end">
                  <el-input
                    class="mt-2 flex"
                    v-model="GalleryPath"
                    placeholder="图库路径"
                    style="width: 300px"
                    disabled
                  ></el-input>
                  <el-button
                    type="primary"
                    @click="selectAndChangeGalleryPath"
                    class="w-[100px] ml-3"
                    >修改图库路径</el-button
                  >
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="外观" name="外观">
            <div class="text-[22px] font-bold">外观</div>
            <div class="flex flex-col px-2 text-[14px]">
              <div class="flex flex-row items-center w-[300px] justify-between">
                <div class="font-bold">主题</div>
                <el-radio-group v-model="isDark" @change="handleThemeChange">
                  <el-radio-button :label="false">浅色</el-radio-button>
                  <el-radio-button :label="true">深色</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import _ from 'lodash'
import { ElMessage, ElLoading } from 'element-plus'
import { useDark, useToggle } from '@vueuse/core'

const tabActiveItem = ref('默认')
const version = ref('')
const NewVersion = ref('0.1.1')
const GalleryPath = ref('')
const GithubUrl = ref('https://github.com/LuoTianOrange/NekoImage')

// 深色模式相关
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
})
const toggleDark = useToggle(isDark)
const handleThemeChange = (val) => {
  toggleDark(val)
  localStorage.setItem('theme', val ? 'dark' : 'light')
  ElMessage.success(`已切换至${val ? '深色' : '浅色'}模式`)
}

onMounted(() => {
  window.api['读取图库路径']().then((res) => {
    GalleryPath.value = res.data
  })
  window.api['读取应用版本']().then((res) => {
    version.value = res.data
  })
  // 初始化主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  }
})

async function selectAndChangeGalleryPath() {
  try {
    // 打开资源管理器选择路径
    const selectResult = await window.api.打开资源管理器选择路径()
    if (!selectResult.success) {
      console.error('用户取消选择路径')
      ElMessage({
        message: '已取消选择路径',
        type: 'info',
        duration: 2000
      })
      return
    }

    const newPath = selectResult.data // 用户选择的路径

    // 显示加载中状态
    const loading = ElLoading.service({
      lock: true,
      text: '正在修改图库路径...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 调用修改图库路径功能
    const changeResult = await window.api.修改图库路径(newPath)

    loading.close() // 关闭加载状态

    if (changeResult.success) {
      console.log('图库路径修改成功:', changeResult.data)
      GalleryPath.value = changeResult.data // 更新图库路径显示

      ElMessage({
        message: `图库路径已修改为: ${changeResult.data}`,
        type: 'success',
        duration: 5000,
        showClose: true
      })
    } else {
      console.error('图库路径修改失败:', changeResult.message)
      ElMessage({
        message: `修改图库路径失败: ${changeResult.message || '未知错误'}`,
        type: 'error',
        duration: 5000,
        showClose: true
      })
    }
  } catch (error) {
    console.error('修改图库路径过程中出错:', error)
    ElMessage({
      message: `操作过程中发生错误: ${error.message || '未知错误'}`,
      type: 'error',
      duration: 5000,
      showClose: true
    })
  }
}
</script>
<style scoped>
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active)::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #fff;
}

.dark {
  @apply bg-gray-900 text-gray-100;
}

/* 调整 Element Plus 组件在深色模式下的样式 */
.dark .el-card {
  @apply bg-gray-800 border-gray-700;
}

.dark .el-input__inner {
  @apply bg-gray-700 text-white border-gray-600;
}
</style>
