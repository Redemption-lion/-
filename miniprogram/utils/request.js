const app = getApp();

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token;
    wx.request({
      url: app.globalData.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success(res) {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data);
          } else if (res.data.code === 401) {
            // 只提示，不清除登录信息也不跳转，让用户手动处理
            wx.showToast({ title: res.data.msg || '认证失败，请重新登录', icon: 'none', duration: 2000 });
            reject(res.data);
          } else {
            wx.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
            reject(res.data);
          }
        } else {
          wx.showToast({ title: `网络错误 ${res.statusCode}`, icon: 'none' });
          reject(res);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
};

const get = (url, data) => request({ url, method: 'GET', data });
const post = (url, data) => request({ url, method: 'POST', data });
const put = (url, data) => request({ url, method: 'PUT', data });
const del = (url, data) => request({ url, method: 'DELETE', data });

module.exports = { request, get, post, put, del };