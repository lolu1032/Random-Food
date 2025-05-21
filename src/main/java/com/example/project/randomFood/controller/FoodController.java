package com.example.project.randomFood.controller;
import com.example.project.randomFood.domain.Food;
import com.example.project.randomFood.dto.UUIDRequest;
import com.example.project.randomFood.service.FoodService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FoodController {
    private final FoodService foodService;

    @PostMapping("/api")
    public ResponseEntity<Food> randomFood(@RequestBody UUIDRequest request) {
        return foodService.randomFood(request);
    }
    @PostMapping("/api/reset")
    public ResponseEntity<?> resetFoodHistory(@RequestBody UUIDRequest request) {
        foodService.resetUserHistory(request.getUuid());
        return ResponseEntity.ok().build();
    }
    @GetMapping("/api/session-uuid")
    public ResponseEntity<String> getSessionUUID(HttpSession session) {
        Object uuid = session.getAttribute("user_uuid");
        return ResponseEntity.ok(uuid != null ? uuid.toString() : "");
    }

}
