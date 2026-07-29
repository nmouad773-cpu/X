from concurrent.futures import ThreadPoolExecutor
import json
import os
import signal
import subprocess
import sys
import threading
import time
import requests

# --- الإعدادات العامة والتطبيق ---
GRAPH_VERSION = "v22.0"

# --- بيانات الوصول للبث المباشر والتعديل ---
LIVE_ACCESS_TOKEN = "EAAZAfLN8JuaMBSDchhhQFMqF8xJfvjDmSrEO2qTGCYWBa1uo4t9IuKBNtSVn8iMZAnmPwGVUFWooX2faBveSX8jZCLBCMM8tf3zmpD87CFI57dD3AnH40TGDvqYl3qG2JpfBZB3htAfZBYen4jqjKjYwou8qAKO7WLdpKxrm8xFBWMTsWhN5RwLUqxU0sTZBviP7zw"
LIVE_PAGE_ID = "466039649924341"

POST_ACCESS_TOKEN = "EAAZAfLN8JuaMBSNC4PaTVkOfXF7cZAMhj4sT6j35zJQQvVnJXzdzLPc4ibyPmMEaKauOdEj0UYXxZBALTvzukoRZA8kzaeKyZBb3Ucpl8WjBuS0ZCzKr0uTbvlmCJKeRrsiCVgRbhFSguZCMjKK9SUxA7Pvs2EAaeehfRiHyFDTVMV5O2IjmoZCoqlNSgtUqgVHZBNAbOUR8P"
POST_PAGE_ID = "1288067541053277"
POST_ID = "122102349183401514"

# --- قائمة القنوات الموحدة (تم تحديث الروابط والصور بناءً على طلبك) ---
CHANNELS = [
    {
        "name": "beIN News",
        "url": "http://pro.netmos.ovh:7355/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/83618",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/753320194_122100376827401514_8275779885008593037_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=oIPWFYYeCrcQ7kNvwFmNDSC&_nc_oc=AdrbZgkHc2Wq6ujLNtTnl4OtG-j9jjQaZlRmPtWwossaTBNUNn6eepA5Cw5lJsUUSKA&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=XFG9bAuC6jlsBoFD8Q3u3A&_nc_ss=7b289&oh=00_AQBWYdbLn0nAse1o0xAunvoBwtF9vYknYp-ZT4-C9avoQQ&oe=6A6D40B7",
    },
    {
        "name": "beIN News",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/443146",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/753320194_122100376827401514_8275779885008593037_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=oIPWFYYeCrcQ7kNvwFmNDSC&_nc_oc=AdrbZgkHc2Wq6ujLNtTnl4OtG-j9jjQaZlRmPtWwossaTBNUNn6eepA5Cw5lJsUUSKA&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=XFG9bAuC6jlsBoFD8Q3u3A&_nc_ss=7b289&oh=00_AQBWYdbLn0nAse1o0xAunvoBwtF9vYknYp-ZT4-C9avoQQ&oe=6A6D40B7",
    },
    {
        "name": "beIN 1",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/325793",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/751563664_122100376317401514_7110231260316540204_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2Jhzsln9fJgQ7kNvwH3Fj4V&_nc_oc=Adpdn7NXY64C3UWfd1GchFgDncYeuKBaV9U12NCGC53F13xKIDn8ABzK2qlnr7ZrbsQ&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=bwtVTnmi1u9TenF7PTWDnQ&_nc_ss=79289&oh=00_AQCRWsgsuOLgFyV2XLnZc6QXS10q-VfjwiUeRlg94FBk9A&oe=6A6D4FCD",
    },
    {
        "name": "beIN 2",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/325794",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/752551212_122100376689401514_5886627502394995910_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=DEc1UxERXlYQ7kNvwFmiw6T&_nc_oc=AdqX6BFTJSmx5mFyIzhqixCvo-4KzxaAgksfQELvFRz8ow5vBjY5yDts0-GHiMjx42Q&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=bwtVTnmi1u9TenF7PTWDnQ&_nc_ss=79289&oh=00_AQA3nxOk4PQ1kmX3xZnmyuQWgXiCJsJL18Gx337q16HS_A&oe=6A6D58AA",
    },
    {
        "name": "beIN 3",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/325795",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/752484584_122100376671401514_6217817104784997284_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=0TnbyYPux9YQ7kNvwG-Ozhk&_nc_oc=Adrls0QkTI2TH5i4AWN4eFltoOIa0pCFAKjrN6XcCHIfNY_HH9XuGYJSCh2MPyQLv8A&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=bwtVTnmi1u9TenF7PTWDnQ&_nc_ss=79289&oh=00_AQCvQz6H12jmq62hOS_EX8BQC5GvmenxxykI3wyaqhmT8A&oe=6A6D5F82",
    },
    {
        "name": "beIN 4",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/325796",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/751578454_122100376809401514_6895915391964971655_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=QoElYlm0i1oQ7kNvwGS8Dxw&_nc_oc=AdoV5lKvA792Zhq13pQikGqZej0mdII6t3DN_5FdaJJEFutVsH-M1LCc1bcEyl1B4Z4&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=bwtVTnmi1u9TenF7PTWDnQ&_nc_ss=79289&oh=00_AQAfRKBwCaBuE6JBJZagKfaf9_VfTvBGGq_N-Vdy8hgOYg&oe=6A6D5A4A",
    },
    {
        "name": "beIN 5",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/325797",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/751437753_122100376821401514_6360876051451700135_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=gV3nhKbdAqsQ7kNvwHXRn8e&_nc_oc=AdoPSqFvlNR6324yq31VhtD4W336naxeGJNqSYIinIVTxjxu0UEypmqwXsyncP8H8jc&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=Ge7jYl46e4cpqhHqicVOxA&_nc_ss=7b289&oh=00_AQDn7DqiQnS-m4CmefOafCkjjbQT80boyk2k6RHFA17YJw&oe=6A6D4938",
    },
    {
        "name": "beIN 6",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/325798",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/753647362_122100376815401514_2257212559810435923_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=F4ADCSQ-6aQQ7kNvwHwJZD-&_nc_oc=Adp3SUULw7OlhOBBpJcD0VibZzAtUgsmCO9XIlCbGkLil-Wr317eg61lMD77ur0dRxY&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=OL0Z0kc1QFJ7fxuAacOhxQ&_nc_ss=7b289&oh=00_AQBT1nAIf-iUOuS5araHxU6xAVE1OBM53LbX_KYlsEzfVA&oe=6A6D4584",
    },
    {
        "name": "beIN 7",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/325799",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/753320194_122100376683401514_6123074156123600585_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=lqiGCPfM7iIQ7kNvwEZZBIy&_nc_oc=Adqvel9H512ibxrMqzFD-fTpcBbTZwmZU-yEXEnR1zOE0XNASkOgNYOHv6YZAjNImU0&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=MWSjtISjlyu1XVHNnpPh2w&_nc_ss=7b289&oh=00_AQBBg4WaEXiiVpQl-UQv5njbZXyYFPPxK7Li-IQkihw8jA&oe=6A6D36A6",
    },
    {
        "name": "beIN 8",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/325800",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/751915199_122100376731401514_3271433633498970370_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=_6P8F-t6xSUQ7kNvwHr3i27&_nc_oc=AdoanrrSovjgKN_TCLXpBbIegMzbAqN00RzxoRdtefLaMG9XVBV6uz9_J9DcnVxxn_c&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=wWH7emSIoh8c3EC19Lg3jA&_nc_ss=7b289&oh=00_AQAEfFElC5sS6-ZCtWv5KmWb95MWYYnrxAGAX00AgKJ4ig&oe=6A6D47F6",
    },
    {
        "name": "الثمانية 1",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/421785",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/752648857_122100395247401514_7968696883797853697_n.jpg?stp=dst-jpg_tt6&cstp=mx240x240&ctp=s240x240&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MCrhN3IF-SoQ7kNvwGisiG_&_nc_oc=AdrIYTwOfrxXboUnOP997weHOGl9S5noVeyLP5OQJCGygeSicdsvhJogLqFC4EhnAeM&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=7fTXC10AuOT1PJkpjjz89A&_nc_ss=7b289&oh=00_AQB9lv0GXWraDbogdtqk-RHc3gbWFNEAKmLEH7gyaE5KXA&oe=6A6D5B42",
    },
    {
        "name": "الثمانية 2",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/421786",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/752648857_122100395247401514_7968696883797853697_n.jpg?stp=dst-jpg_tt6&cstp=mx240x240&ctp=s240x240&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MCrhN3IF-SoQ7kNvwGisiG_&_nc_oc=AdrIYTwOfrxXboUnOP997weHOGl9S5noVeyLP5OQJCGygeSicdsvhJogLqFC4EhnAeM&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=7fTXC10AuOT1PJkpjjz89A&_nc_ss=7b289&oh=00_AQB9lv0GXWraDbogdtqk-RHc3gbWFNEAKmLEH7gyaE5KXA&oe=6A6D5B42",
    },
    {
        "name": "الثمانية 3",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/429403",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/752648857_122100395247401514_7968696883797853697_n.jpg?stp=dst-jpg_tt6&cstp=mx240x240&ctp=s240x240&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MCrhN3IF-SoQ7kNvwGisiG_&_nc_oc=AdrIYTwOfrxXboUnOP997weHOGl9S5noVeyLP5OQJCGygeSicdsvhJogLqFC4EhnAeM&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=7fTXC10AuOT1PJkpjjz89A&_nc_ss=7b289&oh=00_AQB9lv0GXWraDbogdtqk-RHc3gbWFNEAKmLEH7gyaE5KXA&oe=6A6D5B42",
    },
    {
        "name": "Mbc 2",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/45168",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/751563623_122100453369401514_6285272315232538946_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=1M4zPftFV9oQ7kNvwEaLZiJ&_nc_oc=Adp76h1T_KVx_dD04XZNBpr9cRrA2GNohfz20PRw5AkXkwmF7vcaWYqGhfcosWpKzvY&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=T--UC2mvIEg4bxdd3eawsQ&_nc_ss=7b289&oh=00_AQC0Ea2t-M-qXTd5dexA8pjstW5OUFN4itjRxxqseksfqw&oe=6A6D4434",
    },
    {
        "name": "Mbc 3",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/45143",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/753298323_122100453267401514_3476795863090484615_n.jpg?stp=dst-jpg_tt6&cstp=mx160x160&ctp=s160x160&_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=WZS6jQMRpmgQ7kNvwH2ZRS0&_nc_oc=AdoML8xpFZ3-yPFzCvMX85Ys1tAMdT6L5vJdaBYu86X2XeuWNn5uTJlswK7NZgKYDPI&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=T--UC2mvIEg4bxdd3eawsQ&_nc_ss=7b289&oh=00_AQB6X0OWcuyzigZzBN1I-w6s8NWsLJYvq5Mt2Qmuen_rKg&oe=6A6D4FDD",
    },
    {
        "name": "Mbc 4",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/45164",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/754007087_122100453411401514_5987379144688097958_n.jpg?stp=dst-jpg_tt6&cstp=mx1284x1284&ctp=s1284x1284&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=KBXg6tlJcg8Q7kNvwHNecEb&_nc_oc=Adr78RhN8Ierx_pb1Vz0512OYK4eMhFho5_ZtPFkNEcVDvMbB6vHVvpgYaKCr7zsOVc&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=T--UC2mvIEg4bxdd3eawsQ&_nc_ss=7b289&oh=00_AQBbalec5t73eZ_FrIjgoviMniqDp7W90p5tjXYQKNT8gA&oe=6A6D52A4",
    },
    {
        "name": "Mbc 5",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/92759",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/751751765_122100453375401514_1500326668910306352_n.jpg?stp=dst-jpg_tt6&cstp=mx678x452&ctp=s678x452&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=630KjAQHXoQQ7kNvwHicOvc&_nc_oc=AdouHdqjicn93UCgrDmikuMmYQCB5d4KLLjuREuR11tfQFKNdnRhbaODArRUdlgQ4U8&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=T--UC2mvIEg4bxdd3eawsQ&_nc_ss=7b289&oh=00_AQDwNYhaOQsCHlqvqinqyUaOR4rHReJepd5akq2AOySDlA&oe=6A6D4117",
    },
    {
        "name": "2m maroc",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/413999",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/751738154_122101029315401514_7668531375224878344_n.jpg?stp=dst-jpg_tt6&cstp=mx320x320&ctp=s320x320&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=P0r434m6Q6AQ7kNvwEyhdCC&_nc_oc=AdoCY1C0Fqfm7tAGs7Cfty31_vg0pmV4x9RSEbzoZdFSl-sUeobX_aXHFxyWpXKHycc&_nc_zt=23&_nc_ht=scontent.ftng1-1.fna&_nc_gid=VrBKCRn-FNO6I1Car43Ysg&_nc_ss=7b289&oh=00_AQCn3JjlKozE8if0CLOCCXGH49lhKJqQhYDPsX4OxXc_Tg&oe=6A6D59AD",
    },
    {
        "name": "Arryadia HD",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/414007",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/752845929_122101029141401514_180650434062533038_n.jpg?stp=dst-jpg_tt6&cstp=mx225x225&ctp=s225x225&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3ObFdFWM6fYQ7kNvwEVVsWS&_nc_oc=AdqpeuozLwdbxz0hQOfuhkSVI9jOhPUuFA4v0_NBvavG9Nipf1T6i_7FnRytbGlb2kc&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=LNc862nIftvkA8aW3WxslA&_nc_ss=7b289&oh=00_AQAUywz6x_kLJE2U-NG_AmWfITaghHoX2sEcbJu-m-ZZYQ&oe=6A6D6DD5",
    },
    {
        "name": "قران الكريم",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/413749",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/754202392_122102716053401514_6634846598045965560_n.jpg?stp=dst-jpg_tt6&cstp=mx400x400&ctp=s400x400&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=MYFJ7GpUqjEQ7kNvwFMQemj&_nc_oc=AdowwN2hP0CAjH6rBotCRTlOm77UrdLb8UX9qJzNVI3QC3ATARoa0LbAWrNnVvkWbNM&_nc_zt=23&_nc_ht=scontent.ftng2-1.fna&_nc_gid=dr_Dh6EuVQ88j3JmvO3OLA&_nc_ss=79289&oh=00_AQDbIHh8-K9y_xCjwj111eQXGn9ohRXLJIwn6g1R9sAjEA&oe=6A6D3785",
    },
    {
        "name": "Amazon Prime 1",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/414131",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/758677415_122106345471401514_8872222251146600245_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=4cHgJaoB4Q8Q7kNvwFr-Ox3&_nc_oc=Ado5wedV09dvQEvOoM9cfFVCf8eCG4wWRxTSx9Y2WVvjc33rPRcPwlB9Iemd1Ptmq9g&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=MzXcVG2_mECJ5OO5XoRU_w&_nc_ss=79289&oh=00_AQA1SUSCa_1R1DotHpJE6jhkQzAsFGHIr696NOlSKW6w-A&oe=6A6E7EFB",
    },
    {
        "name": "Amzon Prime 2",
        "url": "http://pro.netmos.ovh:7355//UDJPRCRA1L055B/Ep27yiiwbb56mjkl/230577",
        "img": "https://scontent.xx.fbcdn.net/v/t39.30808-6/758677415_122106345471401514_8872222251146600245_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=4cHgJaoB4Q8Q7kNvwFr-Ox3&_nc_oc=Ado5wedV09dvQEvOoM9cfFVCf8eCG4wWRxTSx9Y2WVvjc33rPRcPwlB9Iemd1Ptmq9g&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=MzXcVG2_mECJ5OO5XoRU_w&_nc_ss=79289&oh=00_AQA1SUSCa_1R1DotHpJE6jhkQzAsFGHIr696NOlSKW6w-A&oe=6A6E7EFB",
    },
    {
        "name": "National Geo",
        "url": "http://185.191.126.127:8080//b0:99:d7:15:88:50/3090914536649669/15026",
        "img": "https://scontent.xx.fna.fbcdn.net/v/t39.30808-6/752391120_122101087545401514_6281134918958186835_n.jpg?stp=dst-jpg_tt6&cstp=mx516x387&ctp=s516x387&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=8317botw3dsQ7kNvwEZ3j-j&_nc_oc=AdrbvHnddYNf-ewZCsaYaCQp-rdTZh9KeZlCbojqzrGvTwQY2nxIMil4Vy5vAs5TZuA&_nc_zt=23&_nc_ht=scontent.fcmn5-2.fna&_nc_gid=E_kMbJ86ULVSTuwhGtl6BQ&_nc_ss=79289&oh=00_AQCYVBbrxoJmeyGTLet6PDjg9sNdukgMDE818PcjEVsPeA&oe=6A6E8870",
    },
]

# --- الإعدادات الزمنية ---
SESSION_MS = (3 * 60 + 55) * 60 * 1000
MPD_WAIT_MS = 2 * 60 * 1000
COOLDOWN_MS = 1 * 60 * 1000

active_processes = []
active_stream_keys = []
current_cycle = 1
cycle_start_time = None
is_stopping = False
skip_cycle = False


def sleep_ms(ms):
  time.sleep(ms / 1000.0)


def format_duration(ms):
  if ms < 0:
    ms = 0
  s = ms // 1000
  return f"{s // 3600}h {(s % 3600) // 60}m {s % 60}s"


def now_str():
  return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())


def countdown(ms, label):
  global skip_cycle, is_stopping
  rem = ms
  while rem > 0 and not skip_cycle and not is_stopping:
    sys.stdout.write(f"\r ⏳ [{label}]: {format_duration(rem)} ")
    sys.stdout.flush()
    step = min(1000, rem)
    sleep_ms(step)
    rem -= step
  sys.stdout.write("\n")


def start_ffmpeg(channel, rtmp):
  args = [
      "ffmpeg",
      "-re",
      "-fflags",
      "+genpts",
      "-i",
      channel["url"],
      "-c",
      "copy",
      "-f",
      "flv",
      rtmp,
  ]
  try:
    proc = subprocess.Popen(
        args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    return proc
  except Exception as e:
    print(f" ⚠️ [FFmpeg] فشل تشغيل العملية لـ {channel['name']}: {e}")
    return None


def create_preview(channel):
  try:
    url = f"https://graph.facebook.com/{GRAPH_VERSION}/{LIVE_PAGE_ID}/live_videos"
    params = {
        "access_token": LIVE_ACCESS_TOKEN,
        "status": "UNPUBLISHED",
        "title": channel["name"],
    }
    res = requests.post(url, params=params, timeout=15)
    data = res.json()
    if "id" in data and "stream_url" in data:
      return {**channel, **data}
    else:
      print(f" ❌ [{channel['name']}] خطأ في استجابة فيسبوك: {data}")
      return None
  except Exception as e:
    print(f" ❌ [{channel['name']}] فشل إنشاء الجلسة: {e}")
    return None


def delete_live_video(video_id):
  try:
    url = f"https://graph.facebook.com/{GRAPH_VERSION}/{video_id}"
    params = {"access_token": LIVE_ACCESS_TOKEN}
    requests.delete(url, params=params, timeout=10)
    print(f" 🗑️ تم حذف البث المباشر (ID: {video_id})")
  except Exception as e:
    print(f" ⚠️ فشل حذف البث {video_id}: {e}")


def update_post(stream_keys):
  updated_data = [
      {"img": s["img"], "name": s["name"], "url": s.get("dash") or "Offline"}
      for s in stream_keys
  ]
  message = json.dumps(updated_data)

  try:
    url = f"https://graph.facebook.com/{GRAPH_VERSION}/{POST_PAGE_ID}_{POST_ID}"
    params = {"access_token": POST_ACCESS_TOKEN, "message": message}
    requests.post(url, params=params, timeout=15)
    print(f" 📝 تم تحديث المنشور الرئيسي ({POST_ID}) بنجاح")
  except Exception as e:
    print(f" ⚠️ [POST] خطأ أثناء تحديث المنشور: {e}")


def cleanup_system():
  global active_processes, active_stream_keys
  print("\n🧹 جاري إيقاف جميع محركات FFmpeg وتنظيف البثوث...")

  for p in active_processes:
    try:
      p.terminate()
      p.wait(timeout=2)
    except:
      try:
        p.kill()
      except:
        pass
  active_processes = []

  try:
    if sys.platform == "win32":
      subprocess.run(
          ["taskkill", "/f", "/im", "ffmpeg.exe"],
          stdout=subprocess.DEVNULL,
          stderr=subprocess.DEVNULL,
      )
    else:
      subprocess.run(
          ["pkill", "-9", "ffmpeg"],
          stdout=subprocess.DEVNULL,
          stderr=subprocess.DEVNULL,
      )
  except:
    pass

  if active_stream_keys:
    print("🗑️ حذف جلسات البث النشطة من Facebook...")
    with ThreadPoolExecutor(max_workers=5) as executor:
      executor.map(lambda s: delete_live_video(s["id"]), active_stream_keys)
    active_stream_keys = []


def start_all_channels():
  global active_processes, active_stream_keys
  print(f"\n🚀 جاري إنشاء جلسات فيسبوك لجميع القنوات بالتوازي...")

  with ThreadPoolExecutor(max_workers=10) as executor:
    preview_results = list(executor.map(create_preview, CHANNELS))

  if is_stopping or skip_cycle:
    return

  print(f"▶️ تشغيل محركات FFmpeg لجميع القنوات معاً في نفس اللحظة...")
  for i, res in enumerate(preview_results):
    if res and "stream_url" in res:
      channel = CHANNELS[i]
      info = {
          "name": res["name"],
          "url": res["url"],
          "img": res["img"],
          "rtmp": res["stream_url"],
          "id": res["id"],
      }
      active_stream_keys.append(info)
      proc = start_ffmpeg(info, info["rtmp"])
      if proc:
        active_processes.append(proc)
        print(f"  ✔️ [FFmpeg] تشغيل {channel['name']} (-c copy)")


def run_session(cycle_num):
  global cycle_start_time, skip_cycle, active_processes, active_stream_keys
  cycle_start_time = time.time() * 1000
  skip_cycle = False
  active_processes = []
  active_stream_keys = []

  print(f"\n==========================================")
  print(f"🔄 الدورة #{cycle_num} | البدء: {now_str()}")
  print(f"==========================================")

  # تشغيل جميع القنوات معاً دفعة واحدة في نفس الثانية
  start_all_channels()

  if is_stopping or skip_cycle:
    return

  if len(active_processes) == 0:
    print(" ⚠️ لم يتم التمكن من بدء أي قناة، سيتم الانتقال للدورة التالية...")
    return

  print(f"\n⏳ انتظار استقرار جميع البثوث للحصول على روابط DASH (MPD)...")
  countdown(MPD_WAIT_MS, "استقرار DASH")

  if is_stopping or skip_cycle:
    return

  print(f"\n📡 جلب روابط DASH وتحديث المنشور الرئيسي لكل القنوات...")

  def fetch_dash(s):
    try:
      url = f"https://graph.facebook.com/{GRAPH_VERSION}/{s['id']}"
      params = {"fields": "dash_preview_url", "access_token": LIVE_ACCESS_TOKEN}
      r = requests.get(url, params=params, timeout=10)
      data = r.json()
      s["dash"] = data.get("dash_preview_url")
    except:
      s["dash"] = None

  with ThreadPoolExecutor(max_workers=5) as executor:
    executor.map(fetch_dash, active_stream_keys)

  update_post(active_stream_keys)

  remaining = SESSION_MS - ((time.time() * 1000) - cycle_start_time)
  if remaining > 0 and not is_stopping and not skip_cycle:
    print(f"\n🚀 جميع البثوث تعمل بنجاح! وقت التشغيل المتبقي لهذا الشوط...")
    countdown(int(remaining), "الوقت المتبقي لانتهاء الجلسة")

  print(f"\n🧹 انتهاء شوط البث: إغلاق الجلسات الحالية والتحضير للدورة التالية...")
  cleanup_system()


def interactive_cli():
  global is_stopping, skip_cycle, current_cycle, cycle_start_time
  while not is_stopping:
    try:
      line = input()
      if not line:
        continue
      cmd = line.strip().lower()

      if cmd == "status":
        print(f"\n📊 [حالة النظام]")
        print(f" - الدورة الحالية: #{current_cycle}")
        print(
            f" - عدد القنوات النشطة: {len(active_processes)} /"
            f" {len(CHANNELS)}"
        )
        if cycle_start_time:
          elapsed = int((time.time() * 1000) - cycle_start_time)
          print(f" - الوقت المنقضي: {format_duration(elapsed)}")
        print(f"------------------------------------------")
      elif cmd == "restart":
        print("\n🔄 تم طلب إعادة التشغيل المباشر للدورة...")
        skip_cycle = True
      elif cmd in ["stop", "exit"]:
        print("\n🛑 جاري الإيقاف النهائي للسكريبت بناءً على طلبك...")
        is_stopping = True
        skip_cycle = True
        cleanup_system()
        os._exit(0)
      else:
        print("💡 الأوامر المتاحة: status | restart | stop")
    except EOFError:
      break
    except Exception:
      pass


def main():
  global current_cycle, is_stopping
  os.system("cls" if os.name == "nt" else "clear")
  print("==================================================")
  print(" 📺 Facebook Live Unified Batch Streamer (Python) ")
  print("==================================================")
  print("💡 اكتب الأوامر التالية في أي وقت أثناء البث:")
  print("   - 'status' : لمعرفة حالة القنوات والوقت.")
  print("   - 'restart': لإعادة بدء الدورة الحالية.")
  print("   - 'stop'   : لإيقاف السكريبت وإغلاق كافة البثوث آمنياً.")
  print("==================================================\n")

  cli_thread = threading.Thread(target=interactive_cli, daemon=True)
  cli_thread.start()

  def signal_handler(sig, frame):
    global is_stopping
    print("\n\n🛑 تم التقاط أمر الإيقاف (Ctrl+C). جاري التنظيف والسلامة...")
    is_stopping = True
    cleanup_system()
    sys.exit(0)

  signal.signal(signal.SIGINT, signal_handler)

  while not is_stopping:
    try:
      run_session(current_cycle)
    except Exception as err:
      print(f"❌ خطأ غير متوقع في الدورة الرئيسية: {err}")
      cleanup_system()

    if is_stopping:
      break

    print(f"\n💤 فترة استراحة بين الدورات (دقيقة واحدة)...")
    countdown(COOLDOWN_MS, "فترة الراحة")
    current_cycle += 1


if __name__ == "__main__":
  main()
