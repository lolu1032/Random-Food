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
    private final Random random = new Random();

    public Food randomFood(UUIDRequest request) {
        Set<Long> picked = userPickedFoods.computeIfAbsent(request.getUuid(), k -> new HashSet<>());
        Food food = foodRepository.foodRandomPick(request.getFoodValues(), picked.isEmpty() ? List.of(-1L) : new ArrayList<>(picked) );

        if(food == null) {
            throw new RuntimeException("더 이상 선택할 수 있는 음식이 없습니다.");
        }
        picked.add(food.getId());
        return food;
    }
    public void resetUserHistory(String uuid) {
        userPickedFoods.remove(uuid);
    }

}
