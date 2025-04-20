const routes = [
    {
        path: '/',
        name: 'Home',
        title: '首页',
        component: () => import('../pages/Home/HomePage.vue'),
    },
    {
        path: '/gallery',
        name: 'Gallery',
        title: '图库',
        component: () => import('../pages/Gallery/GalleryPage.vue'),
        // redirect: '/gallery',
        // children: []
    },
    {
        path: '/photo',
        name: 'Photo',
        title: '图片',
        component: () => import('../pages/Gallery/PhotoPage.vue'),
    },
    {
        path: '/photoinfo',
        name: 'PhotoInfo',
        title: '图片信息',
        component: () => import('../pages/Gallery/PhotoInfo.vue'),
    },
    {
        path: '/export',
        name: 'Export',
        title: '导入导出',
        component: () => import('../pages/Export/ExportPage.vue'),
    },
    {
        path: '/tools',
        name: 'Tools',
        title: '工具',
        component: () => import('../pages/Tools/ToolsPage.vue'),
    },
    {
        path: '/setting',
        name: 'Setting',
        title: '设置',
        component: () => import('../pages/Setting/SettingPage.vue'),
    },
    {
      path: '/tools/AdjustImageSize',
      name: 'AdjustImageSize',
      title: '调整图片大小',
      component: () => import('../pages/Tools/AdjustImageSize.vue'),
    },
    {
      path: '/tools/ImageFormatConverter',
      name: 'ImageFormatConverter',
      title: '图片格式转换',
      component: () => import('../pages/Tools/ImageFormatConverter.vue'),
    },
    {
      path: '/tools/CompressImage',
      name: 'CompressImage',
      title: '图片压缩',
      component: () => import('../pages/Tools/CompressImage.vue'),
    },
    {
      path: '/tools/BatchRename',
      name: 'BatchRename',
      title: '批量重命名',
      component: () => import('../pages/Tools/BatchRename.vue'),
    },
    {
      path: '/search',
      name: 'Search',
      title: '搜索',
      component: () => import('../pages/Search/index.vue'),
    }
]

export default routes