const defUser = {
    "engines": {
        "综合": {
            "大海": {
                "icon": "dahai",
                "color": "#037DD8",
                "wap": "https://wap.sogou.com/web/searchList.jsp?keyword=",
                "url": "http://www.sogou.com/web?ie={inputEncoding}&query="
            },
            "搜狗": {
                "icon": "sogou",
                "color": "#FD6853",
                "wap": "https://wap.sogou.com/web/searchList.jsp?keyword=",
                "url": "http://www.sogou.com/web?ie={inputEncoding}&query="
            },
            "必应": {
                "icon": "bing",
                "color": "#FFB900",
                "url": "http://cn.bing.com/search?q=",
                "wap": ""
            },
            "知乎": {
                "icon": "zhihu",
                "color": "#0F88EB",
                "wap": "http://zhihu.sogou.com/zhihuwap?query=",
                "url": "http://zhihu.sogou.com/zhihu?query="
            },
            "微信": {
                "icon": "weixin",
                "color": "#00BC0C",
                "wap": "http://weixin.sogou.com/weixinwap?type=2&query=",
                "url": "http://weixin.sogou.com/weixin?type=2&query="
            },
            "百度": {
                "icon": "baidu",
                "color": "#2319dc",
                "url": "https://www.baidu.com/s?wd=",
                "wap": ""
            }
        },
        "编程": {
            "w3school": {
                "color": "#bd2d30",
                "url": "http://cn.bing.com/search?q=site:w3school.com.cn+",
                "icon": "",
                "wap": ""
            },
            "MDN": {
                "color": "#056B9F",
                "url": "https://developer.mozilla.org/zh-CN/search?q=",
                "icon": "",
                "wap": ""
            },
            "阮一峰": {
                "color": "#556677",
                "url": "http://cn.bing.com/search?q=site:ruanyifeng.com+",
                "icon": "",
                "wap": ""
            }
        },
        "认知": {
            "有道词典": {
                "color": "#e31333",
                "url": "http://m.youdao.com/dict?q=",
                "icon": "",
                "wap": ""
            },
            "网易公开课": {
                "color": "#206740",
                "wap": "http://m.open.163.com/?=",
                "url": "http://c.open.163.com/search/search.htm?query=",
                "icon": ""
            },
            "世界图书馆": {
                "color": "#00618e",
                "url": "http://mx.wdl.org/zh/search/?q=",
                "icon": "",
                "wap": ""
            },
            "百度百科": {
                "color": "#2319dc",
                "url": "http://baike.baidu.com/item/",
                "icon": "",
                "wap": ""
            }
        },
        "图片": {
            "花瓣": {
                "icon": "huaban",
                "color": "#DF4751",
                "url": "http://huaban.com/search/?q=",
                "wap": ""
            },
            "Topit.me": {
                "color": "#FC6B96",
                "url": "http://www.topit.me/items/search?query=",
                "icon": "",
                "wap": ""
            },
            "站酷": {
                "color": "#282828",
                "wap": "http://m.idea.zcool.com.cn/search.do?keys=",
                "url": "http://idea.zcool.com.cn/index.do?keys=",
                "icon": ""
            },
            "动图搜索": {
                "color": "#e84763",
                "wap": "http://www.gifmiao.com/search?keyword=",
                "url": "http://www.soogif.com/search/",
                "icon": ""
            }
        },
        "新闻": {
            "新浪微博": {
                "color": "#E73137",
                "icon": "sina",
                "url": "http://s.weibo.com/weibo/",
                "wap": ""
            }
        },
        "网购": {
            "淘宝": {
                "color": "#ed4403",
                "icon": "taobao",
                "wap": "https://s.m.taobao.com/h5?q=",
                "url": "https://s.taobao.com/search?q="
            },
            "京东": {
                "color": "#B1191A",
                "wap": "https://so.m.jd.com/ware/search.action?keyword=",
                "url": "https://search.jd.com/Search?&enc=utf-8&keyword=",
                "icon": ""
            },
            "亚马逊": {
                "color": "#000",
                "wap": "https://www.amazon.cn/gp/aw/s/ref=nb_sb_noss?k=",
                "url": "https://www.amazon.cn/s/ref=nb_sb_noss?field-keywords=",
                "icon": ""
            },
            "天猫": {
                "color": "#BF0000",
                "url": "https://list.tmall.com/search_product.htm?q=",
                "icon": "",
                "wap": ""
            }
        },
        "旅行": {
            "马蜂窝": {
                "color": "#FFCB10",
                "wap": "https://m.mafengwo.cn/mdd/query.php?q=",
                "url": "http://www.mafengwo.cn/group/s.php?q=",
                "icon": ""
            },
            "飞猪旅行": {
                "color": "#3C3C3C",
                "wap": "https://h5.m.taobao.com/trip/search/result/index.html?keyword=",
                "url": "https://www.alitrip.com/kezhan/?=",
                "icon": ""
            },
            "去哪儿": {
                "color": "#0088A4",
                "wap": "https://touchsearch.qunar.com/intention/productlist.htm?q=",
                "url": "http://bnb.qunar.com/?=",
                "icon": ""
            }
        },
        "地图": {
            "高德地图": {
                "color": "#4C90F9",
                "icon": "amap",
                "wap": "http://m.amap.com/search/mapview/keywords=",
                "url": "http://ditu.amap.com/search?city=100000&query="
            },
            "腾讯地图": {
                "color": "#3399FF",
                "wap": "http://map.qq.com/m/nearby/search?=",
                "url": "http://map.qq.com?=",
                "icon": ""
            },
            "百度地图": {
                "color": "#2319dc",
                "url": "http://map.baidu.com/mobile/webapp/search/search/qt=s&wd=",
                "icon": "",
                "wap": ""
            }
        },
        "音乐": {
            "酷狗音乐": {
                "color": "#2CA2F9",
                "url": "http://m.kugou.com/search?keyword=",
                "icon": "",
                "wap": ""
            },
            "虾米音乐": {
                "color": "#FF6F32",
                "url": "http://h.xiami.com/#!/search/result/?key=",
                "icon": "",
                "wap": ""
            },
            "酷我音乐": {
                "color": "#FECA2E",
                "url": "http://m.kuwo.cn/?key=",
                "icon": "",
                "wap": ""
            },
            "网易云音乐": {
                "color": "#F40A01",
                "icon": "cloud-music",
                "url": "http://music.163.com/#/search/m/?s=",
                "wap": ""
            },
            "喜马拉雅": {
                "color": "#EF5619",
                "wap": "http://m.ximalaya.com/search/",
                "url": "http://www.ximalaya.com/search/",
                "icon": ""
            }
        },
        "视频": {
            "豆瓣电影": {
                "name": "",
                "color": "#2E963D",
                "url": "https://movie.douban.com/subject_search?search_text=",
                "icon": "",
                "wap": ""
            },
            "优酷": {
                "color": "#2fb3ff",
                "url": "http://www.soku.com/search_video/q_",
                "icon": "",
                "wap": ""
            },
            "磁力链接": {
                "color": "#3860BB",
                "url": "http://pianyuan.net/search?q=",
                "icon": "",
                "wap": ""
            },
            "哔哩哔哩": {
                "color": "#F25D8E",
                "wap": "http://www.bilibili.com/mobile/search.html?keyword=",
                "url": "http://search.bilibili.com/all?keyword=",
                "icon": ""
            }
        }
    },
    "books": {
        "常用": {
            "网易云音乐": {
                "color": "#F40A01",
                "url": "http://music.163.com/#/user/home?id=36825881"
            },
            "500px": {
                "url": "https://500px.com/popular",
                "color": ""
            },
            "知乎收藏夹": {
                "url": "https://www.zhihu.com/collections",
                "color": ""
            }
        },
        "编程": {
            "鼠标事件": {
                "url": "http://www.cnblogs.com/rubylouvre/archive/2009/08/24/1552862.html",
                "color": ""
            },
            "Yarn": {
                "url": "https://zhuanlan.zhihu.com/p/25320734",
                "color": ""
            },
            "萧瓜笔记": {
                "url": "https://www.zybuluo.com/iwangyang/note/519509",
                "color": ""
            },
            "小甲鱼Python": {
                "color": "rgb(57,152,214)",
                "url": "https://www.zybuluo.com/iwangyang/note/519509"
            },
            "Js美化": {
                "url": "http://jsbeautifier.org",
                "color": ""
            },
            "Pure": {
                "url": "https://purecss.io",
                "color": ""
            },
            "虚拟主机": {
                "url": "http://myhostadmin.net",
                "color": ""
            },
            "哔哩招聘": {
                "url": "http://www.bilibili.com/html/join-list.html#32",
                "color": ""
            }
        },
        "新闻": {
            "好奇心日报": {
                "url": "http://www.qdaily.com/",
                "color": ""
            },
            "澎湃新闻": {
                "url": "http://www.thepaper.cn/",
                "color": ""
            }
        },
        "软件": {
            "谷歌浏览器": {
                "url": "https://www.google.com/intl/zh-CN/chrome/browser/?standalone=1",
                "color": ""
            },
            "蓝灯": {
                "url": "https://github.com/getlantern/forum/issues/833",
                "color": ""
            }
        }
    },
    "note": "记事本",
    "def": {
        "engine": "综合",
        "book": "常用",
        "logo": "大海"
    }
}

// $.get('ku/data/def.json', function(data){
//     console.log(data)
// })
