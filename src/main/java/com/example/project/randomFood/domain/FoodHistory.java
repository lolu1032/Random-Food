package com.example.project.randomFood.domain;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class FoodHistory {
    private final String food;
    private final Instant time;
}
