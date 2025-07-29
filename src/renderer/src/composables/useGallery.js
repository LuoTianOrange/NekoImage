import { ref } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 图库管理相关的组合式函数
 * 提供图库列表和图片加载的通用功能
 */
export function useGallery() {
  // 响应式状态
  const loading = ref(false)
  const loadError = ref(null)
  const galleryList = ref([])
  const imageList = ref([])
  const selectedGallery = ref('')

  /**
   * 加载图库列表
   * @returns {Promise<void>}
   */
  const loadGalleryList = async () => {
    loading.value = true
    loadError.value = null
    try {
      const response = await window.api['读取全部图库']()
      console.log('图库响应:', response) // 调试日志

      if (response.success) {
        galleryList.value = response.data
        console.log('加载的图库列表:', galleryList.value) // 调试日志
      } else {
        throw new Error(response.message || '未知错误')
      }
    } catch (error) {
      console.error('加载图库出错:', error)
      loadError.value = `加载图库失败: ${error.message}`
      ElMessage.error(`加载图库失败: ${error.message}`)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载指定图库的图片
   * @param {string} galleryName - 图库名称，如果不传则使用 selectedGallery.value
   * @returns {Promise<void>}
   */
  const loadGalleryImages = async (galleryName = null) => {
    const targetGallery = galleryName || selectedGallery.value
    if (!targetGallery) return

    loading.value = true
    try {
      const response = await window.api['读取全部图片']({
        fileName: targetGallery
      })

      if (response.success) {
        imageList.value = response.data.draws || []
      } else {
        throw new Error(response.message || '加载图片失败')
      }
    } catch (error) {
      console.error('加载图片出错:', error)
      loadError.value = `加载图片失败: ${error.message}`
      ElMessage.error(`加载图片失败: ${error.message}`)
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置状态
   */
  const resetGalleryState = () => {
    loading.value = false
    loadError.value = null
    galleryList.value = []
    imageList.value = []
    selectedGallery.value = ''
  }

  /**
   * 只重置图片数据，保留图库列表
   */
  const resetImageState = () => {
    imageList.value = []
    selectedGallery.value = ''
  }

  /**
   * 刷新当前图库的图片
   */
  const refreshCurrentGallery = async () => {
    if (selectedGallery.value) {
      await loadGalleryImages()
    }
  }

  /**
   * 强制刷新当前图库的图片（重新加载）
   */
  const forceRefreshCurrentGallery = async () => {
    if (selectedGallery.value) {
      imageList.value = [] // 先清空当前图片列表
      await loadGalleryImages()
    }
  }

  return {
    // 响应式状态
    loading,
    loadError,
    galleryList,
    imageList,
    selectedGallery,

    // 方法
    loadGalleryList,
    loadGalleryImages,
    resetGalleryState,
    resetImageState,
    refreshCurrentGallery,
    forceRefreshCurrentGallery
  }
}
