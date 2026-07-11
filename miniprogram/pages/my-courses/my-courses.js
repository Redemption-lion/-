const app = getApp();
const { get, del, put } = require('../../utils/request');

Page({
  data: {
    page: 1,
    size: 10,
    total: 0,
    courses: [],
    loading: false,
    hasMore: true,
    statusFilter: '全部',
    statusOptions: ['全部', '正常', '已取消', '已结束']
  },

  onLoad() {
    if (!app.isCoach()) {
      wx.showToast({ title: '权限不足', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.loadCourses();
  },

  onShow() {
    this.loadCourses(true);
  },

  addCourse() {
    wx.navigateTo({ url: '/pages/course-manage/course-manage' });
  },

  async loadCourses(refresh = false) {
    if (this.data.loading) return;
    if (!this.data.hasMore && !refresh) return;
    
    if (refresh) {
      this.setData({ page: 1, courses: [], hasMore: true });
    }
    
    this.setData({ loading: true });
    
    try {
      const res = await get('/coach/courses', { 
        page: this.data.page, 
        size: this.data.size 
      });
      
      if (res.code === 200) {
        let newCourses = res.data.records || [];
        if (this.data.statusFilter !== '全部') {
          newCourses = newCourses.filter(c => c.status === this.data.statusFilter);
        }
        this.setData({
          courses: refresh ? newCourses : [...this.data.courses, ...newCourses],
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

  // 下架课程
  deleteCourse(e) {
    const { id, name } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '提示',
      content: `确定要下架「${name}」吗？下架后会员将无法预约。`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '下架中...' });
          try {
            const result = await del('/coach/course/' + id);
            if (result.code === 200) {
              wx.showToast({ title: '下架成功', icon: 'success' });
              this.loadCourses(true);
            }
          } catch (err) {
            console.error('下架失败', err);
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // 重新上架课程
  relistCourse(e) {
    const { id, name } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '提示',
      content: `确定要重新上架「${name}」吗？上架后会员可预约。`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '上架中...' });
          try {
            const result = await put('/coach/course/relist/' + id);
            if (result.code === 200) {
              wx.showToast({ title: '上架成功', icon: 'success' });
              this.loadCourses(true);
            }
          } catch (err) {
            console.error('上架失败', err);
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // 编辑课程
  editCourse(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/course-manage/course-manage?editId=${id}` });
  },

  // 查看预约详情
  viewBookings(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/booking-audit/booking-audit?courseId=${id}` });
  },

  // 跳转课程详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${id}` });
  },

  // 切换筛选
  onStatusChange(e) {
    this.setData({ statusFilter: this.data.statusOptions[e.detail.value] });
    this.loadCourses(true);
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.loadCourses();
  },

  onPullDownRefresh() {
    this.loadCourses(true);
    wx.stopPullDownRefresh();
  },

  getStatusClass(status) {
    const map = {
      '正常': 'status-active',
      '已取消': 'status-cancelled',
      '已结束': 'status-ended'
    };
    return map[status] || 'status-active';
  }
});