const { cloud } = require('../../utils/cloud')

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: '外卖', label: '外卖' },
  { key: '出行', label: '出行' },
  { key: '快递', label: '快递' }
]

Page({
  data: {
    categories: CATEGORIES,
    activeCategory: 'all',
    coupons: [],
    loading: false,
    error: ''
  },

  onLoad() {
    this.fetchCoupons()
  },

  onPullDownRefresh() {
    this.fetchCoupons().finally(() => wx.stopPullDownRefresh())
  },

  onCategoryTap(e) {
    const key = e.currentTarget.dataset.key
    if (key === this.data.activeCategory) return
    this.setData({ activeCategory: key })
    this.fetchCoupons()
  },

  async fetchCoupons() {
    this.setData({ loading: true, error: '' })
    const { activeCategory } = this.data

    try {
      let query = cloud.database
        .from('coupons')
        .select('*')
        .order('id', { ascending: false })

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory)
      }

      const { data, error } = await query

      if (error) {
        this.setData({ error: this.friendlyError(error), coupons: [] })
        return
      }

      this.setData({ coupons: data || [] })
    } catch (err) {
      this.setData({ error: '加载失败，请检查网络后重试', coupons: [] })
    } finally {
      this.setData({ loading: false })
    }
  },

  friendlyError(error) {
    if (error && error.code === '42501') return '暂无访问权限'
    if (error && error.code === '42P01') return '数据表尚未初始化'
    return '加载失败，请稍后重试'
  },

  onCouponTap(e) {
    const coupon = e.detail.coupon
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + coupon.id
    })
  },

  // 转发给好友
  onShareAppMessage() {
    return {
      title: '外卖/出行/快递优惠券，天天更新，点我领券',
      path: '/pages/index/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '优惠券集：外卖/出行/快递优惠券天天更新'
    }
  }
})
