import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import WindCSS from 'vite-plugin-windicss'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 在Vite 7中设置process.env.NODE_ENV
  process.env.NODE_ENV = mode === 'production' ? 'production' : 'development'
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      WindCSS(),
      // 根据环境变量决定是否启用压缩
      env.VITE_USE_COMPRESSION === 'true' && viteCompression({
        verbose: true, // 是否在控制台输出压缩结果
        disable: false, // 是否禁用压缩
        threshold: 10240, // 体积大于threshold才会被压缩，单位b，默认10kb
        algorithm: 'gzip', // 压缩算法
        ext: '.gz', // 生成的压缩包后缀
        deleteOriginFile: false // 是否删除原文件
      })
    ].filter(Boolean), // 过滤掉false值
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
      host: '0.0.0.0',
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
      // 根据环境变量决定是否生成sourcemap
      sourcemap: env.VITE_SOURCEMAP === 'true',
      // 设置浏览器兼容性目标，Vite 7默认为'baseline-widely-available' 对应Chrome 107+, Firefox 104+, Safari 16.0+
      // 如需支持更旧浏览器，可以设置为'esnext'或其他具体值
      target: 'esnext',
      // 生产环境构建配置
      minify: 'terser', // 使用terser作为代码压缩器，Vite 7也支持esbuild
      // 调整大型块的警告阈值（默认为500kb）
      chunkSizeWarningLimit: 1200,
      terserOptions: {
        compress: {
          // 根据环境变量决定是否移除console和debugger
          drop_console: env.VITE_DROP_CONSOLE === 'true',
          drop_debugger: env.VITE_DROP_CONSOLE === 'true'
        }
      },
      // 分块策略
      rollupOptions: {
        output: {
          // 静态资源分类打包
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          // 拆分第三方库
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            elementPlus: ['element-plus'],
            echarts: ['echarts']
          }
        }
      }
    }
  }
})
