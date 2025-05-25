package com.example.project.randomFood.controller;

import com.example.project.randomFood.dto.FoodResponse;
import com.example.project.randomFood.dto.PickRequest;
import com.example.project.randomFood.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequiredArgsConstructor
public class FoodController {
    private final FoodService foodService;

    @PostMapping("/api")
    public ResponseEntity<FoodResponse> randFood(@RequestBody PickRequest request) {
        return ResponseEntity.ok(foodService.pickRandomFood(request));
    }
    @GetMapping("uuid")
    public String getUuid() {
        return UUID.randomUUID().toString();
    }

}
