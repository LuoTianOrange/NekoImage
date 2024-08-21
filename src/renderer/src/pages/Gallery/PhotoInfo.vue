<template>
    <div>
        <div class="flex flex-col w-full min-h-scree">
            <div class="p-[20px]">
                <div class="text-[20px]">{{ itemName }}</div>
                <div class="mt-5"></div>
                <el-breadcrumb :separator-icon="ArrowRight">
                    <el-breadcrumb-item :to="{ path: '/gallery' }">
                        <div class="flex">
                            <el-icon>
                                <House />
                            </el-icon>
                        </div>
                    </el-breadcrumb-item>
                    <el-breadcrumb-item @click="goToPage('/photo',name)">{{ name }}</el-breadcrumb-item>
                    <el-breadcrumb-item>{{ itemName }}</el-breadcrumb-item>
                </el-breadcrumb>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { watchEffect, ref } from 'vue';
const route = useRoute();
const router = useRouter();
const name = ref('')
const itemName = ref('')
watchEffect(() => {
  name.value = route.query.name;
  itemName.value = route.query.itemName;
});
const goToPage = (path, name) => {
  router.push({ path: path, query: { name } });
}
</script>