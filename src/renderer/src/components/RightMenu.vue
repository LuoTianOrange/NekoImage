<template>
    <div class="h-full w-[240px] bg-white border-l fixed top-0 right-0">
        <div class="p-5">
            <!--图片信息/图库信息-->
            <div class="text-[20px]">{{ MenuItem.name }}</div>
            <div class="mt-3 text-[16px]" v-if="MenuItem.pageID == 1">文件数量：{{ MenuItem.count }}</div>
            <div class="mt-1 text-[16px]">文件大小：{{ MenuItem.size }}</div>
            <div class="mt-1 text-[16px]" v-if="MenuItem.pageID == 0">文件类型：{{ MenuItem.format }}</div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'
/**
 * 如果pageID等于1就是图片信息，如果等于0就是图库信息
 */
const props = defineProps({
  MenuItem: Object
})
console.log(props.MenuItem);
</script>
<style scoped>

</style>
