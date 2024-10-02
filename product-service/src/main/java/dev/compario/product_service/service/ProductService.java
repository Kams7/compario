package dev.compario.product_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import dev.compario.product_service.models.Product;
import dev.compario.product_service.repository.ProductRepository;

@Service
public class ProductService {
  
  private final ProductRepository productRepository;

  public ProductService(ProductRepository productRepository) {
    this.productRepository = productRepository;
  }

  public List<Product> getProducts(String item) {
    Product product = productRepository.findByName(item)
            .orElseThrow(() -> new IllegalStateException("Product with name " + item + " does not exists"));
    return productRepository.findAll();
  }



}
