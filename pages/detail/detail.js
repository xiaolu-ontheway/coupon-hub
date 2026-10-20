const { cloud } = require('../../utils/cloud')
const { PLATFORM_MINI_PROGRAM } = require('../../utils/platform')

Page({
  data: {
    id: null,
    coupon: null,
    loading: true,
    error: ''
  },

  onLoad(options) {
    const id = options.id
    this.setData({ id })
    this.fetchDetail(id)
  },

  async fetchDetail(id) {
    this.setData({ loading: true, error: '' })
    try {
      const { data, error } = await cloud.database
        .from('coupons')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        this.setData({ error: '加载失败，请稍后重试' })
        return
      }
      if (!data) {
        this.setData({ error: '优惠券不存在或已下架' })
        return
      }
      this.setData({ coupon: data })
    } catch (err) {
      this.setData({ error: '加载失败，请检查网络后重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onCopyCode() {
    const code = this.data.coupon && this.data.coupon.coupon_code
    if (!code) {
      wx.showToast({ title: '该券无需口令', icon: 'none' })
      return
    }
    wx.setClipboardData({
      data: code,
      success: () => wx.showToast({ title: '口令已复制', icon: 'success' })
    })
  },

  onGetCoupon() {
    const coupon = this.data.coupon
    if (!coupon) return

    // 1) 有领券链接 → 内嵌 web-view 打开（用户不离开小程序，体验最佳）
    if (coupon.coupon_link) {
      wx.navigateTo({
        url: '/pages/webview/webview?url=' + encodeURIComponent(coupon.coupon_link)
      })
      return
    }

    // 2) 无链接，但有对应平台小程序 → 尝试跳转（需微信后台已关联才能成功）
    const target = PLATFORM_MINI_PROGRAM[coupon.platform]
    if (target && target.appId && wx.canIUse('navigateToMiniProgram')) {
      wx.navigateToMiniProgram({
        appId: target.appId,
        path: target.path || '',
        success: () => {},
        fail: () => {
          // 未建立关联 / 目标小程序未开启被跳转 → 降级复制
          this.fallbackCopy(coupon)
        }
      })
      return
    }

    // 3) 兜底 → 复制口令
    this.fallbackCopy(coupon)
  },

  fallbackCopy(coupon) {
    const platform = coupon.platform || '对应平台'
    const code = coupon.coupon_code
    const link = coupon.coupon_link
    const text = code || link

    // 无口令也无链接：按「是否有对应小程序」给出友好引导
    if (!text) {
      const target = PLATFORM_MINI_PROGRAM[coupon.platform]
      if (target && target.appId) {
        wx.showModal({
          title: '请打开小程序',
          content: '该券需在 ' + platform + ' 小程序内领取。若未自动跳转，请在微信中搜索「' + platform + '」小程序进入',
          showCancel: false,
          confirmText: '知道了'
        })
      } else {
        wx.showModal({
          title: '请前往 App 领取',
          content: '该券需在 ' + platform + ' App 内领取，请打开 ' + platform + ' App 查看',
          showCancel: false,
          confirmText: '知道了'
        })
      }
      return
    }

    wx.setClipboardData({
      data: text,
      success: () => {
        if (code) {
          wx.showModal({
            title: '口令已复制',
            content: '已复制口令「' + code + '」，请打开 ' + platform + ' App，在顶部搜索框粘贴即可领券',
            showCancel: false,
            confirmText: '知道了'
          })
        } else {
          wx.showModal({
            title: '链接已复制',
            content: '已复制领券链接，请打开 ' + platform + ' 后访问该链接领取',
            showCancel: false,
            confirmText: '知道了'
          })
        }
      }
    })
  },

  // 转发给好友
  onShareAppMessage() {
    const coupon = this.data.coupon
    if (!coupon) {
      return { title: '优惠券集', path: '/pages/index/index' }
    }
    return {
      title: (coupon.platform || '') + '「' + (coupon.face_value || '优惠券') + '」速领',
      path: '/pages/detail/detail?id=' + coupon.id
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const coupon = this.data.coupon
    if (!coupon) {
      return { title: '优惠券集：外卖/出行/快递优惠券天天更新' }
    }
    return {
      title: (coupon.platform || '') + '「' + (coupon.face_value || '优惠券') + '」速领',
      query: 'id=' + coupon.id
    }
  },
})
