<template>
  <div
    class="flex flex-row w-full min-h-calc(100vh-35px)"
    v-bind="getRootProps()"
    @dragenter="handleDragEnter"
    @dragover.prevent
    @dragleave="handleDragLeave"
  >
    <!-- 拖拽上传区域 -->
    <div
      v-if="isDragging"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.stop="isDragging = false"
    >
      <div
        class="w-[500px] h-[300px] bg-white dark:bg-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed border-blue-500"
      >
        <input v-bind="getInputProps()" />
        <el-icon class="text-blue-500 mb-4" :size="60">
          <UploadFilled />
        </el-icon>
        <div class="text-xl font-medium mb-2">
          {{ isDragActive ? '松开鼠标上传文件' : '拖放文件到此处上传' }}
        </div>
        <div class="text-gray-500 mb-6">支持图片文件 (JPG, PNG, GIF等)</div>
        <el-button type="primary" @click.stop="open">选择文件</el-button>
      </div>
    </div>
    <div class="p-[20px] overflow-y-auto w-full">
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
          <el-breadcrumb-item class="cursor-pointer">{{ name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!--按钮组-->
      <div class="mt-3 flex">
        <el-button type="primary" plain class="flex flex-row" @click="handleAddPicture">
          <el-icon>
            <UploadFilled />
          </el-icon>
          <div class="ml-1">添加图片</div>
        </el-button>
        <!-- <el-button type="primary" plain class="flex flex-row">
          <el-icon>
            <Download />
          </el-icon>
          <div class="ml-1">下载图库</div>
        </el-button> -->
        <!-- 排序按钮 -->
        <el-dropdown class="ml-2" trigger="click" @command="handleSort">
          <el-button type="primary" plain class="flex flex-row">
            <el-icon>
              <Sort />
            </el-icon>
            <div class="ml-1">排序</div>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="name-asc">按名称升序</el-dropdown-item>
              <el-dropdown-item command="name-desc">按名称降序</el-dropdown-item>
              <el-dropdown-item command="date-asc">按日期升序</el-dropdown-item>
              <el-dropdown-item command="date-desc">按日期降序</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown class="ml-2" trigger="click" @command="handleFilterChange">
          <el-button type="warning" plain class="flex flex-row">
            <el-icon><Star /></el-icon>
            <div class="ml-1">{{ filterText }}</div>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">
                <span :class="{ 'text-yellow-500': currentFilter === 'all' }">显示全部图片</span>
              </el-dropdown-item>
              <el-dropdown-item command="favorites">
                <span :class="{ 'text-yellow-500': currentFilter === 'favorites' }"
                  >仅显示收藏</span
                >
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="primary" plain class="flex flex-row ml-2" @click="clickSetting(name)">
          <el-icon>
            <Tools />
          </el-icon>
          <div class="ml-1">设置</div>
        </el-button>
        <el-button type="danger" plain class="flex flex-row">
          <el-icon>
            <Delete />
          </el-icon>
          <div class="ml-1" @click="deleteDialog = true">删除图库</div>
        </el-button>
      </div>
      <!--图片展示区-->
      <div class="mt-5 flex flex-wrap items-start w-full">
        <div
          v-for="(item, index) in filteredImages"
          class="w-[180px] h-[180px] flex flex-col justify-between items-center bg-theme border-theme p-3 border relative mt-3 ml-3 transform animate-in zoom-in"
          @mouseenter="EnterPicture(index)"
          @mouseleave="LeavePicture(index)"
          @click.stop="goToPage('/photoInfo', { name: name, item: item })"
        >
          <img :src="item.cover" class="w-auto h-[130px] object-scale-down" />
          <el-tooltip :content="item.name" placement="top">
            <span
              class="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] inline-block"
              >{{ item.name }}</span
            >
          </el-tooltip>
          <div
            v-if="isEnterPicture[index]"
            class="flex justify-center items-center transform animate-out zoom-in absolute top-0 bg-white/75 dark:bg-zinc-700/75 w-full h-[40px]"
          >
            <!--收藏图片-->
            <el-button
              type="warning"
              size="small"
              :plain="!item.isFavorite"
              @click.stop="toggleFavorite(item)"
            >
              <el-icon size="16">
                <StarFilled v-if="item.isFavorite" />
                <Star v-else />
              </el-icon>
            </el-button>
            <!--删除图片-->
            <el-button class="" type="danger" size="small" plain @click.stop="deletePhoto(item)">
              <el-icon size="16">
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 信息展示部分 -->
    <div
      class="sticky right-0 top-0 min-h-[100vh-35px] w-[280px] min-w-[280px] border-l border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg"
    >
      <div class="p-4 h-full flex flex-col">
        <!-- 标题区域 -->
        <div
          class="flex items-center justify-between mb-2 pb-2"
        >
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">图库信息</h3>
          <el-button type="info" size="small" plain circle @click="refreshGalleryInfo">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>

        <!-- 信息内容区域 -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="GalleryInfo" class="space-y-4">
            <!-- 基本信息卡片 -->
            <div class="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
              <div class="flex items-center mb-2">
                <el-icon class="text-blue-500 mr-2"><Folder /></el-icon>
                <span class="font-medium text-gray-700 dark:text-gray-300">基本信息</span>
              </div>

              <div class="space-y-2 pl-4">
                <div class="flex items-start">
                  <span class="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">名称:</span>
                  <span
                    class="text-gray-800 dark:text-gray-200 font-medium break-all whitespace-normal"
                  >
                    {{ GalleryInfo['图库名称'] }}
                  </span>
                </div>
                <div class="flex items-start">
                  <span class="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">描述:</span>
                  <span class="text-gray-800 dark:text-gray-200 font-medium break-all whitespace-normal">{{
                    GalleryInfo['图库描述'] || '无描述'
                  }}</span>
                </div>
              </div>
            </div>

            <!-- 统计信息卡片 -->
            <div class="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
              <div class="flex items-center mb-2">
                <el-icon class="text-green-500 mr-2"><DataAnalysis /></el-icon>
                <span class="font-medium text-gray-700 dark:text-gray-300">统计信息</span>
              </div>

              <div class="space-y-2 pl-4">
                <div class="flex items-center">
                  <span class="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">图片数:</span>
                  <span class="text-gray-800 dark:text-gray-200">{{
                    GalleryInfo['图片数量']
                  }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">大小:</span>
                  <span class="text-gray-800 dark:text-gray-200">{{
                    GalleryInfo['图库大小'] || '未知'
                  }}</span>
                </div>
              </div>
            </div>

            <!-- 时间信息卡片 -->
            <div class="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
              <div class="flex items-center mb-2">
                <el-icon class="text-purple-500 mr-2"><Clock /></el-icon>
                <span class="font-medium text-gray-700 dark:text-gray-300">时间信息</span>
              </div>

              <div class="space-y-2 pl-4">
                <div class="flex items-center">
                  <span class="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">创建:</span>
                  <span class="text-gray-800 dark:text-gray-200">{{
                    GalleryInfo['创建时间']
                  }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">更新:</span>
                  <span class="text-gray-800 dark:text-gray-200">{{
                    GalleryInfo['更新时间']
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 无数据状态 -->
          <div v-else class="h-full flex flex-col items-center justify-center text-gray-400">
            <el-icon :size="48" class="mb-2"><DocumentRemove /></el-icon>
            <span>未找到图库信息</span>
            <el-button type="primary" size="small" class="mt-4" @click="refreshGalleryInfo">
              刷新数据
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!--设置弹窗-->
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
    <!--添加图片弹窗-->
    <!-- <el-dialog v-model="showAddPictrueSetting" :width="600">
      <div class="text-[20px] flex flex-col">添加图片</div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">上传图片<span class="text-red-600">*</span></div>
        <el-upload
          ref="uploadRef"
          class="avatar-uploader border h-[100px]"
          action="#"
          :http-request="uploadFile"
          :limit="1"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-success="handleSuccess"
          :on-error="handleError"
          :on-change="handleChange"
          :auto-upload="false"
        >
          <div
            class="relative"
            v-if="imageUrl"
            @mouseenter="disabledHover = false"
            @mouseleave="disabledHover = true"
          >
            <img :src="imageUrl" class="avatar" />
            <span v-if="!disabledHover" class="avatar-icon-bg" @click.stop="handleRemove">
              <el-icon class="" :size="25">
                <Delete />
              </el-icon>
            </span>
          </div>
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画作名称<span class="text-red-600">*</span></div>
        <el-input
          v-model="PhotoInfo.name"
          style="width: 200px"
          placeholder="请输入名称"
          clearable
        ></el-input>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画作描述</div>
        <el-input
          v-model="PhotoInfo.desc"
          style="width: 200px"
          placeholder="画作描述"
          clearable
        ></el-input>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画师名称<span class="text-red-600">*</span></div>
        <el-input
          v-model="PhotoInfo.author"
          style="width: 200px"
          placeholder="画师名称"
          clearable
        ></el-input>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">开始时间</div>
        <el-date-picker
          v-model="PhotoInfo.startTime"
          style="width: 200px"
          type="date"
          size="default"
          placeholder="开始时间"
        >
        </el-date-picker>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">交付时间</div>
        <el-date-picker
          v-model="PhotoInfo.endTime"
          style="width: 200px"
          type="date"
          size="default"
          placeholder="交付时间"
        >
        </el-date-picker>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画作类型<span class="text-red-600">*</span></div>
        <el-select v-model="PhotoInfo.type" style="width: 200px" placeholder="选择画作类型">
          <el-option v-for="i in PictureType" :label="i.label" :value="i.value"></el-option>
        </el-select>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">标签</div>
        <div class="flex flex-col">
          <el-input v-model="tagStore" placeholder="输入标签" clearable style="width: 200px">
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
        <el-tag
          class="m-[4px]"
          v-for="(tag, index) in PhotoInfo.tag"
          :key="index"
          closable
          @close="DeleteTag(index)"
          :style="{ backgroundColor: tag.color }"
          effect="dark"
          >{{ tag.text }}</el-tag
        >
      </div>

      <div class="mt-5 flex flex-row justify-end">
        <el-button
          class="!ml-2"
          type="primary"
          @click="AddPhotoInfo(PhotoInfo)"
          :disabled="!(PhotoInfo.name && PhotoInfo.author && PhotoInfo.type)"
          >保存</el-button
        >
        <el-button class="!ml-2" type="" @click="(showAddPictrueSetting = false), cancelUpload()"
          >取消</el-button
        >
      </div>
    </el-dialog> -->
    <!--删除图片弹窗-->
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
</template>

<script setup>
import {
  ref,
  watchEffect,
  reactive,
  onMounted,
  onUpdated,
  watch,
  onActivated,
  toRaw,
  computed
} from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { ArrowRight, Star, StarFilled } from '@element-plus/icons-vue'
import { DownPicture } from '@icon-park/vue-next'
import { ElMessage, ElDatePicker, ElMessageBox } from 'element-plus'
import moment from 'moment'
import _ from 'lodash'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useDropzone } from 'vue3-dropzone'

const uploadRef = ref(null)
const route = useRoute()
const router = useRouter()

const editForm = reactive({
  originalName: '',
  name: '',
  desc: '',
  draws: [],
  favorites: []
})
const name = ref('')

const image = ref([])
const GalleryInfo = ref({
  图库名称: '',
  图库描述: '',
  图片数量: 0,
  创建时间: '',
  图库大小: ''
})

// 拖拽上传相关
const isDragging = ref(false)

// 使用 vue3-dropzone
function onDrop(acceptFiles, rejectReasons) {
  if (rejectReasons.length > 0) {
    ElMessage.error(`有 ${rejectReasons.length} 个文件不符合要求`)
    return
  }

  // 将拖拽的文件转换为与 handleAddPicture 兼容的格式
  const files = acceptFiles.map((file) => ({
    name: file.name,
    path: file.path
  }))

  // 调用现有的 handleAddPicture 处理逻辑
  handleAddPictureFiles(files)
}

const { getRootProps, getInputProps, open, isDragActive, rootRef } = useDropzone({
  onDrop,
  accept: 'image/*',
  maxSize: 50 * 1024 * 1024, // 50MB
  multiple: true,
  noClick: true,
  noKeyboard: true,
  onDragEnter: () => {
    isDragging.value = true
  },
  onDragLeave: () => {
    isDragging.value = false
  }
})

// 刷新图库信息方法
const refreshGalleryInfo = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在刷新图库信息...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const data = await getGalleryInfo()
    if (data) {
      GalleryInfo.value = data
      ElMessage.success('图库信息已刷新')
    } else {
      ElMessage.error('获取图库信息失败')
    }
  } finally {
    loading.close()
  }
}

// 从 handleAddPicture 提取出的核心上传逻辑
const handleAddPictureFiles = async (files) => {
  if (!files.length) return

  try {
    // 1. 批量上传文件
    const uploadResults = await window.api['上传图片到指定文件夹']({
      files: files,
      folderName: name.value
    })

    // 筛选上传成功的文件
    const successUploads = uploadResults.filter((r) => r.success)

    if (successUploads.length === 0) {
      throw new Error('所有文件上传失败')
    }

    // 2. 批量写入图片信息
    const writeResult = await window.api['将图片信息写入json']({
      folderName: name.value,
      photos: successUploads.map((file) => ({
        name: file.savedName, // 使用处理后的文件名
        savedName: file.savedName, // 传递给后端
        cover: file.path,
        desc: ''
      }))
    })

    if (writeResult.success) {
      ElMessage.success(`成功添加 ${writeResult.addedCount} 张图片`)
      await getAllImages() // 刷新列表
      const updatedInfo = await getGalleryInfo()
      if (updatedInfo) {
        GalleryInfo.value = updatedInfo
      }
    } else {
      throw new Error(writeResult.error)
    }
  } catch (error) {
    ElMessage.error(`添加图片失败: ${error.message}`)
  } finally {
    isDragging.value = false
  }
}

// 手动处理拖拽事件，确保在最外层div也能触发
const handleDragEnter = (e) => {
  if (e.dataTransfer.types.includes('Files')) {
    isDragging.value = true
  }
}

const handleDragLeave = (e) => {
  if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
    isDragging.value = false
  }
}

const currentFilter = ref('all') // 'all' 或 'favorites'
const filterText = computed(() => (currentFilter.value === 'all' ? '显示全部' : '仅收藏'))

const filteredImages = computed(() => {
  let result = [...image.value] // 使用原始图片数据

  // 应用收藏筛选
  if (currentFilter.value === 'favorites') {
    result = result.filter((img) => img.isFavorite)
  }

  // 应用排序
  const { field, order } = sortOptions.value
  return result.sort((a, b) => {
    if (field === 'name') {
      return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    } else if (field === 'date') {
      return order === 'asc'
        ? new Date(a.createTime) - new Date(b.createTime)
        : new Date(b.createTime) - new Date(a.createTime)
    }
    return 0
  })
})

// 处理筛选变化
const handleFilterChange = async (command) => {
  currentFilter.value = command
  await getAllImages()
}

// 切换收藏状态
const toggleFavorite = async (item) => {
  try {
    const isFavorite = !item.isFavorite
    const api = isFavorite ? '添加收藏' : '移除收藏'

    const response = await window.api[api]({
      galleryName: name.value,
      pid: item.pid
    })

    if (response.success) {
      // 更新本地状态
      item.isFavorite = isFavorite
      item.favoriteTime = isFavorite ? new Date().toISOString() : null
      ElMessage.success(isFavorite ? '已添加到收藏' : '已从收藏移除')
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    ElMessage.error(`操作失败: ${error.message}`)
  }
}

//获取全部图片
const getAllImages = async () => {
  /**
   * 图库名称
   */
  const fileName = name.value
  // console.log("fileName:", fileName)
  const response = await window.api['读取全部图片']({ fileName })
  image.value = response.data.draws
  console.log('读取全部图片:', response.data.draws)
}
//获取图库信息
const getGalleryInfo = async () => {
  try {
    const response = await window.api['读取图库信息'](name.value)
    console.log('response:', response)

    if (response.success) {
      const galleryInfo = _.cloneDeep(response.data)
      console.log('galleryInfo:', galleryInfo)

      const info = {
        图库名称: galleryInfo.name,
        图库描述: galleryInfo.desc,
        图片数量: galleryInfo.draws?.length || 0,
        创建时间: moment(galleryInfo.createTime).format('YYYY-MM-DD HH:mm:ss'),
        更新时间: moment(galleryInfo.updateTime).format('YYYY-MM-DD HH:mm:ss'),
        图库大小: galleryInfo.size
      }
      console.log('获取图库信息成功:', info)

      return info
    } else {
      console.error('获取图库信息失败:', response.message)
      return null
    }
  } catch (error) {
    console.error('调用 IPC 通道失败:', error)
    return null
  }
}

//监测路由变化更新图片
onActivated(async () => {
  await getAllImages()
  const data = await getGalleryInfo()
  if (data) {
    GalleryInfo.value = data || {}
  }
})

//图片悬浮框相关
const isEnterPicture = ref([])
const EnterPicture = (index) => {
  isEnterPicture.value[index] = true
}
const LeavePicture = (index) => {
  isEnterPicture.value[index] = false
}

//监控路由变化，改变name的值
watchEffect(() => {
  name.value = route.query.name
})

//路由跳转

const goToPage = (path, { name, item }) => {
  const itemInfo = toRaw(item)
  console.log(itemInfo)
  console.log('name:', { name, itemInfo })
  router.push({ path, query: { name, item: JSON.stringify(itemInfo) } })
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

const PhotoInfo = ref({
  name: '',
  cover: '',
  desc: '',
  type: '',
  tag: [],
  isFavorite: false,
  favoriteTime: null
})
const imageUrl = ref('')
//添加标签
const tagStore = ref('')
const AddTag = () => {
  if (!PhotoInfo.value.tag.some((tag) => tag.text === tagStore.value) && tagStore.value) {
    PhotoInfo.value.tag.push({
      text: tagStore.value,
      color: randomColor()
    })
  } else if (PhotoInfo.value.tag.some((tag) => tag.text === tagStore.value)) {
    ElMessage.error('标签已存在')
  } else {
    ElMessage.error('标签不能为空')
  }
  // console.log(PhotoInfo.tag)
}
//删除标签
const DeleteTag = (index) => {
  PhotoInfo.value.tag.splice(index, 1)
  console.log(PhotoInfo.value.tag)
}
//随机标签颜色
const TagColor = ['#8c939d', '#86cae7', '#ffc283', '#fc3945', '#29af44']
const randomColor = () => {
  const index = Math.floor(Math.random() * TagColor.length)
  return TagColor[index]
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
        callback: async () => {
          showForm.value = false
          // 更新当前页面显示的名称
          name.value = editForm.name

          // 刷新右侧图库信息 - 确保正确更新 GalleryInfo
          const updatedInfo = await getGalleryInfo()
          if (updatedInfo) {
            GalleryInfo.value = updatedInfo
          }

          // 刷新图片列表
          await getAllImages()
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

// 添加图片功能
const handleAddPicture = async () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.multiple = true

  fileInput.onchange = async (event) => {
    const files = Array.from(event.target.files).map((file) => ({
      name: file.name,
      path: file.path
    }))

    await handleAddPictureFiles(files)
  }

  fileInput.click()
}

// 删除图片
const deletePhoto = async (item) => {
  try {
    const folderName = name.value
    const pid = item.pid // 直接使用对象中的pid

    console.log('删除图片:', {
      folderName,
      pid,
      cover: item.cover // 打印要删除的文件路径
    })
    await ElMessageBox.confirm(`确定要删除图片 "${item.name}" 吗?`, '删除图片', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const result = await window.api['删除图库图片']({
      folderName,
      pid
    })

    if (result.success) {
      ElMessage.success('图片删除成功')
      // 使用filter更新数组，避免索引问题
      image.value = image.value.filter((img) => img.pid !== pid)

      // 更新图库信息
      const data = await getGalleryInfo()
      if (data) {
        GalleryInfo.value = data
      }
    } else {
      throw new Error(result.error || '删除失败')
    }
  } catch (error) {
    console.error('删除图片出错:', error)
    ElMessage.error(`删除失败: ${error.message}`)
  }
}

//当前选择的图库名字
const selectDialog = ref('')
//验证输入的图库名字是否和当前图库名字一致

// 监控路由变化，改变 name 的值
watchEffect(() => {
  name.value = route.query.name
  selectDialog.value = name.value // 将 selectDialog 赋值为当前图库名称
})

const ReadAllGallery = async () => {
  const response = await window.api['读取全部图库']()
  galleryList.value = response.data
}

const validateGalleryName = (input) => {
  return input !== selectDialog.value // 当 input 不等于当前图库名称时，返回 true（禁用按钮）
}

const deleteinput = ref('')

// 删除指定图库
const deleteDialog = ref(false)
const deleteGallery = async (name) => {
  NProgress.start()
  const result = await window.api['删除指定图库'](name)
  if (result.success) {
    deleteDialog.value = false
    deleteinput.value = ''
    ElMessageBox.alert('成功删除图库', '提示', {
      confirmButtonText: '确定',
      type: 'success',
      callback: (action) => {
        if (action === 'confirm') {
          NProgress.done()
          router.push('/gallery') // 跳转到 /gallery 页面
        }
      }
    })
    await ReadAllGallery()
    NProgress.done()
  } else {
    ElMessage.error('删除图库失败: ' + result.message)
  }
}

// 排序逻辑
const sortOptions = ref({
  field: 'name', // 默认按名称排序
  order: 'asc' // 默认升序
})

// 处理排序
const handleSort = async (command) => {
  const [field, order] = command.split('-')
  sortOptions.value = { field, order }

  // 调用后端排序接口
  const response = await window.api['获取排序后的图片']({
    folderName: name.value,
    field,
    order
  })

  if (response.success) {
    image.value = response.data
    console.log('排序后的图片列表:', image.value)
  } else {
    ElMessage.error('排序失败: ' + response.message)
  }
}
</script>
<style scoped>
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
  overflow: hidden;
  position: relative;
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
  width: 100px;
  height: 100px;
  text-align: center;
}

.el-tag--dark.el-tag--primary {
  border: none;
}

.avatar-icon-bg {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  color: #fff;
  width: 100px;
  height: 100px;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  cursor: pointer;
}
:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner:hover) {
  color: var(--el-color-primary);
}

.bg-theme {
  @apply bg-white dark:bg-zinc-800;
}
.border-theme {
  @apply border-zinc-200 dark:border-zinc-700;
}
</style>
