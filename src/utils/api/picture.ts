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

export function getLikedList() {  // 获取数据的格式:[{date:日期1,info:[{id:id,url:地址},{id:id,url:地址}]},{date:日期2,info:[{id:id,url:地址},{id:id,url:地址}]}]
    return request({
        url: '/api/picture/getLikedList',
        method: 'get',
    })
}
 
export function addToLikedList(data: any) {  // 传递的数据格式:{date:日期,url:地址,id:id}
    return request({
        url: '/api/picture/addToLikedList',
        method: 'post',
        data
    })
}

export function deleteFromLikedList(data: any) {  // 传递的数据格式:{id:id}
    return request({
        url: '/api/picture/deleteFromLikedList',
        method: 'delete',
        data
    })
}
