<template>
    <div>
        <div class="flex flex-col w-full min-h-scree">
            <div class="p-[20px]">
                <div class="text-[20px]">{{ item.name }}</div>
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
                    <el-breadcrumb-item>{{ item.name }}</el-breadcrumb-item>
                </el-breadcrumb>
                <!--按钮组-->
                <div class="mt-3 flex">
                    <el-button type="primary" plain class="flex flex-row">
                        <el-icon>
                            <Tools />
                        </el-icon>
                        <div class="ml-1">设置</div>
                    </el-button>
                    <el-button type="danger" plain class="flex flex-row">
                        <el-icon>
                            <Delete />
                        </el-icon>
                        <div class="ml-1">删除图片</div>
                    </el-button>
                </div>
                <!--图片展示-->
                <div class="flex items-center mt-5">
                    <div class="w-[500px] p-[10px] bg-white">
                        <!-- <img :src="item.cover" class="w-full h-auto"></img> -->
                        <el-image :src="item.cover" fit="cover" :preview-src-list="photoPreview" :zoom-rate="1.2"
                            :max-scale="7" :min-scale="0.2" class="w-full h-auto">
                        </el-image>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { watchEffect, ref, onActivated, onMounted } from 'vue'
import _ from 'lodash'

const route = useRoute()
const router = useRouter()
const name = ref('')
const item = ref('')
const photoPreview = []
watchEffect(() => {
  name.value = route.query.name
  if (!route.query.item) {
    return
  }
  item.value = JSON.parse(route.query.item)
  photoPreview.length = 0
  photoPreview.push(item.value.cover)
  console.log(route.query);
  console.log(photoPreview);
})
onMounted(() => {
  photoPreview.push(item.value.cover)
})
const goToPage = (path, name) => {
  router.push({ path: path, query: { name } })
}
</script>