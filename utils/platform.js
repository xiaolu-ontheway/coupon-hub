// 平台 → 对应微信小程序 映射表
//
// 背景：微信小程序内无法通过 URL Scheme 直接唤起外部 App（美团/滴滴等）。
// 官方正解是「跳转到该平台自己的微信小程序」，用户在对方小程序里领券下单，
// 体验几乎等同于跳转 App。
//
// 说明：
// - appId 为各平台小程序的公开固定 AppID（多来源交叉确认）。
// - path 留空表示跳到对方小程序首页（最稳妥）；若后续拿到带推广位的领券页
//   路径，可填在此处（如美团/饿了么的红包 CPS 路径）。
// - 未收录的平台（如哈啰、中通、菜鸟等暂无可靠 AppID 来源），点击后自动
//   降级为「复制口令/链接 + 引导打开 App」，见 detail.js 的 onGetCoupon。
//
// 维护：若某平台 AppID 失效或更新，直接改这里即可，无需动页面逻辑。
const PLATFORM_MINI_PROGRAM = {
  // —— 外卖 ——
  '美团外卖': { appId: 'wxde8ac0a21135c07d', path: '' },        // 美团外卖/闪购/吃喝玩乐
  '饿了么': { appId: 'wxece3a9a4c82f58c9', path: '' },           // 饿了么
  '淘宝闪购': { appId: '', path: '' },                           // 淘宝闪购非独立小程序，降级复制口令

  // —— 出行 ——
  '滴滴出行': { appId: 'wxaf35009675aa0b2a', path: '' },         // 滴滴出行
  '高德打车': { appId: 'wxbc0cf9b963bd3550', path: '' },         // 高德地图
  '哈啰出行': { appId: '', path: '' },                           // 暂无可靠 AppID，降级复制

  // —— 快递 ——
  '顺丰速运': { appId: 'wxd4185d00bf7e08ac', path: '' },         // 顺丰寄递
  '京东物流': { appId: 'wx91d27dbf599dff74', path: '' },         // 京东购物（京东快递在京东 App 内）
  '菜鸟裹裹': { appId: '', path: '' },                           // 暂无可靠 AppID，降级复制
  '中通快递': { appId: '', path: '' }                            // 暂无可靠 AppID，降级复制
}

module.exports = { PLATFORM_MINI_PROGRAM }
