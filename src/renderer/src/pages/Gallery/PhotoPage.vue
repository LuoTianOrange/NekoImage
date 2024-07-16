<template>
  <div>
    <div class="flex flex-col w-full min-h-scree">
      <div class="p-[20px]">
        <div class="text-[20px]">{{ name }}</div>
        <div class="mt-5">
          <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/gallery' }">
              <div class="flex">
                <el-icon>
                  <House />
                </el-icon>
              </div>
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
    </div>
  
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
const route = useRoute();
const name = ref('');
//监控路由变化，改变name的值
watchEffect(() => {
  name.value = route.query.name;
});
</script>