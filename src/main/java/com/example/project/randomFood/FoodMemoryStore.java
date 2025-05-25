package com.example.project.randomFood;

import org.springframework.stereotype.Component;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class FoodMemoryStore {
    private final Map<String, List<Long>> store = new ConcurrentHashMap<>();

    public List<Long> getPickIds(String uuid) {
        return store.computeIfAbsent(uuid, key -> new LinkedList<>());
    }

    public void savePickIds(String uuid, List<Long> pickIds) {
        store.put(uuid, pickIds);
    }

    public void clear(String uuid) {
        store.remove(uuid);
    }
}