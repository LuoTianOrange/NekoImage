import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import { to } from 'await-to-js'
import fsPromises from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'
import Store from 'electron-store'

// 初始化配置存储
const store = new Store()

// 路径构建工具函数
const pathUtil = {
  gallery: (name) => path.join(getStorageRoot(), 'Galleries', name),
  meta: (name) => path.join(getStorageRoot(), 'Galleries', name, 'data.json'),
  images: (name) => path.join(getStorageRoot(), 'Galleries', name, 'images')
}

// 获取存储路径
const getStoragePath = () => {
  const customPath = store.get('storagePath')
  const defaultPath = path.join(app.getPath('documents'), 'ElectronGalleryData')
  const storagePath = customPath || defaultPath

  // 确保路径存在
  if (!fs.existsSync(storagePath)) {
    try {
      fs.mkdirSync(storagePath, { recursive: true })
      console.log(`目录已创建: ${storagePath}`)
    } catch (err) {
      console.error(`无法创建目录: ${storagePath}`, err)
    }
  }

  return storagePath
}

// 设置存储路径
const setStoragePath = (newPath) => {
  store.set('storagePath', newPath)
}

// 路径验证函数
const validatePath = (targetPath) => {
  if (!fs.existsSync(path.dirname(targetPath))) {
    throw new Error('父目录不存在')
  }
  if (targetPath.includes('..')) {
    throw new Error('非法路径')
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 700,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    icon: path.join(__dirname, '../../resources/icons/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: false
    }
    // resizable: false //禁止改变主窗口尺寸
  })
  //打开调试工具
  mainWindow.webContents.openDevTools()

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

  const storagePath = getStoragePath()
  console.log(`当前图库路径: ${storagePath}`)

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  /**
   * 应用路径，开发环境和生产环境使用不同的路径
   * @appPath
   */
  const appPath =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? app.getAppPath()
      : path.dirname(app.getPath('exe'))

  ipcMain.on('添加图库', (event, arg) => {
    let newArg = JSON.parse(arg)
    const storagePath = getStoragePath() // 使用 getStoragePath 获取图库路径
    const filePath = path.join(storagePath, 'Galleries', `${newArg.name}.json`) // 图库元数据文件路径
    const dirPath = path.join(storagePath, 'Galleries', newArg.name) // 图库图片目录路径
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err && err.code === 'ENOENT') {
        // 文件不存在，创建新文件
        fs.writeFile(filePath, JSON.stringify(newArg, null, 2), (err) => {
          if (err) {
            event.reply('添加图库响应', { success: false, message: '无法写入文件', error: err })
          } else {
            fs.mkdir(dirPath, (err) => {
              if (err) {
                event.reply('添加图库响应', {
                  success: false,
                  message: '无法创建文件夹',
                  error: err
                })
              } else {
                event.reply('添加图库响应', { success: true, message: '成功添加图库' })
              }
            })
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
    const storagePath = getStoragePath() // 使用 getStoragePath 获取图库路径
    const dirPath = path.join(storagePath, 'Galleries') // 图库目录

    const handleErr = (title, err) => {
      const notification = new Notification()
      notification.title = title
      notification.body = err?.message
      notification.show()
    }

    // 判断图库目录是否存在，如果不存在则创建
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true })
        console.log(`图库目录已创建: ${dirPath}`)
      } catch (err) {
        handleErr('创建图库目录失败', err)
        return { success: false, message: '创建图库目录失败', error: err }
      }
    }

    // 读取图库目录下的所有 JSON 文件
    const getFilesList = async () => {
      const files = await fsPromises.readdir(dirPath)
      const jsonDataList = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (path.extname(file) !== '.json') {
          continue
        }
        const filePath = path.join(dirPath, file)
        try {
          const data = await fsPromises.readFile(filePath, 'utf-8')
          const json = JSON.parse(data)
          jsonDataList.push(json)
        } catch (err) {
          handleErr('读取图库文件失败', err)
        }
      }
      return jsonDataList
    }

    const [err, res] = await to(getFilesList())
    if (err) {
      handleErr('读取全部图库失败', err)
      return { success: false, message: '读取全部图库失败', data: [] }
    }
    return { success: true, message: '成功读取全部图库', data: res }
  })

  ipcMain.handle('读取图库路径', async () => {
    return { success: true, message: '成功读取图库路径', data: getStoragePath() }
  })

  ipcMain.handle('设置图库路径', async (event, newPath) => {
    setStoragePath(newPath)
    return { success: true, message: '成功设置图库路径', data: newPath }
  })

  ipcMain.handle('删除指定图库', async (event, arg) => {
    const storagePath = getStoragePath() // 使用 getStoragePath 获取图库路径
    const filePath = path.join(storagePath, 'Galleries', `${arg}.json`) // 图库元数据文件路径
    const dirPath = path.join(storagePath, 'Galleries', arg)
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject({ success: false, message: '无法删除文件', error: err })
        } else {
          fs.rm(dirPath, { recursive: true }, (err) => {
            if (err) {
              reject({ success: false, message: '无法删除文件夹', error: err })
            } else {
              resolve({ success: true, message: '成功删除图库' })
            }
          })
        }
      })
    })
  })

  ipcMain.handle('上传图片到指定文件夹',
    async (event, { path: filePath, name: fileName, folderName }) => {
      const storagePath = getStoragePath() // 使用 getStoragePath 获取图库路径
      const destinationPath = path.join(storagePath, 'Galleries', folderName, fileName) // 目标文件路径
      const handleErr = (title, err) => {
        const notification = new Notification()
        notification.title = title
        notification.body = err?.message
        notification.show()
      }
      //复制图片到目标文件夹
      async function copyFile(filePath, folderName, fileName) {
        const [err] = await to(fsPromises.copyFile(filePath, destinationPath))
        return { err, destinationPath }
      }

      const { err } = await copyFile(filePath, folderName, fileName)
      if (err) {
        handleErr('读取全部图库失败', err)
        return {
          success: false,
          message: '错误：' + err + `\nappPath:${destinationPath}` + `\nfilePath:${filePath}`
        }
      }
      return { success: true, message: '成功上传图片', path: destinationPath }
    }
  )

  ipcMain.handle('将图片信息写入json', async (event, { folderName, PhotoInfo }) => {
    const handleErr = (title, err) => {
      const notification = new Notification()
      notification.title = title
      notification.body = err?.message
      notification.show()
    }
    const writeJsonFile = async () => {
      const storagePath = getStoragePath() // 使用 getStoragePath 获取图库路径
      const jsonPath = path.join(storagePath, 'Galleries', `${folderName}.json`) // 图库元数据文件路径
      const [readErr, data] = await to(fsPromises.readFile(jsonPath, 'utf-8'))
      if (readErr) {
        handleErr('读取json失败', readErr)
        return { success: false, message: '读取json失败', error: readErr }
      }
      const jsonData = data ? JSON.parse(data) : [PhotoInfo]

      // 添加图片信息
      const pid = uuid()
      jsonData.draws.push({ ...PhotoInfo, pid })
      // console.log(jsonData, PhotoInfo)

      // 写入 JSON 文件
      const [writeErr] = await to(
        fsPromises.writeFile(jsonPath, JSON.stringify(jsonData, null, 2)),
        'utf8'
      )
      if (writeErr) {
        handleErr('写入json失败', writeErr)
        return { success: false, message: '写入json失败', error: writeErr }
      }
      return { success: true, message: '成功写入json文件', data: jsonData }
    }
    const { err, data } = await writeJsonFile()
    if (err) {
      return { success: false, message: '更新json失败', error: err }
    }
    return { success: true, message: '成功更新json文件', data: data }
  })

  ipcMain.handle('读取全部图片', async (event, allPhoto) => {
    const { fileName } = allPhoto
    console.log(allPhoto)

    const handleErr = (title, err) => {
      const notification = new Notification()
      notification.title = title
      notification.body = err?.message
      notification.show()
    }
    const readAllJsonFile = async () => {
      const storagePath = getStoragePath() // 使用 getStoragePath 获取图库路径
      const jsonPath = path.join(storagePath, 'Galleries', `${fileName}.json`)
      // console.log(fileName)
      const data = await fsPromises.readFile(jsonPath, 'utf-8')
      return data
    }
    const [err, data] = await to(readAllJsonFile())
    if (err) {
      handleErr('读取json失败', err)
      return { success: false, message: '读取json失败', error: err }
    }
    return { success: true, message: '成功读取json文件', data: JSON.parse(data) }
  })

  ipcMain.handle('读取应用版本', async () => {
    const appVersion = app.getVersion()
    return { success: true, message: '成功读取应用版本', data: appVersion }
  })

  ipcMain.handle('读取文件信息', async (event, filePath) => {
    try {
      const data = await fsPromises.readFile(filePath, 'utf-8')
      return { success: true, message: '成功读取文件', data }
    } catch (err) {
      return { success: false, message: '读取文件失败', error: err }
    }
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
//在ready事件里
// app.on('ready', async () => {
//   globalShortcut.register('CommandOrControl+Shift+i', function () {
//     mainWindow.webContents.openDevTools()
//   })
// })
