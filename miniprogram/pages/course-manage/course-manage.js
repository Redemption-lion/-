const app = getApp();
const { get, post, put } = require('../../utils/request');

// 获取今天的日期字符串 YYYY-MM-DD
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取当前时间字符串 HH:MM（默认取整点后半小时）
function getDefaultTime() {
  const now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();
  if (minute >= 30) {
    hour += 1;
    minute = 0;
  } else {
    minute = 30;
  }
  if (hour >= 24) {
    hour = 23;
    minute = 30;
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

Page({
  data: {
    isEdit: false,
    editId: null,
    form: {
      courseName: '',
      category: '团课',
      cover: '',
      startTime: '',
      duration: 60,
      maxCapacity: 20,
      difficulty: '初级',
      description: '',
      price: 0
    },
    dateValue: getTodayDate(),
    timeValue: getDefaultTime(),
    categoryOptions: ['团课', '私教'],
    difficultyOptions: ['初级', '中级', '高级'],
    loading: false
  },

  onLoad(options) {
    this.updateStartTime();
    if (options.editId) {
      this.setData({ 
        isEdit: true, 
        editId: parseInt(options.editId) 
      });
      this.loadCourseDetail();
    }
  },

  updateStartTime() {
    const { dateValue, timeValue } = this.data;
    if (dateValue && timeValue) {
      const startTime = `${dateValue} ${timeValue}:00`;
      this.setData({ 'form.startTime': startTime });
    }
  },

  onDateChange(e) {
    this.setData({ dateValue: e.detail.value });
    this.updateStartTime();
  },

  onTimeChange(e) {
    this.setData({ timeValue: e.detail.value });
    this.updateStartTime();
  },

  async loadCourseDetail() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await get('/coach/courses', { page: 1, size: 100 });
      if (res.code === 200) {
        const courses = res.data.records || [];
        const course = courses.find(c => c.id === this.data.editId);
        if (course) {
          let startTime = course.startTime;
          if (startTime) {
            let datePart = startTime.split(' ')[0];
            let timePart = startTime.split(' ')[1]?.substring(0, 5) || getDefaultTime();
            this.setData({
              dateValue: datePart,
              timeValue: timePart
            });
          }
          this.setData({
            form: {
              courseName: course.courseName,
              category: course.category,
              cover: course.cover,
              startTime: course.startTime,
              duration: course.duration,
              maxCapacity: course.maxCapacity,
              difficulty: course.difficulty,
              description: course.description,
              price: course.price
            }
          });
        }
      }
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      wx.hideLoading();
    }
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onCategoryChange(e) {
    this.setData({ 'form.category': this.data.categoryOptions[e.detail.value] });
  },

  onDifficultyChange(e) {
    this.setData({ 'form.difficulty': this.data.difficultyOptions[e.detail.value] });
  },

  onDurationChange(e) {
    this.setData({ 'form.duration': parseInt(e.detail.value) });
  },

  onCapacityChange(e) {
    this.setData({ 'form.maxCapacity': parseInt(e.detail.value) });
  },

  async uploadCover() {
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
              this.setData({ 'form.cover': data.data });
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

  async submitForm() {
    const { form, isEdit, editId } = this.data;
    
    if (!form.courseName) {
      wx.showToast({ title: '请填写课程名称', icon: 'none' });
      return;
    }
    if (!form.startTime) {
      wx.showToast({ title: '请选择课程日期和时间', icon: 'none' });
      return;
    }
    if (form.price <= 0) {
      wx.showToast({ title: '请输入正确的价格', icon: 'none' });
      return;
    }
    if (form.maxCapacity <= 0) {
      wx.showToast({ title: '请输入最大预约人数', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: isEdit ? '保存中...' : '发布中...' });
    
    try {
      let res;
      // 深拷贝表单数据
      const submitData = { ...form };
      // 将 startTime 格式转换为 ISO 8601 (空格替换为 T)
      if (submitData.startTime && !submitData.startTime.includes('T')) {
        submitData.startTime = submitData.startTime.replace(' ', 'T');
      }
      // 确保价格和人数为数字类型
      submitData.price = Number(submitData.price);
      submitData.maxCapacity = Number(submitData.maxCapacity);
      
      console.log('提交的数据:', submitData);
      
      if (isEdit) {
        res = await put('/coach/course', { ...submitData, id: editId });
      } else {
        res = await post('/coach/course', submitData);
      }
      
      if (res.code === 200) {
        wx.showToast({ 
          title: isEdit ? '保存成功' : '发布成功', 
          icon: 'success' 
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (err) {
      console.error('提交失败', err);
      wx.showToast({ title: '提交失败，请检查网络或输入内容', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});