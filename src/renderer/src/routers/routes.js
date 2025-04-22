const routes = [
    {
        path: '/',
        name: 'Home',
        title: '首页',
        component: () => import('../pages/Home/HomePage.vue'),
        meta: { menuIndex: '1' },
    },
    {
        path: '/gallery',
        name: 'Gallery',
        title: '图库',
        component: () => import('../pages/Gallery/GalleryPage.vue'),
        meta: { menuIndex: '2' }
    },
    {
        path: '/photo',
        name: 'Photo',
        title: '图片',
        component: () => import('../pages/Gallery/PhotoPage.vue'),
        meta: { menuIndex: '2' }
    },
    {
        path: '/photoinfo',
        name: 'PhotoInfo',
        title: '图片信息',
        component: () => import('../pages/Gallery/PhotoInfo.vue'),
        meta: { menuIndex: '2' }
    },
    {
        path: '/tools',
        name: 'Tools',
        title: '工具',
        component: () => import('../pages/Tools/ToolsPage.vue'),
        meta: { menuIndex: '4' },
    },
    {
        path: '/setting',
        name: 'Setting',
        title: '设置',
        component: () => import('../pages/Setting/SettingPage.vue'),
        meta: { menuIndex: '5' },
    },
    {
      path: '/tools/AdjustImageSize',
      name: 'AdjustImageSize',
      title: '调整图片大小',
      component: () => import('../pages/Tools/AdjustImageSize.vue'),
      meta: { menuIndex: '4' },
    },
    {
      path: '/tools/ImageFormatConverter',
      name: 'ImageFormatConverter',
      title: '图片格式转换',
      component: () => import('../pages/Tools/ImageFormatConverter.vue'),
      meta: { menuIndex: '4' },
    },
    {
      path: '/tools/CompressImage',
      name: 'CompressImage',
      title: '图片压缩',
      component: () => import('../pages/Tools/CompressImage.vue'),
      meta: { menuIndex: '4' },
    },
    {
      path: '/tools/BatchRename',
      name: 'BatchRename',
      title: '批量重命名',
      component: () => import('../pages/Tools/BatchRename.vue'),
      meta: { menuIndex: '4' },
    },
    {
      path: '/tools/BatchAddSuffix',
      name: 'BatchAddSuffix',
      title: '批量添加后缀',
      component: () => import('../pages/Tools/BatchAddSuffix.vue'),
      meta: { menuIndex: '4' },
    },
    {
      path: '/search',
      name: 'Search',
      title: '搜索',
      component: () => import('../pages/Search/index.vue'),
      meta: { menuIndex: '3' },
    }
]

export default routes