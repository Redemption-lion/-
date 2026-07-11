package com.gym.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.gym.entity.Booking;
import com.gym.entity.Course;
import com.gym.mapper.BookingMapper;
import com.gym.mapper.CourseMapper;
import com.gym.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/course")
@CrossOrigin
public class CourseController {

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private BookingMapper bookingMapper;

    // 获取所有课程列表
    @GetMapping("/list")
    public Map<String, Object> list() {
        List<Course> list = courseMapper.selectList(
                new QueryWrapper<Course>().eq("status", "active")
        );
        Map<String, Object> res = new HashMap<>();
        res.put("code", 0);
        res.put("data", list);
        return res;
    }

    // 预约课程
    @PostMapping("/book")
    public Map<String, Object> book(@RequestParam Integer courseId,
                                    @RequestHeader("token") String token) {
        Integer userId = JwtUtil.getUserId(token);

        // 检查是否已经预约过
        Booking exist = bookingMapper.selectOne(
                new QueryWrapper<Booking>()
                        .eq("user_id", userId)
                        .eq("course_id", courseId)
                        .eq("status", "booked")
        );
        if (exist != null) {
            return error("您已经预约过该课程");
        }

        // 检查课程容量
        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            return error("课程不存在");
        }
        if (course.getBookedCount() >= course.getCapacity()) {
            return error("课程已满，无法预约");
        }

        // 增加已预约人数
        course.setBookedCount(course.getBookedCount() + 1);
        courseMapper.updateById(course);

        // 添加预约记录
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setCourseId(courseId);
        booking.setStatus("booked");
        bookingMapper.insert(booking);

        return success("预约成功");
    }

    // 取消预约
    @PostMapping("/cancel")
    public Map<String, Object> cancel(@RequestParam Integer bookingId,
                                      @RequestHeader("token") String token) {
        Integer userId = JwtUtil.getUserId(token);
        Booking booking = bookingMapper.selectById(bookingId);
        if (booking == null || !booking.getUserId().equals(userId)) {
            return error("无法取消，预约不存在或不属于您");
        }
        if (!"booked".equals(booking.getStatus())) {
            return error("已经取消过了");
        }

        // 更新预约状态为已取消
        booking.setStatus("cancelled");
        bookingMapper.updateById(booking);

        // 减少课程已预约人数
        Course course = courseMapper.selectById(booking.getCourseId());
        if (course != null && course.getBookedCount() > 0) {
            course.setBookedCount(course.getBookedCount() - 1);
            courseMapper.updateById(course);
        }

        return success("取消成功");
    }

    // 查询我的预约（带课程详情）
    @GetMapping("/myBookings")
    public Map<String, Object> myBookings(@RequestHeader("token") String token) {
        Integer userId = JwtUtil.getUserId(token);

        // 1. 查询该用户所有状态为 booked 的预约记录
        List<Booking> bookings = bookingMapper.selectList(
                new QueryWrapper<Booking>()
                        .eq("user_id", userId)
                        .eq("status", "booked")
        );

        // 2. 手动组装课程信息
        List<Map<String, Object>> result = new ArrayList<>();
        for (Booking booking : bookings) {
            Course course = courseMapper.selectById(booking.getCourseId());
            if (course != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("bookingId", booking.getId());
                item.put("courseName", course.getName());
                item.put("startTime", course.getStartTime());
                item.put("endTime", course.getEndTime());
                item.put("coachName", course.getCoachName());
                result.add(item);
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("code", 0);
        res.put("data", result);
        return res;
    }

    // 私有辅助方法：成功响应
    private Map<String, Object> success(String msg) {
        Map<String, Object> res = new HashMap<>();
        res.put("code", 0);
        res.put("msg", msg);
        return res;
    }

    // 私有辅助方法：错误响应
    private Map<String, Object> error(String msg) {
        Map<String, Object> res = new HashMap<>();
        res.put("code", 1);
        res.put("msg", msg);
        return res;
    }
}