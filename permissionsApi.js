(function (root, factory) {
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
        _compassAndLocation = {
            compass: {
                beta: "",
                direction: "",

            },
            chooseLocation: {
                latitude: "",
                longitude: "",
                accuracy: ""
            }
        };

        constructor(config) {

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

            this.loadNeedJsOrCSS();

        }

        loadNeedJsOrCSS() {
            const { _checkLoadType, _isLoadComplete, _execute, loadJSOrCSS, scriptOrCSSTree, _labelTypeName, _useCan } = this;
            for (const { src, type } of loadJSOrCSS) {
                let result = _checkLoadType({ src, type });
                scriptOrCSSTree.push(result)
                document.head.appendChild(result);
                _isLoadComplete({ scriptOrCSSTree, _labelTypeName, loadJSOrCSS }, async ({ success, type }) => {
                    if (success) {
                        await _execute(this).then(_ => {
                            console.log("window.unityInstance", window.unityInstance);
                            setInterval(() => {
                                console.log(_useCan, window.unityInstance);
                                if (_useCan && window.unityInstance) {
                                    console.log("compassAndLocation", compassAndLocation);
                                    window.unityInstance.SendMessage("UnityJsBridge", "JsToUnityTrigger", JSON.stringify(compassAndLocation));
                                }
                            }, 1000);
                        })
                    }
                })
            }
        }

        async _execute(that) {
            that._useCan = true;
            console.log("that._useCan", that._useCan)
            window.onload = () => {
                console.log("_execute", that);
                new window.VConsole();
                let u = navigator.userAgent;
                let { _compassAndLocation, _useCan } = that;
                console.log(window.mui);
                if (u.indexOf("Android") > -1 || u.indexOf("Linux") > -1 || u.indexOf("Windows Phone") > -1) {
                    startCompassListener(({ compass, beta }) => {
                        if (compass) {
                            _compassAndLocation.compass.beta = beta;
                            _compassAndLocation.compass.direction = compass;
                        }
                    })
                    startWatchPosition(position => {
                        if (position) {
                            _compassAndLocation.chooseLocation.latitude = position.coords.latitude;
                            _compassAndLocation.chooseLocation.longitude = position.coords.longitude;
                            _compassAndLocation.chooseLocation.accuracy = position.coords.accuracy;
                        }
                    })
                    that._useCan = true;
                    console.log("that._useCan", that._useCan);
                } else if (u.indexOf("iPhone") > -1) {
                    window.mui?.confirm(`"${window.location.href}"想要访问运动与方向`, '提示', ['取消', '允许'], (res) => {
                        startCompassListener(({ compass, beta }) => {
                            if (compass) {
                                _compassAndLocation.compass.beta = beta;
                                _compassAndLocation.compass.direction = compass;
                            }
                        })
                        startWatchPosition(position => {
                            if (position) {
                                let latitude = position.coords.latitude; // 纬度
                                let longitude = position.coords.longitude; // 经度
                                let altitude = position.coords.altitude; // 高度
                                let speed = position.coords.speed; // 速度
                                let heading = position.coords.heading; // 方向
                                _compassAndLocation.chooseLocation.latitude = position.coords.latitude;
                                _compassAndLocation.chooseLocation.longitude = position.coords.longitude;
                                _compassAndLocation.chooseLocation.accuracy = position.coords.accuracy;
                            }
                        });
                        that._useCan = true;
                        console.log("that._useCan", that._useCan);
                    }, 'div')
                } else {
                    window.mui?.alert("请使用安卓或苹果设备打开！", "提示", ["确定", "取消"], null, "div");
                    return 'noAndoIos'
                }
            }
        }

        _checkLoadType({ src, type }) {
            let scriptOrCSStDom = type == 1 ? document.createElement("script") : document.createElement("link");
            scriptOrCSStDom.type = type == 1 ? "text/javascript" : "text/css";
            scriptOrCSStDom[type == 1 ? "src" : "href"] = src;
            scriptOrCSStDom[type == 1 ? "" : "rel"] = "stylesheet";
            return scriptOrCSStDom
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

        _startCompassListener(callback) {
            if (!window["DeviceOrientationEvent"]) {
                console.warn("DeviceOrientation API not available");
                return;
            }
            let absoluteListener = (e) => {
                if (!e.absolute || e.alpha == null || e.beta == null || e.gamma == null)
                    return;
                let compass = -(e.alpha + e.beta * e.gamma / 90);
                compass -= Math.floor(compass / 360) * 360;
                window.removeEventListener("deviceorientation", webkitListener);
                callback({ compass, beta: e.beta });
            };
            let webkitListener = (e) => {
                let compass = e.webkitCompassHeading;
                if (compass != null && !isNaN(compass)) {
                    callback({ compass, beta: e.beta });
                    window.removeEventListener("deviceorientationabsolute", absoluteListener);
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
                        } else
                            console.warn("Permission for DeviceMotionEvent not granted");
                    });
            } else
                addListeners();
        }

        _startWatchPosition(callback) {
            if ("geolocation" in navigator) {
                navigator.geolocation.watchPosition(function (position) {
                    const latitude = position.coords.latitude; // 纬度
                    const longitude = position.coords.longitude; // 经度
                    const altitude = position.coords.altitude; // 高度
                    const speed = position.coords.speed; // 速度
                    const heading = position.coords.heading; // 方向
                    const accuracy = position.coords.accuracy; // 米
                    callback(position)
                }, function (error) {
                    console.error("获取位置信息失败：" + error.message);
                });
            } else {
                console.error("浏览器不支持Geolocation API");
            }
        }
    }

    return exports;
})));