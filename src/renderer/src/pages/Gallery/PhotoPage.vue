<template>
  <div>
    <div class="flex flex-col w-full min-h-scree">
      <div class="p-[20px]">
        <div class="text-[20px]">{{ name }}</div>
        <!--面包屑-->
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
        <!--按钮组-->
        <div class="mt-3 flex">
          <el-button type="primary" plain class="flex flex-row">
            <el-icon>
              <UploadFilled />
            </el-icon>
            <div class="ml-1">上传</div>
          </el-button>
          <el-button type="primary" plain class="flex flex-row">
            <el-icon>
              <Download />
            </el-icon>
            <div class="ml-1">下载图库</div>
          </el-button>
          <el-button type="primary" plain class="flex flex-row" @click="clickSetting(name)">
            <el-icon>
              <Tools />
            </el-icon>
            <div class="ml-1">设置</div>
          </el-button>
          <el-button type="danger" plain class="flex flex-row">
            <el-icon>
              <Delete />
            </el-icon>
            <div class="ml-1">删除图库</div>
          </el-button>
        </div>
        <!--图片展示区-->
        <div class="mt-5 flex flex-wrap items-start w-full">
          <div v-for="(item, index) in image"
            class="w-[180px] h-[180px] flex flex-col justify-between items-center p-3 border relative mt-3 ml-3 transform animate-in zoom-in"
            @mouseenter="Enterpictrue(index)" @mouseleave="Leavepictrue(index)">
            <img :src="item.cover" class="w-auto h-[130px] object-scale-down" />
            <span>{{ item.name }}</span>
            <div v-if="isEnterPictrue[index]" class="flex justify-center items-center transform animate-out zoom-in absolute top-0 bg-white bg-opacity-75 w-full h-[40px]">
              <el-button class="" type="danger" size="small" plain>
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--设置弹窗-->
    <el-dialog v-model="showForm">
      <div class="text-[20px] flex flex-col">编辑图库</div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">图库名称</div>
        <el-input v-model="input1" style="width: 200px;" placeholder="请输入名称" :value="input1" clearable></el-input>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">图库描述</div>
        <el-input v-model="input2" style="width: 200px;" placeholder="图库描述" clearable></el-input>
      </div>
      <div class="mt-5 flex flex-row justify-end">
        <el-button class="!ml-2" type="primary" @click="saveSetting">保存</el-button>
        <el-button class="!ml-2" type="" @click="showForm = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
import { DownPicture } from '@icon-park/vue-next'

import image1 from '../../assets/images/2025754-1.png';
import image2 from '../../assets/images/PSD.jpg';

const route = useRoute();

const input1 = ref('');
const input2 = ref('');
const name = ref('');

const image = ref([
  {
    cover: image1,
    name: '图片1'
  },
  {
    cover: image2,
    name: '图片2'
  }
])
//图片悬浮框相关
const isEnterPictrue = ref([])
const Enterpictrue = (index) => {
  isEnterPictrue.value[index] = true
}
const Leavepictrue = (index) => {
  isEnterPictrue.value[index] = false
}
//监控路由变化，改变name的值
watchEffect(() => {
  name.value = route.query.name;
});

//设置相关
const showForm = ref(false)
const clickSetting = (name) => {
  showForm.value = true;
  input1.value = name;
};
//保存图库设置
const saveSetting = () => {
  showForm.value = false;
}
</script>