# 基于微信小程序的健身房信息管理系统

## 项目简介

本项目是 **沈阳工程学院** 计算机科学与技术专业毕业设计成果，旨在为中小型健身房提供一套轻量化、易用、可二次开发的信息化管理解决方案。系统基于 **Spring Boot + 微信小程序** 构建，采用前后端分离架构，覆盖 **会员、教练、管理员** 三类角色，实现了课程预约、教练审核、会员管理、设备维护、数据统计等核心业务功能。

通过本系统，健身房可以显著降低人工沟通成本，提高课程资源利用率，并为会员提供透明、自主的服务体验。

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端（小程序） | 微信小程序原生框架 | WXML + WXSS + JavaScript |
| 后端 | Spring Boot 2.7.18 | RESTful API 服务 |
| 数据库 | MySQL 8.0 | 关系型数据库 |
| ORM | Spring Data JPA | 对象关系映射 |
| 权限认证 | JWT（JSON Web Token） | 无状态身份认证 |
| 数据可视化 | ECharts | 管理后台图表展示 |
| 开发工具 | IntelliJ IDEA / 微信开发者工具 | |

---

## 系统功能模块

### 1. 会员端（微信小程序）
| 页面 | 功能 |
|------|------|
| 登录注册 | 手机号+密码登录、新用户注册 |
| 首页课程列表 | 查看所有可预约课程（名称、教练、时间、剩余名额、价格） |
| 课程详情 | 查看课程详细介绍，点击“预约” |
| 我的预约 | 查看已预约课程，支持取消 |
| 上课记录 | 查看已完成课程历史 |
| 课程评价 | 对已完成的课程进行打分和文字评价 |
| 公告查看 | 接收健身房最新通知 |

### 2. 教练端（微信小程序）
| 页面 | 功能 |
|------|------|
| 教练登录 | 账号+密码登录 |
| 教练首页 | 查看自己发布的课程列表 |
| 课程管理 | 发布新课、编辑、下架 |
| 预约审核 | 查看课程预约会员列表，审核通过/拒绝 |
| 学员信息 | 查看预约自己课程的会员基本信息 |
| 上课记录 | 查看已授课记录 |

### 3. 管理员端（Web后台）
| 页面 | 功能 |
|------|------|
| 数据查看 | ECharts 展示会员增长趋势、课程热度 |
| 用户管理 | 会员和教练的增删改查、状态管理 |
| 课程管理 | 所有课程的审核、下架、统计 |
| 评价/公告管理 | 回复会员评价，发布/编辑公告 |
| 订单管理 | 查看所有订单，修改订单状态 |
| 操作日志 | 查看系统关键操作日志 |
| 设备管理 | 器材台账录入、维修状态更新 |
| 预约管理 | 查看所有预约记录，人工干预 |
| 管理员登录 | 后台安全登录入口 |

---

## 项目结构
```plaintext
gym-management/
├── src/
│ └── main/
│ ├── java/com/gym/
│ │ ├── GymApplication.java # 启动类
│ │ ├── config/ # CORS、JWT拦截器
│ │ ├── controller/ # RESTful API 控制器
│ │ │ ├── MemberController.java
│ │ │ ├── CoachController.java
│ │ │ ├── AdminController.java
│ │ │ ├── CourseController.java
│ │ │ ├── EquipmentController.java
│ │ │ ├── OrderController.java
│ │ │ ├── FeedbackController.java
│ │ │ ├── NoticeController.java
│ │ │ └── LogController.java
│ │ ├── entity/ # JPA实体类
│ │ ├── repository/ # 数据访问层
│ │ └── util/
│ │ └── JwtUtil.java # JWT工具类
│ └── resources/
│ ├── application.yml # 配置文件
│ └── static/
│ └── admin.html # 管理员后台页面
├── database/
│ └── gym_db.sql # 建表语句+测试数据
└── wechat-miniprogram/ # 微信小程序源码
├── app.js
├── app.json
├── pages/
│ ├── member/ # 会员端页面
│ │ ├── login/
│ │ ├── index/
│ │ ├── my/
│ │ ├── courseDetail/
│ │ ├── booking/
│ │ ├── record/
│ │ ├── evaluate/
│ │ └── notice/
│ └── coach/ # 教练端页面
│ ├── login/
│ ├── index/
│ ├── courseManage/
│ ├── bookingList/
│ ├── memberList/
│ └── teachRecord/
└── images/ # 图标资源
```

---

## 快速开始

### 环境要求
- JDK 11+
- MySQL 8.0+
- Maven 3.6+
- 微信开发者工具
- IntelliJ IDEA（推荐）

### 1. 数据库准备
```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS gym_db DEFAULT CHARACTER SET utf8mb4;

-- 导入建表语句和测试数据
USE gym_db;
SOURCE /path/to/database/gym_db.sql;

修改 src/main/resources/application.yml 中的数据库连接信息：
```
### 2.后端配置
yaml```
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/gym_db?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
    ```

### 3.启动后端
在 IDEA 中运行 GymApplication.java，或使用 Maven 命令：
bash```
  mvn clean install
  java -jar target/gym-management-0.0.1-SNAPSHOT.jar
    ```

启动成功后，访问 http://localhost:8080/api/course/list 应返回 JSON 数据。

### 4.小程序配置
在微信开发者工具中导入项目根目录下的 wechat-miniprogram 文件夹。

修改 app.js 中的 baseUrl：

javascript```
globalData: {
  baseUrl: 'http://YOUR_IP:8080/api',  // 改为你的电脑IP（真机调试）或 localhost（模拟器）
  // ...
}```
勾选微信开发者工具中的「不校验合法域名」选项。

### 5. 管理员后台
浏览器访问 http://localhost:8080/admin.html。

### 主要接口
|接口 |方法|说明|
|------|------|------|
|/api/member/login|	POST|	会员登录|
|/api/member/book|	POST|	预约课程|
|/api/member/cancel|	POST|	取消预约|
|/api/member/myBookings|	GET|	我的预约列表|
|/api/coach/login|	POST|	教练登录|
|/api/coach/myCourses|	GET|	我的课程列表|
|/api/coach/audit|	POST|	审核预约|
|/api/course/list|	GET|	课程列表（公开）|
|/api/admin/memberStats|	GET|	会员增长统计|
|/api/admin/courseHeat|	GET|	课程热度统计|
|/api/admin/equipment/*|	CRUD|	设备管理|
|/api/admin/order/*|	CRUD|	订单管理|
|/api/admin/feedback/*|	CRUD|	评价管理|
|/api/admin/notice/*|	CRUD|	公告管理|
|/api/admin/log/list|	GET|	操作日志列表|
除 /api/course/** 外，其他接口均需在请求头中携带 Authorization: Bearer {token}。


### 数据库表结构
|表名	|说明|
|------|------|
|admin|	管理员表|
|coach	|教练表|
|member	|会员表|
|course	|课程表|
|booking	|预约表|
|equipment	|器材设备表|
|fitness_data|	健身数据表|
|feedback	|评价反馈表|
|notice	|公告表|
|orders|	订单表|
|sys_log|	系统日志表|


## 许可证
本系统仅供学习与毕业设计参考使用，未经授权不得用于商业用途。

### 沈阳工程学院 · 计算机科学与技术学院 · 计算机242班 · 赵锦强
