package com.example.project.randomFood.controller;
import com.example.project.randomFood.domain.Food;
import com.example.project.randomFood.domain.FoodHistory;
import com.example.project.randomFood.dto.UUIDRequest;
import com.example.project.randomFood.service.FoodService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FoodController {
    private final FoodService foodService;

    @GetMapping("/history")
    public ResponseEntity<List<FoodHistory>> foodHistory(@RequestParam String foodValues, HttpSession session) {
        List<FoodHistory> history = foodService.getHistory(foodValues, session);
        return ResponseEntity.ok(history);
    }
    @PostMapping()
    public ResponseEntity<Food> randomFood(@RequestBody UUIDRequest request,HttpSession session) {
        Food food = foodService.randomFood(request, session);
        foodService.addFoodToHistory(session, food, request.getFoodValues());
        return ResponseEntity.ok(food);
    }
    @PostMapping("/reset")
    public ResponseEntity<?> resetFoodHistory(HttpSession session) {
        foodService.resetFoodHistory(session);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/expire")
    public ResponseEntity<?> resetSession(HttpSession session) {
        foodService.resetSession(session);
        return ResponseEntity.ok().build();
    }


}
