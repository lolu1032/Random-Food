package com.example.project.randomFood.repository;

import com.example.project.randomFood.domain.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface FoodRepository extends JpaRepository<Food, Long> {

    @Query(value = """
    SELECT * FROM food
    WHERE food_values = :foodValues
      AND (:#{#pickId.isEmpty()} = true OR id NOT IN (:pickId))
    """, nativeQuery = true)
    List<Food> findCandidates(@Param("foodValues") String foodValues, @Param("pickId") List<Long> pickId);
//    @Query(value = """
//        SELECT * FROM food
//        WHERE food_values = :type
//          AND id NOT IN (:pickId)
//        """, nativeQuery = true)
//    List<Food> findCandidates(@Param("type") String type, @Param("pickId") List<Long> pickId);

//    List<Food> findByFoodValuesAndIdNotIn(String foodValues, List<Long> pickId);
//    List<Food> findByFoodValues(String foodValues);

//    @Query(value = "SELECT * FROM Food WHERE food_values = :foodValues ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
//    Food findRandomFood(@Param("foodValues") String foodValues);


//    @Query(value = "SELECT * FROM food " +
//            "WHERE food_values = :foodValues " +
//            "  AND id NOT IN (:pickId) " +
//            "OFFSET FLOOR(RANDOM() * (SELECT COUNT(*) FROM food WHERE food_values = :foodValues AND id NOT IN (:pickId))) " +
//            "LIMIT 1",
//            nativeQuery = true)
//    Food foodRandomPick(@Param("foodValues") String foodValues,@Param("pickId") List<Long> pickId);

//    @Query("SELECT * FROM food \n" +
//            "WHERE food_values = :foodValues \n" +
//            "  AND id NOT IN (:pickId)\n" +
//            "OFFSET FLOOR(RANDOM() * (SELECT COUNT(*) FROM food WHERE food_values = :foodValues AND id NOT IN (:pickId))) \n" +
//            "LIMIT 1")
//    Food foodRandomPick(@Param("foodValues") String foodValues,@Param("pickId") List<Long> pickId);

}
