<template>
    <div class="flex flex-col w-full min-h-scree">
        <div class="p-[20px]">
            <div class="text-[20px]">首页</div>
            <el-input class="w-full mt-[10px]" v-model="searchbox" size="large" placeholder="搜索图片" clearable></el-input>
            <div class="mt-5">
                <div class="text-[20px]">常用功能</div>
            </div>
            <div>
                <div class="text-[16px]">数据统计</div>
                <div>
                    <div>图库数量：</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ElContainer } from "element-plus";
import { ref } from "vue";
const searchbox = ref("");
</script>