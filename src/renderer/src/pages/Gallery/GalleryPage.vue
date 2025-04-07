<template>
  <div class="flex flex-col w-full min-h-scree">
    <div class="p-[20px]">
      <div class="text-[20px]">图库管理</div>
      <div class="my-5 flex">
        <el-input
          v-model="NewGalleryName"
          style="width: 200px"
          placeholder="请输入名称"
          clearable
          show-word-limit
          maxlength="10"
        ></el-input>
        <el-button class="ml-3" type="primary" @click="AddNewGallery" :disabled="!NewGalleryName"
          >添加图库</el-button
        >
        <!-- <el-upload
          action=""
          multiple
          :show-file-list="false"
          :on-success="handleSuccess"
          on-remove=""
          :on-error="handleError"
        >
          <el-button class="ml-3" type="primary" @click="readGallery">读取图库</el-button>
        </el-upload>
        <el-button class="ml-3" type="success" @click="ReadAllGallery">更新图库</el-button> -->
      </div>
      <div class="flex flex-wrap items-start w-full">
        <div
          v-for="item in galleryList"
          :key="item.id"
          class="transform animate-in w-[200px] min-h-[200px] m-2 rounded-md overflow-hidden shadow"
        >
          <div
            class="w-full h-[140px] overflow-hidden border-b border-theme"
            @click="goToPage('/photo', item.name)"
          >
            <img
              v-if="item.draws.length == 0"
              class="w-full h-full object-cover object-center"
              src="../../assets/bloghover.png"
            />
            <img
              v-else
              class="w-full h-full object-cover object-center"
              :src="item.draws[0].cover"
            />
          </div>
          <div class="px-2 bg-theme">
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
                <el-button
                  type="danger"
                  class="!ml-2"
                  plain
                  @click="clickDeleteDialogSetting(item.name)"
                >
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-dialog v-model="showForm" :width="600">
        <div class="text-[20px] flex flex-col">编辑图库</div>
        <div class="mt-2 flex justify-between">
          <div class="text-[16px]">图库名称</div>
          <el-input
            v-model="editForm.name"
            style="width: 200px"
            placeholder="请输入名称"
            clearable
          ></el-input>
        </div>
        <div class="mt-2 flex justify-between">
          <div class="text-[16px]">图库描述</div>
          <el-input
            v-model="editForm.desc"
            style="width: 200px"
            placeholder="图库描述"
            clearable
          ></el-input>
        </div>
        <div class="mt-5 flex flex-row justify-end">
          <el-button class="!ml-2" type="primary" @click="saveSetting">保存</el-button>
          <el-button class="!ml-2" type="" @click="showForm = false">取消</el-button>
        </div>
      </el-dialog>
      <el-dialog v-model="deleteDialog" style="max-width: 500px">
        <div class="text-[20px] flex flex-col">删除图库</div>
        <div class="mt-2 flex justify-between">
          <div class="text-[16px]">确定要删掉这个图库吗？</div>
          <el-input
            v-model="deleteinput"
            style="width: 200px"
            placeholder="输入图库名字"
            clearable
          ></el-input>
        </div>
        <div class="text-[16px] text-red-400">一旦删除无法找回！</div>
        <div class="mt-5 flex flex-row justify-end">
          <el-button
            class="!ml-2"
            type="danger"
            @click="deleteGallery(deleteinput)"
            :disabled="validateGalleryName(deleteinput)"
            >删除</el-button
          >
          <el-button class="!ml-2" type="" @click="deleteDialog = false">取消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watchEffect, reactive, onBeforeMount, watch, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { v4 as uuid } from 'uuid'
import { ElMessageBox } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const router = useRouter()
const route = useRoute()
// watch(route, (to, from) => {
//   router.go(0)
// })

const NewGalleryName = ref('')
//图库基本信息
const editForm = reactive({
  originalName: '',
  name: '',
  desc: '',
  draws: [],
  favorites: []
})
const deleteinput = ref('')

//路由跳转
const goToPage = (path, name) => {
  router.push({ path: path, query: { date: new Date().getTime(), name: name } })
  console.log(name)
}
//设置相关
const showForm = ref(false)
const clickSetting = async (name) => {
  showForm.value = true
  editForm.originalName = name

  // 读取图库当前信息
  try {
    const response = await window.api['读取图库信息'](name)
    if (response.success) {
      editForm.name = response.data.name
      editForm.desc = response.data.desc || ''
    } else {
      ElMessageBox.alert('获取图库信息失败', '错误', {
        confirmButtonText: '确定',
        type: 'error'
      })
    }
  } catch (error) {
    console.error('获取图库信息出错:', error)
    ElMessageBox.alert('获取图库信息出错', '错误', {
      confirmButtonText: '确定',
      type: 'error'
    })
  }
}

//保存图库设置
const saveSetting = async () => {
  if (!editForm.name) {
    ElMessageBox.alert('图库名称不能为空', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }

  try {
    NProgress.start()

    const response = await window.api['修改图库信息']({
      galleryName: editForm.originalName,
      updates: {
        name: editForm.name,
        desc: editForm.desc
      }
    })

    if (response.success) {
      ElMessageBox.alert('图库信息更新成功', '提示', {
        confirmButtonText: '确定',
        type: 'success',
        callback: () => {
          showForm.value = false
          ReadAllGallery() // 刷新图库列表
        }
      })
    } else {
      ElMessageBox.alert(response.message || '更新图库信息失败', '错误', {
        confirmButtonText: '确定',
        type: 'error'
      })
    }
  } catch (error) {
    console.error('更新图库信息出错:', error)
    ElMessageBox.alert('更新图库信息出错', '错误', {
      confirmButtonText: '确定',
      type: 'error'
    })
  } finally {
    NProgress.done()
  }
}

//添加默认图库的数据
// const defaultGalleryData = {
//   id: uuid(),
//   name: '',
//   cover: './images/defaultImage.png',
//   desc: '',
//   createTime: new Date().toLocaleDateString(),
//   updateTime: new Date().toLocaleDateString(),
//   draws: []
// }

//当前选择的图库名字
const selectDialog = ref('')
//验证输入的图库名字是否和当前图库名字一致
const validateGalleryName = (input) => {
  const name = selectDialog.value
  if (input === name) {
    return false
  } else {
    return true
  }
}
//删除指定图库
const deleteDialog = ref(false)
const deleteGallery = async (name) => {
  NProgress.start()
  await window.api['删除指定图库'](name)
  deleteDialog.value = false
  deleteinput.value = ''
  ElMessageBox.alert('成功删除图库', '提示', {
    confirmButtonText: '确定',
    type: 'success',
    callback: (action) => {
      if (action === 'confirm') {
        NProgress.done()
      }
    }
  })
  await ReadAllGallery()
  NProgress.done()
  router.go(0)
  console.log('删除指定图库', name)
}
/**
 *
 * @param data 获取当前选择的图库名字
 */
const clickDeleteDialogSetting = (data) => {
  deleteDialog.value = true
  selectDialog.value = data
}

//存放图库列表
const galleryList = ref([])

//读取全部图库
onActivated(async () => {
  const response = await window.api['读取全部图库']()
  galleryList.value = response.data
  console.log(response)
  // console.log("draw[0]:",galleryList.value[0].draws[0].cover)
})
const ReadAllGallery = async () => {
  const response = await window.api['读取全部图库']()
  galleryList.value = response.data
}

//读取指定图库
const readGallery = () => {}
//读取图库成功回调函数
const handleSuccess = (res) => {
  console.log(res)
  ElMessageBox.alert('读取成功', '提示', {
    confirmButtonText: '确定',
    type: 'success'
  })
}
//读取图库失败回调函数
const handleError = (res) => {
  console.log(res)
  ElMessageBox.alert('读取失败', '提示', {
    confirmButtonText: '确定',
    type: 'error'
  })
}
//添加图库
const AddNewGallery = async () => {
  // 检查图库名称是否为空
  if (!NewGalleryName.value.trim()) {
    ElMessageBox.alert('图库名称不能为空', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }

  // 定义非法字符集合（Windows/Linux通用）
  const illegalChars = /[\\/:*?"<>|]/

  // 检查名称是否包含非法字符
  if (illegalChars.test(NewGalleryName.value)) {
    ElMessageBox.alert('图库名称包含非法字符: \\ / : * ? " < > | \n请使用其他名称', '非法名称', {
      confirmButtonText: '确定',
      type: 'error'
    })
    return
  }

  // 检查名称是否以点(.)开头
  if (NewGalleryName.value.startsWith('.')) {
    ElMessageBox.alert('图库名称不能以点(.)开头', '非法名称', {
      confirmButtonText: '确定',
      type: 'error'
    })
    return
  }

  // 检查名称长度是否合理
  if (NewGalleryName.value.length > 10) {
    ElMessageBox.alert('图库名称过长，请控制在10个字符以内', '名称过长', {
      confirmButtonText: '确定',
      type: 'error'
    })
    return
  }

  try {
    NProgress.start()

    // 构造正确的图库数据对象
    const galleryData = {
      name: NewGalleryName.value.trim(),
      desc: '', // 可选描述
      draws: [], // 初始图片数组
      favorites: [] // 初始收藏数组
    }

    // 调用后端API
    const result = await window.api['添加图库'](galleryData)

    // 检查返回结果结构
    if (!result || typeof result.success === 'undefined') {
      throw new Error('无效的API响应格式')
    }

    if (result.success) {
      ElMessageBox.alert(`图库"${result.data?.name || NewGalleryName.value}"创建成功`, '成功', {
        confirmButtonText: '确定',
        type: 'success',
        callback: () => {
          NewGalleryName.value = ''
          ReadAllGallery() // 刷新图库列表
        }
      })
    } else {
      let errorMessage = result.message || '添加图库失败'

      if (result.details?.existingPath) {
        errorMessage = `图库"${NewGalleryName.value}"已存在，请更换其他名称`
      }

      ElMessageBox.alert(errorMessage, '错误', {
        confirmButtonText: '确定',
        type: 'error'
      })
    }
  } catch (error) {
    console.error('添加图库出错:', error)
    ElMessageBox.alert(error.message || '添加图库时发生未知错误', '错误', {
      confirmButtonText: '确定',
      type: 'error'
    })
  } finally {
    NProgress.done()
  }
}

/* —————————————————————————— */
</script>
<style>
:deep(.el-dialog) {
  max-width: 500px !important;
}

#nprogress .bar {
  background: #ffa73b !important;
  box-shadow: none !important;
  height: 3px !important;
  border: none !important;
  z-index: 9999;
}

#nprogress .spinner-icon {
  border-top-color: #ffa73b !important;
  border-left-color: #ffa73b !important;
  z-index: 9999;
}

#nprogress .peg {
  box-shadow:
    0 0 10px #ffa73b,
    0 0 5px #ffa73b !important;
  z-index: 9999;
}

.bg-theme {
  @apply bg-white dark:bg-zinc-800;
}
.border-theme {
  @apply border-zinc-200 dark:border-zinc-700;
}
</style>
