<template>
  <div class="p-[20px]">
    <div class="text-[20px]">工具</div>
    <div class="mt-5">
      <div class="flex flex-row flex-wrap">
        <ToolCard
          v-for="tool in tools"
          :key="tool.path"
          :icon="tool.icon"
          :title="tool.title"
          :path="tool.path"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeftRight, ImageUpscale, Minimize2 } from 'lucide-vue-next'
import ToolCard from './components/ToolCard.vue'

const router = useRouter()

const tools = [
  {
    title: '调整图片尺寸',
    path: '/tools/AdjustImageSize',
    icon: ImageUpscale
  },
  {
    title: '图片格式转换',
    path: '/tools/ImageFormatConverter',
    icon: ArrowLeftRight
  },
  {
    title: '压缩图片大小',
    path: '/tools/CompressImage',
    icon: Minimize2
  }
]
</script>

<style scoped>
.bg-theme {
  @apply bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-800;
}
</style>
