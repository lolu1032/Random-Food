package com.example.project.randomFood.dto;

import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class PickRequest {
    private String uuid;
    private String type;
}
