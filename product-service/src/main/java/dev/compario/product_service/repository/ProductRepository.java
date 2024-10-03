package dev.compario.product_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import dev.compario.product_service.models.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{
    
  Optional<Product> findById(Long id);
  List<Product> findByCategory(String category);
  List<Product> findByName(String name);
}