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
        path: '/setting',
        name: 'Setting',
        title: '设置',
        component: () => import('../pages/Setting/SettingPage.vue'),
    }
]

export default routes