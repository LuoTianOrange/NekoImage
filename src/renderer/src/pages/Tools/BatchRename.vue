<template>
  <div class="p-[20px] w-screen max-w-[1000px]">
    <div class="text-[20px] mb-4">批量重命名</div>
    <div class="flex h-[calc(100vh-100px)] flex-row gap-4">
      <!-- 左侧图库选择 -->
      <div class="w-[280px] h-full pr-4 flex flex-col">
        <el-select
          v-model="selectedGallery"
          placeholder="选择图库"
          class="w-full"
          @change="loadGalleryImages"
          :loading="loading"
        >
          <el-option
            v-for="gallery in galleryList"
            :key="gallery.name"
            :label="gallery.name"
            :value="gallery.name"
          />
        </el-select>

        <div class="mt-4 flex-1 relative h-full overflow-y-scroll">
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
            <el-icon class="animate-spin text-blue-500"><Loading /></el-icon>
          </div>

          <div
            v-else-if="loadError"
            class="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-4"
          >
            <span class="mb-2">{{ loadError }}</span>
            <el-button @click="loadGalleryList" size="small">重试加载</el-button>
          </div>

          <div v-else class="h-full">
            <el-checkbox-group v-model="selectedImages" class="w-full">
              <div
                v-for="(image, index) in imageList"
                :key="image.pid"
                class="flex items-center p-2 cursor-pointer bg-theme rounded mb-1"
                :class="{ '!bg-blue-100 dark:!bg-zinc-800': isSelected(image) }"
              >
                <el-checkbox :value="image" class="mr-2" />
                <img :src="image.cover" class="w-[48px] h-[48px] object-cover rounded" />
                <div class="ml-2 flex-1 min-w-0">
                  <div class="truncate text-sm">{{ image.name }}</div>
                </div>
              </div>
            </el-checkbox-group>

            <div v-if="!loading && imageList.length === 0" class="text-center text-gray-400 py-8">
              当前图库没有图片
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧操作区域 -->
      <div class="flex-1 flex flex-col">
        <div v-if="selectedImages.length > 0" class="flex-1 flex flex-col">
          <!-- 批量操作设置 -->
          <div class="p-4 rounded-lg flex-1 flex flex-col">
            <div class="space-y-6">
              <div>
                <div class="text-sm font-medium mb-2">命名模式</div>
                <el-input v-model="namePattern" placeholder="例如: 图片_{index}">
                  <template #append>
                    <el-select v-model="patternType" style="width: 120px">
                      <el-option value="index" label="序号" />
                      <el-option value="date" label="日期" />
                    </el-select>
                  </template>
                </el-input>
                <div class="text-xs text-gray-500 mt-1">
                  可用变量: {index} 会自动替换为01,02... {date} 替换为当前日期
                </div>
              </div>

              <div>
                <div class="text-sm font-medium mb-2">文件名预览</div>
                <div class="preview-box">
                  <div class="preview-item" v-for="(item, i) in previewNames" :key="i">
                    <el-input v-model="customNames[i]" placeholder="输入自定义名称" />
                    <div class="mt-1">
                      <span class="text-gray-500 line-through">{{ item.old }}</span>
                      <span class="text-green-600 ml-2">→ {{ item.new }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-6 flex gap-4">
              <el-button
                type="primary"
                @click="handleRename"
                :loading="isRenaming"
                class="flex-1"
                size="large"
              >
                {{ isRenaming ? '重命名中...' : '执行重命名' }}
              </el-button>
              <el-button
                type="success"
                @click="handleExport"
                :loading="isExporting"
                class="flex-1"
                size="large"
              >
                {{ isExporting ? '打包中...' : '打包下载' }}
              </el-button>
            </div>
          </div>
        </div>

        <div v-else class="flex-1 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <el-icon :size="48" class="mb-2"><Picture /></el-icon>
            <div>请从左侧选择要操作的图片</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Picture, Loading } from '@element-plus/icons-vue'
import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { cloneDeep } from 'lodash'
// 状态管理
const loading = ref(false)
const loadError = ref(null)
const isRenaming = ref(false)
const isExporting = ref(false)

// 图库数据
const galleryList = ref([])
const selectedGallery = ref('')
const imageList = ref([])
const selectedImages = ref([])

// 重命名设置
const namePattern = ref('图片_{index}')
const patternType = ref('index')

// 添加自定义名称数组
const customNames = ref([])

// 检查是否选中
const isSelected = (image) => {
  return selectedImages.value.some((img) => img.pid === image.pid)
}

// 预览新文件名
const previewNames = computed(() => {
  return selectedImages.value.map((img, i) => {
    const extMatch = (img.cover || img.path || '').match(/\.([a-zA-Z0-9]+)$/)
    const ext = extMatch ? `.${extMatch[1]}` : '.jpg'

    // 获取最终名称（优先使用自定义名称，否则使用模式）
    const finalName = customNames.value[i] || namePattern.value
    // 替换占位符（确保只替换一次）
    const newName = finalName
      .replace(/\{index\}/g, (i + 1).toString().padStart(2, '0'))
      .replace(/\{date\}/g, new Date().toISOString().split('T')[0])

    return {
      old: img.name || '未命名',
      new: `${newName}${ext}` // 直接使用替换后的结果
    }
  })
})
// 加载图库列表
const loadGalleryList = async () => {
  loading.value = true
  loadError.value = null
  try {
    const response = await window.api['读取全部图库']()
    console.log('图库响应:', response) // 调试日志

    if (response.success) {
      galleryList.value = response.data
      console.log('加载的图库列表:', galleryList.value) // 调试日志
    } else {
      throw new Error(response.message || '未知错误')
    }
  } catch (error) {
    console.error('加载图库出错:', error)
    loadError.value = `加载图库失败: ${error.message}`
    ElMessage.error(`加载图库失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 加载图库图片
const loadGalleryImages = async () => {
  if (!selectedGallery.value) return

  loading.value = true
  selectedImages.value = []
  try {
    const response = await window.api['读取全部图片']({
      fileName: selectedGallery.value
    })

    if (response.success) {
      imageList.value = response.data.draws
    }
  } finally {
    loading.value = false
  }
}

// 执行重命名
const handleRename = async () => {
  if (selectedImages.value.length === 0) return

  isRenaming.value = true
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '批量重命名中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    // 深拷贝选中的图片对象
    const imagesToRename = cloneDeep(selectedImages.value)
    const finalNames = selectedImages.value.map((_, i) => {
      return customNames.value[i] || namePattern.value
    })

    const response = await window.api['批量重命名']({
      images: imagesToRename,
      namePatterns: finalNames,
      galleryName: selectedGallery.value
    })

    if (response.success) {
      ElMessage.success(`成功重命名 ${response.results.length} 个文件`)
      await loadGalleryImages()
    }
  } catch (error) {
    ElMessage.error(`重命名失败: ${error.message}`)
  } finally {
    isRenaming.value = false
    loadingInstance.close()
  }
}

// 执行导出
const handleExport = async () => {
  if (selectedImages.value.length === 0) return

  isExporting.value = true
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '打包文件中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const response = await window.api.exportToZip({
      images: selectedImages.value,
      zipName: `${selectedGallery.value || 'export'}_${new Date().getTime()}`
    })

    if (response.success) {
      ElMessage.success(`压缩包已保存到: ${response.path}`)
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`)
    console.error('导出出错:', error)
  } finally {
    isExporting.value = false
    loadingInstance.close()
  }
}

const resetState = () => {
  selectedImages.value = []
  selectedGallery.value = ''
  imageList.value = []
  namePattern.value = '图片_{index}'
  patternType.value = 'index'
}

// 初始化
onMounted(() => {
  loadGalleryList()
})

// 路由离开守卫
onBeforeRouteLeave((to, from) => {
  if (from.name === 'BatchRename') {
    resetState()
  }
})

// 路由更新守卫（相同路由参数变化时）
onBeforeRouteUpdate((to, from) => {
  if (from.name === 'BatchRename') {
    resetState()
  }
})
</script>

<style scoped>
.bg-theme {
  @apply bg-white dark:bg-transparent hover:bg-zinc-300 dark:hover:bg-zinc-800;
}

.preview-box {
  @apply border rounded p-2 max-h-[200px] overflow-y-auto;
}

.preview-item {
  @apply py-1 px-2 text-sm border-b last:border-b-0;
}
</style>
