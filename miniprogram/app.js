App({
  globalData: {
    userInfo: null,
    token: null,
    userId: null,
    userRole: null,
    baseUrl: 'http://localhost:8080',   // 请根据实际后端地址修改
    useMock: false
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    const userRole = wx.getStorageSync('userRole');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userId && userRole) {
      this.globalData.token = token;
      this.globalData.userId = userId;
      this.globalData.userRole = userRole;
      this.globalData.userInfo = userInfo;
    }
  },

  setLoginInfo(token, userId, userRole, userInfo) {
    this.globalData.token = token;
    this.globalData.userId = userId;
    this.globalData.userRole = userRole;
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('token', token);
    wx.setStorageSync('userId', userId);
    wx.setStorageSync('userRole', userRole);
    wx.setStorageSync('userInfo', userInfo);
  },

  clearLoginInfo() {
    this.globalData.token = null;
    this.globalData.userId = null;
    this.globalData.userRole = null;
    this.globalData.userInfo = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userId');
    wx.removeStorageSync('userRole');
    wx.removeStorageSync('userInfo');
  },

  checkLogin() {
    return !!this.globalData.token;
  },

  getRole() {
    return this.globalData.userRole;
  },

  isMember() {
    return this.globalData.userRole === 'member';
  },

  isCoach() {
    return this.globalData.userRole === 'coach';
  }
});