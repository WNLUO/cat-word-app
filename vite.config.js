import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',  // 使用相对路径
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3001,
    strictPort: false
  },
  build: {
    rollupOptions: {
      output: {
        // 使用相对路径引用资源
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1)
          if (/png|jpe?g|svg|gif|ico|webp|avif/.test(extType)) {
            extType = 'img'
          } else if (/woff|woff2|eot|ttf|otf/.test(extType)) {
            extType = 'fonts'
          } else if (/mp3|wav|ogg|webm|mp4/.test(extType)) {
            extType = 'media'
          }
          return `assets/${extType}/[name][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  }
})
