# NekoImage

基于Electron和Vite的图库管理系统，专门为[橘橘博客](https://blog.nekoorange.cn)设计

## 功能

#### 图库管理

- [x] 导入图库功能：导入文件夹内所有图库的json，并在图库页面解析
- [x] 添加全部图库功能：读取文件夹内所有图库的json文件并渲染到页面
- [ ] 添加指定图库功能：读取指定图库的json文件
- [x] 删除图库功能：删除指定图库的json文件和文件夹
- [ ] 修改图库功能：修改指定图库的名字和描述

#### 图片管理

- [x] 添加图片功能：上传指定图片，并且填入图片信息到对应的图库json，将文件名字自动填入输入框，要检查是否有同名图库
- [x] 读取全部图片功能：从json读取所有图片的路径并返回前端渲染
- [ ] 删除图片功能：从图库中删除指定图片，并从json中删除对应信息
- [ ] 修改图片功能：从json中修改图片的信息
- [ ] 导出图库功能：导出指定图库的json
- [ ] 检测图片重名：上传图片后要检测图片是否有同名，否则删除时会报错
- [x] 查看图片详细信息：点击图片可以查看图片的详细信息
- [ ] 图片展示排序：按照名字，创建时间，修改时间等排序，并可以调整为升序或降序
- [ ] 图片收藏功能：可以收藏指定的图片，并在收藏页面显示

#### 软件管理

- [ ] 设置存储路径功能：选择图库存储的默认路径
- [ ] 设置背景功能：修改软件的背景
- [ ] 设置主题功能：可以更改想要的背景颜色，包括夜间模式
- [ ] 多语言支持：可以切换软件的界面语言
- [ ] 在线更新：可以手动更新或自动更新软件
- [ ] 数据展示：首页显示图库信息，图片数量等信息，并以图表显示

#### 图片编辑

- [ ] 转换图片格式功能：将图片转换为jpg，png，gif等常用格式
- [ ] 调整图片大小：将图片调整为指定尺寸
- [ ] 压缩图片：减小图片的文件尺寸
- [ ] 裁剪图片：裁剪图片的指定部分
- [ ] 添加水印：给图片添加水印
- [ ] 任务队列*：支持批量完成对应任务，并自动执行下一步操作(如调整图片大小后自动压缩)

## 踩坑

> 采用history路由模式，打包后，使用router.go(0)刷新页面白屏

需要使用memory路由模式。由于vue是单页面应用，刷新页面后服务器请求了一个不存在的页面，导致白屏

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

> 无法加载本地文件
>
> `violates the following Content Security Policy directive`(浏览器)
>
> `Not allowed to load local resource`(electron)



首先electron有自己的安全策略，可以在`main.js`的`webPreferences`使用`webSecurity: false`关闭

```js
    webPreferences: {
      webSecurity: false
    }
```

其次浏览器有自己的安全策略，可以在`index.html`的`<meta http-equiv="Content-Security-Policy" content="img-src 'self' file: data:;"`

```html
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' file: data:;"
    />
```

中关闭

`file:`用于file类型的文件通过CSP，`data:`用于data类型的文件通过CSP(如base64)

> 使用router.push()路由跳转后没有刷新数据

要使用`onActive()`重新获取数据

> 打包提示：`remove app.asar: The process cannot access the file because it is being used by another process`

可能是`README.md`这种文件在vscode以外的软件正在使用，因为打包的时候也会把readme打包进去

> 如何设置软件图标？

图标要求：小于256px，格式为png或ico

转ico网站：https://redketchup.io/icon-converter

png调整尺寸网站：https://www.iloveimg.com/zh-cn/resize-image/resize-png



软件左上角：

在`main.js`中，

```js
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'icon.png'),
  })
```

软件打包图标：

在`package.json`中，在`build`下添加

`"win":{
      "icon": "build/图标路径"
    }`

```json
"scripts":{...}
"dependencies":{...}
"build": {
    "win":{
      "icon": "build/icons/icon.ico"
    }
  }
```

## 第三方库

图像处理：

- Pica：https://github.com/nodeca/pica
- Blurify：https://github.com/JustClear/blurify
- Cropper.js：https://github.com/fengyuanchen/cropperjs
- CamanJS：https://github.com/meltingice/CamanJS/
- Sharp：https://sharp.nodejs.cn/install

## 页面

### 首页：MainPage

展示信息：

- 图库信息，包括图库数量
- 图片信息，包括图片数量
- 可视化图片上传日期

------



### 图库页面：GalleryPage

渲染所有的图库。

------



### 图片页面：PhotoPage

渲染图库里面的图片。



------

#### 必要参数

##### name

- name：当前图库的名称



### 图片详细页面：PhotoInfo

展示图片的详细信息。



------

#### 必要参数

##### name

- name：图库的名称

##### itemName

- itemName：当前图片的名称
