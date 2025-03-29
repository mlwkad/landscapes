// 定义缓存名称，可以在版本更新时更改，以确保浏览器使用新的缓存
const STATIC_CACHE = 'static-cache-v1'; // 用于预缓存的静态资源
const API_CACHE = 'api-cache-v1';       // 用于API响应
const IMAGE_CACHE = 'image-cache-v1';   // 用于图片资源

// 定义需要缓存的资源列表
//打包完成后,换成dist文件里的文件(一般只缓存css,less,js,图片)
const URLS_TO_CACHE = [
    //在 Service Worker 中不能使用 @ 别名，因为 Service Worker 是在浏览器层面运行的，它需要使用实际的URL路径
    '/assets/styles.less',
    '/assets/property.less',
    '/assets/img/箭头.svg',
];

// 安装事件：当 Service Worker 首次安装时触发
// 这是缓存静态资源的最佳时机
self.addEventListener('install', (event: any) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('开始缓存文件...');
                // 将文件列表加入缓存
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// 处理网络请求的策略
// 包括静态资源请求和 API 请求
self.addEventListener('fetch', (event: any) => {
    const url = new URL(event.request.url);

    // 处理图片API请求 - 使用缓存优先策略
    if (url.pathname.includes('/api/picture/homeShowPicture')) {
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(event.request)
                        .then(response => {
                            if (!response || response.status !== 200) {
                                return response;
                            }

                            const responseToCache = response.clone();
                            caches.open(IMAGE_CACHE).then(cache => {
                                cache.put(event.request, responseToCache);
                                console.log('图片API响应已缓存');
                            });

                            return response;
                        });
                })
        );
    }
    // 如果是其他 API 请求（axios 请求）
    else if (url.pathname.includes('/api/')) {
        event.respondWith(
            // 网络优先策略：先尝试网络请求，失败后再使用缓存
            fetch(event.request)
                .then(response => {
                    // 请求成功，创建响应副本并缓存
                    const responseClone = response.clone();
                    caches.open(API_CACHE).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // 网络请求失败，尝试返回缓存
                    return caches.match(event.request);
                })
        );
    }
    // 处理图片资源请求 (通常以图片扩展名结尾)
    else if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    // 返回缓存的同时，在后台更新缓存
                    const fetchPromise = fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse && networkResponse.status === 200) {
                                const responseToCache = networkResponse.clone();
                                caches.open(IMAGE_CACHE).then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                            }
                            return networkResponse;
                        })
                        .catch(() => { /* 忽略网络错误 */ });

                    // 如果有缓存，立即返回缓存
                    if (cachedResponse) {
                        // 在后台更新缓存
                        fetchPromise;
                        return cachedResponse;
                    }

                    // 没有缓存，等待网络响应
                    return fetchPromise;
                })
        );
    }
    else {
        // 对于静态资源，使用缓存优先策略
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // 如果在缓存中找到响应，则返回缓存的响应
                    if (response) {
                        return response;
                    }
                    // 如果缓存中没有，则从网络获取
                    return fetch(event.request)
                        .then(networkResponse => {
                            if (!networkResponse || networkResponse.status !== 200) {
                                return networkResponse;
                            }

                            // 只缓存成功的响应
                            const responseToCache = networkResponse.clone();
                            caches.open(STATIC_CACHE).then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                            return networkResponse;
                        });
                })
        );
    }
});

// 激活事件：当新的 Service Worker 取得控制权时触发
// 通常用于清理旧版本的缓存
self.addEventListener('activate', (event: any) => {
    const currentCaches = [STATIC_CACHE, API_CACHE, IMAGE_CACHE]; // 需要保留的缓存版本

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 删除不在白名单中的旧缓存
                    if (currentCaches.indexOf(cacheName) === -1) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});