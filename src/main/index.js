import { app, shell, BrowserWindow, ipcMain, Notification, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import fse from 'fs-extra'
import { to } from 'await-to-js'
import fsPromises from 'fs/promises'
import { stat } from 'fs/promises'
const ExifReader = require('exifreader')
const sharp = require('sharp')
import { readFile } from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'
import Store from 'electron-store'
const archiver = require('archiver')
import _ from 'lodash'
// import { devtools } from '@vue/devtools'
// 初始化配置存储
const store = new Store()

/**
 * 生成随机文件名防止同名
 * @param {*} length
 * @returns
 */
//生成随机字符串的函数
function generateRandomString(length = 4) {
  return Math.random().toString(36).substring(2, 2 + length).padEnd(length, '0');
}

// 修改文件名生成逻辑
const generateUniqueFilename = (originalPath, operationPrefix) => {
  const ext = path.extname(originalPath);
  const baseName = path.basename(originalPath, ext);
  const randomStr = generateRandomString(6); // 6位随机字符串
  const timestamp = Date.now();

  return `${baseName}_${operationPrefix}_${timestamp}_${randomStr}${ext}`;
};

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
  // mainWindow.webContents.openDevTools()

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
  // if (process.env.NODE_ENV === 'development')
  //   devtools.connect("http://localhost:8098")
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

  ipcMain.handle('添加图库', async (event, arg) => {
    try {
      const newArg = typeof arg === 'string' ? JSON.parse(arg) : arg;
      const storagePath = getStoragePath();

      // 检查输入参数有效性
      if (!newArg || !newArg.name) {
        throw new Error('图库名称不能为空');
      }

      // 清理和验证图库名称
      const cleanGalleryName = newArg.name.trim();
      if (!cleanGalleryName) {
        throw new Error('图库名称无效');
      }

      // 定义路径
      const filePath = path.join(storagePath, 'Galleries', `${cleanGalleryName}.json`);
      const dirPath = path.join(storagePath, 'Galleries', cleanGalleryName);

      // 检查图库是否已存在
      const [existsErr, exists] = await to(fsPromises.access(filePath).then(() => true).catch(() => false));
      if (existsErr) throw existsErr;

      if (exists) {
        return {
          success: false,
          message: '图库已经存在',
          details: {
            existingPath: filePath,
            // suggestedName: `${cleanGalleryName}_${Math.random().toString(36).substring(2, 6)}`
          }
        };
      }

      // 创建图库目录
      await fsPromises.mkdir(dirPath, { recursive: true });

      // 初始化图库数据
      const galleryData = {
        ...newArg,
        name: cleanGalleryName,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        draws: [],
        favorites: []
      };

      // 写入元数据文件
      await fsPromises.writeFile(filePath, JSON.stringify(galleryData, null, 2));

      return {
        success: true,
        message: '成功添加图库',
        data: {
          path: filePath,
          name: cleanGalleryName
        }
      };
    } catch (error) {
      console.error('添加图库失败:', error);
      return {
        success: false,
        message: '添加图库失败: ' + error.message,
        error: error.stack
      };
    }
  });

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

  ipcMain.handle('上传图片到指定文件夹', async (event, { files, folderName }) => {
    const storagePath = getStoragePath();
    const results = [];
    const existingFiles = new Set(); // 用于记录已存在的文件名

    try {
      // 先获取目标文件夹中已有的文件名
      const galleryPath = path.join(storagePath, 'Galleries', folderName);
      if (fs.existsSync(galleryPath)) {
        const existingFilesList = await fsPromises.readdir(galleryPath);
        existingFilesList.forEach(file => existingFiles.add(file.toLowerCase()));
      }

      for (const file of files) {
        try {
          // 清理文件名中的特殊字符
          const cleanFileName = (fileName) => {
            const specialChars = /[%$#@!&*()+=?<>{}[\]\\\/]/g;
            return fileName.replace(specialChars, '');
          };

          let fileName = cleanFileName(file.name);
          const ext = path.extname(fileName);
          let baseName = path.basename(fileName, ext);
          let savedName = baseName; // 初始化保存的名称（不带后缀和扩展名）

          // 检查文件名是否已存在
          if (existingFiles.has(fileName.toLowerCase())) {
            // 生成随机后缀 (4位字母数字)
            const randomSuffix = Math.random().toString(36).substring(2, 6);
            baseName = `${baseName}_${randomSuffix}`;
            fileName = `${baseName}${ext}`;
            savedName = baseName; // 更新保存的名称（带随机后缀但不带扩展名）

            // 确保新文件名也不存在
            let counter = 1;
            while (existingFiles.has(fileName.toLowerCase())) {
              const newRandomSuffix = Math.random().toString(36).substring(2, 6);
              baseName = `${path.basename(fileName, ext)}_${newRandomSuffix}`;
              fileName = `${baseName}${ext}`;
              savedName = baseName;
              counter++;

              if (counter > 100) {
                throw new Error('无法生成唯一文件名');
              }
            }
          }

          const destinationPath = path.join(storagePath, 'Galleries', folderName, fileName);

          // 确保目标目录存在
          await fsPromises.mkdir(path.dirname(destinationPath), { recursive: true });

          // 复制文件
          await fsPromises.copyFile(file.path, destinationPath);

          // 记录已使用的文件名
          existingFiles.add(fileName.toLowerCase());

          results.push({
            success: true,
            originalName: file.name,
            savedName: savedName, // 只返回基础名称（可能带随机后缀但不带扩展名）
            path: destinationPath
          });
        } catch (error) {
          results.push({
            success: false,
            originalName: file.name,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('上传过程中发生全局错误:', error);
      return [{
        success: false,
        error: '上传过程中发生全局错误: ' + error.message
      }];
    }
  })

  ipcMain.handle('删除图库图片', async (event, { folderName, pid }) => {
    const storagePath = getStoragePath();
    const jsonPath = path.join(storagePath, 'Galleries', `${folderName}.json`);

    try {
      // 读取图库数据
      const data = await fsPromises.readFile(jsonPath, 'utf-8');
      const jsonData = JSON.parse(data);

      // 查找要删除的图片
      const imageIndex = jsonData.draws.findIndex(draw => draw.pid === pid);
      if (imageIndex === -1) {
        throw new Error(`未找到PID为 ${pid} 的图片`);
      }

      // 获取图片路径并验证
      const imagePath = jsonData.draws[imageIndex].cover;
      if (!imagePath || typeof imagePath !== 'string') {
        throw new Error('无效的图片路径');
      }

      // 打印调试信息
      console.log('准备删除:', {
        pid,
        path: imagePath,
        exists: fs.existsSync(imagePath)
      });

      // 删除文件
      if (fs.existsSync(imagePath)) {
        await fsPromises.unlink(imagePath);
      } else {
        console.warn('文件不存在:', imagePath);
      }

      // 更新JSON数据
      jsonData.draws.splice(imageIndex, 1);
      // 从收藏列表中移除（如果存在）
      jsonData.favorites = jsonData.favorites.filter(id => id !== pid);
      // 更新图库修改时间
      jsonData.updateTime = new Date().toISOString();
      // 保存更新
      await fsPromises.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));

      return {
        success: true,
        updateTime: jsonData.updateTime
      };
    } catch (error) {
      console.error('删除过程中出错:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack // 返回错误堆栈便于调试
      };
    }
  })

  ipcMain.handle('将图片信息写入json', async (event, { folderName, photos }) => {
    const storagePath = getStoragePath();
    const jsonPath = path.join(storagePath, 'Galleries', `${folderName}.json`);

    try {
      // 读取现有数据或创建新数据
      let jsonData = { draws: [] };
      if (fs.existsSync(jsonPath)) {
        jsonData = JSON.parse(await fsPromises.readFile(jsonPath, 'utf-8'));
      }

      // 批量添加图片信息
      const addedImages = [];
      for (const photo of photos) {
        // 检查是否已存在相同路径的图片
        const exists = jsonData.draws.some(draw => draw.cover === photo.path);
        if (exists) {
          console.warn(`图片已存在，跳过添加: ${photo.path}`);
          continue;
        }

        const pid = uuid();
        const newImage = {
          ...photo,
          pid,
          name: photo.savedName || path.basename(photo.path), // 使用处理后的文件名
          createTime: new Date().toISOString(),
          isFavorite: false,
          favoriteTime: null
        };

        jsonData.draws.push(newImage);
        addedImages.push(newImage);
      }
      // 更新图库修改时间
      jsonData.updateTime = new Date().toISOString();
      // 保存更新
      await fsPromises.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));

      return {
        success: true,
        addedCount: addedImages.length,
        addedImages,
        updateTime: jsonData.updateTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
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
      const galleryData = JSON.parse(data);
      if (!galleryData.favorites) {
        galleryData.favorites = [];
        galleryData.draws.forEach(draw => {
          draw.isFavorite = draw.isFavorite || false;
          draw.favoriteTime = draw.favoriteTime || null;
        });
        await fsPromises.writeFile(jsonPath, JSON.stringify(galleryData, null, 2));
      }
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

  ipcMain.handle('修改图库路径', async (event, newPath) => {
    const handleErr = (title, err) => {
      const notification = new Notification()
      notification.title = title
      notification.body = err?.message
      notification.show()
    }

    try {
      const oldPath = getStoragePath() // 获取当前图库路径
      const newStoragePath = path.resolve(newPath) // 解析新路径为绝对路径

      // 检查新路径是否有效
      if (!fs.existsSync(newStoragePath)) {
        try {
          fs.mkdirSync(newStoragePath, { recursive: true }) // 创建新路径
          console.log(`新图库路径已创建: ${newStoragePath}`)
        } catch (err) {
          handleErr('创建新路径失败', err)
          return { success: false, message: '创建新路径失败', error: err }
        }
      }

      // 更新存储路径
      setStoragePath(newStoragePath)

      // 迁移现有图库数据到新路径
      const oldGalleriesPath = path.join(oldPath, 'Galleries') // 旧图库路径
      const newGalleriesPath = path.join(newStoragePath, 'Galleries') // 新图库路径

      if (fs.existsSync(oldGalleriesPath)) {
        try {
          // 复制整个 Galleries 文件夹到新路径
          fs.cpSync(oldGalleriesPath, newGalleriesPath, { recursive: true })
          console.log(`图库文件夹已迁移到新路径: ${newGalleriesPath}`)

          // 遍历所有 JSON 文件，更新图片路径
          const galleryFiles = fs.readdirSync(newGalleriesPath)
          for (const file of galleryFiles) {
            if (path.extname(file) === '.json') {
              const jsonFilePath = path.join(newGalleriesPath, file)
              const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))

              // 更新 draws 数组中的图片路径
              if (jsonData.draws && Array.isArray(jsonData.draws)) {
                jsonData.draws = jsonData.draws.map((draw) => {
                  const oldCoverPath = draw.cover
                  const newCoverPath = oldCoverPath.replace(oldGalleriesPath, newGalleriesPath)
                  return { ...draw, cover: newCoverPath }
                })
              }

              // 更新 cover 路径
              if (jsonData.cover) {
                jsonData.cover = jsonData.cover.replace(oldGalleriesPath, newGalleriesPath)
              }

              // 写入更新后的 JSON 文件
              fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2))
              console.log(`JSON 文件已更新: ${jsonFilePath}`)
            }
          }

          // 删除旧图库路径
          try {
            fs.rmSync(oldGalleriesPath, { recursive: true, force: true })
            console.log(`旧图库路径已删除: ${oldGalleriesPath}`)
          } catch (err) {
            console.warn(`删除旧图库路径失败: ${oldGalleriesPath}`, err)
          }
        } catch (err) {
          handleErr('迁移图库数据失败', err)
          return { success: false, message: '迁移图库数据失败', error: err }
        }
      }

      return { success: true, message: '成功修改图库路径', data: newStoragePath }
    } catch (err) {
      handleErr('修改图库路径失败', err)
      return { success: false, message: '修改图库路径失败', error: err }
    }
  })

  ipcMain.handle('打开资源管理器选择路径', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'], // 选择文件夹
      title: '选择图库路径', // 对话框标题
      buttonLabel: '选择', // 确认按钮的标签
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, message: '成功选择路径', data: result.filePaths[0] }
    } else {
      return { success: false, message: '用户取消选择' }
    }
  })

  ipcMain.handle('读取EXIF信息', async (event, imagePath) => {
    try {
      // 读取图片文件
      const buffer = await readFile(imagePath)
      const tags = ExifReader.load(buffer)
      console.log('EXIF 数据:', tags);
      // 格式化 EXIF 数据
      const formattedData = {}
      for (const [key, value] of Object.entries(tags)) {
        formattedData[key] = value.description || value.value
      }

      return { success: true, data: formattedData }
    } catch (error) {
      console.error('无法读取 EXIF 信息:', error)
      return { success: false, message: '无法读取 EXIF 信息', error: error.message }
    }
  })

  ipcMain.handle('获取图片大小', async (event, imagePath) => {
    try {
      if (typeof imagePath !== 'string') {
        throw new Error('路径必须是字符串');
      }
      // 获取文件状态
      const stats = await stat(imagePath)
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2) // 转换为 MB
      return { success: true, size: sizeInMB }
    } catch (error) {
      console.error('获取图片大小失败:', error)
      return { success: false, message: '获取图片大小失败', error: error.message }
    }
  })

  ipcMain.handle('获取图片尺寸', async (event, imagePath) => {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        success: true,
        width: metadata.width,
        height: metadata.height
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('打开图库根目录', async () => {
    try {
      const galleryRootPath = getStoragePath(); // 获取当前图库根目录路径
      await shell.openPath(galleryRootPath); // 打开文件夹
      return { success: true, message: '图库根目录已成功打开', path: galleryRootPath };
    } catch (error) {
      return { success: false, message: '无法打开图库根目录', error: error.message };
    }
  });

  ipcMain.handle('读取图库信息', async (event, galleryName) => {
    const storagePath = getStoragePath(); // 获取图库存储路径
    const galleryMetaPath = path.join(storagePath, 'Galleries', `${galleryName}.json`); // 图库元数据文件路径

    try {
      // 检查元数据文件是否存在
      if (!fs.existsSync(galleryMetaPath)) {
        return { success: false, message: '图库元数据文件不存在' };
      }

      // 读取元数据文件
      const data = await fsPromises.readFile(galleryMetaPath, 'utf-8');
      const galleryInfo = JSON.parse(data);

      // 计算图库总大小
      let totalSize = 0;

      //通过元数据中的图片路径计算大小
      if (galleryInfo.draws && Array.isArray(galleryInfo.draws)) {
        for (const image of galleryInfo.draws) {
          try {
            const stats = await fsPromises.stat(image.cover);
            totalSize += stats.size;
          } catch (error) {
            console.warn(`无法获取图片大小: ${image.cover}`, error);
          }
        }
      }
      const sizeInfo = formatFileSize(totalSize);
      galleryInfo.size = `${sizeInfo.value}${sizeInfo.unit}`
      console.log('galleryInfo:', galleryInfo)

      // 返回图库信息
      return {
        success: true,
        message: '成功读取图库信息',
        data: galleryInfo
      };
    } catch (error) {
      console.error('读取图库信息失败:', error);
      return { success: false, message: '读取图库信息失败', error: error.message };
    }
  });

  ipcMain.handle('修改图库信息', async (event, { galleryName, updates }) => {
    const storagePath = getStoragePath();
    const jsonPath = path.join(storagePath, 'Galleries', `${galleryName}.json`);

    try {
      // 参数验证
      if (!galleryName || typeof galleryName !== 'string') {
        throw new Error('图库名称参数无效');
      }

      // 读取现有数据
      const data = await fsPromises.readFile(jsonPath, 'utf-8');
      const galleryData = JSON.parse(data);
      const originalData = JSON.parse(JSON.stringify(galleryData)); // 深拷贝用于回滚

      // 准备变更记录
      const changes = {
        updatedFields: [],
        oldValues: {},
        newValues: {}
      };

      // 处理名称修改
      if (updates.name && updates.name !== galleryData.name) {
        // 验证新名称
        const nameValidation = validateGalleryName(updates.name);
        if (!nameValidation.valid) {
          throw new Error(nameValidation.reason);
        }

        // 检查名称冲突
        const newJsonPath = path.join(storagePath, 'Galleries', `${updates.name}.json`);
        if (fs.existsSync(newJsonPath)) {
          throw new Error('目标图库名称已存在');
        }

        changes.updatedFields.push('name');
        changes.oldValues.name = galleryData.name;
        changes.newValues.name = updates.name;
        galleryData.name = updates.name;
      }

      // 处理描述修改
      if (updates.desc !== undefined && updates.desc !== galleryData.desc) {
        if (typeof updates.desc !== 'string') {
          throw new Error('描述必须是字符串');
        }

        changes.updatedFields.push('desc');
        changes.oldValues.desc = galleryData.desc;
        changes.newValues.desc = updates.desc;
        galleryData.desc = updates.desc;
      }

      // 如果没有实际修改
      if (changes.updatedFields.length === 0) {
        return {
          success: true,
          message: '未检测到有效修改',
          data: { changed: false }
        };
      }

      // 更新修改时间
      galleryData.updateTime = new Date().toISOString();

      // 执行文件操作（如果是名称修改需要重命名文件）
      if (changes.updatedFields.includes('name')) {
        const newJsonPath = path.join(storagePath, 'Galleries', `${updates.name}.json`);
        const oldDirPath = path.join(storagePath, 'Galleries', galleryName);
        const newDirPath = path.join(storagePath, 'Galleries', updates.name);

        // 重命名操作
        await fsPromises.rename(jsonPath, newJsonPath);
        if (fs.existsSync(oldDirPath)) {
          await fsPromises.rename(oldDirPath, newDirPath);
        }

        // 更新内部路径引用
        if (galleryData.draws) {
          galleryData.draws = galleryData.draws.map(draw => ({
            ...draw,
            cover: draw.cover.replace(
              new RegExp(`Galleries/${galleryName}(/|$)`),
              `Galleries/${updates.name}$1`
            )
          }));
        }
      }

      // 保存数据（如果是名称修改则保存到新路径）
      const savePath = changes.updatedFields.includes('name')
        ? path.join(storagePath, 'Galleries', `${updates.name}.json`)
        : jsonPath;

      await fsPromises.writeFile(savePath, JSON.stringify(galleryData, null, 2));

      return {
        success: true,
        message: '图库信息更新成功',
        data: {
          changed: true,
          changes,
          newGalleryName: updates.name || galleryName,
          updateTime: galleryData.updateTime
        }
      };

    } catch (error) {
      // 错误恢复逻辑
      if (originalData && jsonPath) {
        await fsPromises.writeFile(jsonPath, JSON.stringify(originalData, null, 2))
          .catch(e => console.error('恢复数据失败:', e));
      }

      console.error('修改图库信息失败:', error);
      return {
        success: false,
        message: error.message || '修改图库信息失败',
        error: error.stack
      };
    }
  });

  ipcMain.handle('添加收藏', async (event, { galleryName, pid }) => {
    const storagePath = getStoragePath();
    const jsonPath = path.join(storagePath, 'Galleries', `${galleryName}.json`);

    try {
      const data = await fsPromises.readFile(jsonPath, 'utf-8');
      const galleryData = JSON.parse(data);

      // 更新图片收藏状态
      const imageIndex = galleryData.draws.findIndex(draw => draw.pid === pid);
      if (imageIndex === -1) throw new Error('未找到指定图片');

      galleryData.draws[imageIndex].isFavorite = true;
      galleryData.draws[imageIndex].favoriteTime = new Date().toISOString();

      // 添加到收藏索引
      if (!galleryData.favorites.includes(pid)) {
        galleryData.favorites.push(pid);
      }

      await fsPromises.writeFile(jsonPath, JSON.stringify(galleryData, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('移除收藏', async (event, { galleryName, pid }) => {
    const storagePath = getStoragePath();
    const jsonPath = path.join(storagePath, 'Galleries', `${galleryName}.json`);

    try {
      const data = await fsPromises.readFile(jsonPath, 'utf-8');
      const galleryData = JSON.parse(data);

      // 更新图片收藏状态
      const imageIndex = galleryData.draws.findIndex(draw => draw.pid === pid);
      if (imageIndex !== -1) {
        galleryData.draws[imageIndex].isFavorite = false;
        galleryData.draws[imageIndex].favoriteTime = null;
      }

      // 从收藏索引移除
      galleryData.favorites = galleryData.favorites.filter(id => id !== pid);

      await fsPromises.writeFile(jsonPath, JSON.stringify(galleryData, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('获取收藏列表', async (event, galleryName) => {
    const storagePath = getStoragePath();
    const jsonPath = path.join(storagePath, 'Galleries', `${galleryName}.json`);

    try {
      const data = await fsPromises.readFile(jsonPath, 'utf-8');
      const galleryData = JSON.parse(data);

      const favorites = galleryData.draws.filter(draw =>
        galleryData.favorites.includes(draw.pid)
      ).sort((a, b) =>
        new Date(b.favoriteTime) - new Date(a.favoriteTime)
      );

      return { success: true, data: favorites };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('转换图片格式', async (event, { imagePath, galleryName, options }) => {
    try {
      const storagePath = getStoragePath()
      const jsonPath = path.join(storagePath, 'Galleries', `${galleryName}.json`)

      // 读取图库数据
      const jsonData = JSON.parse(await fsPromises.readFile(jsonPath, 'utf-8'))
      const normalizedPath = path.normalize(imagePath)

      // 查找原图
      const originalImage = jsonData.draws.find(d => path.normalize(d.cover) === normalizedPath)
      if (!originalImage) {
        return { success: false, message: '未找到原始图片记录' }
      }

      const newExt = options.format;
      const convertedPath = path.join(
        path.dirname(normalizedPath),
        generateUniqueFilename(normalizedPath, 'converted')
      ).replace(/\.[^/.]+$/, `.${newExt}`);

      // 使用sharp进行格式转换
      const sharpInstance = sharp(normalizedPath)

      // 根据格式设置不同选项
      switch (options.format) {
        case 'jpg':
          sharpInstance.jpeg({ quality: options.quality })
          break
        case 'png':
          sharpInstance.png({ compression: options.compression })
          break
        case 'webp':
          sharpInstance.webp({
            quality: options.quality,
            lossless: options.lossless
          })
          break
        case 'avif':
          sharpInstance.avif({ quality: options.quality })
          break
      }

      await sharpInstance.toFile(convertedPath)

      // 创建新图库条目
      const newImage = {
        ...originalImage,
        pid: uuid(), // 新唯一ID
        cover: convertedPath,
        name: `${originalImage.name}-${ext.toUpperCase()}`,
        createTime: new Date().toISOString()
      }

      // 更新图库
      jsonData.draws.push(newImage)
      // 更新图库修改时间
      jsonData.updateTime = new Date().toISOString();
      await fsPromises.writeFile(jsonPath, JSON.stringify(jsonData, null, 2))

      return {
        success: true,
        newImage,
        originalPid: originalImage.pid,
        updateTime: jsonData.updateTime
      }

    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  })

  ipcMain.handle('压缩图片', async (event, { imagePath, galleryName, options }) => {
    try {
      const storagePath = getStoragePath();
      const jsonPath = path.join(storagePath, 'Galleries', `${galleryName}.json`);
      const ext = path.extname(imagePath).toLowerCase();
      const isPNG = ext === '.png';

      // 1. 读取原图信息
      const originalStats = await fsPromises.stat(imagePath);
      const originalSize = originalStats.size;
      const normalizedPath = path.normalize(imagePath);

      // 2. 读取图库数据
      const jsonData = JSON.parse(await fsPromises.readFile(jsonPath, 'utf-8'));
      const originalImage = jsonData.draws.find(d => path.normalize(d.cover) === normalizedPath);
      if (!originalImage) {
        return { success: false, message: '未找到原始图片记录' };
      }

      // 3. 准备输出路径
      const compressedPath = path.join(
        path.dirname(normalizedPath),
        generateUniqueFilename(normalizedPath, 'compressed')
      );

      // 4. 创建sharp实例
      const sharpInstance = sharp(normalizedPath);
      const effectiveQuality = Math.min(options.quality, 90);

      // 5. 格式特定处理
      if (isPNG) {
        // PNG专用压缩策略
        const metadata = await sharpInstance.metadata();

        // 根据PNG特性选择压缩方式
        if (metadata.channels <= 4 && !metadata.hasAlpha) {
          // 简单PNG使用调色板优化
          sharpInstance.png({
            compressionLevel: 9,
            palette: true,
            quality: Math.floor(effectiveQuality / 10) + 1 // 1-10
          });
        } else {
          // 复杂PNG使用自适应过滤
          sharpInstance.png({
            compressionLevel: 9,
            adaptiveFiltering: true,
            effort: 7 // 更高的压缩努力值
          });
        }
      } else {
        // 其他格式处理
        switch (ext) {
          case '.jpg':
          case '.jpeg':
            sharpInstance.jpeg({
              quality: effectiveQuality,
              progressive: options.progressive,
              mozjpeg: true
            });
            break;
          case '.webp':
            sharpInstance.webp({
              quality: effectiveQuality,
              alphaQuality: 80
            });
            break;
        }
      }

      // 6. 元数据处理
      if (options.preserveMetadata) {
        sharpInstance.withMetadata();
      } else {
        sharpInstance.withMetadata(false);
      }

      // 7. 执行压缩
      await sharpInstance.toFile(compressedPath);
      const compressedStats = await fsPromises.stat(compressedPath);

      // 8. 验证压缩结果
      if (compressedStats.size >= originalSize * 0.98) {
        // 尝试更激进的压缩方案
        if (isPNG) {
          await sharp(normalizedPath)
            .png({ compressionLevel: 9, effort: 9 })
            .toFile(compressedPath);
        } else {
          await sharp(normalizedPath)
            .jpeg({ quality: Math.max(30, effectiveQuality - 30), mozjpeg: true })
            .toFile(compressedPath);
        }

        const finalStats = await fsPromises.stat(compressedPath);
        if (finalStats.size >= originalSize) {
          fs.unlinkSync(compressedPath);
          return {
            success: false,
            message: '图片已达到最小尺寸',
            originalSize,
            compressedSize: originalSize
          };
        }
      }

      // 9. 更新图库数据
      const newImage = {
        ...originalImage,
        pid: uuid(),
        cover: compressedPath,
        name: `${originalImage.name}-compressed`,
        createTime: new Date().toISOString(),
        metadata: {
          ...(originalImage.metadata || {}),
          compressionInfo: {
            originalSize,
            compressedSize: compressedStats.size,
            qualityUsed: effectiveQuality,
            savedPercent: ((originalSize - compressedStats.size) / originalSize * 100).toFixed(1),
            isPNG
          }
        }
      };

      jsonData.draws.push(newImage);
      jsonData.updateTime = new Date().toISOString();
      await fsPromises.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));

      return {
        success: true,
        newImage,
        originalSize,
        compressedSize: compressedStats.size,
        savedSize: originalSize - compressedStats.size,
        updateTime: jsonData.updateTime
      };

    } catch (error) {
      console.error('压缩过程中出错:', error);
      return {
        success: false,
        message: `压缩失败: ${error.message}`,
        errorDetails: error.stack
      };
    }
  });

  ipcMain.handle('打开图片所在文件夹', async (event, imagePath) => {
    const { shell, app } = require('electron');
    const path = require('path');
    const fs = require('fs');

    try {
      // 验证路径
      if (!fs.existsSync(imagePath)) {
        return { success: false, message: '图片文件不存在' };
      }

      const folderPath = path.dirname(imagePath);

      // 平台特定处理
      switch (process.platform) {
        case 'win32':
          // Windows: 先打开文件夹再选中文件
          await shell.openPath(folderPath);
          await shell.openPath(imagePath);
          break;

        case 'darwin':
          // macOS: 使用AppleScript
          const { exec } = require('child_process');
          exec(`osascript -e 'tell application "Finder" to reveal POSIX file "${imagePath}"' -e 'tell application "Finder" to activate'`);
          break;

        case 'linux':
          // Linux: 使用xdg-open
          await shell.openPath(folderPath);
          break;

        default:
          await shell.openPath(folderPath);
      }

      return { success: true };
    } catch (error) {
      console.error('打开文件夹失败:', error);
      return {
        success: false,
        message: error.message,
        platform: process.platform
      };
    }
  });


  function validateGalleryName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, reason: '名称不能为空' };
    }
    if (name.length > 50) {
      return { valid: false, reason: '名称不能超过50个字符' };
    }
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(name)) {
      return { valid: false, reason: '只能包含中英文、数字、下划线和横线' };
    }
    return { valid: true };
  }

  const sharp = require('sharp'); // 引入 sharp 库
  // 文件大小格式化工具函数
  function formatFileSize(bytes) {
    if (bytes === 0) return { value: 0, unit: 'B' };

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return {
      value: parseFloat((bytes / Math.pow(k, i)).toFixed(2)),
      unit: sizes[i]
    };
  }
  // 调整图片大小
  ipcMain.handle('调整图片大小', async (event, { imagePath, width, height, galleryName }) => {
    try {
      const storagePath = getStoragePath();
      const jsonPath = path.join(storagePath, 'Galleries', `${galleryName}.json`);

      // 1. 读取图库数据
      const jsonData = JSON.parse(await fsPromises.readFile(jsonPath, 'utf-8'));

      // 2. 标准化路径
      const normalizedImagePath = path.normalize(imagePath);
      if (!fs.existsSync(normalizedImagePath)) {
        throw new Error('原始图片不存在');
      }

      // 3. 查找原图
      const originalImage = jsonData.draws.find(draw =>
        path.normalize(draw.cover) === normalizedImagePath
      );
      if (!originalImage) {
        throw new Error('未在图库中找到原图记录');
      }

      // 4. 生成新文件名和路径
      const ext = path.extname(normalizedImagePath);
      // 生成唯一调整大小文件名
      const resizedImagePath = path.join(
        path.dirname(normalizedImagePath),
        generateUniqueFilename(normalizedImagePath, `${width}x${height}`)
      );

      // 5. 调整图片尺寸
      await sharp(normalizedImagePath)
        .resize(width, height, { fit: 'fill' })
        .toFile(resizedImagePath);

      // 6. 创建新条目（生成新PID）
      const newImageEntry = {
        ..._.cloneDeep(originalImage),
        pid: uuid(),
        cover: resizedImagePath,
        name: `${originalImage.name}_${width}×${height}`,
        createTime: new Date().toISOString()
      };

      // 7. 更新图库
      jsonData.draws.push(newImageEntry);
      // 更新图库修改时间
      jsonData.updateTime = new Date().toISOString();
      await fsPromises.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));

      return {
        success: true,
        newImage: newImageEntry,
        originalPid: originalImage.pid, // 仅返回原图PID用于关联
        updateTime: jsonData.updateTime
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  });

  // 按比例调整图片大小
  ipcMain.handle('按比例调整图片大小', async (event, { imagePath, percentage, galleryName }) => {
    try {
      const storagePath = getStoragePath();
      const jsonPath = path.join(storagePath, 'Galleries', `${galleryName}.json`);

      // 1. 读取图库元数据
      const data = await fsPromises.readFile(jsonPath, 'utf-8');
      const jsonData = JSON.parse(data);

      // 2. 标准化路径
      const normalizedImagePath = path.normalize(imagePath);

      // 3. 查找原图信息
      const originalImage = jsonData.draws.find(draw =>
        path.normalize(draw.cover) === normalizedImagePath
      );
      if (!originalImage) {
        return { success: false, message: '未找到匹配的图片路径' };
      }

      // 4. 获取原图尺寸
      const metadata = await sharp(normalizedImagePath).metadata();
      const newWidth = Math.round(metadata.width * percentage);
      const newHeight = Math.round(metadata.height * percentage);

      // 生成唯一调整大小文件名
      const resizedImagePath = path.join(
        path.dirname(normalizedImagePath),
        generateUniqueFilename(normalizedImagePath, `${percentage * 100}pct`)
      );

      // 6. 调整图片尺寸
      await sharp(normalizedImagePath)
        .resize({
          width: newWidth,
          height: newHeight,
          fit: 'inside',
          withoutEnlargement: percentage > 1 ? false : true
        })
        .toFile(resizedImagePath);

      // 7. 创建新图库条目（生成新PID）
      const newImageEntry = {
        ..._.cloneDeep(originalImage),
        pid: uuid(), // 新唯一ID
        cover: resizedImagePath,
        name: `${originalImage.name} (${percentage * 100}%)`,
        createTime: new Date().toISOString()
      };

      // 8. 更新图库数据
      jsonData.draws.push(newImageEntry);
      // 更新图库修改时间
      jsonData.updateTime = new Date().toISOString();
      await fsPromises.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));

      return {
        success: true,
        message: `成功创建调整后的图片-${percentage * 100}%`,
        path: resizedImagePath,
        newEntry: newImageEntry,
        originalEntry: {
          pid: originalImage.pid,
          path: normalizedImagePath
        },
        updateTime: jsonData.updateTime
      };

    } catch (error) {
      console.error('图片调整失败:', error);
      return {
        success: false,
        message: `调整失败: ${error.message}`,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  });

  ipcMain.handle('获取排序后的图片', async (event, { folderName, field, order }) => {
    const storagePath = getStoragePath();
    const jsonPath = path.join(storagePath, 'Galleries', `${folderName}.json`);

    try {
      const data = await fsPromises.readFile(jsonPath, 'utf-8');
      const jsonData = JSON.parse(data);

      // 排序逻辑
      const sortedDraws = jsonData.draws.sort((a, b) => {
        if (field === 'name') {
          return order === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (field === 'date') {
          return order === 'asc'
            ? new Date(a.createTime) - new Date(b.createTime)
            : new Date(b.createTime) - new Date(a.createTime);
        }
        return 0;
      });

      return { success: true, data: sortedDraws };
    } catch (error) {
      console.error('排序失败:', error);
      return { success: false, message: '排序失败', error: error.message };
    }
  });
  ipcMain.handle('获取文件路径', (event, filePath) => {
    return {
      basename: path.basename(filePath),
      extname: path.extname(filePath),
      dirname: path.dirname(filePath)
    }
  })
  // 批量重命名
  ipcMain.handle('批量重命名', async (event, args) => {
    // 使用lodash深拷贝参数
    const { images, namePatterns, galleryName } = _.cloneDeep(args)

    const storagePath = getStoragePath()
    const galleryPath = path.join(storagePath, 'Galleries', `${galleryName}.json`)

    try {
      const galleryData = JSON.parse(await fsPromises.readFile(galleryPath, 'utf-8'))
      const results = []

      for (let i = 0; i < images.length; i++) {
        const img = _.cloneDeep(images[i]) // 深拷贝图片对象
        const customName = namePatterns[i] || `图片_${i + 1}`
        const ext = path.extname(img.path)
        const newName = customName.replace(/\{index\}/g, (i + 1).toString().padStart(2, '0'))
        const newPath = path.join(path.dirname(img.path), `${newName}${ext}`)

        await fsPromises.rename(img.path, newPath)

        const imageIndex = galleryData.draws.findIndex(d => d.cover === img.path)
        if (imageIndex !== -1) {
          galleryData.draws[imageIndex].cover = newPath
          galleryData.draws[imageIndex].name = newName
        }

        results.push({
          original: img.path,
          newPath,
          newName,
          success: true
        })
      }

      await fsPromises.writeFile(galleryPath, JSON.stringify(galleryData, null, 2))
      return { success: true, results: _.cloneDeep(results) } // 返回前深拷贝
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // 压缩导出
  ipcMain.handle('压缩导出', async (_, { images, zipName }) => {
    const downloadsPath = app.getPath('downloads')
    const zipPath = path.join(downloadsPath, `${zipName}.zip`)

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => {
        resolve({
          success: true,
          path: zipPath,
          size: archive.pointer()
        })
      })

      archive.on('error', err => reject({ success: false, error: err.message }))
      archive.pipe(output)

      images.forEach(img => {
        archive.file(img.path, { name: path.basename(img.path) })
      })

      archive.finalize()
    })
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
