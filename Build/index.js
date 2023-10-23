let postMessageUrl = `https://meta-h5.shengydt.com/build/h5/index.html`;

let BASE_URL = `https://meta-h5.shengydt.com/apidata/`;
const CAPTURE_IMAGE = "capture";
const SERVER_LOCALIZE = "localize";
const DOWNLOAD_SPARSE = "sparse";
const DOWNLOAD_DENSE = "dense";
let TOKEN = "d9bf7e650483c9e0b9a7bfe40a25bc79f989276633865042b05b31b7a8a08671" // ADD YOUR IMMERSAL DEVELOPER TOKEN
let MAP_IDS = [
    { id: 488 },  // ADD YOUR IMMERSAL MAP ID
]

let videoWidth = null
let videoHeight = null
let pixelBuffer = null
let cameraIntrinsics = null
let cameraPosition = null
let cameraRotation = null
let isLocalizing = false
let pointCloud = null

let sceneName = null;
let rootPath = null;
let loader = new THREE.ObjectLoader();

let audio = null;
let narrateAudio = null;
let mixer;
let childMixer;

const ossConfig = {
    // url: 'https://metaverse-webar.oss-cn-hangzhou.aliyuncs.com',
    url: 'https://metaoss-webar.shengydt.com',
    version: 1,
    isEnable: true,
    environment: "pro",
    appDownloadUrl: "https://sit-meta-gateway.vonechain.com/api/front/login/getHtml/dl-ylxh"
}

// Bitmaps can cause texture issues on iOS. This workaround can help prevent black textures and crashes.
const IS_IOS =
    /^(iPad|iPhone|iPod)/.test(window.navigator.platform) ||
    (/^Mac/.test(window.navigator.platform) && window.navigator.maxTouchPoints > 1)
if (IS_IOS) {
    window.createImageBitmap = undefined
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

let inDom = false;
function customizingTheLoadScreen() {
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
            if (!inDom) {
                // document.querySelector('.prompt-box-8w').style.backgroundImage ='url("./Images/popupBackground.svg")';
                document.querySelector('.prompt-box-8w p').innerHTML = '<p class="vrPopTitle">提示<p/><p class="vrPopContent"><strong>游历星河需要您相机权限与运动传感器权限</strong><br/><br/>才能进行扫描扫描AR内容</strong></p>'
                document.querySelector('.prompt-button-8w').innerHTML = '拒绝'
                document.querySelector('.button-primary-8w').innerHTML = '同意'
            }
            inDom = true

        } else if (inDom) {
            inDom = false
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
  <button id="reloadButton" class="main-button" onclick="window.parent.postMessage({isAccredit:true},'${postMessageUrl}');clearCookie()">我已知晓</button>`;

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

    linkOutViewAndroid
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

function getScenicAreaConfig(token, id, callBack) {
    let fileLoader = new THREE.FileLoader();
    console.log("${ossConfig.url}/${ossConfig.environment}/Scenes/${TOKEN}/", `${ossConfig.url}/${ossConfig.environment}/Scenes/${TOKEN}/`);
    // fileLoader.load(`${ossConfig.isEnable==true?`${ossConfig.url}/${ossConfig.environment}/Scenes/${TOKEN}/`:`Scenes/${TOKEN}/`}scenicAreaConfig.json?version=${Math.random() * 60}`, function (data) {
    // fileLoader.load(`${ossConfig.isEnable == true ? `${ossConfig.url}/` : `/`}globalConfiguration.json?version=${Math.random() * 60}`, function (data) {
    fileLoader.load(`${ossConfig.isEnable == true ? `${ossConfig.url}/${ossConfig.environment}/` : `/`}environmentConfiguration.json?version=${Math.random() * 60}`, function (data) {
        // const [{ scenicAreaId, scenicSpot, configInfo: { operatingTime, operator, version, environment: { name, url } } }] = JSON.parse(data);
        const [{ configInfo: { operatingTime, operator, version, debugging, notLoadingScenes, environment: { name, url, appDownloadUrl } } }] = JSON.parse(data);

        if (debugging !== true) var vConsole = new window.VConsole();
        new window.VConsole();
        ossConfig.version = version;
        ossConfig.environment = name;
        BASE_URL = `${url}/apidata/`;
        postMessageUrl = `${url}/build/h5/index.html`;
        ossConfig.appDownloadUrl = appDownloadUrl;

        console.log(`%c%c 游历星河 WebAr %c Version：${version} %c Cenvironment：${name} `,
            'color: #3eaf7c; font-size: 16px;line-height:30px;',
            'background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff',
            'background: #41b883; padding: 4px; border-radius: 0 0 0 0; color: #fff',
            'background: pink; padding: 4px; border-radius: 0 3px 3px 0; color: #fff',
        );

        // console.log("scenicAreaId, mapId ",scenicAreaId, scenicSpot, operatingTime, operator, version );
        // if(scenicAreaId != token) {TOKEN = "661385a42594c90d2fd842fcc468682185461eb203e8d586c3d8e5f94c4aca6b"; scenicAreaTips = '景区AR'};

        let isAlike = false;

        // for (const { mapId, name, value } of scenicSpot) {
        //   if(mapId==id){
        //     MAP_IDS[0].id=value;
        //     isAlike=true;
        //     return callBack();
        //   }
        // }


        for (let index = 0; index < notLoadingScenes.length; index++) {
            if (notLoadingScenes[index] == TOKEN) {
                isShowLoader(true, `正在建设中···`, 3000, _ => {
                    return [callBack(), window.location.href = ossConfig.appDownloadUrl];
                });
            }
        }

        // [{ scenicSpotName, scenicAreaId, scenicSpot },index]
        for (let index = 0; index < JSON.parse(data).length; index++) {
            if (index == 0) continue;
            if (TOKEN == JSON.parse(data)[index].scenicAreaId) {
                for (const { mapId, name, value } of JSON.parse(data)[index].scenicSpot) {
                    if (mapId == id) { MAP_IDS[0].id = value; scenicAreaName = name; isAlike = true; return callBack(); }
                }
            }
        }

        console.log("0", TOKEN, MAP_IDS, sceneName, rootPath);

        if (isAlike == false) {
            $('#modelsLoader').css('display', 'flex');
            $('#progressBar').hide();
            isShowLoader(true, `正在建设中···`, 3000, _ => {
                return [callBack(), window.location.href = ossConfig.appDownloadUrl];
                // "https://sit-meta-gateway.vonechain.com/api/front/login/getHtml/dl-ylxh";
                // "https://pre-meta-gateway.shengydt.com/api/front/login/getHtml/dl-ylxh";
                // "https://meta-gateway.shengydt.com/api/front/login/getHtml/dl-ylxh";
            });
        }
        // if(mapId.indexOf(id) == -1) {MAP_IDS[0].id = 488;scenicSpotTips= '景点'};
    }, (xhr) => {
        // console.log('加载进度'+Math.floor(xhr.loaded / xhr.total * 100)+'%');
    }, (err) => {
        // settingConfigure error
        $('#modelsLoader').css('display', 'flex');
        $('#progressBar').hide();
        return isShowLoader(true, `正在建设中···`, 2000, _ => {
            window.location.href = ossConfig.appDownloadUrl;
        });
    })
}

const animate = function () {
    const { scene, camera, renderer } = XR8.Threejs.xrScene();
    requestAnimationFrame(animate);

    let clock = new THREE.Clock()
    const mixerUpdateDelta = clock.getDelta()

    // 场景动画
    if (mixer) {
        mixer.update(0.01);
    }


    renderer.render(scene, camera);
};

/* globals XR8 XRExtras THREE TWEEN */
const placegroundScenePipelineModule = () => {
    const modelFile = 'tree.glb'                            // 3D model to spawn at tap
    const startScale = new THREE.Vector3(0.01, 0.01, 0.01)  // Initial scale value for our model
    const endScale = new THREE.Vector3(2, 2, 2)             // Ending scale value for our model
    const animationMillis = 750                             // Animate over 0.75 seconds

    const raycaster = new THREE.Raycaster()
    const tapPosition = new THREE.Vector2()
    const loader = new THREE.GLTFLoader()  // This comes from GLTFLoader.js.

    let surface  // Transparent surface for raycasting for object placement.

    // Populates some object into an XR scene and sets the initial camera position. The scene and
    // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
    const initXrScene = ({ scene, camera, renderer }) => {
        renderer.shadowMap.enabled = false
        renderer.shadowMap.type = THREE.PCFSoftShadowMap

        const pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(0, 10, 0);
        scene.add(pointLight);

        // add 平行光
        const light = new THREE.DirectionalLight(0xffffff, 1, 100)
        light.position.set(1, 4.3, 2.5)  // default

        scene.add(light)  // Add soft white light to the scene.
        scene.add(new THREE.AmbientLight(0x404040, 1))  // Add soft white light to the scene.

        // light.shadow.mapSize.width = 1024  // default
        // light.shadow.mapSize.height = 1024  // default
        // light.shadow.camera.near = 0.5  // default
        // light.shadow.camera.far = 500  // default
        light.castShadow = false

        // 解决偏移/漂移等问题。
        surface = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 1, 1),
            new THREE.ShadowMaterial({
                opacity: 0.5,
            })
        )

        surface.rotateX(-Math.PI / 2)
        surface.position.set(0, 0, 0)
        surface.receiveShadow = true
        scene.add(surface)

        // Set the initial camera position relative to the scene we just laid out. This must be at a
        // height greater than y=0.
        camera.position.set(0, 1, 0);
    }

    const animateIn = (model, pointX, pointZ, yDegrees) => {
        const scale = { ...startScale }

        model.scene.rotation.set(0.0, yDegrees, 0.0)
        model.scene.position.set(pointX, 0.0, pointZ)
        model.scene.scale.set(scale.x, scale.y, scale.z)
        model.scene.children[0].children[0].children[0].castShadow = true
        XR8.Threejs.xrScene().scene.add(model.scene)

        new TWEEN.Tween(scale)
            .to(endScale, animationMillis)
            .easing(TWEEN.Easing.Elastic.Out)  // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                model.scene.scale.set(scale.x, scale.y, scale.z)
            })
            .start()  // Start the tween immediately.
    }

    // Load the glb model at the requested point on the surface.
    const placeObject = (pointX, pointZ) => {
        loader.load(
            modelFile,  // resource URL.
            (gltf) => {
                animateIn(gltf, pointX, pointZ, Math.random() * 360)
            }
        )
    }

    const placeObjectTouchHandler = (e) => {
        // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
        // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
        if (e.touches.length === 2) {
            XR8.XrController.recenter()
        }

        if (e.touches.length > 2) {
            return
        }

        // If the canvas is tapped with one finger and hits the "surface", spawn an object.
        const { camera } = XR8.Threejs.xrScene()

        // calculate tap position in normalized device coordinates (-1 to +1) for both components.
        tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
        tapPosition.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1

        // Update the picking ray with the camera and tap position.
        raycaster.setFromCamera(tapPosition, camera)

        // Raycast against the "surface" object.
        const intersects = raycaster.intersectObject(surface)

        if (intersects.length === 1 && intersects[0].object === surface) {
            placeObject(intersects[0].point.x, intersects[0].point.z)
        }
    }

    return {
        // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
        name: 'placeground',

        // onStart is called once when the camera feed begins. In this case, we need to wait for the
        // XR8.Threejs scene to be ready before we can access it to add content. It was created in
        // XR8.Threejs.pipelineModule()'s onStart method.
        onStart: ({ canvas }) => {
            const { scene, camera, renderer } = XR8.Threejs.xrScene()  // Get the 3js sceen from xr3js.
            // Add objects to the scene and set starting camera position.
            initXrScene({ scene, camera, renderer })
            // canvas.addEventListener('touchstart', placeObjectTouchHandler, true)  // Add touch listener.

            // prevent scroll/pinch gestures on canvas
            // canvas.addEventListener('touchmove', (event) => {
            //   event.preventDefault()
            // })

            // Enable TWEEN animations.
            const animate = (time) => {
                requestAnimationFrame(animate)
                TWEEN.update(time)
            }

            animate()

            // Sync the xr controller's 6DoF position and camera paremeters with our scene.
            XR8.XrController.updateCameraProjectionMatrix({
                origin: camera.position,
                facing: camera.quaternion,
            })
        },
    }
}

const immersalPipelineModule = () => {
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
            const { rows, cols, rowBytes, pixels, viewport } = processCpuResult.immersal


            const fy = 0.5 * intrinsics[5] * textureWidth
            const cx = 0.5 * (intrinsics[8] + 1.0) * textureWidth
            const cy = 0.5 * (intrinsics[9] + 1.0) * textureHeight
            const intr = { fx: fy, fy: fy, ox: cx, oy: cy }

            videoWidth = cols
            videoHeight = rows
            pixelBuffer = pixels
            cameraIntrinsics = intr
            cameraPosition = position
            cameraRotation = rotation
        }
    }
}

// Get the camera pixel buffer as an 8-bit grayscale PNG.
function getImageData() {
    let buffer = UPNG.encodeLL([pixelBuffer], videoWidth, videoHeight, 1, 0, 8, 0);
    return buffer
}

const onxrloaded = () => {
    // init error page css
    customizingTheLoadScreen();

    XR8.XrController.configure({ scale: 'absolute' })

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

    // if (getUrlParam("token")) {
    //     TOKEN = getUrlParam("token");
    //     // console.log("token",TOKEN);
    // }
    // if (getUrlParam("mapId")) {
    //     let mapIds = getUrlParam("mapId").split(",");
    //     MAP_IDS = [];
    //     for (var i = 0; i < mapIds.length; i++) {
    //         MAP_IDS.push({
    //             id: Number(mapIds[i])
    //         });
    //     }
    // }

    // // 读取景区配置信息
    // getScenicAreaConfig(TOKEN, MAP_IDS[0].id, tips => {
    //     if (ossConfig.isEnable) {
    //         rootPath = `${ossConfig.url}/${ossConfig.environment}/Scenes/${TOKEN}/${MAP_IDS[0].id}`;
    //     } else {
    //         sceneName = `{FROM}/${MAP_IDS[0].id}{END}`.replace("{FROM}", "").replace("{END}", "");
    //         rootPath = `Scenes/${TOKEN}` + sceneName;
    //     }
    // });


    // CoachingOverlay.configure({
    //   animationColor: '#E86FFF',
    //   promptColor:'#28b561',
    //   promptText: 'To generate scale push your phone forward and then pull back',
    //   // disablePrompt:true
    // })

    XR8.addCameraPipelineModules([  // Add camera pipeline modules.
        // Existing pipeline modules.
        XR8.GlTextureRenderer.pipelineModule(),      // Draws the camera feed.
        XR8.CameraPixelArray.pipelineModule({ luminance: true }),
        XR8.Threejs.pipelineModule(),                // Creates a ThreeJS AR Scene.
        XR8.XrController.pipelineModule(),           // Enables SLAM tracking.
        XR8.CanvasScreenshot.pipelineModule(),       // Canvas screenshot
        XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.
        XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.
        XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.
        XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.
        // Custom pipeline modules.
        immersalPipelineModule(),                    // Enables Immersal VPS support.
        // placegroundScenePipelineModule(),

        // CoachingOverlay.pipelineModule(),
        // {
        //   name: 'my-coaching-overlay',
        //   listeners: [
        //     {event: 'coaching-overlay.show', process: ()=>{console.log('show')}},
        //     {event: 'coaching-overlay.hide', process: ()=>{console.log('hide')}},
        //   ],
        // },


    ])


    // XR8.addCameraPipelineModule({
    //     name: 'geolocation',
    //     requiredPermissions: () => ([XR8.XrPermissions.permissions().DEVICE_GPS]),
    // })

    // let iframeDocument = $("iframe").contents()[0];
    // let myDOM = $(iframeDocument).find('canvas')[0];


    // Add CanvasScreenshot
    XR8.CanvasScreenshot.setForegroundCanvas(document.getElementById('camerafeed'));
    XR8.CanvasScreenshot.configure({ maxDimension: 1280, jpgCompression: 100 });

    // Open the camera and start running the camera run loop.
    XR8.run({ canvas: document.getElementById('camerafeed') })

    setTimeout(() => {
        // const unityFrame = document.createElement('iframe');
        // unityFrame.src = 'https://192.168.26.32:7777'; // 将路径替换为正确的 Unity WebGL 项目路径
        // unityFrame.style.position = 'absolute';
        // unityFrame.style.width = '100vw';
        // unityFrame.style.height = '100vh';
        // unityFrame.style.border = 'none';
        // document.body.appendChild(unityFrame);
    }, 1000);
}



const load = () => { XRExtras.Loading.showLoading({ onxrloaded }) }
window.onload = () => {
    setTimeout(() => {
        // window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load);
        new window.VConsole();
    }, 1000);
    // var container = document.querySelector("#unity-container");
    // var canvas = document.querySelector("#camerafeed");
    // var loadingBar = document.querySelector("#unity-loading-bar");
    // var progressBarFull = document.querySelector("#unity-progress-bar-full");
    // var fullscreenButton = document.querySelector("#unity-fullscreen-button");
    // var warningBanner = document.querySelector("#unity-warning");

    // // Shows a temporary message banner/ribbon for a few seconds, or
    // // a permanent error message on top of the canvas if type=='error'.
    // // If type=='warning', a yellow highlight color is used.
    // // Modify or remove this function to customize the visually presented
    // // way that non-critical warnings and error messages are presented to the
    // // user.


    // var buildUrl = "Build";
    // var loaderUrl = buildUrl + "/WebGL.loader.js";
    // var config = {
    //     dataUrl: buildUrl + "/WebGL.data.unityweb",
    //     frameworkUrl: buildUrl + "/WebGL.framework.js.unityweb",
    //     codeUrl: buildUrl + "/WebGL.wasm.unityweb",
    //     streamingAssetsUrl: "StreamingAssets",
    //     companyName: "DefaultCompany",
    //     productName: "WebToJs",
    //     productVersion: "0.1.0",
    //     showBanner: unityShowBanner,
    // };

    // // By default Unity keeps WebGL canvas render target size matched with
    // // the DOM size of the canvas element (scaled by window.devicePixelRatio)
    // // Set this to false if you want to decouple this synchronization from
    // // happening inside the engine, and you would instead like to size up
    // // the canvas DOM size and WebGL render target sizes yourself.
    // // config.matchWebGLToCanvasSize = false;

    // if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    //     // Mobile device style: fill the whole browser client area with the game canvas:

    //     var meta = document.createElement('meta');
    //     meta.name = 'viewport';
    //     meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
    //     document.getElementsByTagName('head')[0].appendChild(meta);
    //     container.className = "unity-mobile";
    //     // canvas.className = "unity-mobile";

    //     // To lower canvas resolution on mobile devices to gain some
    //     // performance, uncomment the following line:
    //     config.devicePixelRatio = 1;

    //     // unityShowBanner('WebGL builds are not supported on mobile devices.');
    // } else {
    //     // Desktop style: Render the game canvas in a window that can be maximized to fullscreen:

    //     canvas.style.width = "1080px";
    //     canvas.style.height = "1920px";
    // }

    // loadingBar.style.display = "block";
    // new window.VConsole();
    // var script = document.createElement("script");
    // script.src = loaderUrl;
    // script.onload = () => {
    //     // LV.open();
    //     createUnityInstance(canvas, config, (progress) => {
    //         progressBarFull.style.width = 100 * progress + "%";
    //     }).then((unityInstance) => {
    //         window.unityInstance = unityInstance;
    //         loadingBar.style.display = "none";
    //         console.log("123123123123123123123123123123123123123123123123123");
    //         window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load);

    //         fullscreenButton.onclick = () => {
    //             unityInstance.SetFullscreen(1);
    //         };
    //     }).catch((message) => {
    //         alert(message);
    //     });
    // };
    // document.body.appendChild(script);
}


function unityToJs(str) {
    console.log("html str ====== " + str, "window.unityInstance", window.unityInstance);
}

function JsToUnityTrigger(val) {
    console.log("val", val);
    window.unityInstance.SendMessage('UnityJsBridge', 'JsToUnityTrigger', val);
}

function unityShowBanner(msg, type) {
    function updateBannerVisibility() {
        warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
    }
    var div = document.createElement('div');
    div.innerHTML = msg;
    warningBanner.appendChild(div);
    if (type == 'error') div.style = 'background: red; padding: 10px;';
    else {
        if (type == 'warning') div.style = 'background: yellow; padding: 10px;';
        setTimeout(function () {
            warningBanner.removeChild(div);
            updateBannerVisibility();
        }, 5000);
    }
    updateBannerVisibility();
}