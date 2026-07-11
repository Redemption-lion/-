package com.gym.controller;

import com.gym.entity.User;
import com.gym.mapper.UserMapper;
import com.gym.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        User user = userMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", username)
                        .eq("password", password)
        );
        Map<String, Object> res = new HashMap<>();
        if (user == null) {
            res.put("code", 1);
            res.put("msg", "用户名或密码错误");
            return res;
        }
        String token = JwtUtil.generateToken(user.getId(), user.getUsername());
        res.put("code", 0);
        res.put("msg", "登录成功");
        res.put("token", token);
        res.put("role", user.getRole());
        return res;
    }
}