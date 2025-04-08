<template>
  <div class="p-[20px] w-screen max-w-[1000px]">
    <div class="text-[20px]">图片格式转换</div>
    <div class="flex h-[calc(100vh-130px)] flex-row mt-5">
      <!-- 左侧：图库和图片选择（与调整尺寸页面相同） -->
      <div class="w-[300px] h-full pr-5">
        <el-select
          v-model="selectedGallery"
          placeholder="选择图库"
          class="w-full"
          @change="loadGalleryImages"
        >
          <el-option
            v-for="gallery in galleryList"
            :key="gallery.name"
            :label="gallery.name"
            :value="gallery.name"
          />
        </el-select>

        <div class="mt-5 h-full overflow-y-auto">
          <div
            v-for="(image, index) in imageList"
            :key="index"
            class="flex items-center p-2 cursor-pointer bg-theme"
            :class="{ 'bg-blue-100': selectedImage === image }"
            @click="selectImage(image)"
          >
            <img :src="image.cover" class="w-[50px] h-[50px] object-cover" />
            <div class="ml-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
              {{ image.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：格式转换区域 -->
      <div class="flex-1 pl-5 w-full overflow-y-auto">
        <div v-if="selectedImage" class="flex flex-col w-full h-full">
          <!-- 当前图片预览 -->
          <div
            class="w-[180px] min-h-[180px] shadow-md flex flex-col justify-between items-center bg-white dark:bg-zinc-800 p-3 border border-theme relative mt-3 ml-3"
          >
            <img :src="selectedImage.cover" class="w-auto h-[130px] object-scale-down" />
            <el-tooltip :content="selectedImage.name" placement="top">
              <span
                class="text-[14px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
              >
                {{ selectedImage.name }}
              </span>
            </el-tooltip>
            <div class="text-[12px] mt-2">
              {{ getFileExtension(selectedImage.cover).toUpperCase() }}
            </div>
          </div>

          <!-- 格式转换选项 -->
          <div class="mt-5 flex flex-col">
            <div class="text-lg mb-3">转换格式</div>

            <el-radio-group v-model="targetFormat" class="mb-5">
              <el-radio-button label="jpg">JPG</el-radio-button>
              <el-radio-button label="png">PNG</el-radio-button>
              <el-radio-button label="webp">WebP</el-radio-button>
              <el-radio-button label="avif">AVIF</el-radio-button>
            </el-radio-group>

            <!-- JPG特有选项 -->
            <div v-if="targetFormat === 'jpg'" class="mb-5">
              <div class="text-sm mb-2">JPG质量 (0-100)</div>
              <el-slider v-model="jpgQuality" :min="0" :max="100" show-input />
            </div>

            <!-- PNG特有选项 -->
            <div v-if="targetFormat === 'png'" class="mb-5">
              <el-checkbox v-model="pngCompression">启用压缩</el-checkbox>
            </div>

            <!-- WebP特有选项 -->
            <div v-if="targetFormat === 'webp'" class="mb-5">
              <div class="text-sm mb-2">WebP质量 (0-100)</div>
              <el-slider v-model="webpQuality" :min="0" :max="100" show-input />
              <el-checkbox v-model="webpLossless" class="mt-2">无损压缩</el-checkbox>
            </div>

            <el-button
              class="w-full max-w-[200px]"
              type="primary"
              @click="convertImage"
              :loading="isConverting"
            >
              开始转换
            </el-button>
          </div>
        </div>
        <div v-else class="text-gray-500 h-full">请选择一张图片</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'

// 图库和图片列表相关状态（与调整尺寸页面相同）
const galleryList = ref([])
const selectedGallery = ref('')
const imageList = ref([])
const selectedImage = ref(null)
const isConverting = ref(false)

// 格式转换相关状态
const targetFormat = ref('jpg')
const jpgQuality = ref(80)
const pngCompression = ref(true)
const webpQuality = ref(80)
const webpLossless = ref(false)

// 加载图库列表（与调整尺寸页面相同）
const loadGalleryList = async () => {
  const response = await window.api['读取全部图库']()
  if (response.success) {
    galleryList.value = response.data
  } else {
    ElMessage.error('加载图库列表失败: ' + response.message)
  }
}

// 加载图库图片（与调整尺寸页面相同）
const loadGalleryImages = async () => {
  if (!selectedGallery.value) return
  const response = await window.api['读取全部图片']({ fileName: selectedGallery.value })
  if (response.success) {
    imageList.value = response.data.draws
  } else {
    ElMessage.error('加载图片列表失败: ' + response.message)
  }
}

// 选择图片
const selectImage = (image) => {
  selectedImage.value = image
}

// 获取文件扩展名
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase()
}

// 执行图片格式转换
const convertImage = async () => {
  if (!selectedImage.value) {
    ElMessage.error('请选择一张图片')
    return
  }

  isConverting.value = true

  try {
    const options = {
      format: targetFormat.value,
      quality: jpgQuality.value,
      compression: pngCompression.value,
      lossless: webpLossless.value
    }

    const response = await window.api['转换图片格式']({
      imagePath: selectedImage.value.cover,
      galleryName: selectedGallery.value,
      options
    })

    if (response.success) {
      ElMessage.success(`图片已成功转换为${targetFormat.value.toUpperCase()}`)
      loadGalleryImages() // 刷新图片列表
    } else {
      ElMessage.error('格式转换失败: ' + response.message)
    }
  } catch (error) {
    ElMessage.error('格式转换失败: ' + error.message)
  } finally {
    isConverting.value = false
  }
}

const resetState = () => {
  selectedGallery.value = ''
  imageList.value = []
  selectedImage.value = null
  isConverting.value = false
  targetFormat.value = 'jpg' // 重置格式选择
  jpgQuality.value = 80 // 重置质量参数
  pngCompression.value = true // 重置压缩选项
  webpQuality.value = 80 // 重置WebP质量
  webpLossless.value = false // 重置WebP无损选项
}

// 初始化加载图库列表
onMounted(() => {
  loadGalleryList()
})

// 路由离开守卫
onBeforeRouteLeave((to, from) => {
  if (from.name === 'ImageFormatConverter') {
    resetState()
  }
})

// 路由更新守卫（相同路由参数变化时）
onBeforeRouteUpdate((to, from) => {
  if (from.name === 'ImageFormatConverter') {
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
