import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import WindCSS from 'vite-plugin-windicss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), WindCSS()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        charset: false,
        additionalData: `@import '@/styles/variable.less';`
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      // 代理所有 /api 前缀的请求到目标服务器
      '/api': {
        target: 'http://127.0.0.1:3100', // 后端服务地址
        changeOrigin: true, // 支持跨域
        rewrite: (path) => path.replace(/^\/api/, '/eduServer/manage'), // 重写路径，将/api/login转换为/eduServer/manage/login
        secure: false, // 如果是https接口，需要配置这个参数
        ws: true // 是否代理 websockets
      }
    }
  },
  build: {
    sourcemap: true
  }
})
