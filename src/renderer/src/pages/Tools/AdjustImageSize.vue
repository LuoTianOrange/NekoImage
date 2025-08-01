<template>
  <div class="p-[20px] w-screen max-w-[1000px]">
    <div class="text-[20px]">调整图片尺寸</div>
    <div class="flex h-[calc(100vh-130px)] flex-row mt-5">
      <!-- 左侧：图库和图片选择 -->
      <div class="w-[300px] h-full pr-5">
        <!-- 图库选择 -->
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

        <!-- 图片列表 -->
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
                  {{ image.metadata?.dimensions?.width || '未知' }}×{{
                    image.metadata?.dimensions?.height || '未知'
                  }}
                </div>
              </div>
            </div>
            <div v-if="!loading && imageList.length === 0" class="text-center text-gray-400 py-8">
              当前图库没有图片
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：调整尺寸 -->
      <div class="flex-1 flex flex-col">
        <div v-if="selectedImage" class="flex-1 flex flex-col">
          <!-- 当前图片预览 -->
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
              <el-tooltip :content="'图片的原始尺寸'" placement="bottom">
                <div class="bg-zinc-700 text-white p-1 rounded-[4px]">
                  {{ originalSize.width }}x{{ originalSize.height }}
                </div>
              </el-tooltip>
              <div class="">→</div>
              <el-tooltip :content="'图片调整后的尺寸'" placement="bottom">
                <div class="bg-blue-400 text-white p-1 rounded-[4px]">
                  {{ resizeForm.width }}x{{ resizeForm.height }}
                </div>
              </el-tooltip>
            </div>
          </div>

          <!-- 自定义尺寸 -->
          <div class="mt-5 flex flex-col">
            <div class="text-lg mb-3">调整尺寸</div>
            <el-radio-group v-model="toggleMode">
              <el-radio-button label="按像素" value="pixel" @click="resetOriginalSize()" />
              <el-radio-button label="按百分比" value="percentage" />
            </el-radio-group>
            <el-form class="mt-5 flex flex-col" v-if="toggleMode === 'pixel'" :model="resizeForm">
              <el-form-item label="宽度(px):" class="max-w-[300px]">
                <el-input v-model.number="resizeForm.width" placeholder="请输入宽度" />
              </el-form-item>
              <el-form-item label="高度(px):" class="max-w-[300px]">
                <el-input v-model.number="resizeForm.height" placeholder="请输入高度" />
              </el-form-item>
              <el-button class="w-full max-w-[200px]" type="primary" @click="resizeImage"
                >调整尺寸</el-button
              >
            </el-form>
            <!-- 预设比例 -->
            <div v-else-if="toggleMode === 'percentage'" class="mt-5 flex flex-col">
              <div class="text-lg mb-3">预设比例</div>
              <el-radio-group v-model="selectedPercentage" @change="updateResizeFormByPercentage">
                <el-radio-button :label="0.75">缩小25%</el-radio-button>
                <el-radio-button :label="0.5">缩小50%</el-radio-button>
                <el-radio-button :label="0.25">缩小75%</el-radio-button>
              </el-radio-group>
              <el-button
                class="mt-3 w-full max-w-[200px]"
                type="primary"
                @click="resizeImageByPercentage(selectedPercentage)"
                >调整尺寸</el-button
              >
            </div>
          </div>
        </div>
        <div v-else class="flex-1 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <el-icon :size="48" class="mb-2"><Picture /></el-icon>
            <div>请从左侧选择要调整的图片</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, onUnmounted, onActivated } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useGallery } from '@/composables/useGallery'

const router = useRouter()

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

// 当前选中的图片
const selectedImage = ref(null)
const toggleMode = ref('pixel')
// 调整尺寸表单
const resizeForm = reactive({
  width: null,
  height: null
})
//图片原始尺寸
const originalSize = reactive({
  width: null,
  height: null
})

// 处理图库切换，重置图片选择
const handleGalleryChange = async () => {
  selectedImage.value = null
  await loadGalleryImagesWithDimensions()
}

// 加载图库图片并获取尺寸信息（重写以包含特殊逻辑）
const loadGalleryImagesWithDimensions = async () => {
  if (!selectedGallery.value) return

  loading.value = true
  try {
    const response = await window.api['读取全部图片']({
      fileName: selectedGallery.value
    })

    if (response.success) {
      // 并行获取所有图片的尺寸
      imageList.value = await Promise.all(
        response.data.draws.map(async (img) => {
          const dimensions = await getImageDimensions(img.cover)
          return {
            ...img,
            metadata: {
              ...img.metadata,
              dimensions // 添加尺寸信息
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
//获取图片尺寸
async function getImageDimensions(imagePath) {
  try {
    const metadata = await window.api['获取图片尺寸'](imagePath)
    if (metadata.success) {
      return {
        width: metadata.width,
        height: metadata.height
      }
    }
    return { width: '未知', height: '未知' }
  } catch (error) {
    console.error('获取图片尺寸失败:', error)
    return { width: '未知', height: '未知' }
  }
}

const loadingExif = async (image) => {
  try {
    const exifResult = await window.api['读取EXIF信息'](image.cover)

    if (exifResult.success) {
      // 尝试从不同可能的EXIF字段获取尺寸
      const width =
        exifResult.data['Image Width'] ||
        exifResult.data['Exif Image Width'] ||
        exifResult.data['PixelXDimension']

      const height =
        exifResult.data['Image Height'] ||
        exifResult.data['Exif Image Height'] ||
        exifResult.data['PixelYDimension']

      if (width && height) {
        resizeForm.width = parseInt(width)
        resizeForm.height = parseInt(height)
        originalSize.width = parseInt(width)
        originalSize.height = parseInt(height)
        return
      }
    }
  } catch (error) {
    console.error('获取图片尺寸失败:', error)
    ElMessage.error('获取图片尺寸失败: ' + error.message)
  }
}
// 调整图片尺寸
const resizeImage = async () => {
  if (!selectedImage.value) {
    ElMessage.error('请选择一张图片')
    return
  }

  if (!resizeForm.width || !resizeForm.height) {
    ElMessage.error('请输入宽度和高度')
    return
  }

  try {
    const response = await window.api['调整图片大小']({
      imagePath: selectedImage.value.cover,
      width: resizeForm.width,
      height: resizeForm.height,
      galleryName: selectedGallery.value // 传递图库名称
    })

    if (response.success) {
      ElMessage.success('图片调整尺寸成功')
      loadGalleryImagesWithDimensions() // 刷新图片列表
    } else {
      ElMessage.error('图片调整尺寸失败: ' + response.message)
    }
  } catch (error) {
    console.error('调整图片尺寸失败:', error)
    ElMessage.error('调整图片尺寸失败: ' + error.message)
  }
}
const selectedPercentage = ref(0.75)
// 根据百分比更新resizeForm
const updateResizeFormByPercentage = () => {
  if (originalSize.width && originalSize.height) {
    resizeForm.width = Math.round(originalSize.width * selectedPercentage.value)
    resizeForm.height = Math.round(originalSize.height * selectedPercentage.value)
  }
}

// 监听原始尺寸变化，自动更新百分比尺寸
watch(originalSize, () => {
  if (toggleMode.value === 'percentage') {
    updateResizeFormByPercentage()
  }
})

// 监听模式切换
watch(toggleMode, (newMode) => {
  if (newMode === 'percentage' && originalSize.width && originalSize.height) {
    updateResizeFormByPercentage()
  }
})

// 修改选择图片方法
const selectImage = (image) => {
  selectedImage.value = image
  loadingExif(image).then(() => {
    if (toggleMode.value === 'percentage') {
      updateResizeFormByPercentage()
    }
  })
}
const resetOriginalSize = () => {
  resizeForm.width = originalSize.width
  resizeForm.height = originalSize.height
}

// 按比例调整图片尺寸
const resizeImageByPercentage = async (percentage) => {
  if (!selectedImage.value) {
    ElMessage.error('请选择一张图片')
    return
  }

  try {
    const response = await window.api['按比例调整图片大小']({
      imagePath: selectedImage.value.cover,
      percentage,
      galleryName: selectedGallery.value // 传递图库名称
    })

    if (response.success) {
      ElMessage.success('图片调整尺寸成功')
      loadGalleryImagesWithDimensions() // 刷新图片列表
    } else {
      ElMessage.error('图片调整尺寸失败: ' + response.message)
    }
  } catch (error) {
    console.error('调整图片尺寸失败:', error)
    ElMessage.error('调整图片尺寸失败: ' + error.message)
  }
}

const resetState = () => {
  selectedImage.value = null
  resizeForm.width = null
  resizeForm.height = null
  originalSize.width = null
  originalSize.height = null
  resetImageState() // 只重置图片状态，保持图库列表
  console.log('页面状态已重置')
}

// 初始化加载图库列表
onMounted(async () => {
  // 如果图库列表为空，则加载
  if (galleryList.value.length === 0) {
    await loadGalleryList()
  }
})

// 页面激活时确保有图库数据
onActivated(async () => {
  // 如果图库列表为空，则重新加载
  if (galleryList.value.length === 0) {
    await loadGalleryList()
  }
  // 强制刷新当前图库的图片（确保数据是最新的）
  if (selectedGallery.value) {
    await forceRefreshCurrentGallery()
  }
})

// 路由离开守卫
onBeforeRouteLeave(async (to, from) => {
  if (from.name === 'AdjustImageSize') {
    resetState() // 只重置页面特定状态
  }
})

// 路由更新守卫（相同路由参数变化时）
onBeforeRouteUpdate(async (to, from) => {
  if (from.name === 'AdjustImageSize') {
    resetState() // 只重置页面特定状态
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
