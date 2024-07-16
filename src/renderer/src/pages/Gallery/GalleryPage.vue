<template>
    <div class="flex flex-col w-full min-h-scree">
        <div class="p-[20px]">
            <div class="text-[20px]">图库管理</div>
            <div class="my-5 flex">
                <el-input v-model="input1" style="width: 200px;" placeholder="请输入名称"></el-input>
                <el-button class="ml-3" type="primary">添加图库</el-button>
            </div>
            <div class="flex flex-wrap items-start w-full">
                <div v-for="item in galleryList" :key="item.id" class="w-[200px] min-h-[200px] m-2 rounded-md overflow-hidden shadow">
                    <div class="w-full h-[140px] overflow-hidden border-b" @click="goToPage('/photo',item.name)">
                        <img class="w-full h-full object-cover object-center" src="../../assets/images/2025754-1.png"></img>
                    </div>
                    <div class="px-2">
                        <div class="pt-1">{{ item.name }}</div>
                        <div class="py-2 flex justify-between items-center">
                            <div class="flex items-center">
                                <el-icon><PictureFilled /></el-icon>
                                <span class="ml-1 text-[14px]">{{ item.id }}</span>
                            </div>
                            <el-button type="primary" class="h-2" plain text>
                                <el-icon ><Tools /></el-icon>
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"
const router = useRouter()
const input1 = ref('')
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
const goToPage = (path, name) => {
  router.push({ path: path, query: { name: name } });
}
</script>