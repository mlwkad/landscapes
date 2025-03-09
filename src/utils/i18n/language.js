// npm install vue-i18n@next
// i18n-ally 
// json文件放语言 
// 配置i18n
// 在main.js中引入
//.vscode/settings.json 配置i18n-ally   
import { createI18n } from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'

const USEI18N = createI18n({
    legacy: false,  //使用组合式API
    locale: localStorage.getItem('language') || 'zh',
    messages: {
        zh: zh,
        en: en
    }
})

export default USEI18N




