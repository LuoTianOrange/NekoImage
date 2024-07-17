<template>
    <div class="flex flex-col w-full min-h-scree">
        <div class="p-[20px]">
            <div class="text-[20px]">图库管理</div>
            <div class="my-5 flex">
                <el-input v-model="input1" style="width: 200px;" placeholder="请输入名称"></el-input>
                <el-button class="ml-3" type="primary" @click="AddNewGallery">添加图库</el-button>
            </div>
            <div class="flex flex-wrap items-start w-full">
                <div v-for="item in galleryList" :key="item.id"
                    class="transform animate-in w-[200px] min-h-[200px] m-2 rounded-md overflow-hidden shadow">
                    <div class="w-full h-[140px] overflow-hidden border-b" @click="goToPage('/photo',item.name)">
                        <img class="w-full h-full object-cover object-center" src="../../assets/images/2025754-1.png"></img>
                    </div>
                    <div class="px-2">
                        <div class="pt-1">{{ item.name }}</div>
                        <div class="py-2 flex justify-between items-center">
                            <div class="flex items-center">
                                <el-icon>
                                    <PictureFilled />
                                </el-icon>
                                <span class="ml-1 text-[14px]">{{ item.id }}</span>
                            </div>
                            <div class="flex">
                                <el-button type="primary" class="" plain @click="clickSetting(item.name)">
                                    <el-icon>
                                        <Tools />
                                    </el-icon>
                                </el-button>
                                <el-button type="danger" class="!ml-2" plain>
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
                    <el-input v-model="input2" style="width: 200px;" placeholder="请输入名称" :value="input2"
                        clearable></el-input>
                </div>
                <div class="mt-2 flex justify-between">
                    <div class="text-[16px]">图库描述</div>
                    <el-input v-model="input3" style="width: 200px;" placeholder="图库描述" clearable></el-input>
                </div>
                <div class="mt-5 flex flex-row justify-end">
                    <el-button class="!ml-2" type="primary" @click="saveSetting">保存</el-button>
                    <el-button class="!ml-2" type="" @click="showForm = false">取消</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"

const router = useRouter()
const input1 = ref('')
const input2 = ref('')
const input3 = ref('')
//存放图库列表
const galleryList = ref([
  {
    id: 1,
    name: '图库1',
    cover: '../../assets/images/2025754-1.png'
  },
  {
    id: 2,
    name: '图库2',
    cover: '../../assets/images/2025754-1.png'
  },
  {
    id: 3,
    name: '图库3',
    cover: '../../assets/images/2025754-1.png'
  },
  {
    id: 4,
    name: '图库4',
    cover: '../../assets/images/2025754-1.png'
  }
])
//路由跳转
const goToPage = (path, name) => {
  router.push({ path: path, query: { name: name } });
}
//设置相关
const showForm = ref(false)
const clickSetting = (name) => {
  showForm.value = true;
  input2.value = name;
};
//保存图库设置
const saveSetting = () => {
  showForm.value = false;
}
//添加默认图库的数据
const defaultGalleryData = {
  id: 0,
  name: '',
  cover: '',
  desc: ''
}
//添加图库
const AddNewGallery = () => {
  defaultGalleryData.name = input1.value
  const defaultGalleryJSON = JSON.stringify(defaultGalleryData, null, 2)
  // ipcRenderer.send('添加图库', defaultGalleryJSON)
  window.api['添加图库'](defaultGalleryJSON)
}
</script>