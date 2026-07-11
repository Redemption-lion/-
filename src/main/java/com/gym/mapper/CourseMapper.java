package com.gym.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gym.entity.Course;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CourseMapper extends BaseMapper<Course> {
}