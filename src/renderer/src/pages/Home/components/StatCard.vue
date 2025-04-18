<template>
  <div class="stat-card">
    <div class="stat-content">
      <div class="stat-label">
        <slot name="label">{{ label }}</slot>
      </div>
      <div class="stat-value">
        <slot>{{ value }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number]
})
</script>

<style scoped>
.stat-card {
  @apply w-[200px] h-[70px] p-3 rounded-lg;
  @apply bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600;
  @apply border border-gray-200 dark:border-zinc-600;
  @apply transition-all duration-200;
  @apply shadow-sm hover:shadow-md;
}

.stat-content {
  @apply h-full flex flex-col justify-between;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.stat-value {
  @apply text-xl font-semibold text-gray-800 dark:text-gray-200;
}
</style>
