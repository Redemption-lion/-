package com.gym.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import lombok.Data;

@Data
@TableName("booking")
public class Booking {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer userId;
    private Integer courseId;
    private Date bookTime;
    private String status;
}