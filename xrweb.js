(async () => {
    // try {
    //     const response = await fetch('https://apps.8thwall.com/xrweb?appKey=1JQhYDLd1E7p8jnKth96BNIyfd0zRIqfMejyXzj0shJjcFMiSIybdWPFDzGq95nagyx2ri');
    //     const scriptCode = await response.text();
    //     let scriptOrCSStDom = document.createElement("script")
    //     scriptOrCSStDom.type = "text/javascript";
    //     scriptOrCSStDom.src = `https://metaverse-webar.oss-cn-hangzhou.aliyuncs.com/PluginRepositories/8thwall/${window?._xr8?.Cenvironment ?? "Dev"}/xrweb?3FappKey=3D1JQhYDLd1E7p8jnKth96BNIyfd0zRIqfMejyXzj0shJjcFMiSIybdWPFDzGq95nagyx2ri`;
    //     document.head.appendChild(scriptOrCSStDom);
    //     eval(scriptCode);

    // } catch (error) {
    //     console.error('请求外网 JS 库出现异常：', error);
    //     // 处理异常的逻辑
    // }


    self.addEventListener('fetch', function (event) {
        if (event.request.url.endsWith('.js')) {
            event.respondWith(
                fetch(event.request).then(function (response) {
                    // 在这里可以获取到请求返回的内容
                    console.log('JS file loaded:', response.url);
                    return response;
                })
            );
        }
    });

})();