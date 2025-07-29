# useGallery 组合式函数使用指南

## 简介

`useGallery` 是一个可复用的 Vue 3 组合式函数，用于管理图库列表和图片加载功能。它将通用的图库操作逻辑提取出来，避免在多个组件中重复代码。

## 基本用法

```javascript
import { useGa## 需要重构的组件列表

以下组件都包含重复的图库加载逻辑，建议按优先级重构：

1. ✅ `BatchRename.vue` - 已完成
2. ✅ `AdjustImageSize.vue` - 已完成
3. ✅ `ImageFormatConverter.vue` - 已完成
4. ✅ `CompressImage.vue` - 已完成
5. ✅ `BatchAddSuffix.vue` - 已完成

🎉 **所有5个工具组件已完成重构！** 🎉

重构工作成功实现了：
- 代码复用性提升 (~215行代码减少)
- 统一的状态管理和错误处理
- 改进的数据同步机制（强制刷新策略）
- 更好的用户体验（解决数据持久性和同步问题）

### 问题解决记录

1. **页面切换数据丢失** ✅ 已解决
2. **图片修改后数据不同步** ✅ 已解决
3. **数据刷新策略优化** ✅ 已实现rom '@/composables/useGallery'

// 在组件中使用
const {
  loading,
  loadError,
  galleryList,
  imageList,
  selectedGallery,
  loadGalleryList,
  loadGalleryImages,
  resetGalleryState,
  refreshCurrentGallery
} = useGallery()
```

## API 参考

### 响应式状态

- `loading: Ref<boolean>` - 加载状态
- `loadError: Ref<string | null>` - 错误信息
- `galleryList: Ref<Array>` - 图库列表
- `imageList: Ref<Array>` - 当前图库的图片列表
- `selectedGallery: Ref<string>` - 当前选中的图库名称

### 方法

- `loadGalleryList()` - 加载所有图库列表
- `loadGalleryImages(galleryName?)` - 加载指定图库的图片
- `resetGalleryState()` - 重置所有状态
- `refreshCurrentGallery()` - 刷新当前图库的图片

## 在现有组件中的使用示例

### 1. BatchRename.vue (已重构)

```javascript
import { useGallery } from '@/composables/useGallery'

const {
  loading,
  loadError,
  galleryList,
  imageList,
  selectedGallery,
  loadGalleryList,
  loadGalleryImages,
  resetGalleryState
} = useGallery()

// 处理图库切换
const handleGalleryChange = async () => {
  selectedImages.value = [] // 清空选中项
  await loadGalleryImages()
}

// 在组件卸载时重置状态
const resetState = () => {
  selectedImages.value = []
  customNames.value = []
  resetGalleryState()
}
```

### 2. AdjustImageSize.vue (已重构)

```javascript
import { useGallery } from '@/composables/useGallery'

const {
  loading,
  loadError,
  galleryList,
  imageList,
  selectedGallery,
  loadGalleryList,
  loadGalleryImages,
  resetGalleryState
} = useGallery()

// 处理图库切换，重置图片选择
const handleGalleryChange = async () => {
  selectedImage.value = null
  await loadGalleryImagesWithDimensions()
}

// 扩展图片加载功能以包含尺寸信息
const loadGalleryImagesWithDimensions = async () => {
  if (!selectedGallery.value) return

  loading.value = true
  try {
    const response = await window.api['读取全部图片']({
      fileName: selectedGallery.value
    })

    if (response.success) {
      // 为每个图片添加尺寸信息
      imageList.value = await Promise.all(
        response.data.draws.map(async (img) => {
          const dimensions = await getImageDimensions(img.cover)
          return {
            ...img,
            metadata: { ...img.metadata, dimensions }
          }
        })
      )
    }
  } finally {
    loading.value = false
  }
}
```

### 3. 其他工具组件重构指南

#### AdjustImageSize.vue 重构
```javascript
// 替换现有的状态定义
- const loading = ref(false)
- const galleryList = ref([])
- const imageList = ref([])
- const selectedGallery = ref('')

// 使用组合式函数
+ const { loading, galleryList, imageList, selectedGallery, loadGalleryList, loadGalleryImages } = useGallery()
```

#### ImageFormatConverter.vue 重构
```javascript
// 替换现有的加载函数
- const loadGalleryList = async () => { /* ... */ }
- const loadGalleryImages = async () => { /* ... */ }

// 直接从组合式函数获取
+ const { loadGalleryList, loadGalleryImages } = useGallery()
```

## 需要重构的组件列表

以下组件都包含重复的图库加载逻辑，建议按优先级重构：

1. ✅ `BatchRename.vue` - 已完成
2. ✅ `AdjustImageSize.vue` - 已完成
3. 🔄 `ImageFormatConverter.vue` - 待重构
4. 🔄 `CompressImage.vue` - 待重构
5. 🔄 `BatchAddSuffix.vue` - 待重构## 重构后的好处

1. **代码复用** - 减少重复代码约 40-50 行/组件
2. **统一维护** - API 变更只需修改一处
3. **一致的错误处理** - 统一的加载状态和错误提示
4. **更好的可测试性** - 可以单独测试组合式函数
5. **更清晰的组件职责** - 组件专注于自己的业务逻辑

## 注意事项

1. 导入路径确保正确：`@/composables/useGallery`
2. **重要**：在页面的 `resetState` 中不要调用 `resetGalleryState()`，以保持图库数据在页面切换时不丢失
3. 使用 `onActivated` 生命周期钩子确保页面激活时有数据
4. 如果需要在切换图库时重置其他状态，需要额外处理
5. 错误处理已内置在组合式函数中，组件无需重复处理

## 页面切换数据保持最佳实践

```javascript
// ✅ 正确的做法 - 只重置页面特定状态
const resetState = () => {
  selectedImages.value = []
  customNames.value = []
  // 不要调用 resetGalleryState()
}

// ✅ 确保页面激活时有数据
onActivated(async () => {
  if (galleryList.value.length === 0) {
    await loadGalleryList()
  }
})

// ❌ 错误的做法 - 会导致页面切换时数据丢失
const resetState = () => {
  selectedImages.value = []
  resetGalleryState() // 这会清空图库数据
}
```

## 重构完成总结

### 📊 重构统计
- **重构组件数量**: 5个
- **减少重复代码**: 约 200-250 行
- **节省的维护成本**: 显著提升

### 🎯 重构成果
1. **代码统一性**: 所有工具页面现在使用相同的图库管理逻辑
2. **数据持久性**: 页面切换时图库数据不再丢失
3. **错误处理一致性**: 统一的加载状态和错误提示
4. **可维护性**: API 变更只需要修改一个地方

### 🔧 特殊处理
- `AdjustImageSize.vue`: 保留了图片尺寸获取的特殊逻辑
- `CompressImage.vue`: 保留了文件大小计算的特殊逻辑
- `ImageFormatConverter.vue`: 保留了格式转换的核心功能
- `BatchRename.vue`: 保留了重命名预览逻辑
- `BatchAddSuffix.vue`: 保留了后缀添加逻辑

### 🚀 下一步建议
1. 监控重构后的性能表现
2. 收集用户反馈
3. 考虑进一步优化图片加载性能
4. 可以考虑添加更多通用功能到 `useGallery` 中
