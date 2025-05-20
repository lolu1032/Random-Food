package com.example.project.randomFood.service;

import com.example.project.randomFood.domain.Food;
import com.example.project.randomFood.dto.UUIDRequest;
import com.example.project.randomFood.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final Map<String, Set<Long>> userPickedFoods = new ConcurrentHashMap<>();

    public Food randomFood(UUIDRequest request) {
        return foodRepository.findRandomFood(request.getFoodValues());
    }


    public void resetUserHistory(String uuid) {
        userPickedFoods.remove(uuid);
    }

}
