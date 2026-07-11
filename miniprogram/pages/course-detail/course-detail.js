const app = getApp();
const { get, post, del } = require('../../utils/request');

Page({
  data: {
    id: null,
    course: null,
    isMember: true,
    isCoach: false,
    hasBooked: false,
    bookingId: null,
    loading: true,
    buttonText: '立即预约',
    buttonDisabled: false,
    isExpired: false      // 新增：课程是否已过期
  },

  onLoad(options) {
    const id = options.id;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ 
      id: parseInt(id),
      isMember: app.isMember(),
      isCoach: app.isCoach()
    });
    this.loadCourseDetail();
  },

  onShow() {
    if (this.data.course) {
      this.checkBookingStatus();
    }
  },

  async loadCourseDetail() {
    this.setData({ loading: true });
    try {
      const url = this.data.isMember ? '/member/course/' + this.data.id : '/course/' + this.data.id;
      const res = await get(url);
      if (res.code === 200) {
        let course, isExpired = false;
        // 兼容两种返回格式：{ course: {...}, isExpired } 或直接返回 Course 对象
        if (res.data.course) {
          course = res.data.course;
          isExpired = res.data.isExpired || false;
        } else {
          course = res.data;
          // 如果返回的是原始 Course 对象，根据开始时间判断是否过期
          isExpired = new Date(course.startTime) < new Date();
        }
        this.setData({ course, isExpired });
        this.checkBookingStatus();
      }
    } catch (err) {
      console.error('加载失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async checkBookingStatus() {
    if (!this.data.isMember) return;
    try {
      const res = await get('/member/bookings', { page: 1, size: 100 });
      if (res.code === 200) {
        const bookings = res.data.records || [];
        const existing = bookings.find(b => b.courseId === this.data.id && b.status === '已确认');
        if (existing) {
          this.setData({ 
            hasBooked: true, 
            bookingId: existing.id,
            buttonText: '取消预约',
            buttonDisabled: false
          });
        } else {
          this.setData({ 
            hasBooked: false, 
            bookingId: null,
            buttonText: '立即预约',
            buttonDisabled: false
          });
        }
      }
    } catch (err) {
      console.error('检查预约失败', err);
    }
  },

  async handleBooking() {
    if (!app.checkLogin()) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    if (this.data.hasBooked) {
      this.cancelBooking();
    } else {
      this.createBooking();
    }
  },

  async createBooking() {
    // 如果课程已过期，禁止预约
    if (this.data.isExpired) {
      wx.showToast({ title: '课程已结束，无法预约', icon: 'none' });
      return;
    }
    if (this.data.course.status !== '正常') {
      wx.showToast({ title: '课程已结束或取消', icon: 'none' });
      return;
    }
    if (this.data.course.bookedCount >= this.data.course.maxCapacity) {
      wx.showToast({ title: '课程已满员', icon: 'none' });
      return;
    }
    this.setData({ buttonDisabled: true });
    wx.showLoading({ title: '预约中...' });
    try {
      const res = await post('/member/booking', { courseId: this.data.id });
      if (res.code === 200) {
        wx.showToast({ title: '预约成功', icon: 'success' });
        this.loadCourseDetail();
      }
    } catch (err) {
      console.error('预约失败', err);
    } finally {
      this.setData({ buttonDisabled: false });
      wx.hideLoading();
    }
  },

  async cancelBooking() {
    this.setData({ buttonDisabled: true });
    wx.showLoading({ title: '取消中...' });
    wx.showModal({
      title: '提示',
      content: '确定要取消预约吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await del('/member/booking/' + this.data.bookingId);
            if (result.code === 200) {
              wx.showToast({ title: '取消成功', icon: 'success' });
              this.loadCourseDetail();
            }
          } catch (err) {
            console.error('取消失败', err);
          }
        }
        this.setData({ buttonDisabled: false });
        wx.hideLoading();
      }
    });
  },

  editCourse() {
    wx.navigateTo({ url: `/pages/course-manage/course-manage?editId=${this.data.id}` });
  },

  onShareAppMessage() {
    return {
      title: this.data.course ? this.data.course.courseName : '健身课程',
      path: `/pages/course-detail/course-detail?id=${this.data.id}`
    };
  }
});