import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// const trash = require('trash')
// const fs = require('fs')
// const path = require('node:path')
import trash from 'trash'
import fs from 'fs'
import path from 'path'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('添加图库', (event, arg) => {
    const appPath = app.getAppPath()
    let newArg = JSON.parse(arg)
    const filePath = path.join(appPath, `./resources/json/${newArg.name}.json`)
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err && err.code === 'ENOENT') {
        // 文件不存在，创建新文件
        fs.writeFile(filePath, JSON.stringify(newArg, null, 2), (err) => {
          if (err) {
            event.reply('添加图库响应', { success: false, message: '无法写入文件', error: err })
          } else {
            event.reply('添加图库响应', { success: true, message: '成功添加图库' })
          }
        })
      } else if (err) {
        // 其他错误
        event.reply('添加图库响应', { success: false, message: '无法读取文件', error: err })
      } else {
        // 文件存在，不允许添加图库
        event.reply('添加图库响应', { success: false, message: '图库已经存在' })
      }
    })
  })
  ipcMain.handle('读取全部图库', async (event, arg) => {
    const appPath = app.getAppPath()
    const dirPath = path.join(appPath, `/resources/json`)

    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          reject({ success: false, message: '无法读取文件夹', error: err });
        } else {
          let jsonsData = [];
          files.forEach((file) => {
            if (path.extname(file) === '.json') {
              const filePath = path.join(dirPath, file);
              const data = fs.readFileSync(filePath, 'utf-8');
              try {
                const json = JSON.parse(data);
                jsonsData.push(json);
              } catch (err) {
                console.log(`无法解析文件 ${file} 的 JSON 数据`, err);
              }
            }
          });
          resolve({ success: true, message: '成功读取全部图库', data: jsonsData });
        }
      });
    });
  })
  ipcMain.handle('读取指定图库',(event,arg)=>{
    
  })
  ipcMain.handle('删除指定图库',async(event,arg)=>{
    const appPath = app.getAppPath()
    const filePath = path.join(appPath, `/resources/json/${arg}.json`)
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject({ success: false, message: '无法删除文件', error: err });
        } else {
          resolve({ success: true, message: '成功删除图库' });
        }
      });
    });
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
