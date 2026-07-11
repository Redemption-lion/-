const app = getApp();
const { get, put } = require('../../utils/request');

Page({
  data: {
    courseId: null,
    courseName: '',
    bookings: [],
    loading: true,
    page: 1,
    size: 20,
    hasMore: true
  },

  onLoad(options) {
    if (options.courseId) {
      this.setData({ courseId: parseInt(options.courseId) });
      this.loadCourseInfo();
      this.loadBookings();
    } else {
      this.loadAllBookings();
    }
  },

  async loadCourseInfo() {
    try {
      const res = await get('/coach/courses', { page: 1, size: 100 });
      if (res.code === 200) {
        const courses = res.data.records || [];
        const course = courses.find(c => c.id === this.data.courseId);
        if (course) {
          this.setData({ courseName: course.courseName });
          wx.setNavigationBarTitle({ title: `${course.courseName} - 预约审核` });
        }
      }
    } catch (err) {
      console.error('加载课程信息失败', err);
    }
  },

  async loadBookings(refresh = false) {
    if (this.data.loading) return;
    if (!this.data.hasMore && !refresh) return;

    if (refresh) {
      this.setData({ page: 1, bookings: [], hasMore: true });
    }

    this.setData({ loading: true });

    try {
      const res = await get(`/coach/course/${this.data.courseId}/bookings`);
      if (res.code === 200) {
        // 扁平化处理：将 booking 对象中的字段展开到外层
        let flatList = (res.data || []).map(item => {
          const booking = item.booking || item; // 兼容可能已扁平的情况
          return {
            id: booking.id,
            bookingNo: booking.bookingNo,
            courseId: booking.courseId,
            courseName: booking.courseName,
            memberId: booking.memberId,
            memberName: booking.memberName,
            bookingTime: booking.bookingTime,
            status: booking.status,
            remark: booking.remark,
            auditRemark: booking.auditRemark,
            cancelReason: booking.cancelReason,
            memberPhone: item.memberPhone,      // 额外补充
            memberNickname: item.memberNickname
          };
        });
        this.setData({
          bookings: flatList,
          hasMore: false
        });
      }
    } catch (err) {
      console.error('加载预约失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadAllBookings() {
    this.setData({ loading: true });
    try {
      const coursesRes = await get('/coach/courses', { page: 1, size: 100 });
      if (coursesRes.code === 200) {
        const courses = coursesRes.data.records || [];
        let allBookings = [];

        for (const course of courses) {
          const bookingsRes = await get(`/coach/course/${course.id}/bookings`);
          if (bookingsRes.code === 200) {
            const flat = (bookingsRes.data || []).map(item => {
              const booking = item.booking || item;
              return {
                id: booking.id,
                bookingNo: booking.bookingNo,
                courseId: booking.courseId,
                courseName: course.courseName,
                memberId: booking.memberId,
                memberName: booking.memberName,
                bookingTime: booking.bookingTime,
                status: booking.status,
                remark: booking.remark,
                auditRemark: booking.auditRemark,
                cancelReason: booking.cancelReason,
                memberPhone: item.memberPhone,
                memberNickname: item.memberNickname
              };
            });
            allBookings = [...allBookings, ...flat];
          }
        }
        this.setData({ bookings: allBookings });
      }
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 审核通过
  async approveBooking(e) {
    const { id, memberName } = e.currentTarget.dataset;
    wx.showModal({
      title: '审核确认',
      content: `确认通过 ${memberName} 的预约申请吗？`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            const result = await put('/coach/booking/audit', null, {
              params: { bookingId: id, action: 'confirm' }
            });
            if (result.code === 200) {
              wx.showToast({ title: '已通过', icon: 'success' });
              this.refreshData();
            }
          } catch (err) {
            console.error('审核失败', err);
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // 拒绝预约
  async rejectBooking(e) {
    const { id, memberName } = e.currentTarget.dataset;
    wx.showModal({
      title: '拒绝预约',
      content: `确认拒绝 ${memberName} 的预约申请吗？`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            const result = await put('/coach/booking/audit', null, {
              params: { bookingId: id, action: 'reject', auditRemark: '教练拒绝' }
            });
            if (result.code === 200) {
              wx.showToast({ title: '已拒绝', icon: 'success' });
              this.refreshData();
            }
          } catch (err) {
            console.error('审核失败', err);
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  refreshData() {
    if (this.data.courseId) {
      this.loadBookings(true);
    } else {
      this.loadAllBookings();
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData();
    wx.stopPullDownRefresh();
  }
});