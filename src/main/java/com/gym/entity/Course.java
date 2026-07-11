package com.gym.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import lombok.Data;

@Data
@TableName("course")
public class Course {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String name;
    private String coachName;
    private Date startTime;
    private Date endTime;
    private Integer capacity;
    private Integer bookedCount;
    private String status;
}