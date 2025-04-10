import request from '@/utils/request'
// 讯飞api
export default function chatWithXunfei(data: any) {
   return request({
      method: 'post',
      url: '/api/chat',
      data
   })
};

// 新的流式处理函数
export function createStreamConnection(message: string) {
   // 直接返回 EventSource 对象,该API必须搭配get请求
   // encodeURIComponent:将message里的￥&？符号转换成对应16进制编码
   return new EventSource(`/api/chat/stream?message=${encodeURIComponent(message)}`);
}

export function onlineSearch(isSure: boolean) {
   return request({
      method: 'get',
      url: `/api/chat/onlineSearch?isSure=${isSure}`
   })
}

export function getAllContent() {
   return request({
      method: 'get',
      url: '/api/chat/getAllContent'
   })
}

export function addToAllContent(data: any) {
   return request({
      method: 'post',
      url: '/api/chat/addToAllContent',
      data
   })
}

export function getContent(id: any) {
   return request({
      method: 'get',
      url: `/api/chat/getContent?id=${id}`
   })
}

export function updateContent(data: any) {
   return request({
      method: 'put',
      url: '/api/chat/updateContent',
      data
   })
}
