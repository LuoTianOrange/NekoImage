<template>
  <div class="flex flex-col w-full min-h-scree">
    <div class="p-[20px]">
      <div class="text-[20px]">设置</div>
      <div class="mt-5">
        <el-tabs v-model="tabActiveItem" type="card">
          <el-tab-pane label="默认" name="默认">
            <div class="text-[22px] font-bold">软件信息</div>
            <div class="flex flex-col px-2 text-[14px]">
              <div class="flex flex-col">
                <div class="font-bold">当前版本</div>
                <div>{{ version }}</div>
              </div>
              <div class="flex flex-col">
                <div class="font-bold">最新版本</div>
                <div>{{ NewVersion }}</div>
              </div>
              <div class="flex flex-col">
                <div class="font-bold">项目地址</div>
                <div>{{ GithubUrl }}</div>
              </div>
            </div>
            <div class="flex flex-col">
              <div class="text-[22px] mt-2 font-bold">图库设置</div>
              <div class="flex flex-col px-2 text-[14px]">
                <div class="font-bold">图库路径</div>
                <div class="flex flex-row items-end">
                  <el-input class="mt-2 flex" v-model="GalleryPath" placeholder="图库路径" style="width: 300px;"
                    disabled></el-input>
                  <el-button type="primary" class="w-[100px] ml-3">修改图库路径</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="外观" name="外观">
            <div class="text-[22px] font-bold">外观</div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import _ from 'lodash'


const tabActiveItem = ref('默认')
const version = ref('')
const NewVersion = ref('')
NewVersion.value = '1.0.0'
const GalleryPath = ref('')
const GithubUrl = ref('https://github.com/LuoTianOrange/NekoImage')
onMounted(() => {
  window.api['读取图库路径']().then(res => {
    GalleryPath.value = res.data
    console.log(res);
  })
  window.api['读取应用版本']().then(res => {
    version.value = res.data
    console.log(res);
  })
})
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