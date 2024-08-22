<template>
    <div class="flex flex-col w-full min-h-scree">
        <div class="p-[20px]">
            <div class="text-[20px]">首页</div>
            <el-input class="w-full mt-[10px]" v-model="searchbox" size="large" placeholder="搜索图片" clearable></el-input>
            <div class="mt-5">
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
import { onActivated, onMounted, ref } from "vue"
const searchbox = ref("")
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
</script>