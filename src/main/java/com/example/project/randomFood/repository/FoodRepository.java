package com.example.project.randomFood.repository;

import com.example.project.randomFood.domain.Food;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface FoodRepository extends JpaRepository<Food, Long> {
}
