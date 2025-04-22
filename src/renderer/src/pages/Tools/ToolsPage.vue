<template>
  <div class="p-[20px] flex-1">
    <div class="text-[20px]">工具</div>
    <div class="mt-5">
      <div class="text-xl font-bold mb-4">图片处理</div>
      <div class="grid grid-cols-1 xl:gap-2 xl:grid-cols-2">
        <ToolCard
          v-for="tool in photoTools"
          :key="tool.path"
          :icon="tool.icon"
          :title="tool.title"
          :path="tool.path"
        />
      </div>
      <div class="text-xl font-bold my-4">文件处理</div>
      <div class="grid grid-cols-1 xl:gap-2 xl:grid-cols-2">
        <ToolCard
          v-for="tool in fileTools"
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
import { ArrowLeftRight, ImageUpscale, Minimize2, SquarePen,TextCursorInput } from 'lucide-vue-next'
import ToolCard from './components/ToolCard.vue'

const router = useRouter()

const photoTools = [
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

const fileTools = [
  {
    title: '批量修改文件名',
    path: '/tools/BatchRename',
    icon: SquarePen
  },
  {
    title: '批量添加文件名后缀',
    path: '/tools/BatchAddSuffix',
    icon: TextCursorInput
  }
]
</script>

<style scoped>
.bg-theme {
  @apply bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-800;
}
</style>
