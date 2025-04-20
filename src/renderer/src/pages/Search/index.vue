<template>
  <div class="flex flex-col w-full min-h-screen">
    <div class="p-[20px]">
      <div class="text-[20px]">搜索</div>
      <div class="my-5 flex items-center">
        <!-- 下拉选择器 -->
        <el-select
          v-model="searchType"
          style="width: 120px"
          placeholder="选择类型"
          class="mr-3"
        >
          <el-option
            v-for="item in searchOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <!-- 搜索输入框 -->
        <el-input
          v-model="searchKeyword"
          style="width: 300px"
          :placeholder="getPlaceholder(searchType)"
          clearable
          show-word-limit
          :maxlength="searchType === 'name' ? 10 : 20"
        ></el-input>

        <el-button class="ml-3" type="primary" @click="handleSearch">
          搜索
        </el-button>
        <el-button class="ml-3" type="warning" @click="clearSearchResults">
          清除搜索结果
        </el-button>
      </div>

      <!-- 搜索结果展示区域 -->
      <div class="flex flex-wrap items-start w-full">
        <div v-if="searchResults.length > 0" class="w-full">
          <div class="text-gray-500 mb-2">共找到 {{ searchResults.length }} 条结果</div>
          <el-table :data="searchResults" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="description" label="描述" />
          </el-table>
        </div>
        <div v-else-if="hasSearched" class="text-gray-500">
          没有找到匹配的结果
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 搜索类型选项
const searchOptions = ref([
  { value: 'name', label: '按名称' },
  { value: 'tag', label: '按标签' },
  { value: 'date', label: '按日期' },
  { value: 'size', label: '按描述' }
])

// 搜索相关数据
const searchType = ref('name') // 默认按名称搜索
const searchKeyword = ref('')
const searchResults = ref([])
const hasSearched = ref(false)

// 根据搜索类型获取不同的placeholder
const getPlaceholder = (type) => {
  const placeholders = {
    name: '请输入名称',
    tag: '请输入标签，多个标签用逗号分隔',
    date: '请输入日期范围，如：2023-01-01~2023-12-31',
    size: '请输入大小范围，如：1MB~5MB'
  }
  return placeholders[type] || '请输入搜索内容'
}

// 搜索处理函数
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  // 模拟搜索请求 - 实际项目中替换为API调用
  hasSearched.value = true
  searchResults.value = [
    { name: '示例结果1', type: searchType.value, description: '这是第一个搜索结果' },
    { name: '示例结果2', type: searchType.value, description: '这是第二个搜索结果' }
  ]

  ElMessage.success('搜索完成')
}

const clearSearchResults = () => {
  searchResults.value = []
  hasSearched.value = false
  searchKeyword.value = ''
}
</script>

<style scoped>
/* 可以添加自定义样式 */
.el-select {
  margin-right: 12px;
}

.search-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.results-count {
  color: #909399;
  margin-bottom: 10px;
}
</style>
