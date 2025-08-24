# 教育管理系统前端

这是一个基于 Vue 3 + TypeScript + Vite 开发的教育管理系统前端项目。该系统提供了完整的教育资源管理功能，包括用户管理、论文管理、专利管理、动态管理、通知管理等模块。

## 项目特性

- 🚀 **现代化技术栈**：基于 Vue 3、TypeScript 和 Vite 构建
- 🎨 **精美 UI**：使用 Element Plus 组件库，提供美观的用户界面
- 📊 **数据可视化**：集成 ECharts 提供强大的数据图表展示
- 📝 **富文本编辑**：集成 TinyMCE 编辑器，支持复杂内容编辑
- 🔄 **状态管理**：使用 Pinia 进行状态管理，支持持久化存储
- 🌙 **深色模式**：支持明暗主题切换，提升用户体验
- 📱 **响应式设计**：适配不同尺寸的设备屏幕
- 🔒 **权限控制**：基于角色的访问控制系统
- 🔍 **全局搜索**：快速查找系统资源
- 📋 **拖拽排序**：支持用户列表拖拽排序功能
- 📦 **代码分割**：按需加载组件，优化首屏加载速度
- 🗜️ **Gzip 压缩**：减小文件体积，提升加载速度

## 功能模块

### 用户管理

- 用户信息管理
- 用户权限控制
- 用户排序设置

### 论文管理

- 论文信息录入与编辑
- 论文发布状态管理
- 论文投稿状态管理
- 论文详情展示

### 专利管理

- 专利信息录入与编辑
- 专利状态管理
- 专利详情展示

### 动态管理

- 实验室动态发布
- 动态信息编辑
- 动态展示

### 通知管理

- 通知发布
- 通知编辑
- 通知展示

### 字典管理

- 系统字典维护
- 字典项管理

## 路由缓存机制

本项目实现了基于路由名称的组件缓存机制，解决了以下几个问题：

1. 同一组件不同参数导致的缓存问题
2. 标签页切换时保持状态
3. 支持按需刷新组件

### 实现原理

1. **动态缓存控制**：

   - 使用 Vue 的内置 keep-alive 组件的 include 属性控制缓存
   - 通过动态计算 cachedViews 列表来决定哪些组件需要被缓存
   - 当需要刷新组件时，从缓存列表中排除该组件

2. **动态组件 key**：

   - 使用路由名称和路径的组合作为组件 key
   - 当需要刷新时，在 key 中添加时间戳强制组件重新渲染

3. **刷新机制**：
   - 通过 Pinia store 中的 refreshMap 记录需要刷新的组件
   - 提供 refreshTab 方法支持按需刷新指定路径的组件

### 使用方法

**缓存组件**：
组件默认会被缓存，无需额外配置。

**刷新组件**：

```js
// 在组件内刷新当前组件
import { useTabsStore } from '@/stores/menuTabs'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useTabsStore()

// 刷新当前页面
const refreshCurrent = () => {
  store.refreshTab(route.fullPath)
}
```

**右键菜单刷新**：
右键点击标签页，选择"刷新当前"选项可刷新对应组件。

## 项目优化

### 性能优化

- **代码分割**：使用动态导入实现路由懒加载和组件按需加载
- **Gzip 压缩**：开启 Gzip 压缩减小文件体积，提升加载速度
- **缓存策略**：合理使用组件缓存，减少不必要的重渲染
- **Tree-Shaking**：移除未使用的代码，减小打包体积

### 用户体验优化

- **骨架屏**：加载过程中显示骨架屏，减少用户等待感
- **过渡动画**：添加页面切换和组件加载的平滑过渡动画
- **错误处理**：全局异常捕获和友好的错误提示
- **加载状态**：各操作过程中的加载状态反馈

## 项目结构

```
edu-manage-ui/
├── public/                # 静态资源
│   └── tinymce/           # TinyMCE 编辑器资源
├── src/
│   ├── assets/            # 项目资源文件
│   ├── components/        # 公共组件
│   ├── dic/               # 字典配置
│   ├── hooks/             # 自定义钩子
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── .env.development       # 开发环境配置
├── .env.production        # 生产环境配置
├── vite.config.ts         # Vite 配置
└── tsconfig.json          # TypeScript 配置
```

## 开发指南

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发环境启动

```bash
npm run dev
```

### 构建生产环境

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 技术栈

- **核心框架**：Vue 3.5.x
- **类型系统**：TypeScript 5.8.x
- **构建工具**：Vite 6.3.x
- **UI 组件库**：Element Plus 2.10.x
- **状态管理**：Pinia 3.0.x
- **路由管理**：Vue Router 4.5.x
- **HTTP 客户端**：Axios 1.9.x
- **图表库**：ECharts 6.0.x
- **富文本编辑器**：TinyMCE 6.x
- **CSS 预处理器**：Less 4.3.x
- **拖拽组件**：vuedraggable 4.1.x
- **动画库**：animate.css 4.1.x

## 浏览器兼容性

- Chrome (最近两个版本)
- Firefox (最近两个版本)
- Edge (最近两个版本)
- Safari (最近两个版本)

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

[MIT](LICENSE)
