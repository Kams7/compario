package dev.compario.product_service.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.compario.product_service.models.Product;
import dev.compario.product_service.service.ProductService;


@RestController
@RequestMapping(path = "api/v1/product")
public class ProductApiController {
  private final ProductService productService;

  public ProductApiController(ProductService productService) {
    this.productService = productService;
  }
  
  @GetMapping
  public List<Product> getProducts(@RequestParam String category) {
    return productService.getProducts(category);
  }


}
