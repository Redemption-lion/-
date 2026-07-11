package com.gym.controller;

import com.gym.entity.Feedback;
import com.gym.mapper.FeedbackMapper;
import com.gym.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin
public class FeedbackController {

    @Autowired
    private FeedbackMapper feedbackMapper;

    @PostMapping("/submit")
    public Map<String, Object> submit(@RequestBody Map<String, String> params, @RequestHeader("token") String token) {
        Integer userId = JwtUtil.getUserId(token);
        String content = params.get("content");
        Feedback fb = new Feedback();
        fb.setUserId(userId);
        fb.setContent(content);
        feedbackMapper.insert(fb);
        Map<String, Object> res = new HashMap<>();
        res.put("code", 0);
        res.put("msg", "提交成功");
        return res;
    }

    @GetMapping("/list")
    public Map<String, Object> list() {
        List<Feedback> list = feedbackMapper.selectList(null);
        Map<String, Object> res = new HashMap<>();
        res.put("code", 0);
        res.put("data", list);
        return res;
    }
}