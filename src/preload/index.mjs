import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  '添加图库': async (arg) => {
    const result = await ipcRenderer.invoke('添加图库', arg)
    return result
  },
  '读取全部图库': async (data) => {
    const result = await ipcRenderer.invoke('读取全部图库', data)
    return result
  },
  '删除指定图库': async (data) => {
    const result = await ipcRenderer.invoke('删除指定图库', data)
    return result
  },
  '上传图片到指定文件夹': async ({ files, folderName }) => {
    const result = await ipcRenderer.invoke('上传图片到指定文件夹', { files, folderName });
    console.log(result);
    return result;
  },
  '将图片信息写入json': async ({ folderName, photos }) => {
    const result = await ipcRenderer.invoke('将图片信息写入json', { folderName, photos });
    return result;
  },
  '读取全部图片': async (data) => {
    const result = await ipcRenderer.invoke('读取全部图片', data);
    return result;
  },
  '读取图库路径': async (data) => {
    const result = await ipcRenderer.invoke('读取图库路径', data);
    return result;
  },
  '设置图库路径': async (newPath) => {
    const result = await ipcRenderer.invoke('设置图库路径', newPath);
    return result;
  },
  '读取应用版本': async (data) => {
    const result = await ipcRenderer.invoke('读取应用版本', data);
    return result;
  },
  '读取文件信息': async (filePath) => {
    const result = await ipcRenderer.invoke('读取文件信息', filePath);
    return result;
  },
  修改图库路径: async (newPath) => {
    const result = await ipcRenderer.invoke('修改图库路径', newPath)
    return result
  },
  打开资源管理器选择路径: async () => {
    const result = await ipcRenderer.invoke('打开资源管理器选择路径')
    return result
  },
  '删除图库图片': async ({ folderName, pid }) => {
    const result = await ipcRenderer.invoke('删除图库图片', { folderName, pid })
    return result
  },
  '读取EXIF信息': async (imagePath) => {
    const result = await ipcRenderer.invoke('读取EXIF信息', imagePath)
    return result
  },
  '获取图片大小': async (imagePath) => {
    const result = await ipcRenderer.invoke('获取图片大小', imagePath)
    return result
  },
  '打开图库根目录': async () => {
    const result = await ipcRenderer.invoke('打开图库根目录')
    return result
  },
  '读取图库信息': async (galleryName) => {
    const result = await ipcRenderer.invoke('读取图库信息', galleryName)
    return result
  },
  '获取排序后的图片': async (galleryName) => {
    const result = await ipcRenderer.invoke('获取排序后的图片', galleryName)
    return result
  },
  '调整图片大小': async ({ imagePath, width, height, galleryName }) => {
    const result = await ipcRenderer.invoke('调整图片大小', { imagePath, width, height, galleryName })
    return result
  },
  '按比例调整图片大小': async ({ imagePath, percentage, galleryName }) => {
    const result = await ipcRenderer.invoke('按比例调整图片大小', { imagePath, percentage, galleryName })
    return result
  },
  '修改图库信息': async ({ galleryName, updates }) => {
    const result = await ipcRenderer.invoke('修改图库信息', { galleryName, updates })
    return result
  },
  '添加收藏': async ({ galleryName, pid }) => {
    const result = await ipcRenderer.invoke('添加收藏', { galleryName, pid })
    return result
  },
  '移除收藏': async ({ galleryName, pid }) => {
    const result = await ipcRenderer.invoke('移除收藏', { galleryName, pid })
    return result
  },
  '获取收藏列表': async (galleryName) => {
    const result = await ipcRenderer.invoke('获取收藏列表', galleryName)
    return result
  },

}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
