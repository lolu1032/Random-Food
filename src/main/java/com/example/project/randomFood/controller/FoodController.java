package com.example.project.randomFood.controller;
import com.example.project.randomFood.domain.Food;
import com.example.project.randomFood.dto.UUIDRequest;
import com.example.project.randomFood.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FoodController {
    private final FoodService foodService;

    @PostMapping("/api")
    public Food randomFood(@RequestBody UUIDRequest request) {
        return foodService.randomFood(request);
    }
    @PostMapping("/api/reset")
    public ResponseEntity<?> resetFoodHistory(@RequestBody UUIDRequest request) {
        foodService.resetUserHistory(request.getUuid());
        return ResponseEntity.ok().build();
    }
}
