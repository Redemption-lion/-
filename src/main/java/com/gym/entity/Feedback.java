package com.gym.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import lombok.Data;

@Data
@TableName("feedback")
public class Feedback {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer userId;
    private String content;
    private String reply;
    private Date createTime;
}