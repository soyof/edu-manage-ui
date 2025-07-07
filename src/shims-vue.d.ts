/* eslint-disable */
// 这个文件用于声明Vue组件的类型，解决TypeScript无法识别.vue文件的问题

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
} 
