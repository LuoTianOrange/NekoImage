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
            <div class="ml-1">添加单张图片</div>
          </el-button>
          <el-button type="primary" plain class="flex flex-row" @click="">
            <el-icon>
              <UploadFilled />
            </el-icon>
            <div class="ml-1">添加多张图片</div>
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
          <!-- <el-button class="flex flex-row" type="warning" plain @click="getAllImages()">
            <el-icon>
              <Tools />
            </el-icon>
            <div class="ml-1">刷新</div>
          </el-button> -->
        </div>
        <!--图片展示区-->
        <div class="mt-5 flex flex-wrap items-start w-full">
          <div v-for="(item, index) in image"
            class="w-[180px] h-[180px] flex flex-col justify-between items-center bg-white p-3 border relative mt-3 ml-3 transform animate-in zoom-in"
            @mouseenter="EnterPicture(index)" @mouseleave="LeavePicture(index)"
            @click.stop="goToPage('/photoInfo',{name: name,item: item})">
            <img :src="item.cover" class="w-auto h-[130px] object-scale-down" />
            <span>{{ item.name }}</span>
            <div v-if="isEnterPicture[index]"
              class="flex justify-center items-center transform animate-out zoom-in absolute top-0 bg-white bg-opacity-75 w-full h-[40px]">
              <!--复制图片信息-->
              <el-button class="" type="success" size="small" plain>
                <el-icon>
                  <DocumentCopy />
                </el-icon>
              </el-button>
              <!--删除图片-->
              <el-button class="" type="danger" size="small" plain @click.stop="deletePhoto(index)">
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
    <el-dialog v-model="showForm" :width="600">
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
    <el-dialog v-model="showAddPictrueSetting" :width="600">
      <div class="text-[20px] flex flex-col">添加图片</div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">上传图片<span class="text-red-600">*</span></div>
        <el-upload ref="uploadRef" class="avatar-uploader border h-[100px]" action="#" :http-request="uploadFile"
          :limit="1" :show-file-list="false" :before-upload="beforeUpload" :on-success="handleSuccess"
          :on-error="handleError" :on-change="handleChange" :auto-upload="false">
          <div class="relative" v-if="imageUrl" @mouseenter="disabledHover = false" @mouseleave="disabledHover = true">
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
        <el-input v-model="PhotoInfo.name" style="width: 200px;" placeholder="请输入名称" clearable></el-input>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画作描述</div>
        <el-input v-model="PhotoInfo.desc" style="width: 200px;" placeholder="画作描述" clearable></el-input>
      </div>
      <div class="mt-2 flex justify-between">
        <div class="text-[16px]">画师名称<span class="text-red-600">*</span></div>
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
        <div class="text-[16px]">画作类型<span class="text-red-600">*</span></div>
        <el-select v-model="PhotoInfo.type" style="width: 200px;" placeholder="选择画作类型">
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
        <el-tag class="m-[4px]" v-for="(tag,index) in PhotoInfo.tag" :key="index" closable @close="DeleteTag(index)"
          :style="{ backgroundColor: tag.color }" effect="dark">{{ tag.text }}</el-tag>
      </div>
  
      <div class="mt-5 flex flex-row justify-end">
        <el-button class="!ml-2" type="primary" @click="AddPhotoInfo(PhotoInfo)"
          :disabled="!(PhotoInfo.name && PhotoInfo.author && PhotoInfo.type)">保存</el-button>
        <el-button class="!ml-2" type="" @click="showAddPictrueSetting = false,cancelUpload()">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watchEffect, reactive, onMounted, onUpdated, watch, onActivated, toRaw } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { DownPicture } from '@icon-park/vue-next'
import { ElMessage, ElDatePicker } from 'element-plus'
import _ from 'lodash'

const uploadRef = ref(null)
const route = useRoute()
const router = useRouter()

const input1 = ref('')
const input2 = ref('')
const name = ref('')

const image = ref([])
//获取全部图片
const getAllImages = async () => {
  const fileName = name.value
  console.log("fileName:", fileName)
  const response = await window.api['读取全部图片']({ fileName })
  image.value = response.data.draws
  console.log(response.data.draws)
}
//监测路由变化更新图片
onActivated(() => {
  getAllImages()
})

//图片悬浮框相关
const isEnterPicture = ref([])
const EnterPicture = (index) => {
  isEnterPicture.value[index] = true
}
const LeavePicture = (index) => {
  isEnterPicture.value[index] = false
}

const disabledHover = ref(true)
const handleRemove = () => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles() // 取消上传
  }
  imageUrl.value = ''
  ElMessage.error('图片已从上传队列移除')
}

//监控路由变化，改变name的值
watchEffect(() => {
  name.value = route.query.name
})

//路由跳转
const item = ref('')
const goToPage = (path, { name, item }) => {
  const itemInfo = toRaw(item)
  console.log(itemInfo)
  console.log("name:", { name, itemInfo })
  router.push({ path, query: { name,item:JSON.stringify(itemInfo) } })
}

//设置相关
const showForm = ref(false)
const clickSetting = (name) => {
  showForm.value = true
  input1.value = name
}
//添加图片设置
const showAddPictrueSetting = ref(false)

const PhotoInfo = ref({
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
    value: '插画'
  },
  {
    label: '立绘',
    value: '立绘'
  },
  {
    label: '头像',
    value: '头像'
  },
  {
    label: 'Q版',
    value: 'Q版'
  },
]
//添加标签
const tagStore = ref('')
const AddTag = () => {
  if (!PhotoInfo.value.tag.some(tag => tag.text === tagStore.value) && tagStore.value) {
    PhotoInfo.value.tag.push({
      text: tagStore.value,
      color: randomColor(),
    })
  } else if (PhotoInfo.value.tag.some(tag => tag.text === tagStore.value)) {
    ElMessage.error('标签已存在')
  }
  else {
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
const saveSetting = () => {
  showForm.value = false
}

const beforeRemove = (file, uploadFiles) => {
  console.log("beforeRemove:", file, uploadFiles)
}
//上传图片时把图片作为封面
const handleChange = (file, fileList) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}
//清空输入框
const ClearInputBox = () => {
  imageUrl.value = ''
  PhotoInfo.value.cover = ''
  PhotoInfo.value.name = ''
  PhotoInfo.value.desc = ''
  PhotoInfo.value.author = ''
  PhotoInfo.value.type = ''
  PhotoInfo.value.startTime = ''
  PhotoInfo.value.endTime = ''
  tagStore.value = ''
  PhotoInfo.value.tag = []
}
//取消上传
const cancelUpload = () => {
  ClearInputBox()
  if (uploadRef.value) {
    uploadRef.value.clearFiles() // 取消上传
  }
}
//添加图片信息，手动上传图片
const AddPhotoInfo = (PhotoInfo) => {
  const info = toRaw(PhotoInfo)
  if (_.isEmpty(info)) {
    ElMessage.error('请填写完整信息')
    return
  }
  uploadRef.value.submit()
  showAddPictrueSetting.value = false

  console.log(PhotoInfo)
}
//上传图片
/**
 * 第一步：通过前端获取文件路径，再通过nodejs获取要上传到的文件夹的路径，使用move-file库移动文件 [√]
 * 第二步：nodejs添加图片信息到对应json里 [x]
 * @param file 上传的图片文件
 */
const uploadFile = async (file) => {
  const filepath = file.file.path
  const filename = file.file.name
  const folderName = name.value
  // console.log(file)
  //上传图片到指定文件夹
  const response1 = { path: filepath, name: filename, folderName }
  const res = await window.api['上传图片到指定文件夹'](response1)
  console.log("res:", res.path)
  // console.log("res:", res)

  //将图片信息写入json
  const safePhotoInfo = toRaw(PhotoInfo.value)
  safePhotoInfo.cover = res.path
  const fileInfo = { folderName, PhotoInfo: safePhotoInfo }
  console.log("fileInfo", fileInfo)
  const jsonResponse = await window.api['将图片信息写入json'](fileInfo)
  console.log(jsonResponse)
}
const handleSuccess = () => {
  ElMessage.success('文件上传成功')
  ClearInputBox()
  getAllImages()
  imageUrl.value = ''
  router.go(0)
  // cancelUpload()
}

const handleError = () => {
  ElMessage.error('文件上传失败')
}

const beforeUpload = (rawfile) => {
  if (rawfile.type !== 'image/jpeg' && rawfile.type !== 'image/png') {
    ElMessage.error('图片必须是jpeg格式或者png格式')
    return false
  }
}

//删除图片
const deletePhoto = (index) => {
  console.log("删除图片", index)
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
  border: none
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
</style>