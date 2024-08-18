import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
// import bm from 'builtin-modules'
/**
 * @typedef {A = import('vite').UserConfig.plugins} A
 */

export default defineConfig({
  base: './',
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue(),
      // [
      //   "import",
      //   {
      //     libraryName: '@icon-park/vue',
      //     libraryDirectory: 'es/icons',
      //     camel2DashComponentName: false // default: true,
      //   }
      // ]
    ]
  },
  build: {
    rollupOptions: {
      // external: bm.filter(module => module !== 'path'),
    },
  },
})
