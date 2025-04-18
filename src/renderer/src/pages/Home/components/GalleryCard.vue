<template>
  <div class="gallery-card" @click="$emit('click')">
    <div class="card-content">
      <slot name="icon">
        <el-icon class="card-icon">
          <component :is="icon" />
        </el-icon>
      </slot>
      <div class="card-text">
        <div class="card-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="subtitle" class="card-subtitle">
          {{ subtitle }}
        </div>
      </div>
    </div>
    <el-icon v-if="showArrow" class="card-arrow">
      <ChevronRight class="text-[20px]" />
    </el-icon>
  </div>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next';

defineProps({
  title: String,
  subtitle: String,
  icon: {
    type: [String, Object],
    default: null
  },
  showArrow: {
    type: Boolean,
    default: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.gallery-card {
  @apply w-[200px] h-[70px] p-4 rounded-lg;
  @apply bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600;
  @apply border border-gray-200 dark:border-zinc-600;
  @apply flex items-center justify-between;
  @apply cursor-pointer transition-all duration-200;
  @apply shadow-sm hover:shadow-md;
}

.card-content {
  @apply flex items-center gap-3;
}

.card-icon {
  @apply w-6 h-6 text-[20px] text-gray-700 dark:text-gray-300;
}

.card-text {
  @apply flex flex-col;
}

.card-title {
  @apply text-base font-medium text-gray-800 dark:text-gray-200;
}

.card-subtitle {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.card-arrow {
  @apply w-5 h-5 text-gray-500 dark:text-gray-400;
}
</style>
