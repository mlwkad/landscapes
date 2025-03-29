import request from '@/utils/request'

export default function login(data: any) {
    return request({
        url: '/api/login',
        method: 'post',
        data
    })
}
