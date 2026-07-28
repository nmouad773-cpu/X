/**
 * ====================================================================================
 * 🐉 DRAGON LIVE 24/7 - Automated Facebook Live Channel Streamer Script (.js)
 * ====================================================================================
 * 
 * هذا سكريبت كامل يعمل بشكل مستقل على Node.js (18+) بدون الحاجة لتثبيت أي مكتبات خارجية!
 * يقوم بالبث المتزامن التلقائي لجميع القنوات إلى Facebook Live وتحديث منشور فيسبوك بروابط DASH.
 * 
 * طريقة التشغيل على أي سيرفر أو VPS أو جهاز محلي:
 *   node fb_live_streamer.js
 * ====================================================================================
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GRAPH_VERSION = "v19.0";
const CONFIG_FILE = path.join(__dirname, "stream_config.json");

// الإعدادات الافتراضية الشاملة مع رموز الوصول Access Tokens والقنوات
const DEFAULT_CONFIG = {
  liveAccessToken: "EAAZAfLN8JuaMBSDchhhQFMqF8xJfvjDmSrEO2qTGCYWBa1uo4t9IuKBNtSVn8iMZAnmPwGVUFWooX2faBveSX8jZCLBCMM8tf3zmpD87CFI57dD3AnH40TGDvqYl3qG2JpfBZB3htAfZBYen4jqjKjYwou8qAKO7WLdpKxrm8xFBWMTsWhN5RwLUqxU0sTZBviP7zw",
  livePageId: "466039649924341",
  postAccessToken: "EAAZAfLN8JuaMBSNC4PaTVkOfXF7cZAMhj4sT6j35zJQQvVnJXzdzLPc4ibyPmMEaKauOdEj0UYXxZBALTvzukoRZA8kzaeKyZBb3Ucpl8WjBuS0ZCzKr0uTbvlmCJKeRrsiCVgRbhFSguZCMjKK9SUxA7Pvs2EAaeehfRiHyFDTVMV5O2IjmoZCoqlNSgtUqgVHZBNAbOUR8P",
  postPageId: "1288067541053277",
  postId: "122102349183401514",
  sessionMinutes: 235, // مدة البث لكل دورة: 3 ساعات و55 دقيقة
  mpdWaitSeconds: 120, // الانتظار بعد التشغيل لتوليد روابط DASH
  cooldownSeconds: 60,  // فترة التبريد بين الدورات
  streamDelaySeconds: 0,
  probeSize: "10000000",
  analyzeDuration: "10000000",
  channels: [
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/753320194_122100376827401514_8275779885008593037_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=oIPWFYYeCrcQ7kNvwFmNDSC&_nc_oc=AdrbZgkHc2Wq6ujLNtTnl4OtG-j9jjQaZlRmPtWwossaTBNUNn6eepA5Cw5lJsUUSKA&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=XFG9bAuC6jlsBoFD8Q3u3A&_nc_ss=7b289&oh=00_AQBWYdbLn0nAse1o0xAunvoBwtF9vYknYp-ZT4-C9avoQQ&oe=6A6D40B7",
      name: "beIN News", 
      url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/83618.ts" 
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/753320194_122100376827401514_8275779885008593037_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=oIPWFYYeCrcQ7kNvwFmNDSC&_nc_oc=AdrbZgkHc2Wq6ujLNtTnl4OtG-j9jjQaZlRmPtWwossaTBNUNn6eepA5Cw5lJsUUSKA&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=XFG9bAuC6jlsBoFD8Q3u3A&_nc_ss=7b289&oh=00_AQBWYdbLn0nAse1o0xAunvoBwtF9vYknYp-ZT4-C9avoQQ&oe=6A6D40B7",
      name: "beIN News", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/443146.ts" 
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751563664_122100376317401514_7110231260316540204_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2Jhzsln9fJgQ7kNvwH3Fj4V&_nc_oc=Adpdn7NXY64C3UWfd1GchFgDncYeuKBaV9U12NCGC53F13xKIDn8ABzK2qlnr7ZrbsQ&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=bwtVTnmi1u9TenF7PTWDnQ&_nc_ss=79289&oh=00_AQCRWsgsuOLgFyV2XLnZc6QXS10q-VfjwiUeRlg94FBk9A&oe=6A6D4FCD",
      name: "beIN 1",    
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/325793.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752551212_122100376689401514_5886627502394995910_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=DEc1UxERXlYQ7kNvwFmiw6T&_nc_oc=AdqX6BFTJSmx5mFyIzhqixCvo-4KzxaAgksfQELvFRz8ow5vBjY5yDts0-GHiMjx42Q&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=bwtVTnmi1u9TenF7PTWDnQ&_nc_ss=79289&oh=00_AQA3nxOk4PQ1kmX3xZnmyuQWgXiCJsJL18Gx337q16HS_A&oe=6A6D58AA",
      name: "beIN 2",    
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/325794.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752484584_122100376671401514_6217817104784997284_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=0TnbyYPux9YQ7kNvwG-Ozhk&_nc_oc=Adrls0QkTI2TH5i4AWN4eFltoOIa0pCFAKjrN6XcCHIfNY_HH9XuGYJSCh2MPyQLv8A&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=bwtVTnmi1u9TenF7PTWDnQ&_nc_ss=79289&oh=00_AQCvQz6H12jmq62hOS_EX8BQC5GvmenxxykI3wyaqhmT8A&oe=6A6D5F82",
      name: "beIN 3",    
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/325795.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751578454_122100376809401514_6895915391964971655_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=QoElYlm0i1oQ7kNvwGS8Dxw&_nc_oc=AdoV5lKvA792Zhq13pQikGqZej0mdII6t3DN_5FdaJJEFutVsH-M1LCc1bcEyl1B4Z4&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=bwtVTnmi1u9TenF7PTWDnQ&_nc_ss=79289&oh=00_AQAfRKBwCaBuE6JBJZagKfaf9_VfTvBGGq_N-Vdy8hgOYg&oe=6A6D5A4A",
      name: "beIN 4",    
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/325796.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751437753_122100376821401514_6360876051451700135_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=gV3nhKbdAqsQ7kNvwHXRn8e&_nc_oc=AdoPSqFvlNR6324yq31VhtD4W336naxeGJNqSYIinIVTxjxu0UEypmqwXsyncP8H8jc&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=Ge7jYl46e4cpqhHqicVOxA&_nc_ss=7b289&oh=00_AQDn7DqiQnS-m4CmefOafCkjjbQT80boyk2k6RHFA17YJw&oe=6A6D4938",
      name: "beIN 5",    
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/325797.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/753647362_122100376815401514_2257212559810435923_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=F4ADCSQ-6aQQ7kNvwHwJZD-&_nc_oc=Adp3SUULw7OlhOBBpJcD0VibZzAtUgsmCO9XIlCbGkLil-Wr317eg61lMD77ur0dRxY&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=OL0Z0kc1QFJ7fxuAacOhxQ&_nc_ss=7b289&oh=00_AQBT1nAIf-iUOuS5araHxU6xAVE1OBM53LbX_KYlsEzfVA&oe=6A6D4584",
      name: "beIN 6",    
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/325798.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/753320194_122100376683401514_6123074156123600585_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=lqiGCPfM7iIQ7kNvwEZZBIy&_nc_oc=Adqvel9H512ibxrMqzFD-fTpcBbTZwmZU-yEXEnR1zOE0XNASkOgNYOHv6YZAjNImU0&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=MWSjtISjlyu1XVHNnpPh2w&_nc_ss=7b289&oh=00_AQBBg4WaEXiiVpQl-UQv5njbZXyYFPPxK7Li-IQkihw8jA&oe=6A6D36A6",
      name: "beIN 7",    
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/325799.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751915199_122100376731401514_3271433633498970370_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=_6P8F-t6xSUQ7kNvwHr3i27&_nc_oc=AdoanrrSovjgKN_TCLXpBbIegMzbAqN00RzxoRdtefLaMG9XVBV6uz9_J9DcnVxxn_c&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=wWH7emSIoh8c3EC19Lg3jA&_nc_ss=7b289&oh=00_AQAEfFElC5sS6-ZCtWv5KmWb95MWYYnrxAGAX00AgKJ4ig&oe=6A6D47F6",
      name: "beIN 8",    
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/325800.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752648857_122100395247401514_7968696883797853697_n.jpg?stp=dst-jpg_tt6&cstp=mx240x240&ctp=s240x240&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MCrhN3IF-SoQ7kNvwGisiG_&_nc_oc=AdrIYTwOfrxXboUnOP997weHOGl9S5noVeyLP5OQJCGygeSicdsvhJogLqFC4EhnAeM&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=7fTXC10AuOT1PJkpjjz89A&_nc_ss=7b289&oh=00_AQB9lv0GXWraDbogdtqk-RHc3gbWFNEAKmLEH7gyaE5KXA&oe=6A6D5B42",
      name: "الثمانية 1", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/421785.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752648857_122100395247401514_7968696883797853697_n.jpg?stp=dst-jpg_tt6&cstp=mx240x240&ctp=s240x240&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MCrhN3IF-SoQ7kNvwGisiG_&_nc_oc=AdrIYTwOfrxXboUnOP997weHOGl9S5noVeyLP5OQJCGygeSicdsvhJogLqFC4EhnAeM&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=7fTXC10AuOT1PJkpjjz89A&_nc_ss=7b289&oh=00_AQB9lv0GXWraDbogdtqk-RHc3gbWFNEAKmLEH7gyaE5KXA&oe=6A6D5B42",
      name: "الثمانية 2", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/421786.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752648857_122100395247401514_7968696883797853697_n.jpg?stp=dst-jpg_tt6&cstp=mx240x240&ctp=s240x240&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MCrhN3IF-SoQ7kNvwGisiG_&_nc_oc=AdrIYTwOfrxXboUnOP997weHOGl9S5noVeyLP5OQJCGygeSicdsvhJogLqFC4EhnAeM&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=7fTXC10AuOT1PJkpjjz89A&_nc_ss=7b289&oh=00_AQB9lv0GXWraDbogdtqk-RHc3gbWFNEAKmLEH7gyaE5KXA&oe=6A6D5B42",
      name: "الثمانية 3", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/429403.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751563623_122100453369401514_6285272315232538946_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=1M4zPftFV9oQ7kNvwEaLZiJ&_nc_oc=Adp76h1T_KVx_dD04XZNBpr9cRrA2GNohfz20PRw5AkXkwmF7vcaWYqGhfcosWpKzvY&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=T--UC2mvIEg4bxdd3eawsQ&_nc_ss=7b289&oh=00_AQC0Ea2t-M-qXTd5dexA8pjstW5OUFN4itjRxxqseksfqw&oe=6A6D4434",
      name: "Mbc 2", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/45168.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/753298323_122100453267401514_3476795863090484615_n.jpg?stp=dst-jpg_tt6&cstp=mx160x160&ctp=s160x160&_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=WZS6jQMRpmgQ7kNvwH2ZRS0&_nc_oc=AdoML8xpFZ3-yPFzCvMX85Ys1tAMdT6L5vJdaBYu86X2XeuWNn5uTJlswK7NZgKYDPI&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=T--UC2mvIEg4bxdd3eawsQ&_nc_ss=7b289&oh=00_AQB6X0OWcuyzigZzBN1I-w6s8NWsLJYvq5Mt2Qmuen_rKg&oe=6A6D4FDD",
      name: "Mbc 3", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/45143.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/754007087_122100453411401514_5987379144688097958_n.jpg?stp=dst-jpg_tt6&cstp=mx1284x1284&ctp=s1284x1284&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=KBXg6tlJcg8Q7kNvwHNecEb&_nc_oc=Adr78RhN8Ierx_pb1Vz0512OYK4eMhFho5_ZtPFkNEcVDvMbB6vHVvpgYaKCr7zsOVc&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=T--UC2mvIEg4bxdd3eawsQ&_nc_ss=7b289&oh=00_AQBbalec5t73eZ_FrIjgoviMniqDp7W90p5tjXYQKNT8gA&oe=6A6D52A4",
      name: "Mbc 4", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/45164.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751751765_122100453375401514_1500326668910306352_n.jpg?stp=dst-jpg_tt6&cstp=mx678x452&ctp=s678x452&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=630KjAQHXoQQ7kNvwHicOvc&_nc_oc=AdouHdqjicn93UCgrDmikuMmYQCB5d4KLLjuREuR11tfQFKNdnRhbaODArRUdlgQ4U8&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=T--UC2mvIEg4bxdd3eawsQ&_nc_ss=7b289&oh=00_AQDwNYhaOQsCHlqvqinqyUaOR4rHReJepd5akq2AOySDlA&oe=6A6D4117",
      name: "Mbc 5", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/92759.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751563644_122101029321401514_6404423517557507320_n.jpg?stp=dst-jpg_tt6&cstp=mx220x231&ctp=s220x231&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=DQPNeXgTPWQQ7kNvwFuCSli&_nc_oc=Adr7WEa5xpFI3w9oDZqyFha-tH5M0RR7qgMiC0vV6hV7O9lW8Q-nY9h51v0aQQwBYIo&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=VrBKCRn-FNO6I1Car43Ysg&_nc_ss=7b289&oh=00_AQAvp9iKEZSLtYMsONbRvgFGDOrUQ0MvWTRUSgB801ZnkA&oe=6A6D4B6D",
      name: "Al aoula HD", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/414016.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751738154_122101029315401514_7668531375224878344_n.jpg?stp=dst-jpg_tt6&cstp=mx320x320&ctp=s320x320&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=P0r434m6Q6AQ7kNvwEyhdCC&_nc_oc=AdoCY1C0Fqfm7tAGs7Cfty31_vg0pmV4x9RSEbzoZdFSl-sUeobX_aXHFxyWpXKHycc&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=VrBKCRn-FNO6I1Car43Ysg&_nc_ss=7b289&oh=00_AQCn3JjlKozE8if0CLOCCXGH49lhKJqQhYDPsX4OxXc_Tg&oe=6A6D59AD",
      name: "2m maroc", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/413999.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752845929_122101029141401514_180650434062533038_n.jpg?stp=dst-jpg_tt6&cstp=mx225x225&ctp=s225x225&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3ObFdFWM6fYQ7kNvwEVVsWS&_nc_oc=AdqpeuozLwdbxz0hQOfuhkSVI9jOhPUuFA4v0_NBvavG9Nipf1T6i_7FnRytbGlb2kc&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=LNc862nIftvkA8aW3WxslA&_nc_ss=7b289&oh=00_AQAUywz6x_kLJE2U-NG_AmWfITaghHoX2sEcbJu-m-ZZYQ&oe=6A6D6DD5",
      name: "Arryadia HD", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/414007.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/754202392_122102716053401514_6634846598045965560_n.jpg?stp=dst-jpg_tt6&cstp=mx400x400&ctp=s400x400&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MYFJ7GpUqjEQ7kNvwFMQemj&_nc_oc=AdowwN2hP0CAjH6rBotCRTlOm77UrdLb8UX9qJzNVI3QC3ATARoa0LbAWrNnVvkWbNM&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=dr_Dh6EuVQ88j3JmvO3OLA&_nc_ss=79289&oh=00_AQDbIHh8-K9y_xCjwj111eQXGn9ohRXLJIwn6g1R9sAjEA&oe=6A6D3785",
      name: "قران الكريم", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/413749.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/758677415_122106345471401514_8872222251146600245_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=4cHgJaoB4Q8Q7kNvwFr-Ox3&_nc_oc=Ado5wedV09dvQEvOoM9cfFVCf8eCG4wWRxTSx9Y2WVvjc33rPRcPwlB9Iemd1Ptmq9g&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=MzXcVG2_mECJ5OO5XoRU_w&_nc_ss=79289&oh=00_AQA1SUSCa_1R1DotHpJE6jhkQzAsFGHIr696NOlSKW6w-A&oe=6A6E7EFB",
      name: "Amazon Prime 1", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/414131.ts"
    },
    { 
      img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/758677415_122106345471401514_8872222251146600245_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=4cHgJaoB4Q8Q7kNvwFr-Ox3&_nc_oc=Ado5wedV09dvQEvOoM9cfFVCf8eCG4wWRxTSx9Y2WVvjc33rPRcPwlB9Iemd1Ptmq9g&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=MzXcVG2_mECJ5OO5XoRU_w&_nc_ss=79289&oh=00_AQA1SUSCa_1R1DotHpJE6jhkQzAsFGHIr696NOlSKW6w-A&oe=6A6E7EFB",
      name: "Amazon Prime 2", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/414132.ts"
    },
    { 
      img: "https://scontent.xx.fna.fbcdn.net/v/t39.30808-6/752391120_122101087545401514_6281134918958186835_n.jpg?stp=dst-jpg_tt6&cstp=mx516x387&ctp=s516x387&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=8317botw3dsQ7kNvwEZ3j-j&_nc_oc=AdrbvHnddYNf-ewZCsaYaCQp-rdTZh9KeZlCbojqzrGvTwQY2nxIMil4Vy5vAs5TZuA&_nc_zt=23&_nc_ht=scontent.fcmn5-2.fna&_nc_gid=E_kMbJ86ULVSTuwhGtl6BQ&_nc_ss=79289&oh=00_AQCYVBbrxoJmeyGTLet6PDjg9sNdukgMDE818PcjEVsPeA&oe=6A6E8870",
      name: "National Geo", 
      url: "http://185.191.126.127:8080/live/b0:99:d7:15:88:50/3090914536649669/15026.ts"
    }
  ]
};

function normalizeChannels(cfg) {
  if (cfg && Array.isArray(cfg.channels)) {
    cfg.channels = cfg.channels.map(ch => {
      let url = ch.url;
      if (typeof url === "string") {
        url = url.replace(/\.m3u8$/i, ".ts");
        if (url.includes("/live/")) {
          url = url.replace(/\/+live\//i, "//live/");
        }
      }
      return { ...ch, url };
    });
  }
  return cfg;
}

normalizeChannels(DEFAULT_CONFIG);

// تحميل الإعدادات المخصصة إن وجدت في ملف stream_config.json
let config = { ...DEFAULT_CONFIG };
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    config = normalizeChannels({ ...DEFAULT_CONFIG, ...loaded });
    console.log("⚙️  تم تحميل الإعدادات المخصصة من stream_config.json بنجاح.");
  } catch (e) {
    console.error("⚠️  تعذر قراءة stream_config.json، سيتم الاعتماد على الإعدادات المدمجة.", e.message);
  }
}

// دالة الطباعة السريعة مع الوقت والتاريخ
function log(msg) {
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${time}] ${msg}`);
}

// دالة الانتظار Async Sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// دالة طلبات FB Graph API عبر fetch المدمجة
async function fbRequest(endpoint, method = 'GET', bodyParams = null, queryParams = {}) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${endpoint}`);
  Object.keys(queryParams).forEach(k => url.searchParams.append(k, queryParams[k]));

  const options = { method };
  if (bodyParams) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(bodyParams);
  }

  const res = await fetch(url.toString(), options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Facebook API Error [${res.status}]`);
  }
  return data;
}

// متغيرات حالة البث والعمليات
let activeProcs = [];
let activeStreamKeys = [];
let currentCycle = 1;

// تنظيف العمليات عند الخروج
function cleanupAndExit() {
  log("🛑 جاري إغلاق السكريبت وتنظيف عمليات FFmpeg...");
  activeProcs.forEach(p => {
    try { p.kill('SIGKILL'); } catch (e) {}
  });
  try {
    execSync("pkill -9 ffmpeg 2>/dev/null || true");
  } catch (e) {}
  log("✅ تم إغلاق كافة عمليات البث. وداعاً!");
  process.exit(0);
}

process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);

// الدالة الرئيسية للمحرك التلقائي
async function runDragonLiveLoop() {
  console.log(`
====================================================================
🐉  DRAGON LIVE 24/7 STREAMER LOADED
📡  عدد القنوات: ${config.channels.length} قناة رياضية وترفيهية
⏱️  مدة الدورة: ${config.sessionMinutes} دقيقة
====================================================================
  `);

  while (true) {
    try {
      log(`\n=================== 🚀 بدء الدورة رقم #${currentCycle} ===================`);

      // 1. إنشاء بث مباشر لجميع القنوات على فيسبوك بالتوازي
      log(`1️⃣  جاري إنشاء نقاط البث المباشر (FB Live Video) لـ ${config.channels.length} قناة...`);
      const creationPromises = config.channels.map(async (ch) => {
        let attempts = 0;
        while (attempts < 3) {
          attempts++;
          try {
            const res = await fbRequest(`${config.livePageId}/live_videos`, 'POST', null, {
              access_token: config.liveAccessToken,
              status: "UNPUBLISHED",
              title: ch.name
            });
            log(`  ✅ [${ch.name}] تم إنشاء نقطة البث بنجاح (ID: ${res.id})`);
            return { ...ch, ...res };
          } catch (e) {
            log(`  ⚠️ [${ch.name}] فشلت المحاولة ${attempts}: ${e.message}`);
            if (attempts < 3) await sleep(2000);
            else return null;
          }
        }
        return null;
      });

      const sessions = (await Promise.all(creationPromises)).filter(Boolean);
      log(`📊  تم تجهيز ${sessions.length} من أصل ${config.channels.length} قناة للبث المباشر.`);

      if (sessions.length === 0) {
        log("❌  لم يتم إنشاء أي نقطة بث! سيتم إعادة المحاولة بعد 60 ثانية...");
        await sleep(60000);
        continue;
      }

      // 2. تشغيل FFmpeg لكل قناة
      log(`2️⃣  جاري تشغيل محركات FFmpeg لإرسال البث المباشر لجميع القنوات...`);
      activeStreamKeys = [];
      activeProcs = [];

      for (let i = 0; i < sessions.length; i++) {
        const s = sessions[i];
        if (s.stream_url) {
          activeStreamKeys.push({
            id: s.id,
            name: s.name,
            img: s.img,
            url: s.url,
            rtmp: s.stream_url,
            dash: null
          });

          const args = [
            ...(config.userAgent ? ["-user_agent", config.userAgent] : []),
            "-reconnect", "1",
            "-reconnect_streamed", "1",
            "-reconnect_delay_max", "10",
            "-reconnect_at_eof", "1",
            "-reconnect_on_network_error", "1",
            "-reconnect_on_http_error", "4xx,5xx",
            "-i", s.url,
            "-c:v", "copy",
            "-c:a", "copy",
            "-f", "flv",
            s.stream_url
          ];

          log(`  🚀 [${s.name}] تشغيل FFmpeg...`);
          const v7Ffmpeg = path.join(__dirname, "bin", "ffmpeg-v7", "ffmpeg");
          const v8Ffmpeg = path.join(__dirname, "bin", "ffmpeg-v8", "ffmpeg");
          const rootFfmpeg = path.join(__dirname, "bin", "ffmpeg");
          const localFfmpeg = path.join(__dirname, "bin", "ffmpeg-5.1-bin", "ffmpeg");
          const ffmpegBin = process.env.FFMPEG_PATH || (fs.existsSync(v7Ffmpeg) ? v7Ffmpeg : (fs.existsSync(rootFfmpeg) ? rootFfmpeg : (fs.existsSync(v8Ffmpeg) ? v8Ffmpeg : (fs.existsSync("/usr/bin/ffmpeg") ? "/usr/bin/ffmpeg" : (fs.existsSync(localFfmpeg) ? localFfmpeg : "ffmpeg")))));
          const proc = spawn(ffmpegBin, args);
          activeProcs.push(proc);

          proc.stderr.on('data', (data) => {
            const errStr = data.toString();
            if (errStr.toLowerCase().includes("fatal") || errStr.toLowerCase().includes("error")) {
              if (!errStr.includes("input/output error") && !errStr.includes("non-existing index")) {
                // log(`  [FFmpeg ${s.name}]: ${errStr.trim()}`);
              }
            }
          });

          proc.on('exit', (code, sig) => {
            log(`  ℹ️ [${s.name}] انتهت عملية FFmpeg (رمز: ${code || sig})`);
          });
        }
      }

      // 3. الانتظار لاستقرار البث وتوليد روابط DASH
      log(`3️⃣  جاري الانتظار لمدة ${config.mpdWaitSeconds} ثانية لاستقرار البث وتوليد روابط DASH...`);
      await sleep(config.mpdWaitSeconds * 1000);

      // 4. استخراج روابط DASH وتحديث منشور فيسبوك
      log(`4️⃣  جاري استخراج روابط المعاينة DASH وتحديث المنشور المباشر...`);
      await Promise.all(activeStreamKeys.map(async (s) => {
        try {
          const r = await fbRequest(s.id, 'GET', null, {
            fields: "dash_preview_url",
            access_token: config.liveAccessToken
          });
          s.dash = r.dash_preview_url || null;
        } catch (e) {
          s.dash = null;
        }
      }));

      // إعداد كائن JSON لتحديث المنشور
      const postPayload = activeStreamKeys.map(s => ({
        img: s.img,
        name: s.name,
        url: s.dash || "Offline"
      }));
      const postMessage = JSON.stringify(postPayload, null, 2);

      try {
        await fbRequest(`${config.postPageId}_${config.postId}`, 'POST', null, {
          access_token: config.postAccessToken,
          message: postMessage
        });
        log("  📝 تم تحديث منشور فيسبوك بنجاح بقائمة القنوات وروايط DASH الحية!");
      } catch (e) {
        log(`  ⚠️ تعذر تحديث منشور فيسبوك: ${e.message}`);
      }

      // 5. الاستمرار في البث طوال فترة الجلسة
      const sessionMs = config.sessionMinutes * 60 * 1000;
      log(`5️⃣  🔥 جميع القنوات تعمل بنجاح! سيستمر البث المباشر لمدة ${config.sessionMinutes} دقيقة...`);
      await sleep(sessionMs);

      // 6. التنظيف والتبريد قبل الدورة التالية
      log(`6️⃣  انتهت الجلسة. جاري إيقاف عملية البث وحذف منشورات البث المباشر المؤقتة...`);
      activeProcs.forEach(p => { try { p.kill('SIGKILL'); } catch (e) {} });
      activeProcs = [];
      try { execSync("pkill -9 ffmpeg 2>/dev/null || true"); } catch (e) {}

      await Promise.all(activeStreamKeys.map(async (s) => {
        try {
          await fbRequest(s.id, 'DELETE', null, { access_token: config.liveAccessToken });
        } catch (e) {}
      }));

      activeStreamKeys = [];
      log(`😴 فترة تبريد لمدة ${config.cooldownSeconds} ثانية قبل بدء الدورة الجديدة...`);
      await sleep(config.cooldownSeconds * 1000);

      currentCycle++;

    } catch (e) {
      log(`❌ حدث خطأ غير متوقع في محرك البث: ${e.message}`);
      log("إعادة المحاولة بعد 30 ثانية...");
      await sleep(30000);
    }
  }
}

// بدء التشغيل
runDragonLiveLoop();
