Component({
  properties: {
    coupon: {
      type: Object,
      value: {}
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { coupon: this.data.coupon })
    }
  }
})
