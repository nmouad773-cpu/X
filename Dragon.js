const axios = require("axios");
const { spawn, execSync } = require("child_process");
const readline = require("readline");

// --- الإعدادات العامة والتطبيق ---
const GRAPH_VERSION = "v22.0";

// --- بيانات الوصول للبث المباشر والتعديل ---
const LIVE_ACCESS_TOKEN = "EAAZAfLN8JuaMBSDchhhQFMqF8xJfvjDmSrEO2qTGCYWBa1uo4t9IuKBNtSVn8iMZAnmPwGVUFWooX2faBveSX8jZCLBCMM8tf3zmpD87CFI57dD3AnH40TGDvqYl3qG2JpfBZB3htAfZBYen4jqjKjYwou8qAKO7WLdpKxrm8xFBWMTsWhN5RwLUqxU0sTZBviP7zw";
const LIVE_PAGE_ID = "466039649924341";

const POST_ACCESS_TOKEN = "EAAZAfLN8JuaMBSNC4PaTVkOfXF7cZAMhj4sT6j35zJQQvVnJXzdzLPc4ibyPmMEaKauOdEj0UYXxZBALTvzukoRZA8kzaeKyZBb3Ucpl8WjBuS0ZCzKr0uTbvlmCJKeRrsiCVgRbhFSguZCMjKK9SUxA7Pvs2EAaeehfRiHyFDTVMV5O2IjmoZCoqlNSgtUqgVHZBNAbOUR8P";
const POST_PAGE_ID = "1288067541053277";
const POST_ID = "122102349183401514";

// --- قائمة القنوات الكاملة (بدون ترميز صوت - Copy مباشر للكل) ---
const CHANNELS = [
  { name: "beIN News", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/83618.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/753320194_122100376827401514_8275779885008593037_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Z1L3joJIsbAQ7kNvwE-yaFq&_nc_oc=Adp37Drggm4JsIEa_bDP3atBnWXnz9dB58hBEpxXEh5u3hayJ1uiUkOGUnCqQJ-DaUw&_nc_zt=23&_nc_ht=scontent.fcmn5-1.fna&_nc_gid=HTDMSiG_KoRIadFytuAx-Q&_nc_ss=7b289&oh=00_AQBepozuMy5zvH_u-B_hQK19qg3OZrdaF-uGU9YxubJT7w&oe=6A6476B7" },
  { name: "beIN 1", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/78797.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751563664_122100376317401514_7110231260316540204_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=TLpTgiehBq8Q7kNvwG7e6fr&_nc_oc=Adphwie250_LoPza4kadv_EOltqLTSHDBw0vTUdHWHFNAOZr7ZbvkYmYNJxlPtX1Nsg&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=yEEgc5683cYLvXmaIGKcfQ&_nc_ss=7b289&oh=00_AQAhfQL5H2WsQlyG_D71zMMeKFFA9RnABtcAqsxKzh-thg&oe=6A644D8D" },
  { name: "beIN 2", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/78798.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752551212_122100376689401514_5886627502394995910_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=z4nwcj0ViHAQ7kNvwGOSJZT&_nc_oc=Adq586Y8gkrlvsyde8q1ofxnj-vZTFewhbFYd-C33-ZcX_0zMI7eYSx-zvsV_WTlU7o&_nc_zt=23&_nc_ht=scontent.fcmn5-1.fna&_nc_gid=t6wQiIQ6Lgb5HIe5s_vUjQ&_nc_ss=7b289&oh=00_AQA7J-qLVQlAdHngD7FdSaHsGqqaOMlPTFsZpJFftj1oPw&oe=6A64566A" },
  { name: "beIN 3", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/78799.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752484584_122100376671401514_6217817104784997284_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=fOqozvThvhAQ7kNvwEb1Np0&_nc_oc=AdosbWce7blAiqo3Mm1AzHCQDO2iRGB2k5F0fFJUFnsvmR1wGXL-7xF2TwsHzeHU3kE&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=m1_yQa9AEA1qypn-tsV1sg&_nc_ss=7b289&oh=00_AQCm4-EHHUYAybxgWRiI1m19uBwrgqUEEFoA_LBnUbbR5Q&oe=6A645D42" },
  { name: "beIN 4", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/78800.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751578454_122100376809401514_6895915391964971655_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=N2_PjpxatqoQ7kNvwEGl66q&_nc_oc=AdqWD1jd9bNexUcSdXFXeUxcrctpwOXg3128503HXgA33sV4EXcyezbqV4Np-zbAPvo&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=l6UqIvNuGWGlm7ahim2MZw&_nc_ss=7b289&oh=00_AQAdgJXZn7fb-ItD4VaIqhv3cYhw-NyHL5jxnW1l9ay_yQ&oe=6A64580A" },
  { name: "beIN 5", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/78801.ts", img: "https://scontent.fcmn7-1.fna.fbcdn.net/v/t39.30808-6/751437753_122100376821401514_6360876051451700135_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=ySobcf3DHjkQ7kNvwGm3gSt&_nc_oc=Ado8vcCfuFeOm6-dxHj3wsm1gf1IY5908s2xroXCh910--xCnep4DEti4ZuzxISFN40&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=oFMQ7vCvjHGEMBFv19j2Gw&_nc_ss=7b289&oh=00_AQD5-Kj5qOCMqKBJtM5xumrJNcSHsp9IMFZqhhZrevqjbA&oe=6A647F38" },
  { name: "beIN 6", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/78802.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/753647362_122100376815401514_2257212559810435923_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=pwxaqOFDXHUQ7kNvwGlavHZ&_nc_oc=Ado93-Ao-Uafm_24GAs4QEQmtqyDR4XfEStTwKNX8pyRJlRDBp9TEfeldrnXF7bqKw8&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=qIBJdlGIwLWJdiDSPlyu3g&_nc_ss=7b289&oh=00_AQBl7HqKUgm-hnksxvW0JrNEKRpEEDLe435LHTZ5sZvP0g&oe=6A647B84" },
  { name: "beIN 7", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/78803.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/753320194_122100376683401514_6123074156123600585_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=OzhXdnr9YFQQ7kNvwHCQok4&_nc_oc=AdpT4gQOHsVhF9Jsw1IlRYGK870LCY65rY88epGZ1PyBTg_X9gbUqQYn-taGp00xSFU&_nc_zt=23&_nc_ht=scontent.fcmn5-2.fna&_nc_gid=F4Mg_1myT-o5kIICu54igw&_nc_ss=7b289&oh=00_AQC6H5KnvrMNh1LnVcj6qi-TKTNFNO_bFUg1LCnp78KCeg&oe=6A646CA6" },
  { name: "beIN 8", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/78804.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751915199_122100376731401514_3271433633498970370_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=SCHI_I1ewfcQ7kNvwEhQdSZ&_nc_oc=AdoIIL7hD1GJXzP187-mP1lbKbJ-bFOKapcCqF2Iw7DcQPwqnRIzdaV51VCEXScSz8w&_nc_zt=23&_nc_ht=scontent.fcmn5-2.fna&_nc_gid=2s0C_xunuHkudQhNlPTuDA&_nc_ss=7b289&oh=00_AQCq_eQehzRfTiLB6GDirN9AjDjx8nb10SsclXjKhRLMEA&oe=6A647DF6" },
  { name: "الثمانية 1", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/181611.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752648857_122100395247401514_7968696883797853697_n.jpg?stp=dst-jpg_tt6&cstp=mx240x240&ctp=s240x240&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2FRLcPqDq_cQ7kNvwEXeapC&_nc_oc=AdpXohEoQ7ZJmb3FvdIif-lHhpFlq8DqVZpSfLUom1XR48oQuFzdVebk1QiK1HZEAzU&_nc_zt=23&_nc_ht=scontent.fcmn5-1.fna&_nc_gid=-kptSb0bXqpmqziwEiUyqg&_nc_ss=7b289&oh=00_AQBQFybFXkZv6AM5d3oYYfbgH_4dQ7pbGTALBAzsfbDsTQ&oe=6A645902" },
  { name: "الثمانية 2", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/181612.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752648857_122100395247401514_7968696883797853697_n.jpg?stp=dst-jpg_tt6&cstp=mx240x240&ctp=s240x240&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2FRLcPqDq_cQ7kNvwEXeapC&_nc_oc=AdpXohEoQ7ZJmb3FvdIif-lHhpFlq8DqVZpSfLUom1XR48oQuFzdVebk1QiK1HZEAzU&_nc_zt=23&_nc_ht=scontent.fcmn5-1.fna&_nc_gid=-kptSb0bXqpmqziwEiUyqg&_nc_ss=7b289&oh=00_AQBQFybFXkZv6AM5d3oYYfbgH_4dQ7pbGTALBAzsfbDsTQ&oe=6A645902" },
  { name: "الثمانية 3", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/181684.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752648857_122100395247401514_7968696883797853697_n.jpg?stp=dst-jpg_tt6&cstp=mx240x240&ctp=s240x240&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2FRLcPqDq_cQ7kNvwEXeapC&_nc_oc=AdpXohEoQ7ZJmb3FvdIif-lHhpFlq8DqVZpSfLUom1XR48oQuFzdVebk1QiK1HZEAzU&_nc_zt=23&_nc_ht=scontent.fcmn5-1.fna&_nc_gid=-kptSb0bXqpmqziwEiUyqg&_nc_ss=7b289&oh=00_AQBQFybFXkZv6AM5d3oYYfbgH_4dQ7pbGTALBAzsfbDsTQ&oe=6A645902" },
  { name: "Mbc 5", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/9753.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751751765_122100453375401514_1500326668910306352_n.jpg?stp=dst-jpg_tt6&cstp=mx678x452&ctp=s678x452&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=5z9e2zaHIQwQ7kNvwGEf8ok&_nc_oc=AdohyAete4SR9PEc3Q8L2PLOY2QWxO3peGfnZRhyonRehKj_vkWk_0QwGx8k9mSGqXw&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=WnkG4EqtfRDBCwMRQYRwnQ&_nc_ss=79289&oh=00_AQB-cPsv-90voPGeZHUpoIJA6PRzuHP_lVvPOrX5JNPdgQ&oe=6A647717" },
  { name: "Mbc 2", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/723.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751563623_122100453369401514_6285272315232538946_n.jpg?stp=dst-jpg_tt6&cstp=mx447x447&ctp=s447x447&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=v1y5LRcwtcMQ7kNvwE3a6zC&_nc_oc=AdoU9urHD_KqOilDtOpkswwDBe-GsQzuTTFQjOJrhgWt7zKXctEMTeoltZ5COcNd0JE&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=WnkG4EqtfRDBCwMRQYRwnQ&_nc_ss=79289&oh=00_AQAQUeikvhI6tQ52CG_H2x9lpbORELcQUPFsgs5M2JmR3w&oe=6A647A34" },
  { name: "Arryadia HD", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/161944.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752845929_122101029141401514_180650434062533038_n.jpg?stp=dst-jpg_tt6&cstp=mx225x225&ctp=s225x225&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=9LYr1DYQ9OEQ7kNvwHDRemh&_nc_oc=AdqlhG0UkcCg6yE9quFMsCyG2QZwv4cA1QZvAHu-Crd1IMOg3zT5A5C_SZaQHlMaDUw&_nc_zt=23&_nc_ht=scontent.fcmn5-2.fna&_nc_gid=Nv-1ScKdj0qpQQdGjxDoWA&_nc_ss=7b289&oh=00_AQBuzdKvU0rfp2KWdTZ3ACZH3rP4q8OPZjBZFx4lRQtf_A&oe=6A654C95" },
  { name: "Mbc 3", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/41070.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/753298323_122100453267401514_3476795863090484615_n.jpg?stp=dst-jpg_tt6&cstp=mx160x160&ctp=s160x160&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=F1svTvMdrB4Q7kNvwGP4jbp&_nc_oc=AdpHDDaJTaUqr9jmf0PdDJvwhL1l2JEY9yVyIJA99B15pnRxvC3X1VBJKlqQxWLG5p4&_nc_zt=23&_nc_ht=scontent.fcmn5-2.fna&_nc_gid=WnkG4EqtfRDBCwMRQYRwnQ&_nc_ss=79289&oh=00_AQAsB12Q3hbcPYVmmySxZA5pC_W4ZlR6bRbm9I-S_988ww&oe=6A6485DD" },
  { name: "National Geo", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/736.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/752391120_122101087545401514_6281134918958186835_n.jpg?stp=dst-jpg_tt6&cstp=mx516x387&ctp=s516x387&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=_zJdzEnLV5wQ7kNvwEX_BoL&_nc_oc=AdpTeAApiMacDBPE9BKG6FzM0MvfPM4LuE44Chz3UD535yFS3wpzSciLrnHkONjJIcQ&_nc_zt=23&_nc_ht=scontent.fcmn5-2.fna&_nc_gid=BaTnmsH1DXwnxlkCaqeX5Q&_nc_ss=7b289&oh=00_AQD_NCgSpLSauOqXHmZSLXgYd-r9aVPhf6rC1lwp8-AzFA&oe=6A654DF0" },
  { name: "Al aoula HD", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/187252.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/751563644_122101029321401514_6404423517557507320_n.jpg?stp=dst-jpg_tt6&cstp=mx220x231&ctp=s220x231&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=wWQptmuLWtUQ7kNvwFUT722&_nc_oc=Adr7yvkaUAjtx0vvI68F0aCCDVNwWp1siwGNt8Ib-igMJF2JMQ9Mskj02MwPxQsp2tw&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=DGoI_cRNr1GQ7P5W0i9gWQ&_nc_ss=7b289&oh=00_AQD68vNdK26bJiMI88RfLzXITtxcMYTJlomzhfPgg5RK2w&oe=6A65626D" },
  { name: "2m maroc", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/166512.ts", img: "https://scontent.fcmn7-1.fna.fbcdn.net/v/t39.30808-6/751738154_122101029315401514_7668531375224878344_n.jpg?stp=dst-jpg_tt6&cstp=mx320x320&ctp=s320x320&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=_vlmDUu9PqwQ7kNvwEC1Luh&_nc_oc=Adol32V5RS-UOcahs3nUjpUMuc4FlDVasbtRYH5qkmS9IiuBG9xDu8a_K8NdOngqQm0&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=Nv-1ScKdj0qpQQdGjxDoWA&_nc_ss=7b289&oh=00_AQD3Us-mDaXbCGdHH0CthNLPS2y7AESPu-HBoIEJF57xeA&oe=6A65386D" },
  { name: "قرآن الكريم", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/55964.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/481069067_28543685108611474_5115389696913786814_n.jpg?stp=dst-jpg_tt6&cstp=mx554x554&ctp=s554x554&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=R1OK0f6lNJoQ7kNvwHGZGMl&_nc_oc=Adq5Uh5xsY1Ohfr72pWsTqP08QgRoN8dCb-wYj6QCOfH4DBpgMxtw3ONnCnNHOgU-Gc&_nc_zt=23&_nc_ht=scontent.fcmn5-1.fna&_nc_gid=mOz-oEmz7G5mWHXyHbiy8Q&_nc_ss=7b289&oh=00_AQC-c1t_wjjUtmojlfC1GBjC6QIoF9Kyy_1jREEk6C37Sw&oe=6A677B5C" },
  { name: "Mbc 4", url: "http://pro.netmos.ovh:7355/live/UDJPRCRA1L055B/Ep27yiiwbb56mjkl/719.ts", img: "https://scontent.xx.fbcdn.net/v/t39.30808-6/754007087_122100453411401514_5987379144688097958_n.jpg?stp=dst-jpg_tt6&cstp=mx1284x1284&ctp=s1284x1284&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_ohc=rMZr_L9OeCEQ7kNvwG4UtGS&_nc_oc=Adr2hB9EPItNKSQal7Bw9A9W3q_wDn0FaOSziqULUqZ3Iajt_4mSYSYWY05s7K-Ztw8&_nc_zt=23&_nc_ht=scontent.fcmn7-1.fna&_nc_gid=WnkG4EqtfRDBCwMRQYRwnQ&_nc_ss=79289&oh=00_AQAeAJ5HIBAOzI_Xtyg2RRltRJ4UCCj7i-FUnfKtqatQpA&oe=6A6488A4" }
];

// --- الإعدادات الزمنية ---
const SESSION_MS = (3 * 60 + 55) * 60 * 1000; 
const MPD_WAIT_MS = 2 * 60 * 1000; 
const COOLDOWN_MS = 1 * 60 * 1000; 

let activeProcesses = [];
let activeStreamKeys = [];
let currentCycle = 1;
let cycleStartTime = null;
let isStopping = false;
let skipCycle = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
}

function nowStr() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

async function countdown(ms, label) {
  let rem = ms;
  while (rem > 0 && !skipCycle && !isStopping) {
    process.stdout.write(`\r ⏳ [${label}]: ${formatDuration(rem)} `);
    const step = Math.min(1000, rem);
    await sleep(step);
    rem -= step;
  }
  process.stdout.write("\n");
}

function startFFmpeg(channel, rtmp) {
  // استخدام -re مع الفلتر +flags وتطبيق -c copy للجميع
  const args = [
    "-re",
    "-fflags", "+genpts",
    "-i", channel.url,
    "-c", "copy",
    "-f", "flv",
    rtmp
  ];

  const proc = spawn("ffmpeg", args, { stdio: "ignore" });

  proc.on("exit", (code) => {
    if (code !== 0 && code !== null && !isStopping) {
      console.log(` ⚠️ [${channel.name}] انقطع البث المباشر (الكود: ${code})`);
    }
  });

  return proc;
}

async function createPreview(channel) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${LIVE_PAGE_ID}/live_videos`,
      null,
      {
        timeout: 15000,
        params: {
          access_token: LIVE_ACCESS_TOKEN,
          status: "UNPUBLISHED",
          title: channel.name,
        },
      }
    );
    return { ...channel, ...res.data };
  } catch (e) {
    console.error(` ❌ [${channel.name}] فشل إنشاء الجلسة: ${e.response?.data?.error?.message || e.message}`);
    return null;
  }
}

async function deleteLiveVideo(videoId) {
  try {
    await axios.delete(`https://graph.facebook.com/${GRAPH_VERSION}/${videoId}`, {
      params: { access_token: LIVE_ACCESS_TOKEN },
      timeout: 10000,
    });
    console.log(` 🗑️ تم حذف البث المباشر (ID: ${videoId})`);
  } catch (e) {
    console.error(` ⚠️ فشل حذف البث ${videoId}: ${e.response?.data?.error?.message || e.message}`);
  }
}

async function updatePost(streamKeys) {
  const updatedData = streamKeys.map((s) => ({
    img: s.img,
    name: s.name,
    url: s.dash || "Offline",
  }));
  const message = JSON.stringify(updatedData);

  try {
    await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${POST_PAGE_ID}_${POST_ID}`,
      null,
      {
        params: {
          access_token: POST_ACCESS_TOKEN,
          message: message,
        },
      }
    );
    console.log(` 📝 تم تحديث المنشور الرئيسي (${POST_ID}) بنجاح`);
  } catch (e) {
    console.error(` ⚠️ [POST] خطأ أثناء تحديث المنشور: ${e.response?.data?.error?.message || e.message}`);
  }
}

async function cleanupSystem() {
  console.log("\n🧹 جاري إيقاف جميع محركات FFmpeg وتنظيف البثوث...");
  
  activeProcesses.forEach((p) => {
    try { p.kill("SIGKILL"); } catch {}
  });
  activeProcesses = [];

  try {
    execSync("pkill -9 ffmpeg 2>/dev/null || true");
  } catch {}

  if (activeStreamKeys.length > 0) {
    console.log("🗑️ حذف جلسات البث النشطة من Facebook...");
    await Promise.all(activeStreamKeys.map((s) => deleteLiveVideo(s.id)));
    activeStreamKeys = [];
  }
}

async function runSession(cycleNum) {
  cycleStartTime = Date.now();
  skipCycle = false;
  activeProcesses = [];
  activeStreamKeys = [];

  console.log(`\n==========================================`);
  console.log(`🔄 الدورة #${cycleNum} | البدء: ${nowStr()}`);
  console.log(`==========================================`);

  console.log(`\n1️⃣ بدء إنشاء جلسات البث من فيسبوك لجميع القنوات دفعة واحدة...`);
  
  const previewPromises = CHANNELS.map(channel => createPreview(channel));
  const previewResults = await Promise.all(previewPromises);

  if (isStopping || skipCycle) return;

  console.log(`\n2️⃣ تشغيل جميع محركات FFmpeg للبث في نفس الثانية تماماً...`);
  
  previewResults.forEach((res, index) => {
    if (res && res.stream_url) {
      const channel = CHANNELS[index];
      const info = { name: res.name, url: res.url, img: res.img, rtmp: res.stream_url, id: res.id };
      activeStreamKeys.push(info);
      activeProcesses.push(startFFmpeg(info, info.rtmp));
      console.log(` ▶️ [FFmpeg] تشغيل ${channel.name} (-c copy)`);
    }
  });

  if (isStopping || skipCycle) return;

  if (activeProcesses.length === 0) {
    console.log(" ⚠️ لم يتم التمكن من بدء أي قناة، سيتم الانتقال للدورة التالية...");
    return;
  }

  console.log(`\n3️⃣ انتظار استقرار البث للحصول على روابط DASH (MPD)...`);
  await countdown(MPD_WAIT_MS, "استقرار DASH");

  if (isStopping || skipCycle) return;

  console.log(`\n4️⃣ جلب روابط DASH وتحديث المنشور الرئيسي...`);
  await Promise.all(
    activeStreamKeys.map(async (s) => {
      try {
        const r = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${s.id}`, {
          params: { fields: "dash_preview_url", access_token: LIVE_ACCESS_TOKEN },
          timeout: 10000,
        });
        s.dash = r.data.dash_preview_url || null;
      } catch {
        s.dash = null;
      }
    })
  );

  await updatePost(activeStreamKeys);

  const remaining = SESSION_MS - (Date.now() - cycleStartTime);
  if (remaining > 0 && !isStopping && !skipCycle) {
    console.log(`\n🚀 جميع البثوث تعمل بنجاح! وقت التشغيل المتبقي لهذا الشوط...`);
    await countdown(remaining, "الوقت المتبقي لانتهاء الجلسة");
  }

  console.log(`\n5️⃣ انتهاء شوط البث: إغلاق الجلسات الحالية والتحضير للدورة التالية...`);
  await cleanupSystem();
}

function setupInteractiveCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", async (line) => {
    const cmd = line.trim().toLowerCase();

    if (cmd === "status") {
      console.log(`\n📊 [حالة النظام]`);
      console.log(` - الدورة الحالية: #${currentCycle}`);
      console.log(` - عدد القنوات النشطة: ${activeProcesses.length} / ${CHANNELS.length}`);
      if (cycleStartTime) {
        const elapsed = Date.now() - cycleStartTime;
        console.log(` - الوقت المنقضي: ${formatDuration(elapsed)}`);
      }
      console.log(`------------------------------------------`);
    } else if (cmd === "restart") {
      console.log("\n🔄 تم طلب إعادة التشغيل المباشر للدورة...");
      skipCycle = true;
    } else if (cmd === "stop" || cmd === "exit") {
      console.log("\n🛑 جاري الإيقاف النهائي للسكريبت بناءً على طلبك...");
      isStopping = true;
      skipCycle = true;
      await cleanupSystem();
      process.exit(0);
    } else {
      console.log("💡 الأوامر المتاحة: status | restart | stop");
    }
  });
}

async function main() {
  console.clear();
  console.log("==================================================");
  console.log(" 📺 Facebook Live Multi-Streamer (-c copy)       ");
  console.log("==================================================");
  console.log("💡 اكتب الأوامر التالية في أي وقت أثناء البث:");
  console.log("   - 'status' : لمعرفة حالة القنوات والوقت.");
  console.log("   - 'restart': لإعادة بدء الدورة الحالية.");
  console.log("   - 'stop'   : لإيقاف السكريبت وإغلاق كافة البثوث آمنياً.");
  console.log("==================================================\n");

  setupInteractiveCLI();

  while (!isStopping) {
    try {
      await runSession(currentCycle);
    } catch (err) {
      console.error(`❌ خطأ غير متوقع في الدورة الرئيسية: ${err.message}`);
      await cleanupSystem();
    }

    if (isStopping) break;

    console.log(`\n💤 فترة استراحة بين الدورات (دقيقة واحدة)...`);
    await countdown(COOLDOWN_MS, "فترة الراحة");
    currentCycle++;
  }
}

process.on("SIGINT", async () => {
  console.log("\n\n🛑 تم التقاط أمر الإيقاف (Ctrl+C). جاري التنظيف والسلامة...");
  isStopping = true;
  await cleanupSystem();
  process.exit(0);
});

main();
