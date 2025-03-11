import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  '添加图库': (data) => ipcRenderer.send('添加图库', data),
  '读取全部图库': async (data) => {
    const result = await ipcRenderer.invoke('读取全部图库', data)
    return result
  },
  '删除指定图库': async (data) => {
    const result = await ipcRenderer.invoke('删除指定图库', data)
    return result
  },
  '上传图片到指定文件夹': async ({ path, name, folderName }) => {
    const result = await ipcRenderer.invoke('上传图片到指定文件夹', { path, name, folderName });
    console.log(result);
    return result;
  },
  '将图片信息写入json': async ({ folderName, PhotoInfo }) => {
    const result = await ipcRenderer.invoke('将图片信息写入json', { folderName, PhotoInfo });
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
  }
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
