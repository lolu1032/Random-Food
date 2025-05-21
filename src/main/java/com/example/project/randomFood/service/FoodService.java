package com.example.project.randomFood.service;

import com.example.project.randomFood.domain.Food;
import com.example.project.randomFood.dto.UUIDRequest;
import com.example.project.randomFood.repository.FoodRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final Map<String, Set<Long>> userPickedFoods = new ConcurrentHashMap<>();
    private final HttpSession session;

    public ResponseEntity<Food> randomFood(UUIDRequest request) {
        List<Long> pickId = (List<Long>) session.getAttribute("pickId");
        System.out.println(pickId);
        if (pickId == null) {
            pickId = new ArrayList<>();
            session.setAttribute("pickId", pickId);
        }

        List<Food> candidates = foodRepository.findCandidates(request.getFoodValues(), pickId);
        if (candidates.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        int randomIndex = ThreadLocalRandom.current().nextInt(candidates.size());
        Food randomPick = candidates.get(randomIndex);

        pickId.add(randomPick.getId());
        session.setAttribute("pickId", pickId);

        return ResponseEntity.ok(randomPick);
    }


    public void resetUserHistory(String uuid) {
        userPickedFoods.remove(uuid);
    }

}
