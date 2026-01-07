import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    strictPort: false  // 端口被占用时自动尝试下一个可用端口
  }
})
