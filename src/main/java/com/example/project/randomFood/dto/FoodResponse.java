package com.example.project.randomFood.dto;

import com.example.project.randomFood.domain.Food;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FoodResponse {
    private Food food;
}
