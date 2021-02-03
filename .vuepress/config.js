module.exports = {
  "title": "强到活捉喜羊羊",
  "description": "记录美好生活",
  "dest": "public",
  "base":"/lyxblog/",      //部署GitHub
  "head": [
    [
      "link",
      {
        "rel": "icon",
        "href": "/favicon.ico"
      }
    ],
    [
      "meta",
      {
        "name": "viewport",
        "content": "width=device-width,initial-scale=1,user-scalable=no"
      }
    ]
  ],
  "theme": "reco",
  "themeConfig": {
    "nav": [
      {
        "text": "首页",
        "link": "/",
        "icon": "reco-home"
      },
      {
        "text": "时间轴",
        "link": "/timeline/",
        "icon": "reco-date"
      },
      {
        "text": "插件",
        "icon": "reco-message",
        "items": [
          {
            "text": "v-gantt",
            "link": "/docs/theme-reco/"
          }
        ]
      },
      {
        "text": "contact me",
        "icon": "reco-message",
        "items": [
          {
            "text": "GitHub",
            "link": "https://github.com/lyxisblog",
            "icon": "reco-github"
          }
        ]
      }
    ],
    "sidebar": {
      "/docs/theme-reco/": [
        "",
        "theme",
        "plugin",
        "api"
      ]
    },
    "type": "blog",
    "blogConfig": {
      "category": {
        "location": 2,
        "text": "博客"
      },
      "tag": {
        "location": 3,
        "text": "Tag"
      }
    },
    "friendLink": [     //友情链接
      {
        "title": "test1",
        "desc": "Enjoy when you can, and endure when you must.",
        "email": "1156743527@qq.com",
        "link": "https://github.com/lyxisblog"
      },
      {
        "title": "test2",
        "desc": "A simple and beautiful vuepress Blog & Doc theme.",
        "avatar": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
        "link": "https://github.com/lyxisblog"
      }
    ],
    // "keyPage":{
    //   "keys" : ['123'], // 1.3.0 版本后需要设置为密文
    //   "color" : '#42b983', // 登录页动画球的颜色
    //   "lineColor" : '#42b983' // 登录页动画线的颜色
    // },
    "logo": "/avatar2.png",
    "search": true,
    "searchMaxSuggestions": 10,
    "lastUpdated": "最后更新时间",
    "author": "强到活捉喜羊羊",
    "authorAvatar": "/avatar.jpg",
    "record": "沪ICP备20201227",
    "startYear": "2017"
  },
  "markdown": {
    "lineNumbers": true
  },
  plugins: [
    [
      //先安装在配置， npm install @vuepress-reco/vuepress-plugin-kan-ban-niang --save
      "@vuepress-reco/vuepress-plugin-kan-ban-niang",
      {
        theme: ['koharu', 'blackCat', 'whiteCat', 'haru1', 'haru2', 'haruto', 'izumi', 'shizuku', 'wanko', 'miku', 'z16'],
        clean: true,
        messages: {
          welcome: '我是lookroot欢迎你的关注 ',
          home: '心里的花，我想要带你回家。',
          theme: '好吧，希望你能喜欢我的其他小伙伴。',
          close: '再见哦'
        },
        width: 240,
        height: 352
      }
    ],
    [
      //先安装在配置， npm install @vuepress-plugin-meting --save
      'meting', {
        // metingApi: "https://api.i-meto.com/meting/api",
        meting: {
          // server: "netease",
          // type: "playlist",
          // mid: "621465725",
          auto: "http://music.163.com/song?id=1425371292"
        },          // 不配置该项的话不会出现全局播放器
        aplayer: {
          lrcType: 3,
          autoplay:true,
        }
      }
    ],
  ]
}