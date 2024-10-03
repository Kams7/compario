package dev.compario.product_service.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import dev.compario.product_service.models.Product;
import dev.compario.product_service.repository.ProductRepository;

@Service
public class ProductService {
  
  private final ProductRepository productRepository;
  private final RestTemplate restTemplate;

  public ProductService(ProductRepository productRepository, RestTemplate restTemplate) {
    this.productRepository = productRepository;
    this.restTemplate = restTemplate;
  }

  public List<Product> getProducts(String category) {

    // Check if the product is already in the database
    List<Product> products = productRepository.findByCategory(category);
    if (!products.isEmpty()) {
      return products;
    }

    // Send request to another service to scrape the data.
    String scrapingServiceUrl = "http://localhost:3000/scrape";

    String scrapingUrl = UriComponentsBuilder.fromHttpUrl(scrapingServiceUrl)
        .queryParam("product", category)
        .toUriString();

        // Send the request to the scraping service
        Product[] scrapedProducts = restTemplate.getForObject(scrapingUrl, Product[].class);
    
        // Save the scraped products to the repository
        if (scrapedProducts != null) {
          productRepository.saveAll(List.of(scrapedProducts));
        }
    
        return List.of(scrapedProducts);
  }
}
