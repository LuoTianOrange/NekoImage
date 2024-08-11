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
          <el-button type="primary" plain class="flex flex-row" @click="showAddPictrueSetting = true">
            <el-icon>
              <UploadFilled />
            </el-icon>
            <div class="ml-1">添加图片</div>
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
            <div v-if="isEnterPictrue[index]"
              class="flex justify-center items-center transform animate-out zoom-in absolute top-0 bg-white bg-opacity-75 w-full h-[40px]">
              <!--复制图片信息-->
              <el-button class="" type="success" size="small" plain>
                <el-icon>
                  <DocumentCopy />
                </el-icon>
              </el-button>
              <!--删除图片-->
              <el-button class="" type="danger" size="small" plain>
                <el-icon>
                  <Delete />
                </el-icon>
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
    <!--添加图片弹窗-->
    <el-dialog v-model="showAddPictrueSetting">
      <div class="text-[20px] flex flex-col">添加图片</div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">上传图片</div>
        <el-upload class="avatar-uploader border h-[140px]">
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画作名称</div>
        <el-input v-model="PhotoInfo.name" style="width: 200px;" placeholder="请输入名称" clearable></el-input>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画作描述</div>
        <el-input v-model="PhotoInfo.desc" style="width: 200px;" placeholder="画作描述" clearable></el-input>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画师名称</div>
        <el-input v-model="PhotoInfo.author" style="width: 200px;" placeholder="画师名称" clearable></el-input>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">开始时间</div>
        <el-date-picker v-model="PhotoInfo.startTime" style="width: 200px;" type="date" size="default" placeholder="开始时间">
        </el-date-picker>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">交付时间</div>
        <el-date-picker v-model="PhotoInfo.endTime" style="width: 200px;" type="date" size="default" placeholder="交付时间">
        </el-date-picker>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画作类型</div>
        <el-select v-model="PhotoInfo.type" style="width: 200px;" placeholder="选择画作类型">
          <el-option v-for="i in PictureType" :label="i.label" :value="i.value"></el-option>
        </el-select>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">标签</div>
        <div class="flex flex-col">
          <el-input v-model="tagStore" placeholder="输入标签"  clearable style="width: 200px">
            <template #append>
              <el-button type="primary" @click="AddTag">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
      <div class="flex justify-end flex-wrap mt-2">
        <el-tag class="m-[4px]" v-for="(tag,index) in PhotoInfo.tag" :key="index" 
        closable @close="DeleteTag(index)" :style="{ backgroundColor: tag.color }" effect="dark">{{ tag.text }}</el-tag>
      </div>

      <div class="mt-5 flex flex-row justify-end">
        <el-button class="!ml-2" type="primary" @click="">保存</el-button>
        <el-button class="!ml-2" type="" @click="showAddPictrueSetting = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watchEffect,reactive } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight, Plus } from '@element-plus/icons-vue';
import { DownPicture } from '@icon-park/vue-next'
import { ElMessage, ElDatePicker } from 'element-plus'

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
//添加图片设置
const showAddPictrueSetting = ref(false)

const PhotoInfo = reactive({
  name: '',
  cover: '',
  desc: '',
  author: '',
  type: '',
  startTime: '',
  endTime: '',
  tag: []
})
const imageUrl = ref('')
const PictureType = [
  {
    label: '插画',
    value: '1'
  },
  {
    label: '立绘',
    value: '2'
  },
  {
    label: '头像',
    value: '3'
  },
  {
    label: 'Q版',
    value: '4'
  },
]
//添加标签
const tagStore = ref('')
const AddTag = () => {
  if(!PhotoInfo.tag.includes(tagStore.value)){
    PhotoInfo.tag.push({
      text: tagStore.value,
      color: randomColor(),
    })
  }
  console.log(PhotoInfo.tag);
}
//删除标签
const DeleteTag = (index) =>{
  PhotoInfo.tag.splice(index, 1);
  console.log(PhotoInfo.tag);
}
//随机标签颜色
const TagColor = ['#8c939d','#86cae7','#ffc283','#fc3945','#29af44']
const randomColor = () => {
  // const letters = '0123456789ABCDEF';
  // let color = '#';
  // for (let i = 0; i < 6; i++) {
  //   color += letters[Math.floor(Math.random() * 16)];
  // }
  // return color;
  const index = Math.floor(Math.random() * TagColor.length);
  return TagColor[index];
}
//保存图库设置
const saveSetting = () => {
  showForm.value = false;
}
</script>
<style scoped>
.avatar-uploader .avatar {
  width: 140px;
  height: 140px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 140px;
  height: 140px;
  text-align: center;
}
.el-tag--dark.el-tag--primary{
  border: none
}
</style>