const app = getApp();
const { get, post } = require('../../utils/request');

Page({
  data: {
    role: 'member',
    feedbacks: [],
    page: 1,
    size: 10,
    total: 0,
    hasMore: true,
    loading: false,
    showForm: false,
    form: {
      title: '',
      content: ''
    }
  },

  onLoad() {
    this.setData({ role: app.getRole() });
    this.loadFeedbacks();
  },

  async loadFeedbacks(refresh = false) {
    if (this.data.loading) return;
    if (!this.data.hasMore && !refresh) return;
    
    if (refresh) {
      this.setData({ page: 1, feedbacks: [], hasMore: true });
    }
    
    this.setData({ loading: true });
    
    try {
      let url;
      if (app.isMember()) {
        url = '/member/feedbacks';
      } else {
        url = '/coach/feedbacks';
      }
      
      const res = await get(url, { page: this.data.page, size: this.data.size });
      
      if (res.code === 200) {
        const newFeedbacks = res.data.records || [];
        this.setData({
          feedbacks: refresh ? newFeedbacks : [...this.data.feedbacks, ...newFeedbacks],
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

  // 显示表单
  showFormDialog() {
    this.setData({ 
      showForm: true,
      form: { title: '', content: '' }
    });
  },

  // 隐藏表单
  hideFormDialog() {
    this.setData({ showForm: false });
  },

  // 表单输入
  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  // 提交反馈
  async submitFeedback() {
    const { title, content } = this.data.form;
    
    if (!title) {
      wx.showToast({ title: '请填写标题', icon: 'none' });
      return;
    }
    if (!content) {
      wx.showToast({ title: '请填写内容', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '提交中...' });
    
    try {
      let url;
      if (app.isMember()) {
        url = '/member/feedback';
      } else {
        url = '/coach/feedback';
      }
      
      const res = await post(url, { title, content });
      
      if (res.code === 200) {
        wx.showToast({ title: '提交成功', icon: 'success' });
        this.hideFormDialog();
        this.loadFeedbacks(true);
      }
    } catch (err) {
      console.error('提交失败', err);
    } finally {
      wx.hideLoading();
    }
  },

  // 下拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.loadFeedbacks();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadFeedbacks(true);
    wx.stopPullDownRefresh();
  },

  // 格式化时间
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000 && date.getDate() === now.getDate()) {
      return '今天 ' + `${date.getHours()}:${date.getMinutes().toString().padStart(2,'0')}`;
    }
    return `${date.getMonth()+1}月${date.getDate()}日`;
  }
});