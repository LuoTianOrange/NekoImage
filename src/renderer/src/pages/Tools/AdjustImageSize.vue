<template>
  <div class="p-[20px]">
    <div class="text-[20px]">调整图片尺寸</div>
    <div class="flex flex-row mt-5">
      <!-- 左侧：图库和图片选择 -->
      <div class="w-[300px] border-r pr-5">
        <!-- 图库选择 -->
        <el-select
          v-model="selectedGallery"
          placeholder="选择图库"
          class="w-full"
          @change="loadGalleryImages"
        >
          <el-option
            v-for="gallery in galleryList"
            :key="gallery.name"
            :label="gallery.name"
            :value="gallery.name"
          />
        </el-select>

        <!-- 图片列表 -->
        <div class="mt-5">
          <div
            v-for="(image, index) in imageList"
            :key="index"
            class="flex items-center p-2 cursor-pointer hover:bg-gray-100"
            :class="{ 'bg-blue-100': selectedImage === image }"
            @click="selectImage(image)"
          >
            <img :src="image.cover" class="w-[50px] h-[50px] object-cover" />
            <div class="ml-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] inline-block">{{ image.name }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧：调整尺寸 -->
      <div class="flex-1 pl-5">
        <div v-if="selectedImage" class="flex flex-col">
          <!-- 当前图片预览 -->
          <div class="text-lg mb-3">当前图片：{{ selectedImage.name }}</div>
          <img :src="selectedImage.cover" class="w-[200px] h-auto" />

          <!-- 自定义尺寸 -->
          <div class="mt-5">
            <div class="text-lg mb-3">自定义尺寸</div>
            <el-form :model="resizeForm" label-width="80px">
              <el-form-item label="宽度">
                <el-input v-model.number="resizeForm.width" placeholder="请输入宽度" />
              </el-form-item>
              <el-form-item label="高度">
                <el-input v-model.number="resizeForm.height" placeholder="请输入高度" />
              </el-form-item>
            </el-form>
            <el-button type="primary" @click="resizeImage">调整尺寸</el-button>
          </div>

          <!-- 预设比例 -->
          <div class="mt-5">
            <div class="text-lg mb-3">预设比例</div>
            <el-button type="primary" @click="resizeImageByPercentage(0.75)">75%</el-button>
            <el-button type="primary" @click="resizeImageByPercentage(0.5)">50%</el-button>
            <el-button type="primary" @click="resizeImageByPercentage(0.25)">25%</el-button>
          </div>
        </div>
        <div v-else class="text-gray-500">请选择一张图片</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';

// 图库列表
const galleryList = ref([]);
// 当前选中的图库
const selectedGallery = ref('');
// 图片列表
const imageList = ref([]);
// 当前选中的图片
const selectedImage = ref(null);

// 调整尺寸表单
const resizeForm = reactive({
  width: null,
  height: null,
});

// 加载图库列表
const loadGalleryList = async () => {
  const response = await window.api['读取全部图库']();
  if (response.success) {
    galleryList.value = response.data;
  } else {
    ElMessage.error('加载图库列表失败: ' + response.message);
  }
};

// 加载图库中的图片
const loadGalleryImages = async () => {
  if (!selectedGallery.value) return;

  const response = await window.api['读取全部图片']({ fileName: selectedGallery.value });
  if (response.success) {
    imageList.value = response.data.draws;
  } else {
    ElMessage.error('加载图片列表失败: ' + response.message);
  }
};

// 选择图片
const selectImage = (image) => {
  selectedImage.value = image;
};

// 调整图片尺寸
const resizeImage = async () => {
  if (!selectedImage.value) {
    ElMessage.error('请选择一张图片');
    return;
  }

  if (!resizeForm.width || !resizeForm.height) {
    ElMessage.error('请输入宽度和高度');
    return;
  }

  try {
    const response = await window.api['调整图片大小']({
      imagePath: selectedImage.value.cover,
      width: resizeForm.width,
      height: resizeForm.height,
      galleryName: selectedGallery.value, // 传递图库名称
    });

    if (response.success) {
      ElMessage.success('图片调整尺寸成功');
      loadGalleryImages(); // 刷新图片列表
    } else {
      ElMessage.error('图片调整尺寸失败: ' + response.message);
    }
  } catch (error) {
    console.error('调整图片尺寸失败:', error);
    ElMessage.error('调整图片尺寸失败: ' + error.message);
  }
};

// 按比例调整图片尺寸
const resizeImageByPercentage = async (percentage) => {
  if (!selectedImage.value) {
    ElMessage.error('请选择一张图片');
    return;
  }

  try {
    const response = await window.api['按比例调整图片大小']({
      imagePath: selectedImage.value.cover,
      percentage,
      galleryName: selectedGallery.value, // 传递图库名称
    });

    if (response.success) {
      ElMessage.success('图片调整尺寸成功');
      loadGalleryImages(); // 刷新图片列表
    } else {
      ElMessage.error('图片调整尺寸失败: ' + response.message);
    }
  } catch (error) {
    console.error('调整图片尺寸失败:', error);
    ElMessage.error('调整图片尺寸失败: ' + error.message);
  }
};

// 初始化加载图库列表
onMounted(() => {
  loadGalleryList();
});
</script>

<style scoped>
</style>
