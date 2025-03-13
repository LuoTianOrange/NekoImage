<template>
  <div class="flex flex-row w-full min-h-screen">
    <div class="p-[20px] w-full">
      <div class="text-[20px]">{{ item.name }}</div>
      <div class="mt-5"></div>
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/gallery' }">
          <div class="flex">
            <el-icon>
              <House />
            </el-icon>
          </div>
        </el-breadcrumb-item>
        <el-breadcrumb-item @click="goToPage('/photo', name)">{{ name }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ item.name }}</el-breadcrumb-item>
      </el-breadcrumb>
      <!--按钮组-->
      <div class="mt-3 flex">
        <el-button type="primary" plain class="flex flex-row">
          <el-icon>
            <Tools />
          </el-icon>
          <div class="ml-1">设置</div>
        </el-button>
        <el-button type="danger" plain class="flex flex-row">
          <el-icon>
            <Delete />
          </el-icon>
          <div class="ml-1" @click="deletePhoto()">删除图片</div>
        </el-button>
      </div>
      <!--图片展示-->
      <div class="flex flex-row justify-center items-center mt-5">
        <div class="min-w-[500px] p-[10px] bg-white">
          <!-- <img :src="imageSrc" class="w-full h-auto"></img> -->
          <!-- <el-image
              :src="imageSrc"
              fit="cover"
              :preview-src-list="photoPreview"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              class="w-full h-auto"
            >
            </el-image> -->
          <viewer :images="imageSrc">
            <img
              v-for="src in imageSrc"
              :key="src"
              :src="src"
              class="w-full h-auto cursor-pointer"
            />
          </viewer>
        </div>
      </div>
    </div>
    <!-- 信息展示部分 -->
    <div class="relative right-0 top-0 h-screen w-[300px] border-l border-zinc-200 bg-white">
      <div class="p-4">
        <h3 class="text-lg font-bold">图片信息</h3>
        <div v-if="fileInfo && Object.keys(fileInfo).length > 0">
          <div
            v-for="(value, key) in fileInfo"
            :key="key"
            class="mb-1 py-1"
          >
            <strong>{{ key }}:</strong> {{ value }}
          </div>
        </div>
        <div v-else>未找到 EXIF 信息</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter, useRoute, onBeforeRouteUpdate  } from 'vue-router'
import { watchEffect, ref, onActivated, onMounted, computed } from 'vue'
import _ from 'lodash'
import 'viewerjs/dist/viewer.css'
import { ElMessage, ElDatePicker, ElMessageBox } from 'element-plus'
import { readExifData } from '../../libs/exifReader'

const route = useRoute()
const router = useRouter()
const name = ref('')
const item = ref('')
const photoPreview = []
const imageSrc = ref([])
//图片Exif信息
const exifData = ref({})
const imageSize = ref(0)

// watchEffect(() => {
//   name.value = route.query.name
//   if (!route.query.item) {
//     return
//   }
//   item.value = JSON.parse(route.query.item)
//   photoPreview.length = 0
//   photoPreview.push(item.value.cover)
//   console.log(route.query);
//   console.log(photoPreview);
// })
watchEffect(async () => {
  name.value = route.query.name
  if (!route.query.item) return

  item.value = JSON.parse(route.query.item)
  const coverPath = item.value.cover
  imageSrc.value = [coverPath]
  photoPreview.value = [coverPath] // 确保 photoPreview 正确填充
  console.log('当前图片路径:', imageSrc.value)
  console.log('预览图片列表:', photoPreview.value)

  // 获取图片的 EXIF 信息
  if (item.value?.cover) {
    const result = await window.api['读取EXIF信息'](item.value.cover)
    if (result.success) {
      exifData.value = result.data
      console.log('图片 EXIF 信息:', exifData.value)
    } else {
      console.error('读取 EXIF 信息失败:', result.message)
    }
  }

  // 获取图片大小
  if (item.value?.cover) {
    const sizeResult = await window.api['获取图片大小'](item.value.cover)
    if (sizeResult.success) {
      imageSize.value = sizeResult.size
      console.log('图片大小:', imageSize.value)
    } else {
      console.error('获取图片大小失败:', sizeResult.message)
    }
  }
})


// 监听路由更新
onBeforeRouteUpdate(async (to, from) => {
  if (to.query.item !== from.query.item) {
    // 解析新的 item
    item.value = JSON.parse(to.query.item)
    const coverPath = item.value.cover
    imageSrc.value = [coverPath]
    photoPreview.value = [coverPath]
    console.log('当前图片路径:', imageSrc.value)
    console.log('预览图片列表:', photoPreview.value)

    // 获取图片的 EXIF 信息
    if (item.value?.cover) {
      const result = await window.api['读取EXIF信息'](item.value.cover)
      if (result.success) {
        exifData.value = result.data
        console.log('图片 EXIF 信息:', exifData.value)
      } else {
        console.error('读取 EXIF 信息失败:', result.message)
      }
    }

    // 获取图片大小
    if (item.value?.cover) {
      const sizeResult = await window.api['获取图片大小'](item.value.cover)
      if (sizeResult.success) {
        imageSize.value = sizeResult.size
        console.log('图片大小:', imageSize.value)
      } else {
        console.error('获取图片大小失败:', sizeResult.message)
      }
    }
  }
})

// 计算属性：格式化文件信息
const fileInfo = computed(() => ({
  '文件类型': exifData.value['FileType'] || '未知',
  '大小': imageSize.value ? `${imageSize.value}MB` : '未知',
  '宽度': exifData.value['Image Width'] || '未知',
  '高度': exifData.value['Image Height'] || '未知',
  '拍摄时间': exifData.value['DateTimeOriginal'] || '未知',
  '相机型号': exifData.value['Model'] || '未知',
  '光圈值': exifData.value['FNumber'] || '未知',
  '曝光时间': exifData.value['ExposureTime'] || '未知',
  'ISO': exifData.value['ISOSpeedRatings'] || '未知',
  '焦距': exifData.value['FocalLength'] || '未知'
}))

const goToPage = (path, name) => {
  router.push({ path: path, query: { name } })
}

// 删除图片
const deletePhoto = async (pid) => {
  const folderName = item.name
  const result = await window.api['删除图片']({ folderName, pid })
  if (result.success) {
    alert('图片删除成功')
    // 刷新图片列表
    image.value = image.value.filter((item) => item.pid !== pid)
  } else {
    alert('图片删除失败: ' + result.message)
  }
}
</script>
<style scoped>
:deep(.el-breadcrumb__inner) {
  cursor: pointer;
}
:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner:hover) {
  color: var(--el-color-primary);
}
:deep(.el-breadcrumb__inner):hover {
  color: var(--el-color-primary);
}
</style>
