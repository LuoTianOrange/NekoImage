<template>
  <div class="home-page">
    <div class="p-[20px]">
      <div class="h-[200px] overflow-hidden rounded-lg relative">
        <div class="absolute top-10 left-10 text-[30px] text-white font-bold z-20">
          {{ softName }}<br />图片管理工具
        </div>
        <div class="absolute bg-black w-full h-full opacity-20 z-10"></div>
        <div class="w-full h-full flex items-center justify-center">
          <el-image
            :src="bg"
            class="w-full h-auto object-cover object-center"
            style="min-height: 100%; min-width: 100%"
          />
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 文件夹区域 -->
      <section class="section">
        <h2 class="section-title">文件夹</h2>
        <div class="card-container">
          <GalleryCard
            title="根目录"
            subtitle="appPath"
            :icon="Folder"
            @click="openGalleryRoot()"
          />
        </div>
      </section>

      <!-- 数据统计 -->
      <section class="section">
        <h2 class="section-title">数据统计</h2>
        <div class="stats-grid">
          <StatCard label="图库数量" :value="GalleryCount" />
          <StatCard label="图片数量" :value="PhotoCount" />
          <!-- <StatCard label="图片大小" :value="PhotoSize" /> -->
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onActivated, onDeactivated } from 'vue'
import { Folder } from 'lucide-vue-next'
import GalleryCard from './components/GalleryCard.vue'
import StatCard from './components/StatCard.vue'
import bg from '../../assets/bg.jpg'

const GalleryCount = ref(0)
const PhotoCount = ref(0)
const PhotoSize = ref('123MB')
const softName = '橘橘'

onActivated(async () => {
  const res = await window.api['读取全部图库']()
  GalleryCount.value = res.data.length

  const promises = res.data.map((item) => window.api['读取全部图片']({ fileName: item.name }))
  const results = await Promise.all(promises)
  PhotoCount.value = results.reduce((total, res) => total + res.data.draws.length, 0)
})

onDeactivated(() => {
  GalleryCount.value = 0
  PhotoCount.value = 0
})

const openGalleryRoot = () => {
  window.api['打开图库根目录']()
}
</script>

<style scoped>
.home-page {
  @apply flex flex-col flex-1;
}

/* 内容容器（限制最大宽度） */
.content-container {
  @apply w-full max-w-6xl px-5 pb-5;
}

/* 内容区域样式 */
.section {
  @apply mb-4;
}

.section-title {
  @apply text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200;
}

/* 卡片容器（左对齐） */
.card-container {
  @apply flex flex-wrap gap-3;
}

/* 统计卡片网格（左对齐） */
.stats-grid {
  @apply flex flex-wrap gap-3;
}
</style>
