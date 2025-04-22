<template>
  <div class="p-[20px] w-screen max-w-[1000px]">
    <div class="text-[20px] mb-4">批量添加序号后缀</div>
    <div class="flex h-[calc(100vh-100px)] flex-row gap-4">
      <!-- 左侧图库选择 -->
      <div class="w-[280px] h-full pr-4 flex flex-col">
        <div class="flex flex-row">
          <el-select
            v-model="selectedGallery"
            placeholder="选择图库"
            @change="loadGalleryImages"
            class="mb-4"
          >
            <el-option
              v-for="gallery in galleryList"
              :key="gallery.name"
              :label="gallery.name"
              :value="gallery.name"
              class=""
            />
          </el-select>
          <el-button class="ml-2" type="warning" @click="ClearSelection" :disabled="selectedImages.length === 0">
            清除选择
          </el-button>
        </div>

        <div class="flex-1 overflow-y-auto rounded">
          <el-checkbox-group v-model="selectedImages">
            <div
              v-for="image in imageList"
              :key="image.pid"
              class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <el-checkbox :value="image" class="mr-2" />
              <img
                :src="getThumbnail(image.cover)"
                class="w-12 h-12 object-cover rounded"
              />
              <div class="ml-2 truncate">
                <div class="text-sm text-ellipsis overflow-hidden">{{ getBaseName(image.cover) }}</div>
                <div class="text-xs text-gray-400">{{ formatDate(image.createTime) }}</div>
              </div>
            </div>
          </el-checkbox-group>
        </div>
      </div>

      <!-- 右侧操作区 -->
      <div class="flex-1 flex flex-col">
        <div v-if="selectedImages.length > 0" class="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg h-full">
          <div class="mb-6">
            <div class="text-sm font-medium mb-2">文件名预览</div>
            <div class="max-h-[60vh] overflow-y-auto">
              <div
                v-for="(item, index) in previewNames"
                :key="index"
                class="flex items-center py-2"
              >
                <span class="text-gray-500 flex-1 truncate">{{ item.oldName }}</span>
                <el-icon class="mx-2"><ArrowRight /></el-icon>
                <span class="text-green-600 flex-1 truncate">{{ item.newName }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <el-button
              type="primary"
              @click="handleAutoSuffix"
              :loading="isProcessing"
              class="flex-1"
            >
              <el-icon class="mr-1"><Check /></el-icon>
              一键添加序号后缀
            </el-button>
          </div>
        </div>

        <div v-else class="flex-1 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <el-icon :size="48" class="mb-2"><Picture /></el-icon>
            <div>请从左侧选择图片</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Picture, ArrowRight, Check } from '@element-plus/icons-vue'

// 状态管理
const loading = ref(false)
const galleryList = ref([])
const selectedGallery = ref('')
const imageList = ref([])
const selectedImages = ref([])
const isProcessing = ref(false)

// 自动生成序号后缀
const previewNames = computed(() => {
  return selectedImages.value.map((img, index) => {
    const originalPath = img.cover || ''
    const baseName = getBaseName(originalPath)
    const ext = getFileExtension(originalPath)

    return {
      oldName: img.name || baseName + ext,
      newName: `${baseName}_${(index + 1).toString().padStart(2, '0')}${ext}`,
      originalPath: originalPath
    }
  })
})

// 路径处理方法
const getFileName = (path) => {
  if (!path) return ''
  return path.split(/[\\/]/).pop() || ''
}

const getFileExtension = (path) => {
  const fileName = getFileName(path)
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.slice(lastDot) : ''
}

const getBaseName = (path) => {
  const fileName = getFileName(path)
  const ext = getFileExtension(path)
  return ext ? fileName.slice(0, -ext.length) : fileName
}

const ClearSelection = () => {
  selectedImages.value = []
}

// 执行自动添加后缀
const handleAutoSuffix = async () => {
  if (selectedImages.value.length === 0) return

  isProcessing.value = true
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在批量添加序号后缀...'
  })

  try {
    // 只传递必要数据到主进程
    const result = await window.api['批量添加文件名后缀']({
      galleryName: selectedGallery.value,
      selectedImages: selectedImages.value.map(img => ({
        pid: img.pid,
        cover: img.cover
      }))
    })

    if (result.success) {
      ElMessage.success(result.message)
      loadGalleryImages() // 刷新列表
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    ElMessage.error(`添加后缀失败: ${error.message}`)
  } finally {
    isProcessing.value = false
    loadingInstance.close()
  }
}

// 加载图库列表
const loadGalleryList = async () => {
  loading.value = true
  try {
    const response = await window.api['读取全部图库']()
    if (response.success) {
      galleryList.value = response.data
    }
  } finally {
    loading.value = false
  }
}

// 加载图库图片
const loadGalleryImages = async () => {
  if (!selectedGallery.value) return
  loading.value = true
  try {
    const response = await window.api['读取全部图片']({
      fileName: selectedGallery.value
    })
    if (response.success) {
      imageList.value = response.data.draws || []
      selectedImages.value = []
    }
  } finally {
    loading.value = false
  }
}

// 辅助方法
const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toLocaleDateString() : '未知日期'
}

const getThumbnail = (path) => {
  return path?.startsWith('http') ? path : `file://${path}`
}

// 初始化
onMounted(loadGalleryList)
</script>

<style scoped>
.bg-theme {
  @apply bg-white dark:bg-transparent hover:bg-zinc-300 dark:hover:bg-zinc-800;
}

.preview-box {
  @apply rounded p-2 max-h-[300px] flex-1 overflow-y-auto;
}

.preview-item {
  @apply py-2 px-3 text-sm;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
