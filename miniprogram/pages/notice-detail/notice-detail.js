const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    id: null,
    notice: null,
    loading: true
  },

  onLoad(options) {
    const id = options.id;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ id: parseInt(id) });
    this.loadNotice();
  },

  async loadNotice() {
    this.setData({ loading: true });
    try {
      const url = app.isMember() ? '/member/notice/' + this.data.id : '/notice/' + this.data.id;
      const res = await get(url);
      if (res.code === 200) {
        this.setData({ notice: res.data });
        wx.setNavigationBarTitle({ title: res.data.title });
      }
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onShareAppMessage() {
    return {
      title: this.data.notice ? this.data.notice.title : '公告详情',
      path: `/pages/notice-detail/notice-detail?id=${this.data.id}`
    };
  }
});