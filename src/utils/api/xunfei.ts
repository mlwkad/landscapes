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