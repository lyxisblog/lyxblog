(function (root, factory) {

    if (typeof exports === 'object' && typeof module === 'object') {
        // CommonJS (Node.js) environment
        module.exports = factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        // AMD (RequireJS) environment
        define(['exports'], factory);
    } else {
        // Browser global (root is the global context, e.g., window)
        factory(root.xr8thWall = {});
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, (function (exports) {

    class immersalPipeline {
        inDom = false;
        startLoadSetInterval = null;

        #videoWidth = null;
        #videoHeight = null;
        #pixelBuffer = null;
        #cameraIntrinsics = null;
        #cameraPosition = null;
        #cameraRotation = null;

        constructor(config) {
            // console.log("this", this.getConfig());
        }

        startLoad({ config, callback }) {
            this.startLoadSetInterval = setInterval(() => {
                if (window.XR8 && window.XRExtras) {
                    config.debugger == true ? new window.VConsole() : null;
                    window.XRExtras ? XRExtras.Loading.showLoading({ onxrloaded: this.onxrloaded(callback) }) : window.addEventListener('xrextrasloaded', XRExtras.Loading.showLoading({ onxrloaded: this.onxrloaded(callback) }));
                    clearInterval(this.startLoadSetInterval);
                }
            }, 15);
        };

        // $('#iframeIndex')[0].contentWindow.SyncCameraTransform([{ARObjectPosition:position,ARObjectRotation:rotation}]);

        immersalPipelineModule() {
            // this._baseConfig.sceneArguments.onCameraUpdate({ ARObjectPosition: "position", ARObjectRotation: "rotation" })
            return {
                name: 'immersal',
                onProcessCpu: ({ frameStartResult, processGpuResult }) => {
                    const { camerapixelarray } = processGpuResult
                    if (!camerapixelarray || !camerapixelarray.pixels) {
                        return
                    }
                    const { rows, cols, rowBytes, pixels } = camerapixelarray
                    return { rows, cols, rowBytes, pixels }
                },
                onUpdate: ({ frameStartResult, processGpuResult, processCpuResult }) => {
                    if (!processCpuResult.reality) {

                        return
                    }
                    const { rotation, position, intrinsics } = processCpuResult.reality
                    const { textureWidth, textureHeight } = frameStartResult
                    const { rows, cols, rowBytes, pixels } = processCpuResult.immersal

                    const fy = 0.5 * intrinsics[5] * textureWidth
                    const cx = 0.5 * (intrinsics[8] + 1.0) * textureWidth
                    const cy = 0.5 * (intrinsics[9] + 1.0) * textureHeight

                    const intr = { fx: fy, fy: fy, ox: cx, oy: cy };
                    // this._baseConfig.sceneArguments.onUpdate({ ARObjectPosition: position, ARObjectRotation: rotation });
                    this._baseConfig.sceneArguments.onUpdate({ cameraPosition: position, cameraRotation: rotation });


                    this.#videoWidth = cols;
                    this.#videoHeight = rows;
                    this.#pixelBuffer = pixels;
                    this.#cameraIntrinsics = intr;
                    this.#cameraPosition = position;
                    this.#cameraRotation = rotation;
                }
            }
        }


        openCamera() {
            return {
                name: 'camera',
                requiredPermissions: () => ([XR8.XrPermissions.permissions().DEVICE_ORIENTATION]),
            }
        }

        onxrloaded(callback) {

            XR8.XrController.configure({ scale: 'absolute' });

            const incompatibilityReasons = XR8.XrDevice.IncompatibilityReasons;
            if (incompatibilityReasons.INSUFFICIENT_PERMISSION) {
                console.log("需要授予相机和传感器权限以启用 AR/VR 功能。");
            } else if (incompatibilityReasons.DEVICE_NOT_SUPPORTED) {
                console.log("您的设备不支持 AR/VR 功能。");
            } else if (incompatibilityReasons.BROWSER_NOT_SUPPORTED) {
                console.log("您的浏览器不支持 AR/VR 功能。请尝试使用支持的浏览器。");
            } else {
                console.log("发生未知错误或不明确的不兼容性原因。");
            }

            XR8.addCameraPipelineModules([  // Add camera pipeline modules.
                // Existing pipeline modules.
                XR8.GlTextureRenderer.pipelineModule(),      // Draws the camera feed. ***
                // XR8.CameraPixelArray.pipelineModule({ luminance: true }),
                // XR8.XrController.pipelineModule(),           // Enables SLAM tracking.

                // XR8.CanvasScreenshot.pipelineModule(),       // Canvas screenshot
                // XR8.Threejs.pipelineModule(),                // Creates a ThreeJS AR Scene.

                XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.
                XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.
                XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup. 
                XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.

                // Custom pipeline modules.
                // this.immersalPipelineModule(),                    // Enables Immersal VPS support.

                // placegroundScenePipelineModule(),

                // this.openCamera()
            ])

            // Open the camera and start running the camera run loop.
            XR8.run({ canvas: document.getElementById('camerafeed') });
            this.customizingTheLoadScreen();
            XR8.initialize().then(() => callback({ success: true }));
        }

        injectImmersalPipelineModule() {
            console.log("injectImmersalPipelineModule");
            this.addCameraPipelineModules([
                XR8.CameraPixelArray.pipelineModule({ luminance: true }),
                XR8.XrController.pipelineModule(),
                this.immersalPipelineModule()
            ])
        }

        removeImmersalModules() {
            XR8.removeCameraPipelineModules(["immersal"]);
        }

        clearCameraPipelineModules() {
            XR8.clearCameraPipelineModules()
        }

        customizingTheLoadScreen() {
            // No permission prompt android
            // document.querySelector('.permissionIconIos').innerHTML='<img class="foreground-image" src="//cdn.8thwall.com/web/img/loading/v2/camera.svg">';
            document.getElementById("cameraPermissionsErrorAppleMessage").innerHTML = '<p>相机权限被拒绝授权</p><p>请同意启用相机访问权限</p>';
            document.querySelector('.bottom-message').innerHTML = `<span class="wk-app-name"></span>
                <img class="foreground-image" src="//cdn.8thwall.com/web/img/loading/v2/reload.svg" onclick="window.location.reload()">点击重新发起获取权限`;

            // No permission prompt apple
            document.getElementById("cameraPermissionsErrorAndroid").innerHTML = `
                <div class="permissionIcon">
                    <img class="foreground-image" src="//cdn.8thwall.com/web/img/loading/v2/camera.svg"> 
                </div> 
                <div class="loading-error-header">让我们打开你的相机权限</div> 
                    <ol class="loading-error-instructions"> 
                    <li>请寻找 <img class="foreground-image" src="//cdn.8thwall.com/web/img/loading/v2/dots.svg"> 在右上方 </li> 
                    <li>利用设置打开</li> <li class="chrome-instruction hidden"> <span class="highlight">网站的设置</span> </li> 
                    <li class="chrome-instruction hidden"> 
                        <span class="highlight">相机</span> 
                    </li> 
                    <li class="chrome-instruction hidden"> 
                        <span class="highlight">被阻止了</span> 
                        <br> 
                        <span class="camera-instruction-block domain-view">apps.8thwall.com</span>
                    </li> 
                    <li class="chrome-instruction hidden">
                        <span class="camera-instruction-button">请去获取权限</span> 
                    </li> 
                    <li class="samsung-instruction hidden"> 
                        <span class="highlight">Advanced</span> 
                    </li> 
                    <li class="samsung-instruction hidden"> 
                        <span class="highlight">Manage website data</span> 
                    </li>
                    <li class="samsung-instruction hidden"> Press and hold<br> 
                        <span class="camera-instruction-block domain-view">apps.8thwall.com</span> 
                    </li> 
                    <li class="samsung-instruction hidden"> 
                        <span class="highlight" style="color:#1500ba">DELETE</span>
                    </li> 
                    </ol> 
                    <div class="loading-error-footer"> 
                    <a href="https://meta-gateway.shengydt.com/api/front/login/getHtml/dl-ylxh">去下载“游历星河”APP进行体验</a>
                    </div>
                </div>`
            // <img class="foreground-image" style="transform:rotate(130deg)" src="//cdn.8thwall.com/web/img/loading/v2/reload.svg" onclick="window.location.reload()">

            // TurnDown Page
            document.getElementById('userPromptError').innerHTML = '<h1>相机权限被拒绝授权</h1><p>您需要同意启用相机权限与运动传感器权限才能继续访问。</p><button id="reloadButton" class="main-button" onclick="window.location.reload()">去授权</button>';

            // Loading Screen
            // const cameraImageBg = document.getElementById("requestingCameraPermissions").src = "./Images/startupPage.jpg";
            const cameraImageBg = document.getElementById("requestingCameraPermissions").innerHTML = '<img id="requestingCameraIcon" style="margin-top: 140px;" src="//cdn.8thwall.com/web/img/loading/v2/camera.svg"> 点击“允许”，开始体验'
            // const cameraImage = document.getElementById("requestingCameraIcon").src = "./Images/startupPage.jpg";
            // const loadImageBg = document.getElementById("loadBackground").src = "./Images/background.png";
            // const loadImage = document.getElementById("loadImage").src = "./Images/button.gif";

            // Motion Sensor Prompt
            const observer = new MutationObserver(() => {
                if (document.querySelector('.prompt-box-8w')) {
                    if (!this.inDom) {
                        // document.querySelector('.prompt-box-8w').style.backgroundImage ='url("./Images/popupBackground.svg")';
                        document.querySelector('.prompt-box-8w p').innerHTML = '<p class="vrPopTitle">提示<p/><p class="vrPopContent"><strong>游历星河需要您相机权限与运动传感器权限</strong><br/><br/>才能进行扫描扫描AR内容</strong></p>'
                        document.querySelector('.prompt-button-8w').innerHTML = '拒绝'
                        document.querySelector('.button-primary-8w').innerHTML = '同意'
                    }
                    this.inDom = true

                } else if (this.inDom) {
                    this.inDom = false
                    observer.disconnect()
                }
            })
            observer.observe(document.body, { childList: true })

            // motion sensors 
            document.getElementById('motionPermissionsErrorApple').innerHTML = `
            <h1>运动传感器权限被拒绝授权</h1>
            <p>您已经阻止页面访问您的运动传感器</p> 
            <p>您需要同意启用相机权限与运动传感器权限才能继续访问
                <span class="wk-app-name"></span> 
                需要您重启启动应用程序，重新发起运动传感器获取权限
            </p>
            <button id="reloadButton" class="main-button" onclick="">我已知晓</button>`;

            // copyLinkViewAndroid
            document.getElementById("copyLinkViewAndroid").innerHTML = `
            <div class="error-text-outer-container">
                <div class="error-text-container error-margin-top-5">
                <span id="error_text_header_unknown" class="open-header-unknown">
                    <h2>很抱歉，您手机暂不支持AR<br></h2>
                    您可以点击下方按钮下载“游历星河”APP继续进行体验。
                </span>
                
                <span id="app_link" class="desktop-home-link mobile"></span>
                <button id="copy_link_android" class="copy-link-btn"><a href="https://meta-gateway.shengydt.com/api/front/login/getHtml/dl-ylxh">去下载“游历星河”APP进行体验</a></button>
                <img class="foreground-image poweredby-img" src="//cdn.8thwall.com/web/img/almostthere/v2/poweredby-horiz-white-4.svg">
                </div>
            </div>
            `
            // <img id="app_img" class="app-header-img unknown"> <br> 

            // linkOutViewAndroid
            // <img id="app_img" class="app-header-img unknown"><br></br>
            // <img class="foreground-image poweredby-img" src="//cdn.8thwall.com/web/img/almostthere/v2/poweredby-horiz-white-4.svg"> 
            document.getElementById("linkOutViewAndroid").innerHTML = `
            <div id="linkOutViewAndroid" class="absolute-fill hidden"> 
            <div class="error-text-outer-container">
                </>出现了亿点小问题，请点击按钮帮我重新运行吧</p>
                <div class="error-text-container error-margin-top-5">
                <a id="open_browser_android" class="start-ar-button" onclick="window.location.reload()">点我重启运行</a> 
                </div>
            </div>
            </div>`;

            document.getElementById("loadBackground").innerHTML = `
            <div id="loadBackground" class="absolute-fill">
                <div id="loadImageContainer" class="absolute-fill">
                <img src="//cdn.8thwall.com/web/img/loading/v2/load-grad.png" id="loadImage" class="spin"/>
                </div>
            </div>
            `
        }
    }

    exports.init = class init extends immersalPipeline {
        _labelTypeName = ["scrip", "link"];
        scriptOrCSSTree = [];
        _baseConfig = null;

        _loadJSOrCSS = [
            // {
            //     // 8thWall Web - Replace the app key here with your own app key
            //     src: `https://apps.8thwall.com/xrweb?appKey=${this.#_appKey}`,
            //     type: 1,
            // },
            {
                // XR Extras - provides utilities like load screen, almost there, and error handling.
                //  See github.com/8thwall/web/tree/master/xrextras
                src: "https://cdn.8thwall.com/web/xrextras/xrextras.js",
                type: 1,
            },
            {
                // Coaching Overlay 
                src: "https://cdn.8thwall.com/web/coaching-overlay/coaching-overlay.js",
                type: 1,
            },
            {
                src: "https://cdnjs.cloudflare.com/ajax/libs/mui/3.7.1/js/mui.min.js",
                type: 1,
            },
            {
                src: "https://cdnjs.cloudflare.com/ajax/libs/mui/3.7.1/css/mui.min.css",
                type: 2,
            },
            {
                src: "https://unpkg.com/vconsole@latest/dist/vconsole.min.js",
                type: 1,
            }
        ];

        constructor(config, callback) {
            super();
            this._baseConfig = config;

            this._isCheckAppKey(config, async ({ success, errors }) => {
                if (success) {
                    await this.loadNeedJsOrCSS(() => this._isLoadComplete(({ success, type }) => success == true ? [
                        this.startLoad({ config, callback }),
                    ] : null));
                } else {
                    alert("appKey 不能为空！");
                    callback({ success, errors })
                }
            });
        }

        async loadNeedJsOrCSS(callback) {
            const { _checkLoadType, _loadJSOrCSS, scriptOrCSSTree } = this;
            for (const { src, type } of _loadJSOrCSS) {
                let result = await _checkLoadType.bind(this)({ src, type });
                if (result == true) continue;
                scriptOrCSSTree.push(result);
                document.head.appendChild(result);
                if (_loadJSOrCSS.length == scriptOrCSSTree.length) callback()
            }
        }

        _isAlreadyLoaded({ src: existingSrc, type: existingType }) {
            return Array.from(existingType == 1 ? document.getElementsByTagName('script') : document.querySelectorAll('link[rel="stylesheet"]')).some(scriptOrsheet => scriptOrsheet[existingType == 1 ? "src" : "href"].includes(existingSrc.split('/')[existingSrc.split('/').length - 1]));
        }

        _checkLoadType({ src, type }) {
            if (this._isAlreadyLoaded({ src, type }) == true) return true;
            let scriptOrCSStDom = type == 1 ? document.createElement("script") : document.createElement("link");
            scriptOrCSStDom.type = type == 1 ? "text/javascript" : "text/css";
            scriptOrCSStDom[type == 1 ? "src" : "href"] = `${src}`;
            scriptOrCSStDom[type == 1 ? "" : "rel"] = "stylesheet";
            return scriptOrCSStDom;
        }

        _isLoadComplete(callback) {
            const { _loadJSOrCSS, scriptOrCSSTree, _labelTypeName } = this;
            switch (scriptOrCSSTree[scriptOrCSSTree.length - 1].localName, _labelTypeName[0]) {
                case _labelTypeName[0]:
                    if (_loadJSOrCSS.length == scriptOrCSSTree.length) {
                        scriptOrCSSTree[scriptOrCSSTree.length - 1].onload = () => {
                            return callback({ success: true, type: "js" });
                        }
                    }

                    break;
                case _labelTypeName[1]:
                    if (_loadJSOrCSS.length == scriptOrCSSTree.length) {
                        scriptOrCSSTree[scriptOrCSSTree.length - 1].onload = () => {
                            return callback({ success: true, type: "css" });
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        _isCheckAppKey(config, callback) {
            if (config.appKey && config.appKey !== null) this._loadJSOrCSS.push({ src: `https://apps.8thwall.com/xrweb?appKey=${config.appKey}`, type: 1, }), callback({ success: true })
            else return callback({ success: false, errors: "appKey 不能为空！" });
        }
    }

    return exports;
})));