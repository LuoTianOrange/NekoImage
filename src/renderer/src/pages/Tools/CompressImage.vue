<template>
  <div class="p-[20px] w-screen max-w-[1000px]">
    <div class="text-[20px] mb-4">图片压缩</div>
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
            <div
              v-for="(image, index) in imageList"
              :key="index"
              class="flex items-center p-2 cursor-pointer bg-theme rounded mb-1"
              :class="{ '!bg-blue-100 dark:!bg-zinc-800': selectedImage?.pid === image.pid }"
              @click="selectImage(image)"
            >
              <img :src="image.cover" class="w-[48px] h-[48px] object-cover rounded" />
              <div class="ml-2 flex-1 min-w-0">
                <div class="truncate text-sm">{{ image.name }}</div>
                <div class="text-xs text-gray-500">
                  {{
                    image.metadata?.fileSize ||
                    image.metadata?.compressionInfo?.originalSize ||
                    '未知大小'
                  }}
                  MB
                </div>
              </div>
            </div>

            <div v-if="!loading && imageList.length === 0" class="text-center text-gray-400 py-8">
              当前图库没有可压缩的图片
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧压缩区域 -->
      <div class="flex-1 flex flex-col">
        <div v-if="selectedImage" class="flex-1 flex flex-col">
          <!-- 图片预览 -->
          <div class="flex justify-center mb-6">
            <div
              class="w-[200px] bg-white dark:bg-zinc-800 p-3 rounded-lg shadow border border-theme"
            >
              <img :src="selectedImage.cover" class="w-full h-auto max-h-[180px] object-contain" />
              <div class="mt-2 text-center">
                <el-tooltip :content="selectedImage.name">
                  <div class="text-sm truncate px-2">{{ selectedImage.name }}</div>
                </el-tooltip>
                <div class="text-xs text-gray-500 mt-1">
                  {{
                    selectedImage.metadata?.compressionInfo?.originalSize ||
                    selectedImage.metadata?.fileSize ||
                    fileSize
                  }}
                  MB
                </div>
              </div>
            </div>
          </div>

          <!-- 压缩选项 -->
          <div class="p-4 rounded-lg flex-1 flex flex-col">
            <div class="space-y-6">
              <div>
                <div class="text-sm font-medium mb-2">压缩质量: {{ compressionQuality }}</div>
                <el-slider v-model="compressionQuality" :min="10" :max="95" :step="5" show-input />
                <div class="flex justify-between text-md text-gray-500 mt-1">
                  <span>高压缩</span>
                  <span>高质量</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <el-checkbox v-model="preserveMetadata">保留基本元数据</el-checkbox>
                <!-- <el-checkbox
                  v-model="progressive"
                  :disabled="!selectedImage.cover.toLowerCase().endsWith('.jpg')"
                >
                  渐进式JPG
                </el-checkbox> -->
              </div>
            </div>

            <div class="mt-3 pt-6">
              <el-button
                type="primary"
                @click="compressImage"
                :loading="isCompressing"
                class="w-full max-w-[200px]"
                size="large"
              >
                {{ isCompressing ? '压缩中...' : '开始压缩' }}
              </el-button>
            </div>
          </div>
        </div>

        <div v-else class="flex-1 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <el-icon :size="48" class="mb-2"><Picture /></el-icon>
            <div>请从左侧选择要压缩的图片</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Picture, Loading } from '@element-plus/icons-vue'
import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
// 状态管理
const loading = ref(false)
const loadError = ref(null)
const isCompressing = ref(false)
const fileSize = ref('计算中...')

// 图库数据
const galleryList = ref([])
const selectedGallery = ref('')
const imageList = ref([])
const selectedImage = ref(null)

// 压缩设置
const compressionQuality = ref(75)
const preserveMetadata = ref(true)
const progressive = ref(false)

// 格式化文件大小
const formatSize = (bytes) => {
  if (bytes === undefined || bytes === null) return '未知大小'
  if (typeof bytes === 'string') {
    // 如果已经是格式化字符串，直接返回
    if (bytes.includes('MB')) return bytes
    // 如果是字符串形式的数字，转换为数字
    bytes = parseFloat(bytes)
  }
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 加载图库列表
const loadGalleryList = async () => {
  loading.value = true
  loadError.value = null
  try {
    const response = await window.api['读取全部图库']()
    if (response.success) {
      galleryList.value = response.data
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    loadError.value = `加载图库失败: ${error.message}`
    console.error('加载图库失败:', error)
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
      imageList.value = await Promise.all(
        response.data.draws.map(async (img) => {
          try {
            const sizeRes = await window.api['获取图片大小'](img.cover)
            return {
              ...img,
              metadata: {
                ...img.metadata,
                fileSize: sizeRes.success ? sizeRes.size : img.metadata?.fileSize || '未知大小',
                compressionInfo: {
                  ...(img.metadata?.compressionInfo || {}),
                  originalSize: sizeRes.success
                    ? sizeRes.size
                    : img.metadata?.compressionInfo?.originalSize || '未知大小'
                }
              }
            }
          } catch {
            return {
              ...img,
              metadata: {
                ...img.metadata,
                fileSize: img.metadata?.fileSize || '未知大小',
                compressionInfo: {
                  ...(img.metadata?.compressionInfo || {}),
                  originalSize: img.metadata?.compressionInfo?.originalSize || '未知大小'
                }
              }
            }
          }
        })
      )
    }
  } finally {
    loading.value = false
  }
}

// 选择图片
const selectImage = async (image) => {
  selectedImage.value = image
  try {
    fileSize.value = '计算中...'
    const sizeRes = await window.api['获取图片大小'](image.cover)

    if (sizeRes.success) {
      fileSize.value = sizeRes.size
      // 更新列表中的对应图片数据
      const index = imageList.value.findIndex((img) => img.pid === image.pid)
      if (index !== -1) {
        imageList.value[index].metadata = {
          ...imageList.value[index].metadata,
          fileSize: sizeRes.size,
          compressionInfo: {
            ...(imageList.value[index].metadata?.compressionInfo || {}),
            originalSize: sizeRes.size
          }
        }
      }
    } else {
      fileSize.value =
        image.metadata?.compressionInfo?.originalSize || image.metadata?.fileSize || '未知大小'
    }
  } catch {
    fileSize.value =
      image.metadata?.compressionInfo?.originalSize || image.metadata?.fileSize || '未知大小'
  }
}

// 执行压缩
const compressImage = async () => {
  if (!selectedImage.value) return

  isCompressing.value = true
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '图片压缩中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const options = {
      quality: compressionQuality.value,
      preserveMetadata: preserveMetadata.value,
      progressive: progressive.value
    }

    const response = await window.api['压缩图片']({
      imagePath: selectedImage.value.cover,
      galleryName: selectedGallery.value,
      options
    })

    if (response.success) {
      if (response.compressedSize < response.originalSize) {
        const savedPercent = (
          ((response.originalSize - response.compressedSize) / response.originalSize) *
          100
        ).toFixed(1)
        ElMessage.success({
          message: `压缩成功！节省 ${formatSize(response.savedSize)} (${savedPercent}%)`,
          duration: 5000
        })
      } else {
        ElMessage.warning('图片已达到最优压缩状态')
      }

      // 强制刷新图片列表
      await loadGalleryImages()

      // 重新选择当前图片以更新显示
      const newImage = imageList.value.find((img) => img.pid === response.newImage.pid)
      if (newImage) {
        selectedImage.value = newImage
      }
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    ElMessage.error(`压缩失败: ${error.message}`)
    console.error('压缩出错:', error)
  } finally {
    isCompressing.value = false
    loadingInstance.close()
  }
}

const resetState = () => {
  selectedImage.value = null
  selectedGallery.value = ''
  imageList.value = []
  compressionQuality.value = 75
  preserveMetadata.value = true
  progressive.value = false
}

// 初始化
onMounted(() => {
  loadGalleryList()
})

// 路由离开守卫
onBeforeRouteLeave((to, from) => {
  if (from.name === 'CompressImage') {
    resetState()
  }
})

// 路由更新守卫（相同路由参数变化时）
onBeforeRouteUpdate((to, from) => {
  if (from.name === 'CompressImage') {
    resetState()
  }
})
</script>

<style scoped>
.bg-theme {
  @apply bg-white dark:bg-transparent hover:bg-zinc-300 dark:hover:bg-zinc-800;
}

.border-theme {
  @apply border-zinc-200 dark:border-zinc-700;
}
</style>
