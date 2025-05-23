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
    port: 3000
  }
})
