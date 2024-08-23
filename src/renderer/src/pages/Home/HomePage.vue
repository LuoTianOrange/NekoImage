<template>
    <div class="flex flex-col w-full min-h-scree">
        <div class="p-[20px]">
            <!-- <div class="text-[20px]">首页</div> -->
            <!-- <el-input class="w-full mt-[10px]" v-model="searchbox" size="large" placeholder="搜索图片" clearable></el-input> -->
            <div class="h-[260px] overflow-hidden rounded-lg ">
                <el-image :src="bg" class="object-cover"></el-image>
            </div>
            <div class="mt-5">
                <div class="text-[22px] font-bold">文件夹</div>
                <div class="flex flex-row flex-wrap">
                    <div v-for="item in 6"
                        class="w-[200px] h-[60px] bg-gray-200 rounded-lg flex flex-row items-center justify-between p-3 m-1">
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
                <div>
                    <div>图库数量：{{ GalleryCount }}</div>
                    <div>图片数量：{{ PhotoCount }}</div>
                    <div v-for="item in PhotoType" class="flex flex-row">
                        <div>{{ item.name }}：</div>
                        <div>{{ item.count }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { forEach } from "lodash";
import { onActivated, onDeactivated, onMounted, ref } from "vue"
// const searchbox = ref("")
const bg = ref("../../src/assets/bg.jpg")
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
  const promises = fileName.map(name => window.api['读取全部图片']({ fileName: name }))
  const results = await Promise.all(promises)
  results.forEach(res => {
    PhotoCount.value += res.data.draws.length
    // console.log(res);
    // console.log(res.data.draws.length);
  })
})
onDeactivated(() => {
  GalleryCount.value = 0
  PhotoCount.value = 0
})
</script>