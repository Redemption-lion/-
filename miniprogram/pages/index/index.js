const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    role: 'member',
    userInfo: {},                     // 新增，用于显示头像和昵称
    banners: [
      { id: 1, image: '/images/banner1.jpg', url: '' },
      { id: 2, image: '/images/banner2.jpg', url: '' }
    ],
    hotCourses: [],
    notices: [],
    coachInfo: null,
    todayCourses: []
  },

  onShow() {
    if (!app.checkLogin()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    const role = app.getRole();
    const userInfo = app.globalData.userInfo || {};
    this.setData({ role, userInfo });
    if (role === 'member') {
      this.loadMemberHome();
    } else {
      this.loadCoachHome();
    }
  },

  async loadMemberHome() {
    wx.showLoading({ title: '加载中...' });
    try {
      const coursesRes = await get('/member/courses', { page: 1, size: 6 });
      if (coursesRes.code === 200) {
        this.setData({ hotCourses: coursesRes.data.records || [] });
      }
      const noticeRes = await get('/member/notices', { page: 1, size: 3 });
      if (noticeRes.code === 200) {
        this.setData({ notices: noticeRes.data.records || [] });
      }
    } catch (err) {
      console.error('加载首页数据失败', err);
    } finally {
      wx.hideLoading();
    }
  },

  async loadCoachHome() {
    wx.showLoading({ title: '加载中...' });
    try {
      const profileRes = await get('/coach/profile');
      if (profileRes.code === 200) {
        this.setData({ coachInfo: profileRes.data });
      }
      const coursesRes = await get('/coach/courses', { page: 1, size: 10 });
      if (coursesRes.code === 200) {
        const today = new Date().toISOString().split('T')[0];
        const todayCourses = (coursesRes.data.records || []).filter(c => 
          c.startTime && c.startTime.split('T')[0] === today
        );
        this.setData({ todayCourses });
      }
    } catch (err) {
      console.error('加载教练首页失败', err);
    } finally {
      wx.hideLoading();
    }
  },

  goToCourses() {
    wx.navigateTo({ url: '/pages/courses/courses' });
  },

  goToCourseDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${id}` });
  },

  goToNoticeDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/notice-detail/notice-detail?id=${id}` });
  },

  goToNotices() {
    wx.navigateTo({ url: '/pages/notice/notice' });
  },

  goToCourseManage() {
    wx.navigateTo({ url: '/pages/course-manage/course-manage' });
  },

  goToBookingAudit() {
    wx.navigateTo({ url: '/pages/booking-audit/booking-audit' });
  },

  goToMyCourses() {
    wx.navigateTo({ url: '/pages/my-courses/my-courses' });
  },

  // 以下为新增的缺失方法
  goToMyBookings() {
    wx.switchTab({ url: '/pages/booking/booking' });
  },

  goToFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' });
  },

  onPullDownRefresh() {
    if (this.data.role === 'member') {
      this.loadMemberHome();
    } else {
      this.loadCoachHome();
    }
    wx.stopPullDownRefresh();
  },

  onShareAppMessage() {
    return {
      title: '健身房管理系统',
      path: '/pages/index/index'
    };
  }
});