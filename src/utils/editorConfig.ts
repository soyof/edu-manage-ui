import { getRandom } from './utils'
import services from '@/utils/services'

// 图片上传处理函数
export const imageUploadFn = (blobInfo: any, _progress: any) => new Promise((resolve, reject) => {
  const formData = new FormData()
  formData.append('image', blobInfo.blob())
  services.upload('/api/uploadImage', formData).then((res: any) => {
    resolve(`/api/previewImage?filename=${res.url}`)
  }).catch((err: any) => {
    reject(err)
  })
  // resolve('http://pic.sc.chinaz.com/files/pic/pic9/202005/apic25209.jpg')
})

// 编辑器基本配置
export const getBaseConfig = () => {
  return {
    promotion: false,
    license_key: 'gpl',
    width: '100%',
    menubar: false,
    branding: false, // 关闭底部官网提示
    statusbar: true,
    autosave_ask_before_unload: false, // 阻止有内容时浏览器阻塞行为
    draggable_modal: true, // 模态框允许拖动
    toolbar_sticky: false, // 粘性工具栏
    toolbar_mode: 'sliding', // sliding生效条件toolbar必须为字符串,且有'|'区分,不能为数组
    font_size_formats: '12px 14px 16px 18px 20px 22px 24px 26px 36px 48px 56px',
    line_height_default: 1.5,
    line_height_formats: '1 1.1 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 2 3 4 5 12px 14px 16px 18px 20px 22px 24px 26px 36px 48px 56px',
    language: 'zh_CN',
    language_url: '/tinymce/langs/zh_CN.js',
    quickbars_selection_toolbar: 'bold italic underline strikethrough blockquote link',
    quickbars_insert_toolbar: false,
    content_style: 'body { font-family:Arial,sans-serif; font-size:14px; margin: 8px; padding: 0 } p { margin: 4px 0; padding: 0 }',
    font_family_formats: "微软雅黑='微软雅黑'; 宋体='宋体'; 黑体='黑体'; 仿宋='仿宋'; 楷体='楷体'; 隶书='隶书'; 幼圆='幼圆'; 方正舒体='方正舒体'; 方正姚体='方正姚体'; 等线='等线'; 华文彩云='华文彩云'; 华文仿宋='华文仿宋'; 华文行楷='华文行楷'; 华文楷体='华文楷体'; 华文隶书='华文隶书'; Andale Mono=andale mono,times; Arial=arial; Arial Black=arial black;avant garde; Book Antiqua=book antiqua;palatino; Comic Sans MS=comic sans ms; Courier New=courier new;courier; Georgia=georgia; Helvetica=helvetica; Impact=impact;chicago; Symbol=symbol; Tahoma=tahoma;arial; sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms; Verdana=verdana;geneva; Webdings=webdings; Wingdings=wingdings",
    plugins: 'importcss image preview autolink directionality fullscreen link charmap advlist lists wordcount help quickbars emoticons wordcount code',
    toolbar: 'undo redo ltr rtl blocks fontfamily fontsize bold italic underline strikethrough subscript superscript align blockquote numlist bullist link lineheight outdent indent forecolor backcolor removeformat charmap emoticons image fullscreen preview code empty wordcount',
    textpattern_patterns: [
      { start: '*', end: '*', format: 'italic' },
      { start: '**', end: '**', format: 'bold' },
      { start: '#', format: 'h1' },
      { start: '##', format: 'h2' },
      { start: '###', format: 'h3' },
      { start: '####', format: 'h4' },
      { start: '#####', format: 'h5' },
      { start: '######', format: 'h6' },
      { start: '1. ', cmd: 'InsertOrderedList' },
      { start: '* ', cmd: 'InsertUnorderedList' },
      { start: '- ', cmd: 'InsertUnorderedList' }
    ],
    paste_data_images: true,
    images_upload_handler: imageUploadFn,
    image_advtab: false, // 为上传图片窗口添加高级属性 需引入插件image
    setup: (editor: any) => { // 初始化前执行
      // 监听鼠标按下事件
      editor.on('keydown', (e: any) => {
        if (e.keyCode === 9) {
          if (e.shiftKey) {
            editor.execCommand('Outdent')
          } else {
            editor.execCommand('Indent')
          }
          e.preventDefault()
          e.stopPropagation()
        }
      })

      // 注册清空图标（方式1：使用SVG）
      editor.ui.registry.addIcon('clear-content', `
        <svg viewBox="0 0 1024 1024" width="20" height="20">
          <path d="M899.1 869.6l-53-305.6H864c14.4 0 26-11.6 26-26V346c0-14.4-11.6-26-26-26H618V138c0-14.4-11.6-26-26-26H432c-14.4 0-26 11.6-26 26v182H160c-14.4 0-26 11.6-26 26v192c0 14.4 11.6 26 26 26h17.9l-53 305.6c-0.3 1.5-0.4 3-0.4 4.4 0 14.4 11.6 26 26 26h723c1.5 0 3-0.1 4.4-0.4 14.2-2.4 23.7-15.9 21.2-30zM204 390h272V182h72v208h272v104H204V390z m468 440V674c0-4.4-3.6-8-8-8h-48c-4.4-0-8 3.6-8 8v156H416V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H202.8l45.1-260H776l45.1 260H672z"/>
        </svg>
      `)

      // 注册清空内容按钮
      editor.ui.registry.addButton('empty', {
        icon: 'clear-content', // 使用上面注册的图标
        tooltip: '清空内容',
        onAction: () => {
          editor.setContent('')
        }
      })
    }
  }
}

// 生成唯一编辑器ID
export const generateEditorId = (id?: string) => {
  return id || `editor_${new Date().getTime()}_${getRandom()}`
}

// TinyMCE脚本源
export const TINYMCE_SCRIPT_SRC = '/tinymce/tinymce.min.js'
