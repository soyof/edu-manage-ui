declare module '@wangeditor/editor-for-vue' {
  import { ComponentOptions } from 'vue'

  export const Editor: ComponentOptions
  export const Toolbar: ComponentOptions
}

declare module '@wangeditor/editor' {
  export interface IDomEditor {
    getHtml: () => string
    getText: () => string
    setHtml: (html: string) => void
    disable: () => void
    enable: () => void
    destroy: () => void
  }

  export interface IEditorConfig {
    placeholder: string
    readOnly: boolean
    autoFocus: boolean
    MENU_CONF?: Record<string, any>
  }

  export interface IToolbarConfig {
    toolbarKeys: string[]
    excludeKeys: string[]
  }

  export interface IMenuGroup {
    key: string
    title: string
    iconSvg?: string
    menuKeys: string[]
  }
}
