const app = getApp();
const { get } = require('../../utils/request');

Page({
  data: {
    page: 1,
    size: 10,
    total: 0,
    courses: [],
    loading: false,
    hasMore: true,
    filters: {
      courseName: '',
      difficulty: ''
    },
    difficultyOptions: ['全部', '初级', '中级', '高级'],
    selectedDifficulty: '全部'
  },

  onLoad() {
    this.loadCourses();
  },

  // 加载课程列表
  async loadCourses(refresh = false) {
    if (this.data.loading) return;
    if (!this.data.hasMore && !refresh) return;
    
    if (refresh) {
      this.setData({ page: 1, courses: [], hasMore: true });
    }
    
    this.setData({ loading: true });
    
    try {
      const { page, size, filters } = this.data;
      const params = { page, size };
      if (filters.courseName) params.courseName = filters.courseName;
      if (filters.difficulty && filters.difficulty !== '全部') params.difficulty = filters.difficulty;
      
      const url = app.isMember() ? '/member/courses' : '/coach/courses';
      const res = await get(url, params);
      
      if (res.code === 200) {
        const newCourses = res.data.records || [];
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

  // 搜索输入
  onSearchInput(e) {
    this.setData({ 'filters.courseName': e.detail.value });
  },

  // 搜索确认
  onSearch() {
    this.loadCourses(true);
  },

  // 选择难度（修复：从 dataset.index 获取选项索引）
  onDifficultyChange(e) {
    const idx = e.currentTarget.dataset.index;   // 关键修复
    const difficulty = this.data.difficultyOptions[idx];
    this.setData({ 
      selectedDifficulty: difficulty,
      'filters.difficulty': difficulty === '全部' ? '' : difficulty
    });
    this.loadCourses(true);
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${id}` });
  },

  // 下拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.loadCourses();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCourses(true);
    wx.stopPullDownRefresh();
  }
});