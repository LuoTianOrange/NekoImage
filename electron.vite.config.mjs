import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
// 使用 Tailwind CSS
import tailwind from 'tailwindcss'
// 自动添加浏览器前缀
import autoprefixer from 'autoprefixer'
// import bm from 'builtin-modules'
/**
 * @typedef {A = import('vite').UserConfig.plugins} A
 */

export default defineConfig({
  base: './',
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['electron-store']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: 'es',
          entryFileNames: '[name].mjs'
        }
      }
    }
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
