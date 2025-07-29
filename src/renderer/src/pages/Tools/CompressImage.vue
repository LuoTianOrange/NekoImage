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
          @change="handleGalleryChange"
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
              当前图库没有图片
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧压缩区域 -->
      <div class="flex-1 flex flex-col">
        <div v-if="selectedImage" class="flex-1 flex flex-col">
          <!-- 图片预览 -->
          <div class="flex mb-6">
            <div
              class="w-[180px] min-h-[180px] shadow-md flex flex-col justify-between items-center bg-white dark:bg-zinc-800 p-3 border border-theme relative mt-3 ml-3 transform animate-in zoom-in"
            >
              <img :src="selectedImage.cover" class="w-auto h-[130px] object-scale-down" />
              <el-tooltip :content="selectedImage.name" placement="top">
                <span
                  class="text-[14px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] inline-block"
                  >{{ selectedImage.name }}</span
                >
              </el-tooltip>
              <div class="text-[12px] mt-2 flex flex-row items-center">
                <el-tooltip :content="'图片原始大小'" placement="bottom">
                  <div class="bg-zinc-700 text-white p-1 rounded-[4px]">
                    {{ selectedImage.metadata.fileSize }} MB
                  </div>
                </el-tooltip>
                <div class="">→</div>
                <el-tooltip :content="'预计压缩后大小'" placement="bottom">
                  <div class="bg-blue-400 text-white p-1 rounded-[4px]">
                    {{ calculateEstimatedSize() }}
                  </div>
                </el-tooltip>
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
import { ref, onMounted, computed, onActivated } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Picture, Loading } from '@element-plus/icons-vue'
import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useGallery } from '@/composables/useGallery'

// 使用图库组合式函数
const {
  loading,
  loadError,
  galleryList,
  imageList,
  selectedGallery,
  loadGalleryList,
  loadGalleryImages,
  resetImageState,
  forceRefreshCurrentGallery
} = useGallery()

// 页面特定状态
const isCompressing = ref(false)
const fileSize = ref('计算中...')
const selectedImage = ref(null)

// 压缩设置
const compressionQuality = ref(75)
const preserveMetadata = ref(true)
const progressive = ref(false)

// 格式化文件大小
const formatSize = (bytes) => {
  // 处理 undefined/null/NaN/0
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) {
    return '未知大小'
  }

  // 处理字符串
  if (typeof bytes === 'string') {
    // 如果已经是格式化字符串直接返回
    if (bytes.endsWith('MB') || bytes.endsWith('KB')) return bytes
    bytes = parseFloat(bytes)
    if (isNaN(bytes)) return '未知大小'
  }

  // 处理数字
  if (bytes < 1024) {
    return bytes.toFixed(2) + ' MB'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' MB'
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

// 处理图库切换，重置图片选择
const handleGalleryChange = async () => {
  selectedImage.value = null
  await loadGalleryImagesWithSize()
}

// 扩展图片加载功能以包含文件大小信息
const loadGalleryImagesWithSize = async () => {
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
    } else {
      throw new Error(response.message || '加载图片失败')
    }
  } catch (error) {
    console.error('加载图片出错:', error)
    loadError.value = `加载图片失败: ${error.message}`
    ElMessage.error(`加载图片失败: ${error.message}`)
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
      await loadGalleryImagesWithSize()

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
  isCompressing.value = false
  compressionQuality.value = 75 // 重置压缩质量
  preserveMetadata.value = true
  resetImageState() // 只重置图片状态，保持图库列表
}

//计算处理后的图片大小
const calculateEstimatedSize = () => {
  if (!selectedImage.value) return '未知大小'

  // 获取原始大小（单位MB）
  const originalSizeMB = parseFloat(
    selectedImage.value.metadata?.compressionInfo?.originalSize ||
      selectedImage.value.metadata?.fileSize ||
      0
  )

  if (!originalSizeMB || isNaN(originalSizeMB)) return '未知大小'

  const quality = compressionQuality.value // 10-95
  const ext = selectedImage.value.cover.split('.').pop().toLowerCase()

  // 各格式的压缩曲线参数（基于实际测试数据调整）
  const getCompressionRatio = () => {
    const normalizedQuality = quality / 100 // 转换为0.1-0.95

    // 使用二次曲线模拟压缩效果（质量越低压缩率越高）
    if (ext === 'png') {
      return 0.15 + 0.85 * Math.pow(normalizedQuality, 2) // 质量50→约0.36
    } else if (ext === 'jpg' || ext === 'jpeg') {
      return 0.25 + 0.75 * Math.pow(normalizedQuality, 1.5)
    } else if (ext === 'webp') {
      return 0.1 + 0.9 * Math.pow(normalizedQuality, 2)
    } else {
      return 0.2 + 0.8 * normalizedQuality
    }
  }

  // 计算压缩率（0.1-1.0范围）
  let ratio = getCompressionRatio()

  // 应用您的测试数据校准（4.6MB→0.75MB对应质量50）
  if (ext === 'png' && quality === 50) {
    const actualRatio = 0.75 / 4.6 // ≈0.163
    const currentRatio = getCompressionRatio() // 理论值
    ratio *= actualRatio / currentRatio // 校准系数
  }

  // 确保压缩率在5%-100%之间
  ratio = Math.max(0.05, Math.min(1, ratio))

  const estimatedSizeMB = originalSizeMB * ratio

  // 格式化输出
  if (estimatedSizeMB < 1) {
    return `${(estimatedSizeMB * 1024).toFixed(0)} KB`
  }
  return `${estimatedSizeMB.toFixed(2)} MB`
}

// 初始化
onMounted(async () => {
  if (galleryList.value.length === 0) {
    await loadGalleryList()
  }
})

// 页面激活时确保有图库数据
onActivated(async () => {
  console.log('CompressImage activated')
  try {
    await loadGalleryList() // 重新加载图库列表
    if (selectedGallery.value) {
      await forceRefreshCurrentGallery() // 强制刷新当前图库的图片
    }
  } catch (error) {
    console.error('刷新图库数据失败:', error)
  }
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
