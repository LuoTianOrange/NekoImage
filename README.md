# NekoImage

基于Electron和Vite的图库管理系统，专门为[橘橘博客](https://blog.nekoorange.cn)设计

## 功能

#### 图库管理

- [x] 导入图库功能：导入文件夹内所有图库的json，并在图库页面解析
- [x] 添加全部图库功能：读取文件夹内所有图库的json文件并渲染到页面
- [ ] 添加指定图库功能：读取指定图库的json文件
- [x] 删除图库功能：删除指定图库的json文件和文件夹
- [ ] 修改图库功能：修改指定图库的信息

#### 图片管理

- [x] 添加图片功能：上传指定图片，并且填入图片信息到对应的图库json
- [ ] 删除图片功能：从图库中删除指定图片，并从json中删除对应信息
- [ ] 修改图片功能：从json中修改图片的信息
- [ ] 导出图库功能：导出指定图库的json

#### 软件管理

- [ ] 设置存储路径功能：选择图库存储的默认路径
- [ ] 设置背景功能：修改软件的背景

## 踩坑

> 采用hash路由模式，打包后，使用router.go(0)刷新页面白屏

需要使用history路由模式。由于vue是单页面应用，刷新页面后服务器请求了一个不存在的页面，导致白屏

> 用app.getAppPath()打包出来的目录找不到对应文件夹

`app.getAppPath()` 方法返回的是应用的包（asar）的路径，而不是应用的可执行文件的路径。在开发环境中，这个路径通常是项目的根目录。但是在打包的应用中，这个路径是应用的asar包的路径。

因此需要判断是否处于开发环境来切换获取的目录

使用`path.dirname(app.getPath('exe')`可以获取打包后的主目录

```js
var appPath
if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  appPath = app.getAppPath()
  } else {
  appPath = path.dirname(app.getPath('exe'))
  }
```

