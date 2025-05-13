package com.example.project.randomFood.service;

import com.example.project.randomFood.domain.Food;
import com.example.project.randomFood.dto.UUIDRequest;
import com.example.project.randomFood.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final Map<String, Set<Long>> userPickedFoods = new HashMap<>();
    private final Random random = new Random();

    // 점심 저녁 입력값을 받아서 findAll이 아닌 findByValue로 받기.....
    // 현재의 문제점 구분없이 findAll
    // 구분하기 점심 / 저녁 클라에서 점심 저녁 클릭할 때 특정 값 부여 ???????????
    // 점심  = 0  저녁 = 1 request -> String uuid , boolean/char value
    // findByValue를 사용 그럼 하나의 로직으로 운영가능

    public Food randomFood(UUIDRequest request) {
        List<Food> foodList = foodRepository.findByFoodValues(request.getFoodValues());
        Set<Long> picked = userPickedFoods.computeIfAbsent(request.getUuid(), k -> new HashSet<>());

        // 남은 음식만 필터링
        List<Food> unpickedFoods = foodList.stream()
                .filter(f -> !picked.contains(f.getId()))
                .toList();
        if (unpickedFoods.isEmpty()) {
            throw new RuntimeException("더 이상 선택할 수 있는 음식이 없습니다.");
        }

        Food randomFood = unpickedFoods.get(random.nextInt(unpickedFoods.size()));
        picked.add(randomFood.getId());

        return randomFood;
    }
    public void resetUserHistory(String uuid) {
        userPickedFoods.remove(uuid);
    }

}
