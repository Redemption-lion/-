const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    activeTab: 'upcoming',      // upcoming: 即将上课, history: 历史课程
    upcomingCourses: [],        // 即将上课（开始时间 >= 当前时间）
    historyCourses: [],         // 历史课程（开始时间 < 当前时间）
    loading: false,
    page: 1,
    size: 20,
    hasMore: true,
    selectedCourse: null,
    showMemberDialog: false,
    members: [],
    membersLoading: false
  },

  onLoad() {
    this.loadCourses();
  },

  onPullDownRefresh() {
    this.loadCourses(true);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadCourses();
    }
  },

  // 切换选项卡
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  async loadCourses(refresh = false) {
    if (this.data.loading) return;
    if (!this.data.hasMore && !refresh) return;

    if (refresh) {
      this.setData({ page: 1, upcomingCourses: [], historyCourses: [], hasMore: true });
    }

    this.setData({ loading: true });
    try {
      const res = await get('/coach/courses', {
        page: this.data.page,
        size: this.data.size
      });
      if (res.code === 200) {
        let newCourses = res.data.records || [];
        const now = new Date();
        // 分离即将上课和历史课程
        let newUpcoming = [];
        let newHistory = [];
        newCourses.forEach(course => {
          const startTime = new Date(course.startTime);
          if (startTime >= now) {
            newUpcoming.push(course);
          } else {
            newHistory.push(course);
          }
        });
        // 分别排序：即将上课按时间升序（最近的在前），历史课程按时间降序（最近的在前）
        newUpcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        newHistory.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        this.setData({
          upcomingCourses: refresh ? newUpcoming : [...this.data.upcomingCourses, ...newUpcoming],
          historyCourses: refresh ? newHistory : [...this.data.historyCourses, ...newHistory],
          hasMore: this.data.page * this.data.size < res.data.total
        });
      }
    } catch (err) {
      console.error('加载课程失败', err);
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  async showMembers(e) {
    const courseId = e.currentTarget.dataset.id;
    const course = [...this.data.upcomingCourses, ...this.data.historyCourses].find(c => c.id === courseId);
    if (!course) return;

    this.setData({
      selectedCourse: course,
      showMemberDialog: true,
      membersLoading: true,
      members: []
    });

    try {
      const res = await get(`/coach/course/${courseId}/bookings`);
      if (res.code === 200) {
        let items = res.data || [];
        const flatList = items.map(item => {
          const booking = item.booking || {};
          return {
            id: booking.id,
            memberId: booking.memberId,
            memberName: booking.memberName,
            status: booking.status,
            bookingTime: booking.bookingTime,
            remark: booking.remark,
            auditRemark: booking.auditRemark,
            memberPhone: item.memberPhone,
            memberNickname: item.memberNickname
          };
        });
        const confirmed = flatList.filter(b => b.status === '已确认');
        const members = confirmed.map(b => ({
          id: b.memberId,
          name: b.memberName || b.memberNickname || '学员',
          phone: b.memberPhone || '暂无',
          remark: b.remark || ''
        }));
        this.setData({ members });
      }
    } catch (err) {
      console.error('加载学员失败', err);
    } finally {
      this.setData({ membersLoading: false });
    }
  },

  closeMemberDialog() {
    this.setData({ showMemberDialog: false, selectedCourse: null, members: [] });
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
  },

  // 判断课程是否已满（可选，用于样式）
  isFull(course) {
    return course.bookedCount >= course.maxCapacity;
  }
});