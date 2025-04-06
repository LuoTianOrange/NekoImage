<template>
  <div
    @click="router.push(path)"
    class="w-[200px] h-[60px] bg-theme rounded-lg flex flex-row items-center justify-between p-3 m-1 cursor-pointer hover:bg-gray-300"
  >
    <div class="flex flex-row items-center">
      <component :is="icon" :size="22" />
      <div class="flex flex-col ml-4 content-center text-[18px]">
        <div>{{ title }}</div>
      </div>
    </div>
    <el-icon :size="16">
      <ArrowRight />
    </el-icon>
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
