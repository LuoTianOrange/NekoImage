<template>
  <div class="p-[20px]">
    <div class="text-[20px]">工具</div>
    <div class="flex flex-row">
      <div>
        <div class="mt-5">
          <div class="flex flex-row flex-wrap">
            <div
              @click="router.push('/tools/AdjustImageSize')"
              class="w-[200px] h-[60px] bg-theme rounded-lg flex flex-row items-center justify-between p-3 m-1 cursor-pointer hover:bg-gray-300"
            >
              <div class="flex flex-row items-center">
                <el-icon :size="22">
                  <Crop/>
                </el-icon>
                <div class="flex flex-col ml-4 content-center text-[18px]">
                  <div>调整图片尺寸</div>
                </div>
              </div>
              <el-icon :size="16">
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

</script>
<style scoped>
.bg-theme{
  @apply bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-800
}
</style>