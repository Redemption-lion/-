package com.gym.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import lombok.Data;

@Data
@TableName("equipment_repair")
public class EquipmentRepair {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String equipmentName;
    private Integer userId;
    private String description;
    private String status;
    private Date createTime;
}