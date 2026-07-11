const app = getApp();
const { get, put } = require('../../utils/request');

Page({
  data: {
    role: 'member',
    userInfo: {},
    isEditing: false,
    editForm: {
      nickname: '',
      realName: '',
      gender: '',
      avatar: ''
    },
    genderOptions: ['男', '女', '未知'],
    // 上课记录相关（会员）
    fitnessDataList: [],
    fitnessDataLoading: false,
    fitnessDataPage: 1,
    fitnessDataHasMore: true
  },

  onLoad() {
    this.setData({ role: app.getRole() });
    this.loadUserInfo();
    this.loadFitnessData();
  },

  onShow() {
    this.loadUserInfo();
    if (this.data.fitnessDataList.length === 0) {
      this.loadFitnessData(true);
    }
  },

  async loadUserInfo() {
    wx.showLoading({ title: '加载中...' });
    try {
      let res;
      if (app.isMember()) {
        res = await get('/member/profile');
      } else {
        res = await get('/coach/profile');
      }
      if (res.code === 200) {
        const userInfo = res.data;
        this.setData({
          userInfo,
          editForm: {
            nickname: userInfo.nickname || userInfo.coachName || '',
            realName: userInfo.realName || '',
            gender: userInfo.gender || '未知',
            avatar: userInfo.avatar || ''
          }
        });
      }
    } catch (err) {
      console.error('加载用户信息失败', err);
    } finally {
      wx.hideLoading();
    }
  },

  // 加载上课记录（仅会员）
  async loadFitnessData(refresh = false) {
    if (!app.isMember()) return;
    if (this.data.fitnessDataLoading) return;
    if (!this.data.fitnessDataHasMore && !refresh) return;

    if (refresh) {
      this.setData({ fitnessDataPage: 1, fitnessDataList: [], fitnessDataHasMore: true });
    }

    this.setData({ fitnessDataLoading: true });
    try {
      const res = await get('/member/fitness-data', {
        page: this.data.fitnessDataPage,
        size: 10
      });
      if (res.code === 200) {
        const records = res.data.records || [];
        this.setData({
          fitnessDataList: refresh ? records : [...this.data.fitnessDataList, ...records],
          fitnessDataHasMore: this.data.fitnessDataPage * 10 < res.data.total
        });
      }
    } catch (err) {
      console.error('加载上课记录失败', err);
    } finally {
      this.setData({ fitnessDataLoading: false });
    }
  },

  // 加载更多
  loadMoreFitnessData() {
    if (!this.data.fitnessDataHasMore || this.data.fitnessDataLoading) return;
    this.setData({ fitnessDataPage: this.data.fitnessDataPage + 1 });
    this.loadFitnessData();
  },

  // 切换编辑模式
  toggleEdit() {
    this.setData({ isEditing: !this.data.isEditing });
  },

  // 表单输入
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`editForm.${field}`]: e.detail.value });
  },

  // 选择性别
  onGenderChange(e) {
    this.setData({ 'editForm.gender': this.data.genderOptions[e.detail.value] });
  },

  // 保存修改
  async saveProfile() {
    wx.showLoading({ title: '保存中...' });
    try {
      let res;
      const { editForm } = this.data;
      
      if (app.isMember()) {
        res = await put('/member/profile', {
          nickname: editForm.nickname,
          realName: editForm.realName,
          gender: editForm.gender,
          avatar: editForm.avatar
        });
      } else {
        res = await put('/coach/profile', {
          coachName: editForm.nickname,
          gender: editForm.gender,
          avatar: editForm.avatar,
          bio: editForm.bio
        });
      }
      
      if (res.code === 200) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        this.setData({ isEditing: false });
        this.loadUserInfo();
        
        const userInfo = app.globalData.userInfo;
        userInfo.nickname = editForm.nickname;
        userInfo.avatar = editForm.avatar;
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
      }
    } catch (err) {
      console.error('保存失败', err);
    } finally {
      wx.hideLoading();
    }
  },

  // 上传头像
  async uploadAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        wx.showLoading({ title: '上传中...' });
        
        wx.uploadFile({
          url: app.globalData.baseUrl + '/upload/image',
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${app.globalData.token}`
          },
          success: (uploadRes) => {
            const data = JSON.parse(uploadRes.data);
            if (data.code === 200) {
              this.setData({ 'editForm.avatar': data.data });
              wx.showToast({ title: '上传成功', icon: 'success' });
            } else {
              wx.showToast({ title: '上传失败', icon: 'none' });
            }
          },
          fail: () => {
            wx.showToast({ title: '上传失败', icon: 'none' });
          },
          complete: () => {
            wx.hideLoading();
          }
        });
      }
    });
  },

  // 修改密码
  changePassword() {
    wx.navigateTo({ url: '/pages/profile/change-password' });
  },

  // 我的预约（会员）
  goToBookings() {
    wx.switchTab({ url: '/pages/booking/booking' });
  },

  // 我的课程（教练）
  goToMyCourses() {
    wx.navigateTo({ url: '/pages/my-courses/my-courses' });
  },

  // 预约审核（教练）
  goToBookingAudit() {
    wx.navigateTo({ url: '/pages/booking-audit/booking-audit' });
  },

  // 上课记录（教练）
  goToSchedule() {
    wx.navigateTo({ url: '/pages/coach-schedule/coach-schedule' });
  },

  // 我的评价
  goToFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  // 公告
  goToNotices() {
    wx.navigateTo({ url: '/pages/notice/notice' });
  },

  // 我的预约（会员）
  goToMyBookings() {
    wx.switchTab({ url: '/pages/booking/booking' });
  },

  // 切换角色（仅教练可切换到会员视角）
  switchToMember() {
    wx.showModal({
      title: '切换视角',
      content: '切换到会员视角后，您可以体验会员功能。再次登录将恢复教练身份。',
      success: (res) => {
        if (res.confirm) {
          app.clearLoginInfo();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearLoginInfo();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '健身房信息管理系统 v1.0\n\n为中小型健身房提供数字化管理解决方案。\n\n客服邮箱：support@gym.com',
      showCancel: false
    });
  }
});