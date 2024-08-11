<template>
  <div class="flex flex-col w-full min-h-scree">
    <div class="p-[20px]">
      <div class="text-[20px]">图库管理</div>
      <div class="my-5 flex">
        <el-input v-model="NewGalleryName" style="width: 200px;" placeholder="请输入名称"></el-input>
        <el-button class="ml-3" type="primary" @click="AddNewGallery" :disabled="!NewGalleryName">添加图库</el-button>
        <el-upload action="" multiple :show-file-list=false :on-success="handleSuccess" on-remove="" on-error=""
          @click="handleSuccess">
          <el-button class="ml-3" type="primary" @click="readGallery">读取图库</el-button>
        </el-upload>
      </div>
      <div class="flex flex-wrap items-start w-full">
        <div v-for="item in galleryList" :key="item.id"
          class="transform animate-in w-[200px] min-h-[200px] m-2 rounded-md overflow-hidden shadow ">
          <div class="w-full h-[140px] overflow-hidden border-b" @click="goToPage('/photo',item.name)">
            <img class="w-full h-full object-cover object-center" src="../../assets/images/2025754-1.png"></img>
          </div>
          <div class="px-2 bg-white">
            <div class="pt-1">{{ item.name }}</div>
            <div class="py-2 flex justify-between items-center">
              <div class="flex items-center">
                <el-icon>
                  <PictureFilled />
                </el-icon>
                <span class="ml-1 text-[14px]">{{ item.draws.length }}</span>
              </div>
              <div class="flex">
                <el-button type="primary" class="" plain @click="clickSetting(item.name)">
                  <el-icon>
                    <Tools />
                  </el-icon>
                </el-button>
                <el-button type="danger" class="!ml-2" plain @click="clickDialogSetting">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-dialog v-model="showForm">
        <div class="text-[20px] flex flex-col">编辑图库</div>
        <div class="mt-2 flex justify-between">
          <div class="text-[16px]">图库名称</div>
          <el-input v-model="GallertInfo.name" style="width: 200px;" placeholder="请输入名称" :value="GallertInfo.name" clearable></el-input>
        </div>
        <div class="mt-2 flex justify-between">
          <div class="text-[16px]">图库描述</div>
          <el-input v-model="GallertInfo.desc" style="width: 200px;" placeholder="图库描述" clearable></el-input>
        </div>
        <div class="mt-5 flex flex-row justify-end">
          <el-button class="!ml-2" type="primary" @click="saveSetting">保存</el-button>
          <el-button class="!ml-2" type="" @click="showForm = false">取消</el-button>
        </div>
      </el-dialog>
      <el-dialog v-model="deleteDialog" style="max-width: 500px;">
        <div class="text-[20px] flex flex-col">删除图库</div>
        <div class="mt-2 flex justify-between">
          <div class="text-[16px]">确定要删掉这个图库吗？</div>
          <el-input v-model="deleteinput" style="width: 200px;" placeholder="输入图库名字" clearable></el-input>
        </div>
        <div class="mt-5 flex flex-row justify-end">
          <el-button class="!ml-2" type="danger" @click="" :disabled="!(deleteinput)">删除</el-button>
          <el-button class="!ml-2" type="" @click="deleteDialog = false">取消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watchEffect, reactive } from "vue";
import { useRouter } from "vue-router"
import { v4 as uuid } from 'uuid'
import json from '../../../../../resources/json/test1.json'
import { ElMessageBox } from 'element-plus';
const router = useRouter()
const NewGalleryName = ref('')
const GallertInfo = reactive({
  name: '',
  cover: '',
  desc: '',
  craeteTime: '',
  draws: []
})
const input2 = ref('')
const input3 = ref('')
const deleteinput = ref('')
//存放图库列表
const galleryList = ref([
  {
    "id": 1,
    "name": '图库1',
    "cover": '../../assets/images/2025754-1.png',
    "craeteTime": "2024/7/21",
    "draws": [
      {
        "no": uuid(),
        "name": "no_name",
        "author": "白樱索菲",
        "authorid": "4",
        "price": '1000RMB',
        "time": "2022-01-08",
        "url": "../../assets/images/2025754-1.png",
        "type": "illustration",
        "tag": [
          { tno: 1, tname: "1 girl" },
        ],
        "intrduce": `无`
      }
    ]
  },
  {
    "id": 2,
    "name": '图库2',
    "cover": '../../assets/images/2025754-1.png',
    "craeteTime": "2024/7/21",
    "draws": []
  },
  {
    "id": 3,
    "name": '图库3',
    "cover": '../../assets/images/2025754-1.png',
    "craeteTime": "2024/7/21",
    "draws": []
  },
  {
    "id": 4,
    "name": '图库4',
    "cover": '../../assets/images/2025754-1.png',
    "craeteTime": "2024/7/21",
    "draws": []
  }
])
galleryList.value.push(json)
//路由跳转
const goToPage = (path, name) => {
  router.push({ path: path, query: { name: name } });
}
//设置相关
const showForm = ref(false)
const clickSetting = (name) => {
  showForm.value = true;
  GallertInfo.name = name;
}
//确认删除
const deleteDialog = ref(false)
const clickDialogSetting = () => {
  deleteDialog.value = true
}

//保存图库设置
const saveSetting = () => {
  showForm.value = false;
}
//添加默认图库的数据
const defaultGalleryData = {
  "id": uuid(),
  "name": '',
  "cover": './images/defaultImage.png',
  "desc": '',
  "craeteTime": new Date().toLocaleDateString(),
  "draws": []
}
//添加图库
const AddNewGallery = () => {
  defaultGalleryData.name = NewGalleryName.value
  const defaultGalleryJSON = JSON.stringify(defaultGalleryData, null, 2)
  window.api['添加图库'](defaultGalleryJSON)
}
//读取图库相关
// onMounted(() => {
//   window.api['读取全部图库']()
// })
const readGallery = () => {
  window.api['读取全部图库']()
}
//读取图库成功回调函数
const handleSuccess = (res) => {
  console.log(res)
  ElMessageBox.alert('读取成功', '提示', {
    confirmButtonText: '确定',
    type: 'success'
  })
}
/* —————————————————————————— */
</script>
<style>
:deep(.el-dialog) {
  max-width: 500px !important
}
</style>