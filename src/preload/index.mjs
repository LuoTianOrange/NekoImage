import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 自定义API
const api = {

  // 图库相关
  '添加图库': async (arg) => await ipcRenderer.invoke('添加图库', arg),
  '读取全部图库': async (data) => await ipcRenderer.invoke('读取全部图库', data),
  '删除指定图库': async (data) => await ipcRenderer.invoke('删除指定图库', data),
  '上传图片到指定文件夹': async ({ files, folderName }) => await ipcRenderer.invoke('上传图片到指定文件夹', { files, folderName }),
  '将图片信息写入json': async ({ folderName, photos }) => await ipcRenderer.invoke('将图片信息写入json', { folderName, photos }),
  '读取全部图片': async (data) => await ipcRenderer.invoke('读取全部图片', data),
  '读取图库路径': async (data) => await ipcRenderer.invoke('读取图库路径', data),
  '设置图库路径': async (newPath) => await ipcRenderer.invoke('设置图库路径', newPath),
  '修改图库路径': async (newPath) => await ipcRenderer.invoke('修改图库路径', newPath),
  '打开资源管理器选择路径': async () => await ipcRenderer.invoke('打开资源管理器选择路径'),
  '删除图库图片': async ({ folderName, pid }) => await ipcRenderer.invoke('删除图库图片', { folderName, pid }),

  // 图片处理
  '读取EXIF信息': async (imagePath) => await ipcRenderer.invoke('读取EXIF信息', imagePath),
  '获取图片大小': async (imagePath) => await ipcRenderer.invoke('获取图片大小', imagePath),
  '打开图库根目录': async () => await ipcRenderer.invoke('打开图库根目录'),
  '读取图库信息': async (galleryName) => await ipcRenderer.invoke('读取图库信息', galleryName),
  '获取排序后的图片': async (galleryName) => await ipcRenderer.invoke('获取排序后的图片', galleryName),
  '调整图片大小': async ({ imagePath, width, height, galleryName }) => await ipcRenderer.invoke('调整图片大小', { imagePath, width, height, galleryName }),
  '按比例调整图片大小': async ({ imagePath, percentage, galleryName }) => await ipcRenderer.invoke('按比例调整图片大小', { imagePath, percentage, galleryName }),

  // 收藏功能
  '添加收藏': async ({ galleryName, pid }) => await ipcRenderer.invoke('添加收藏', { galleryName, pid }),
  '移除收藏': async ({ galleryName, pid }) => await ipcRenderer.invoke('移除收藏', { galleryName, pid }),
  '获取收藏列表': async (galleryName) => await ipcRenderer.invoke('获取收藏列表', galleryName),

  // 其他功能
  '转换图片格式': async ({ imagePath, galleryName, options }) => await ipcRenderer.invoke('转换图片格式', { imagePath, galleryName, options }),
  '压缩图片': async ({ imagePath, galleryName, options }) => await ipcRenderer.invoke('压缩图片', { imagePath, galleryName, options }),
  '打开图片所在文件夹': async (imagePath) => await ipcRenderer.invoke('打开图片所在文件夹', imagePath),
  '获取图片尺寸': async (imagePath) => await ipcRenderer.invoke('获取图片尺寸', imagePath),
  '批量重命名': async (args) => await ipcRenderer.invoke('批量重命名', args),
  '压缩导出': async ({ images, zipName }) => await ipcRenderer.invoke('压缩导出', { images, zipName }),
  '获取文件路径': async (filePath) => await ipcRenderer.invoke('获取文件路径', filePath),
  '改变主题': async (theme) => await ipcRenderer.invoke('改变主题', theme),
  '读取应用版本': async (data) => await ipcRenderer.invoke('读取应用版本', data),
  '读取文件信息': async (filePath) => await ipcRenderer.invoke('读取文件信息', filePath),
  '修改图库信息': async ({ galleryName, updates }) => await ipcRenderer.invoke('修改图库信息', { galleryName, updates }),
  '关键词搜索图片': async ({ keyword }) => await ipcRenderer.invoke('关键词搜索图片', { keyword })
}

// 暴露API到渲染进程
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
