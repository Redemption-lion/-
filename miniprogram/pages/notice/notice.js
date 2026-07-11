const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    page: 1,
    size: 10,
    total: 0,
    notices: [],
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadNotices();
  },

  async loadNotices(refresh = false) {
    if (this.data.loading) return;
    if (!this.data.hasMore && !refresh) return;
    
    if (refresh) {
      this.setData({ page: 1, notices: [], hasMore: true });
    }
    
    this.setData({ loading: true });
    
    try {
      const url = app.isMember() ? '/member/notices' : '/coach/notices';
      const res = await get(url, { page: this.data.page, size: this.data.size });
      
      if (res.code === 200) {
        const newNotices = res.data.records || [];
        this.setData({
          notices: refresh ? newNotices : [...this.data.notices, ...newNotices],
          total: res.data.total,
          hasMore: this.data.page * this.data.size < res.data.total
        });
      }
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/notice-detail/notice-detail?id=${id}` });
  },

  // 下拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.loadNotices();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadNotices(true);
    wx.stopPullDownRefresh();
  }
});