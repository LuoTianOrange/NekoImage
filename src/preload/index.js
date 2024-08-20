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
