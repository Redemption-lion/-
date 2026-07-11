const app = getApp();
const { get, del } = require('../../utils/request');

Page({
  data: {
    page: 1,
    size: 10,
    total: 0,
    bookings: [],
    loading: false,
    hasMore: true,
    statusFilter: '全部',
    statusOptions: ['全部', '已确认', '已取消', '已完成']
  },

  onLoad() {
    this.loadBookings();
  },

  onShow() {
    // 刷新数据
    this.loadBookings(true);
  },

  async loadBookings(refresh = false) {
    if (this.data.loading) return;
    if (!this.data.hasMore && !refresh) return;
    
    if (refresh) {
      this.setData({ page: 1, bookings: [], hasMore: true });
    }
    
    this.setData({ loading: true });
    
    try {
      const res = await get('/member/bookings', { 
        page: this.data.page, 
        size: this.data.size 
      });
      
      if (res.code === 200) {
        const newBookings = res.data.records || [];
        this.setData({
          bookings: refresh ? newBookings : [...this.data.bookings, ...newBookings],
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

  // 取消预约
  cancelBooking(e) {
    const { id, courseName } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '提示',
      content: `确定要取消「${courseName}」的预约吗？`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' });
          try {
            const result = await del('/member/booking/' + id);
            if (result.code === 200) {
              wx.showToast({ title: '取消成功', icon: 'success' });
              this.loadBookings(true);
            }
          } catch (err) {
            console.error('取消失败', err);
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // 跳转课程详情
  goToCourse(e) {
    const courseId = e.currentTarget.dataset.courseId;
    wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${courseId}` });
  },

  // 切换筛选
  onStatusChange(e) {
    this.setData({ statusFilter: this.data.statusOptions[e.detail.value] });
    this.loadBookings(true);
  },

  // 下拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.loadBookings();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadBookings(true);
    wx.stopPullDownRefresh();
  },

  // 格式化时间
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000 && date.getDate() === now.getDate()) {
      return `今天 ${date.getHours()}:${date.getMinutes().toString().padStart(2,'0')}`;
    }
    return `${date.getMonth()+1}月${date.getDate()}日`;
  },

  // 获取状态样式
  getStatusClass(status) {
    const map = {
      '已确认': 'status-confirmed',
      '已取消': 'status-cancelled',
      '已完成': 'status-completed'
    };
    return map[status] || 'status-confirmed';
  }
});