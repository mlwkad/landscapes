//防止到不到svg模块
declare module '*.svg' {
    const content: string
    export default content
  }