package com.example.project.randomFood.repository;

import com.example.project.randomFood.domain.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface FoodRepository extends JpaRepository<Food, Long> {
    @Query(value = "SELECT * FROM food " +
            "WHERE food_values = :foodValues " +
            "  AND id NOT IN (:pickId) " +
            "OFFSET FLOOR(RANDOM() * (SELECT COUNT(*) FROM food WHERE food_values = :foodValues AND id NOT IN (:pickId))) " +
            "LIMIT 1",
            nativeQuery = true)
    Food foodRandomPick(@Param("foodValues") String foodValues,@Param("pickId") List<Long> pickId);

//    @Query("SELECT * FROM food \n" +
//            "WHERE food_values = :foodValues \n" +
//            "  AND id NOT IN (:pickId)\n" +
//            "OFFSET FLOOR(RANDOM() * (SELECT COUNT(*) FROM food WHERE food_values = :foodValues AND id NOT IN (:pickId))) \n" +
//            "LIMIT 1")
//    Food foodRandomPick(@Param("foodValues") String foodValues,@Param("pickId") List<Long> pickId);
}
