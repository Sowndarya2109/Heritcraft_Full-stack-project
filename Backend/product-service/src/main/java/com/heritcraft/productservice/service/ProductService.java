package com.heritcraft.productservice.service;

import com.heritcraft.productservice.dto.MediaItemDto;
import com.heritcraft.productservice.dto.ProductRequest;
import com.heritcraft.productservice.dto.ProductResponse;
import com.heritcraft.productservice.entity.Product;
import com.heritcraft.productservice.entity.ProductMedia;
import com.heritcraft.productservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductResponse addProduct(ProductRequest request) {
        Product product = new Product();
        updateProductFields(product, request);

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    public ProductResponse editProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        updateProductFields(product, request);

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    private void updateProductFields(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        product.setStock(request.getStock());
        product.setDescription(request.getDescription());
        product.setSellerId(request.getSellerId());
        product.setSellerName(request.getSellerName());
        product.setSellerShopName(request.getSellerShopName());

        // Category-specific validation / restriction
        String category = request.getCategory();
        if ("Handmade Clothes".equalsIgnoreCase(category) || "Textiles".equalsIgnoreCase(category)) {
            product.setSizes(request.getSizes() != null ? request.getSizes() : new ArrayList<>());
            product.setWeights(new ArrayList<>()); // clear weights
        } else if ("Handmade Snacks".equalsIgnoreCase(category)) {
            product.setWeights(request.getWeights() != null ? request.getWeights() : new ArrayList<>());
            product.setSizes(new ArrayList<>()); // clear sizes
        } else {
            // default categories clear both sizes and weights
            product.setSizes(new ArrayList<>());
            product.setWeights(new ArrayList<>());
        }

        // Update Media (cascade all orphanRemoval)
        product.getMedia().clear();
        if (request.getMedia() != null) {
            for (MediaItemDto mDto : request.getMedia()) {
                ProductMedia pm = new ProductMedia();
                pm.setUrl(mDto.getUrl());
                pm.setType(mDto.getType());
                pm.setName(mDto.getName());
                product.addMedia(pm);
            }
        }
        product.calculateOffer();
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.set_id(String.valueOf(product.getId()));
        response.setName(product.getName());
        response.setCategory(product.getCategory());
        response.setPrice(product.getPrice());
        response.setOldPrice(product.getOldPrice());
        response.setStock(product.getStock());
        response.setDescription(product.getDescription());
        response.setSellerId(product.getSellerId());
        response.setSellerName(product.getSellerName());
        response.setSellerShopName(product.getSellerShopName());
        response.setAverageRating(product.getAverageRating());
        response.setNumReviews(product.getNumReviews());
        response.setOffer(product.getOffer());
        response.setCreatedAt(product.getCreatedAt());

        // Seller Info
        ProductResponse.SellerInfo sellerInfo = new ProductResponse.SellerInfo();
        sellerInfo.setShopName(product.getSellerShopName());
        response.setSeller(sellerInfo);

        // Filter media files
        List<String> images = new ArrayList<>();
        List<String> videos = new ArrayList<>();

        if (product.getMedia() != null) {
            for (ProductMedia pm : product.getMedia()) {
                String type = pm.getType() != null ? pm.getType().toLowerCase() : "";
                if (type.startsWith("image")) {
                    images.add(pm.getUrl());
                } else if (type.startsWith("video")) {
                    videos.add(pm.getUrl());
                } else {
                    // Fallback to name or url matching if type is not specified
                    images.add(pm.getUrl());
                }
            }
        }

        response.setImages(images);
        response.setVideos(videos);
        response.setSizes(product.getSizes());
        response.setWeights(product.getWeights());

        return response;
    }
}
