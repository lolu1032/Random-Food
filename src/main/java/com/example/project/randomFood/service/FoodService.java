package com.example.project.randomFood.service;

import com.example.project.randomFood.FoodMemoryStore;
import com.example.project.randomFood.domain.Food;
import com.example.project.randomFood.dto.FoodResponse;
import com.example.project.randomFood.dto.PickRequest;
import com.example.project.randomFood.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;


@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final FoodMemoryStore memoryStore;

    private final Map<String, List<Food>> foodCache = new ConcurrentHashMap<>();

    @Cacheable
    public List<Food> getCandidates(String type, List<Long> picIds) {
        List<Food> all = foodCache.computeIfAbsent(type, t -> foodRepository.findByFoodValues(t));
        return all.stream()
                .filter(food -> !picIds.contains(food.getId()))
                .toList();
    }

    public FoodResponse pickRandomFood(PickRequest request) {
        String uuid = request.getUuid();
        String type = request.getType();

        List<Long> pickIds = memoryStore.getPickIds(uuid);
        if (pickIds.size() >= 20) {
            memoryStore.clear(uuid);
            pickIds = memoryStore.getPickIds(uuid);
        }

        List<Food> foodList = getCandidates(type, pickIds);
        if (foodList == null || foodList.isEmpty()) {
            throw new IllegalStateException("추천 가능한 음식이 없습니다.");
        }

        Food picked = foodList.get(ThreadLocalRandom.current().nextInt(foodList.size()));
        pickIds.add(picked.getId());

        memoryStore.savePickIds(uuid, pickIds);

        return FoodResponse.builder()
                .food(picked)
                .build();
    }
}