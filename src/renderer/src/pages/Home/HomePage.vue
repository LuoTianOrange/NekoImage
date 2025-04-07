<template>
  <div class="flex flex-col w-full min-h-screen">
    <div class="p-[20px]">
      <div class="h-[200px] overflow-hidden rounded-lg relative">
        <div class="absolute top-10 left-10 text-[30px] text-white font-bold z-20">
          绘枢<br />图片管理工具
        </div>
        <div class="absolute bg-black w-full h-full opacity-20 z-10"></div>
        <el-image :src="bg" class="object-cover"></el-image>
      </div>
      <div class="mt-5">
        <div class="text-[22px] font-bold">文件夹</div>
        <div class="flex flex-row flex-wrap">
          <div
            @click="openGalleryRoot()"
            v-for="item in 1"
            class="w-[200px] h-[60px] bg-theme rounded-lg flex flex-row items-center justify-between p-3 m-1 cursor-pointer "
          >
            <div class="flex flex-row items-center">
              <el-icon :size="22">
                <Folder />
              </el-icon>
              <div class="flex flex-col ml-4 content-center text-[14px]">
                <div>根目录</div>
                <div>appPath</div>
              </div>
            </div>
            <el-icon :size="16">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>
      <div class="mt-2">
        <div class="text-[22px] font-bold">数据统计</div>
        <div class="flex flex-row flex-wrap">
          <div class="w-[200px] h-[70px] bg-theme rounded-lg p-3 m-1">
            <div class="flex flex-col">
              <div class="">图库数量</div>
              <div>{{ GalleryCount }}</div>
            </div>
          </div>
          <div class="w-[200px] h-[70px] bg-theme rounded-lg p-3 m-1">
            <div class="flex flex-col">
              <div>图片数量</div>
              <div>{{ PhotoCount }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { forEach } from 'lodash'
import { onActivated, onDeactivated, onMounted, ref } from 'vue'
import { useDark } from '@vueuse/core'
import bg from '../../assets/bg.jpg'

const isDark = useDark()
const GalleryCount = ref(0)
const PhotoCount = ref(0)
const PhotoType = ref([])
onActivated(async () => {
  const fileName = []
  await window.api['读取全部图库']().then((res) => {
    GalleryCount.value = res.data.length
    forEach(res.data, (item) => {
      fileName.push(item.name)
    })
    // console.log(fileName);
  })
  const promises = fileName.map((name) => window.api['读取全部图片']({ fileName: name }))
  const results = await Promise.all(promises)
  results.forEach((res) => {
    PhotoCount.value += res.data.draws.length
    // console.log(res);
    // console.log(res.data.draws.length);
  })
})

const openGalleryRoot = () => {
  window.api['打开图库根目录']()
}

onDeactivated(() => {
  GalleryCount.value = 0
  PhotoCount.value = 0
})
</script>
<style scoped>
.bg-theme{
  @apply bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-800
}
</style>
