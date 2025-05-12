package com.example.project.randomFood.service;

import com.example.project.randomFood.domain.Food;
import com.example.project.randomFood.repository.FoodRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@SpringBootTest
class FoodServiceTest {

    @Mock
    private FoodRepository foodRepository;

    @Test
    @DisplayName("랜덤 ID로 음식 조회 테스트")
    void testFindById() {
        // given
        List<Food> foodList = List.of(
                Food.builder().id(1L).name("김치찌개").build(),
                Food.builder().id(2L).name("라면").build(),
                Food.builder().id(3L).name("한우").build()
        );

        Random rd = new Random();
        long randomId = foodList.get(rd.nextInt(foodList.size())).getId();

        Food selectedFood = foodList.stream()
                .filter(f -> f.getId().equals(randomId))
                .findFirst()
                .orElse(null);
        when(foodRepository.findById(randomId)).thenReturn(Optional.ofNullable(selectedFood));

        // when
        Optional<Food> result = foodRepository.findById(randomId);

        // then
        assertTrue(result.isPresent());  // Optional이 비어있지 않음을 확인
        System.out.println("선택된 음식: " + result.get().getName());
    }
}
