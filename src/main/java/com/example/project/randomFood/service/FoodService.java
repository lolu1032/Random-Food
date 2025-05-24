package com.example.project.randomFood.service;

import com.example.project.randomFood.domain.Food;
import com.example.project.randomFood.domain.FoodHistory;
import com.example.project.randomFood.dto.UUIDRequest;
import com.example.project.randomFood.repository.FoodRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;

    public Food randomFood(UUIDRequest request,HttpSession session) {
        List<Long> pickId = (List<Long>) session.getAttribute("pickId");
        System.out.println(pickId);
        if (pickId == null) {
            pickId = new LinkedList<>();
            session.setAttribute("pickId", pickId);
        }

        if(pickId.size() >= 50) {
            pickId.clear();
        }

        List<Food> candidates = foodRepository.findCandidates(request.getFoodValues(), pickId);
        if (candidates.isEmpty()) {
            return null;
        }

        int randomIndex = ThreadLocalRandom.current().nextInt(candidates.size());
        Food randomPick = candidates.get(randomIndex);

        pickId.add(randomPick.getId());
        session.setAttribute("pickId", pickId);

        return randomPick;
    }

    public void resetFoodHistory(HttpSession session) {
        session.removeAttribute("pickId");
    }
    public void resetSession(HttpSession session) {
        session.invalidate();
    }
    public List<FoodHistory> getHistory(String foodValues, HttpSession session) {
        String historyKey = "foodHistory_" + foodValues; // 0: 점심, 1: 저녁
        List<FoodHistory> history = (List<FoodHistory>) session.getAttribute(historyKey);
        if (history == null) {
            history = new ArrayList<>();
            session.setAttribute(historyKey, history);
        }
        return history;
    }
    public void addFoodToHistory(HttpSession session, Food food, String mealType) {
        String historyKey = "foodHistory_" + mealType;
        List<FoodHistory> history = (List<FoodHistory>) session.getAttribute(historyKey);
        if (history == null) {
            history = new ArrayList<>();
        }

        history.add(FoodHistory.builder()
                .food(food.getName())
                .time(Instant.now())
                .build());

        if (history.size() > 50) {
            history.remove(0);
        }
        session.setAttribute(historyKey, history);
    }

}
