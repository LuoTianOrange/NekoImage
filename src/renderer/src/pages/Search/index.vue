<template>
  <div class="flex flex-col w-screen min-h-[calc(100vh-35px)]">
    <div class="p-[20px]">
      <div class="text-[20px]">图片搜索</div>
      <div class="my-5 flex items-center">
        <el-input
          v-model="searchKeyword"
          placeholder="输入图片名称关键词"
          clearable
          @keyup.enter="handleSearch"
          style="width: 400px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button
          type="primary"
          class="ml-3"
          @click="handleSearch"
          :loading="isLoading"
        >
          搜索
        </el-button>
        <el-button type="warning" @click="ClearSearchResults">清除搜索结果</el-button>
      </div>

      <!-- 搜索结果展示 -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <el-icon class="animate-spin" :size="30"><Loading /></el-icon>
      </div>

      <div v-else>
        <div v-if="searchResults.length > 0" class="mt-4">
          <div class="text-gray-500 mb-4">
            共找到 {{ searchResults.length }} 个结果
            <span v-if="searchKeyword"> - 关键词: "{{ searchKeyword }}"</span>
          </div>

          <!-- 添加表格容器 -->
          <div class="table-container">
            <el-table
              :data="searchResults"
              style="width: 100%"
              height="100%"
            >
              <el-table-column label="图片" width="180">
                <template #default="{ row }">
                  <div
                    class="image-container"
                    @click.stop="goToPhotoInfo(row)"
                  >
                    <el-image
                      :src="getImageUrl(row.cover)"
                      fit="cover"
                      style="width: 160px; height: 120px; background: #f5f5f5; cursor: pointer"
                      hide-on-click-modal
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>加载失败</span>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="图片名称" />
              <el-table-column prop="galleryName" label="所属图库" width="150" />
              <el-table-column label="创建时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.createTime) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <el-empty
          v-else-if="hasSearched"
          description="没有找到匹配的图片"
          :image-size="200"
        >
          <template #image>
            <el-icon :size="50"><Picture /></el-icon>
          </template>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Picture, Loading } from '@element-plus/icons-vue'

const router = useRouter()
const searchKeyword = ref('')
const searchResults = ref([])
const hasSearched = ref(false)
const isLoading = ref(false)

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  isLoading.value = true
  searchResults.value = []

  try {
    const { success, data, error } = await window.api['关键词搜索图片']({
      keyword: searchKeyword.value
    })

    if (success) {
      searchResults.value = data
      hasSearched.value = true
    } else {
      throw new Error(error || '搜索失败')
    }
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    isLoading.value = false
  }
}

// 跳转到图片详情页
const goToPhotoInfo = (item) => {
  router.push({
    path: '/photoInfo',
    query: {
      name: item.galleryName,
      item: JSON.stringify(item)
    }
  })
}

// 直接使用原图URL
const getImageUrl = (path) => {
  if (path.startsWith('http')) {
    return path
  }
  return `file://${path}`
}

// 日期格式化
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const ClearSearchResults = () => {
  searchResults.value = []
  searchKeyword.value = ''
  hasSearched.value = false
}
</script>

<style scoped>
/* 新增表格容器样式 */
.table-container {
  height: calc(100vh - 230px); /* 根据实际布局调整 */
  overflow: hidden;
  position: relative;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

/* 确保表格填满容器 */
:deep(.el-table) {
  height: 100% !important;
}

/* 表格内容区域滚动 */
:deep(.el-table__body-wrapper) {
  overflow-y: auto !important;
  max-height: calc(100% - 40px); /* 减去表头高度 */
}

/* 固定表头 */
:deep(.el-table__header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
}

/* 原有样式保持不变 */
.image-container {
  display: inline-block;
  cursor: pointer;
}

.image-container:hover {
  opacity: 0.8;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
}
</style>
