<template>
  <div
    @click="router.push(path)"
    class="tool-card"
  >
    <div class="tool-content">
      <component :is="icon" class="tool-icon" />
      <span class="tool-title">{{ title }}</span>
    </div>
    <ArrowRight class="tool-arrow" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

defineProps({
  title: String,
  path: String,
  icon: Object
})

const router = useRouter()
</script>

<style scoped>
.tool-card {
  @apply w-full h-16 p-4 my-1 rounded-lg;
  @apply bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600;
  @apply border border-gray-200 dark:border-zinc-600;
  @apply flex items-center justify-between;
  @apply cursor-pointer transition-all duration-200;
  @apply shadow-sm hover:shadow-md;
}

.tool-content {
  @apply flex items-center gap-4;
}

.tool-icon {
  @apply w-6 h-6 !text-[20px] text-gray-700 dark:text-gray-300;
}

.tool-title {
  @apply text-lg font-medium text-gray-800 dark:text-gray-200;
}

.tool-arrow {
  @apply w-5 h-5 text-gray-500 dark:text-gray-400;
}
</style>
