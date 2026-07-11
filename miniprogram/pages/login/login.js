const app = getApp();
const { post } = require('../../utils/request');

Page({
  data: {
    activeTab: 'login',
    selectedRole: 'member',
    loginForm: {
      username: '',
      password: ''
    },
    registerForm: {
      phone: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      realName: ''
    },
    showPassword: false,
    agreePrivacy: false
  },

  onLoad() {
    if (app.checkLogin()) {
      this.navigateToHome();
    }
  },

  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ selectedRole: role });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onLoginInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`loginForm.${field}`]: value });
  },

  onRegisterInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`registerForm.${field}`]: value });
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  togglePrivacy() {
    this.setData({ agreePrivacy: !this.data.agreePrivacy });
  },

  async handleLogin() {
    const { username, password } = this.data.loginForm;
    const { selectedRole } = this.data;

    const trimmedUsername = username ? username.trim() : '';
    const trimmedPassword = password ? password.trim() : '';

    if (!trimmedUsername || !trimmedPassword) {
      wx.showToast({ title: '请填写完整信息', icon: 'none', duration: 2000 });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    try {
      let url, role;
      if (selectedRole === 'member') {
        url = '/member/login';
        role = 'member';
      } else {
        url = '/coach/login';
        role = 'coach';
      }

      const res = await post(url, {
        username: trimmedUsername,
        password: trimmedPassword,
        role: role
      });

      if (res.code === 200) {
        const data = res.data;
        let userId, userInfo;
        if (selectedRole === 'member') {
          userId = data.memberId;
          userInfo = {
            nickname: data.nickname,
            avatar: data.avatar,
            userId: userId
          };
        } else {
          userId = data.coachId;
          userInfo = {
            nickname: data.coachName,
            avatar: data.avatar,
            userId: userId
          };
        }

        app.setLoginInfo(data.token, userId, role, userInfo);

        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          this.navigateToHome();
        }, 1000);
      }
    } catch (err) {
      console.error('登录请求异常', err);
    } finally {
      wx.hideLoading();
    }
  },

  async handleRegister() {
    const { phone, password, confirmPassword, nickname, realName } = this.data.registerForm;

    const trimmedPhone = phone ? phone.trim() : '';
    const trimmedPassword = password ? password.trim() : '';
    const trimmedNickname = nickname ? nickname.trim() : '';

    if (!trimmedPhone || !trimmedPassword || !trimmedNickname) {
      wx.showToast({ title: '请填写手机号、密码和昵称', icon: 'none' });
      return;
    }

    if (trimmedPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }

    if (!this.data.agreePrivacy) {
      wx.showToast({ title: '请同意隐私协议', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '注册中...' });

    try {
      const res = await post('/member/register', {
        phone: trimmedPhone,
        password: trimmedPassword,
        nickname: trimmedNickname,
        realName: realName || '',
        gender: '未知',
        avatar: ''
      });

      if (res.code === 200) {
        wx.showToast({ title: '注册成功，请登录', icon: 'success' });
        this.setData({
          activeTab: 'login',
          selectedRole: 'member',
          'loginForm.username': trimmedPhone
        });
      }
    } catch (err) {
      console.error('注册失败', err);
    } finally {
      wx.hideLoading();
    }
  },

  navigateToHome() {
    // 统一使用 reLaunch，确保清除页面栈并跳转到首页
    wx.reLaunch({ url: '/pages/index/index' });
  },

  viewPrivacy() {
    wx.showModal({
      title: '隐私协议',
      content: '我们将严格保护您的个人信息安全，不会泄露给第三方。',
      showCancel: false
    });
  }
});