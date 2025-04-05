import request from '@/utils/request'

export function homeShowPicture() {
    return request({
        url: '/api/picture/homeShowPicture',
        method: 'get',
    })
}

export function isLiked(data: any) {
    return request({
        url: '/api/picture/updateLikeStatus',
        method: 'put',
        data
    })
}

export function upLoadPicture(data: any) {
    return request({
        url: '/api/picture/uploadPicture',
        method: 'post',
        data
    })
}
