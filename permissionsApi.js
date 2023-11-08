(function (root, factory) {
    "use strict";
    if (typeof exports === "object" && typeof module === "object") {
        // CommonJS (Node.js) environment
        module.exports = factory(exports);
    } else if (typeof define === "function" && define.amd) {
        // AMD (RequireJS) environment
        define(["exports"], factory);
    } else {
        // Browser global (root is the global context, e.g., window)
        factory(root.permissions = {});
    }
}(typeof globalThis !== "undefined" ? globalThis : this, (function (exports) {

    exports.init = class init {
        _useCan = false;
        loadJSOrCSS = [];
        scriptOrCSSTree = [];
        _labelTypeName = ["scrip", "link"];
        _permissionsList = [
            { type: "camera", api: "mediaDevices", method: "_startGetUserMedia", needKey: "stream" },
            { type: "geolocation", api: "geolocation", method: "_startWatchPosition", needKey: "{ coords: { latitude, longitude, accuracy } }" },
            { type: "magnetometer", api: "deviceorientation", method: "_startCompassListener", needKey: "{ compass, beta }" }
        ];

        _unityInstance = {};
        _deviceAuthorization = {};
        _permissions = {};
        _errors = () => { };

        #_cameraStream = null;
        _debugger = false;

        _compassAndLocation = [
            {
                method: "getCompass",
                arguments: {
                    direction: "0.33",
                    beta: "0.33"
                }
            },
            {
                method: "getChooseLocation",
                arguments: {
                    accuracy: "0.33",
                    latitude: "0.33",
                    longitude: "0.33"
                }
            }
        ]

        constructor(config, callback) {

            this.loadJSOrCSS = config?.loadJSOrCSS ?? [
                {
                    src: "https://unpkg.com/vconsole@latest/dist/vconsole.min.js",
                    type: 1,
                },
                {
                    src: "https://cdnjs.cloudflare.com/ajax/libs/mui/3.7.1/js/mui.min.js",
                    type: 1,
                },
                {
                    src: "https://cdnjs.cloudflare.com/ajax/libs/mui/3.7.1/css/mui.min.css",
                    type: 2,
                }
            ];

            this._unityInstance = {
                target: config?.unityInstance?.target ?? window?.unityInstance ?? {},
                sendMessage: {
                    gameObject: config?.unityInstance?.sendMessage?.gameObject ?? "UnityJsBridge",
                    methodName: config?.unityInstance?.sendMessage?.methodName ?? "JsToUnityTrigger",
                    timer: config?.unityInstance?.sendMessage?.timer ?? 1000,
                }
            }

            this._deviceAuthorization = {
                confirm: {
                    message: config?.deviceAuthorization?.confirm?.message ?? `"${window.location.href}"想要访问运动与方向`,
                    title: config?.deviceAuthorization?.confirm?.title ?? `提示`,
                    btnValue: config?.deviceAuthorization?.confirm?.btnValue ?? ['取消', '允许'],
                    callback: config?.deviceAuthorization?.confirm?.callback,
                    type: config?.deviceAuthorization?.confirm?.type ?? "div"
                },
                alert: {
                    message: config?.deviceAuthorization?.alert?.message ?? "请使用安卓或苹果设备打开！",
                    title: config?.deviceAuthorization?.alert?.title ?? "提示",
                    btnValue: config?.deviceAuthorization?.alert?.btnValue ?? ["确定"],
                    callback: config?.deviceAuthorization?.alert?.callback,
                    type: config?.deviceAuthorization?.alert?.type ?? "div"
                }
            }

            this._permissions = config.permissions;
            // config.permissions.mediaDevices?.enabled ? config.permissions.mediaDevices?.enabled == true : null;

            this._errors = config.errors;

            this._debugger = config.debugger;

            this.loadNeedJsOrCSS(callback);
        }

        loadNeedJsOrCSS(callback) {
            const { _checkLoadType, _isLoadComplete, _execute, loadJSOrCSS, scriptOrCSSTree, _labelTypeName } = this;
            for (const { src, type } of loadJSOrCSS) {
                let result = _checkLoadType({ src, type });
                scriptOrCSSTree.push(result)
                document.head.appendChild(result);
                _isLoadComplete({ scriptOrCSSTree, _labelTypeName, loadJSOrCSS }, ({ success, type }) => {
                    if (success) {
                        setTimeout(() => {
                            _execute.bind(this)(this._permissions).then(_ => {
                                this._debugger ? new window.VConsole() : null, 500;
                                callback({ success });
                            })
                        }, 1000);
                    }
                })
            }
        }

        async _execute(permissions) {
            const that = this;
            const u = navigator.userAgent;
            const { _startWatchPosition, _startCompassListener, _startGetUserMedia, _permissionsList, _deviceAuthorization: { confirm: muiConfirm, alert: muiAlert }, _permissions: { mediaDevices } } = that;
            if (u.indexOf("Android") > -1 || u.indexOf("Linux") > -1 || u.indexOf("Windows Phone") > -1) {
                for (const [apis, { enabled, successResults }] of Object.entries(permissions)) {
                    enabled == true ? _permissionsList.filter(async ({ api, method }) => apis == api ? await that[method].bind(that)((...arg) => successResults(arg)) : null) : null;
                }

                // await _startWatchPosition.bind(that)(({ coords: { latitude, longitude, accuracy } }) => {
                //     if (latitude && longitude) {
                //         that._compassAndLocation[1].arguments = { longitude: String(longitude), latitude: String(latitude), accuracy: String(accuracy) };
                //     }
                // })

                // await _startCompassListener.bind(that)(({ compass, beta }) => {
                //     if (compass) {
                //         that._compassAndLocation[0].arguments = { direction: String(compass), beta: String(beta) };
                //     }
                // })

                // await _startGetUserMedia.bind(that)(stream => {
                //     const checkCanvasDom = (canvas) => document.querySelector(canvas) ? { canvas: document.querySelector(canvas), type: 0 } : document.querySelector("canvas") ? { canvas: document.querySelector(canvas), type: 0 } : { canvas: document.createElement("canvas"), type: 1 };
                //     const checkVideoDom = () => document.querySelector("video") ? { video: document.querySelector("video"), type: 0 } : { video: document.createElement("video"), type: 1 };
                //     if (!mediaDevices) {
                //         const canvasElement = document.createElement("canvas");
                //         canvasElement.style.display = "block";
                //         document.body.appendChild(canvasElement);
                //         const ctx = canvasElement.getContext('2d');

                //         const videoElement = document.createElement("video");
                //         videoElement.srcObject = stream;
                //         videoElement.onloadedmetadata = () => {
                //             videoElement.play();
                //             videoElement.style.display = "none";
                //             canvasElement.width = window.innerWidth;
                //             canvasElement.height = window.innerHeight;
                //         }
                //         document.body.appendChild(videoElement);

                //         setInterval(() => ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height), 15);
                //     } else {
                //         if (mediaDevices) {
                //             const canvasResult = checkCanvasDom(mediaDevices.canvas);
                //             const videoResult = checkVideoDom();
                //             const canvasElement = canvasResult.canvas;
                //             canvasElement.style.display = "block";
                //             const ctx = canvasElement.getContext('2d');

                //             const videoElement = videoResult.video;
                //             videoElement.srcObject = stream;
                //             videoElement.onloadedmetadata = () => {
                //                 videoElement.play();
                //                 videoElement.style.display = "none";
                //                 canvasElement.width = window.innerWidth;
                //                 canvasElement.height = window.innerHeight;
                //             }
                //             videoResult.type == 1 ? document.body.appendChild(videoElement) : null;
                //             canvasResult.type == 1 ? document.body.appendChild(canvasElement) : null;
                //             setInterval(() => ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height), 15);
                //         } else {
                //             return that._errorsAlert(`缺少mediaDevices，请检查参数与mediaDevices`, "提示", `缺少mediaDevices，请检查参数与mediaDevices`);
                //         }
                //     }
                // })
                that._useCan = true;
            } else if (u.indexOf("iPhone") > -1) {
                window.mui.confirm(muiConfirm.message, muiConfirm.title, muiConfirm.btnValue, async ({ index, value }) => {
                    if (index == 1) {
                        for (const [apis, { enabled, successResults }] of Object.entries(permissions)) {
                            enabled == true ? _permissionsList.filter(async ({ api, method }) => apis == api ? await that[method].bind(that)((...arg) => successResults(arg)) : null) : null;
                        }
                        // await _startWatchPosition.bind(that)(({ coords: { latitude, longitude, accuracy } }) => {
                        //     if (latitude && longitude) {
                        //         that._compassAndLocation[1].arguments = { longitude: String(longitude), latitude: String(latitude), accuracy: String(accuracy) };
                        //     }
                        // })

                        // await _startCompassListener.bind(that)(({ compass, beta }) => {
                        //     if (compass) {
                        //         that._compassAndLocation[0].arguments = { direction: String(compass), beta: String(beta) };
                        //     }
                        // })

                        // await _startGetUserMedia.bind(that)(stream => {
                        //     const checkCanvasDom = (canvas) => document.querySelector(canvas) ? { canvas: document.querySelector(canvas), type: 0 } : document.querySelector("canvas") ? { canvas: document.querySelector(canvas), type: 0 } : { canvas: document.createElement("canvas"), type: 1 };
                        //     const checkVideoDom = () => document.querySelector("video") ? { video: document.querySelector("video"), type: 0 } : { video: document.createElement("video"), type: 1 };
                        //     if (!mediaDevices) {
                        //         const canvasElement = document.createElement("canvas");
                        //         canvasElement.style.display = "block";
                        //         document.body.appendChild(canvasElement);
                        //         const ctx = canvasElement.getContext('2d');

                        //         const videoElement = document.createElement("video");
                        //         videoElement.srcObject = stream;
                        //         videoElement.onloadedmetadata = () => {
                        //             videoElement.play();
                        //             videoElement.style.display = "none";
                        //             canvasElement.width = window.innerWidth;
                        //             canvasElement.height = window.innerHeight;
                        //         }
                        //         document.body.appendChild(videoElement);

                        //         setInterval(() => ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height), 15);
                        //     } else {
                        //         if (mediaDevices) {
                        //             const canvasResult = checkCanvasDom(mediaDevices.canvas);
                        //             const videoResult = checkVideoDom();
                        //             const canvasElement = canvasResult.canvas;
                        //             canvasElement.style.display = "block";
                        //             const ctx = canvasElement.getContext('2d');

                        //             const videoElement = videoResult.video;
                        //             videoElement.srcObject = stream;
                        //             videoElement.setAttribute('playsinline', true);
                        //             videoElement.setAttribute('autoplay', true);
                        //             videoElement.style.display = "block";
                        //             videoElement.style.top = "0px";
                        //             videoElement.style.left = "0px";
                        //             videoElement.style.width = "2px";
                        //             videoElement.style.height = "2px";
                        //             videoElement.style.position = "fixed";
                        //             videoElement.style.opacity = "0.01";
                        //             videoElement.style.pointerEvents = "none";
                        //             videoElement.style.zIndex = 999;

                        //             videoElement.onloadedmetadata = () => {
                        //                 videoElement.play();
                        //                 canvasElement.width = window.innerWidth;
                        //                 canvasElement.height = window.innerHeight;
                        //             }

                        //             videoResult.type == 1 ? document.body.appendChild(videoElement) : null;
                        //             canvasResult.type == 1 ? document.body.appendChild(canvasElement) : null;
                        //             setInterval(() => ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height), 15);
                        //         } else {
                        //             return that._errorsAlert(`缺少mediaDevices，请检查参数与mediaDevices`, "提示", `缺少mediaDevices，请检查参数与mediaDevices`);
                        //         }
                        //     }
                        // })

                        that._useCan = true;
                        muiConfirm.callback({ index, value: { btnName: muiConfirm.btnValue[index], authorization: that._useCan } });
                    } else {
                        that._useCan = false;
                        muiConfirm.callback({ index, value: { btnName: muiConfirm.btnValue[index], authorization: that._useCan } });
                    }

                }, muiConfirm.type)
            } else {
                window.mui.alert(muiAlert.message, muiAlert.title, muiAlert.btnValue, ({ index, value }) => muiAlert.callback({ index, value: { btnName: muiConfirm.btnValue[index], inform: 'noAndoIos' } }), muiAlert.type);
                return 'noAndoIos'
            }
        }

        _checkLoadType({ src, type }) {
            let scriptOrCSStDom = type == 1 ? document.createElement("script") : document.createElement("link");
            scriptOrCSStDom.type = type == 1 ? "text/javascript" : "text/css";
            scriptOrCSStDom[type == 1 ? "src" : "href"] = src;
            scriptOrCSStDom[type == 1 ? "" : "rel"] = "stylesheet";
            return scriptOrCSStDom;
        }

        _isLoadComplete({ scriptOrCSSTree, _labelTypeName, loadJSOrCSS }, callback) {
            switch (scriptOrCSSTree[scriptOrCSSTree.length - 1].localName) {
                case _labelTypeName[0]:
                    if (loadJSOrCSS.length == scriptOrCSSTree.length) {
                        scriptOrCSSTree[scriptOrCSSTree.length - 1].onload = () => {
                            return callback({ success: true, type: "js" })
                        }
                    }

                    break;
                case _labelTypeName[1]:
                    if (loadJSOrCSS.length == scriptOrCSSTree.length) {
                        scriptOrCSSTree[scriptOrCSSTree.length - 1].onload = () => {
                            return callback({ success: true, type: "css" })
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        checkAuthorization(callback) {
            // 'granted'（已授权）、'denied'（已拒绝） 和 'prompt'（需要用户授权）
            const { _permissionsList, _permissions, _startWatchPosition, _startCompassListener, _startGetUserMedia, _execute } = this;
            const that = this;
            _permissionsList.map(({ type, method, api }, index) => {
                navigator.permissions.query({ name: type }).then(async permissionStatus => {
                    switch (permissionStatus.state) {
                        case 'granted':
                            console.log("type", type, Object.entries(_permissions).every(([apis]) => [type].includes(apis)));
                            Object.entries(_permissions).every(([apis]) => [type].includes(apis)) == true ? callback(true) : callback(false);
                            break;
                        case 'denied': break;
                        case 'prompt':
                            Object.entries(_permissions).filter((item) => item[0] == api ? _execute.bind(that)(new Object({ [item[0]]: item[1] })) : null);

                            // if (_permissionsList[0].type == type) {

                            // } else if (_permissionsList[1].type == type) {
                            //     await _startWatchPosition.bind(this)(({ latitude, longitude, accuracy }) => {
                            //         if (latitude && longitude) {
                            //             this._compassAndLocation[1].arguments = { latitude, longitude, accuracy };
                            //         }
                            //     })
                            // } else if (_permissionsList[2].type == type) {
                            //     await _startCompassListener.bind(that)(({ compass, beta }) => {
                            //         if (compass) {
                            //             that._compassAndLocation[0].arguments = { direction: compass, beta };
                            //         }
                            //     })
                            // }
                            break;
                        default: break;
                    }
                });
            })
        }

        _startCompassListener(callback) {
            let that = this;
            const { _permissions: { deviceorientation: { enabled, successResults } } } = this;
            if (!enabled) return;
            if (!window["DeviceOrientationEvent"]) {
                that._errorsAlert(`当前设备或浏览器不支持获取运动传感器`, "提示", "DeviceOrientation API not available");
                console.warn("DeviceOrientation API not available");
                return;
            }
            let absoluteListener = (e) => {
                if (!e.absolute || e.alpha == null || e.beta == null || e.gamma == null)
                    return;
                let compass = -(e.alpha + e.beta * e.gamma / 90);
                compass -= Math.floor(compass / 360) * 360;
                window.removeEventListener("deviceorientation", webkitListener);
                if (compass) {
                    that._compassAndLocation[0].arguments = { direction: String(compass), beta: String(e.beta) };
                }
                callback({ compass, beta: e.beta });
            };
            let webkitListener = (e) => {
                let compass = e.webkitCompassHeading;
                if (compass != null && !isNaN(compass)) {
                    window.removeEventListener("deviceorientationabsolute", absoluteListener);
                    if (compass) {
                        that._compassAndLocation[0].arguments = { direction: String(compass), beta: String(e.beta) };
                    }
                    callback({ compass, beta: e.beta });
                }
            }

            function addListeners() {
                window.addEventListener("deviceorientationabsolute", absoluteListener);
                window.addEventListener("deviceorientation", webkitListener);
            }

            if (typeof (DeviceOrientationEvent["requestPermission"]) === "function") {
                DeviceOrientationEvent["requestPermission"]()
                    .then(response => {
                        if (response == "granted") {
                            addListeners();
                        } else {
                            that._errorsAlert(`运动传感器获取信息失败`, "提示", "Permission for DeviceMotionEvent not granted");
                            console.warn("Permission for DeviceMotionEvent not granted");
                        }
                    });
            } else {
                addListeners();
            }
        }

        _startWatchPosition(callback) {
            let that = this;
            const { _permissions: { geolocation: { enabled, successResults } } } = this;
            if (!enabled) return;
            if ("geolocation" in navigator) {
                navigator.geolocation.watchPosition(function (position) {
                    const latitude = position.coords.latitude; // 纬度
                    const longitude = position.coords.longitude; // 经度
                    const altitude = position.coords.altitude; // 高度
                    const speed = position.coords.speed; // 速度
                    const heading = position.coords.heading; // 方向
                    const accuracy = position.coords.accuracy; // 米
                    if (latitude && longitude) {
                        that._compassAndLocation[1].arguments = { longitude: String(longitude), latitude: String(latitude), accuracy: String(accuracy) };
                    }
                    callback(position);
                }, function (error) {
                    console.error("获取位置信息失败：" + error.message);
                    that._errorsAlert(`获取位置信息失败`, "提示", error.message);
                }, { enableHighAccuracy: true, maximumAge: 0 });
            } else {
                console.error("当前浏览器不支持Geolocation API");
                that._errorsAlert(`当前设备或浏览器不支持获取位置信息`, "提示", `当前设备或浏览器不支持获取位置信息,不支持Geolocation API`);
            }
        }

        _startGetUserMedia(callback) {
            let that = this;
            const { _disposePicture, _permissions: { mediaDevices: { enabled, successResults } } } = this;
            if (!enabled) return;
            if ("mediaDevices" in navigator) {
                navigator.mediaDevices.getUserMedia(that._permissions?.mediaDevices ?? { video: { facingMode: { exact: "environment" } }, audio: false, }).then(function (stream) {
                    _disposePicture.bind(that)(stream);
                    callback(stream);
                }).catch(function (error) {
                    console.error('获取摄像头失败: ', error);
                    that._errorsAlert(`获取摄像头失败:`, "提示", error.message);
                });
            } else {
                console.error("当前浏览器不支持MediaDevices API");
                that._errorsAlert(`当前设备或浏览器不支持打开媒体设备${Object.entries(that._permissions?.mediaDevices).map(item => item[0]).toString()}`, "提示", `当前设备或浏览器不支持打开媒体设备${Object.entries(that._permissions?.mediaDevices).map(item => item[0]).toString()},不支持MediaDevices API`);
            }
        }

        _disposePicture(stream) {
            const { _permissions: { mediaDevices } } = this;
            const checkCanvasDom = (canvas) => document.querySelector(canvas) ? { canvas: document.querySelector(canvas), type: 0 } : document.querySelector("canvas") ? { canvas: document.querySelector(canvas), type: 0 } : { canvas: document.createElement("canvas"), type: 1 };
            const checkVideoDom = () => document.querySelector("video") ? { video: document.querySelector("video"), type: 0 } : { video: document.createElement("video"), type: 1 };
            if (!mediaDevices) {
                const canvasElement = document.createElement("canvas");
                canvasElement.style.display = "block";
                document.body.appendChild(canvasElement);
                const ctx = canvasElement.getContext('2d');

                const videoElement = document.createElement("video");
                videoElement.srcObject = stream;
                videoElement.setAttribute('playsinline', true);
                videoElement.setAttribute('autoplay', true);
                videoElement.style.display = "block";
                videoElement.style.top = "0px";
                videoElement.style.left = "0px";
                videoElement.style.width = "2px";
                videoElement.style.height = "2px";
                videoElement.style.position = "fixed";
                videoElement.style.opacity = "0.01";
                videoElement.style.pointerEvents = "none";
                videoElement.style.zIndex = 999;



                videoElement.onloadedmetadata = () => {
                    canvasElement.width = window.innerWidth;
                    canvasElement.height = window.innerHeight;
                }
                videoElement.play();

                document.body.appendChild(videoElement);
                setInterval(() => ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height), 15);
            } else {
                if (mediaDevices && mediaDevices.canvas) {
                    const canvasResult = checkCanvasDom(mediaDevices.canvas);
                    const videoResult = checkVideoDom();
                    const canvasElement = canvasResult.canvas;
                    canvasElement.style.display = "block";
                    const ctx = canvasElement.getContext('2d');

                    const videoElement = videoResult.video;
                    videoElement.srcObject = stream;
                    videoElement.setAttribute('playsinline', true);
                    videoElement.setAttribute('autoplay', true);
                    videoElement.style.display = "block";
                    videoElement.style.top = "0px";
                    videoElement.style.left = "0px";
                    videoElement.style.width = "2px";
                    videoElement.style.height = "2px";
                    videoElement.style.position = "fixed";
                    videoElement.style.opacity = "0.01";
                    videoElement.style.pointerEvents = "none";
                    videoElement.style.zIndex = 999;

                    videoElement.onloadedmetadata = () => {
                        canvasElement.width = window.innerWidth;
                        canvasElement.height = window.innerHeight;
                    }
                    videoElement.play();

                    videoResult.type == 1 ? document.body.appendChild(videoElement) : null;
                    canvasResult.type == 1 ? document.body.appendChild(canvasElement) : null;
                    setInterval(() => ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height), 15);
                } else {
                    return that._errorsAlert(`缺少mediaDevices，请检查参数与mediaDevices`, "提示", `缺少mediaDevices，请检查参数与mediaDevices`);
                }
            }
        }

        onStartCamera() {
            const { _startGetUserMedia, _execute, _permissions: { mediaDevices, } } = this;
            // this._disposePicture.bind(this)();
            // _execute.bind(this)({ mediaDevices });
            _startGetUserMedia.bind(this)(() => { })
        }

        onCloseCamera() {
            const video = document.querySelector('#video')
            this.#_cameraStream.getTracks().forEach(track => track.stop());
            video.value.srcObject = null;
        }

        _errorsAlert(message, title, error) {
            window.mui.alert(message, title, ["确定"], ({ index, value }) => this._errors({ index, value: { btnName: "确定", error: error } }), 'div');
        }
    }

    return exports;
})));