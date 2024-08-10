<template>
    <div class="flex flex-col w-full min-h-scree">
        <div class="p-[20px]">
            <div class="text-[20px]">设置</div>
            <div class="mt-5">
              <el-tabs v-model="tabActiveItem" type="card">
                <el-tab-pane label="默认" name="默认">
                  <div>NekoImage版本:{{ version }}</div>
                </el-tab-pane>
                <el-tab-pane label="其他" name="其他">
                  <div>没有了</div>
                </el-tab-pane>
              </el-tabs>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
const tabActiveItem = ref('默认')
const version = ref('1.0.0')
</script>
<style scoped>
:deep(.el-tabs--card>.el-tabs__header .el-tabs__item.is-active)::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #fff;
}
</style>