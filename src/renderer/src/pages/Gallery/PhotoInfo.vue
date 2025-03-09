<template>
  <div>
    <div class="flex flex-col w-full min-h-screen">
      <div class="p-[20px]">
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
            <div class="ml-1">删除图片</div>
          </el-button>
        </div>
        <!--图片展示-->
        <div class="flex items-center mt-5">
          <div class="w-[500px] p-[10px] bg-white">
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
              <img v-for="src in imageSrc" :key="src" :src="src" class="w-full h-auto" />
            </viewer>
          </div>
        </div>
      </div>
    </div>
    <RightMenu :MenuItem="MenuItem"></RightMenu>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { watchEffect, ref, onActivated, onMounted } from 'vue'
import RightMenu from '../../components/RightMenu.vue'
import _ from 'lodash'
import 'viewerjs/dist/viewer.css'

const route = useRoute()
const router = useRouter()
const name = ref('')
const item = ref('')
const photoPreview = []
const imageSrc = ref([])

const MenuItem = ref({
  name: '基本信息',
  size: 10,
  pageID: 0,
  format: 'jpg'
})

// 处理图片路径
const handleImagePath = (path) => {
  try {
    // 将路径转换为 URL 格式
    const url = new URL(`file://${path}`).href
    return url
  } catch (err) {
    console.error('路径转换失败:', err)
    return ''
  }
}

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
watchEffect(() => {
  name.value = route.query.name
  if (!route.query.item) {
    return
  }
  item.value = JSON.parse(route.query.item)
  const coverPath = handleImagePath(item.value.cover)
  imageSrc.value = [coverPath]
  photoPreview.value = [coverPath] // 确保 photoPreview 正确填充
  console.log('当前图片路径:', imageSrc.value)
  console.log('预览图片列表:', photoPreview.value)
})
const getFileInfo = async () => {
  const filePath = item.value.cover
  console.log(typeof filePath)
  const response = await window.api['读取文件信息'](filePath.toString())
  console.log(response)
  return response
}
onMounted(() => {
  // photoPreview.push(item.value.cover)
  getFileInfo()
})
const goToPage = (path, name) => {
  router.push({ path: path, query: { name } })
}
</script>
