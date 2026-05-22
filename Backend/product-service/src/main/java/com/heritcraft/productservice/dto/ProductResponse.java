package com.heritcraft.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String _id; // Same as id string for frontend compatibility
    private String name;
    private String category;
    private Double price;
    private Double oldPrice;
    private Integer stock;
    private String description;
    private Long sellerId;
    private String sellerName;
    private String sellerShopName;
    private Double averageRating;
    private Integer numReviews;
    private Integer offer;
    private LocalDateTime createdAt;
    
    private SellerInfo seller;
    
    private List<String> images = new ArrayList<>();
    private List<String> videos = new ArrayList<>();
    private List<String> sizes = new ArrayList<>();
    private List<String> weights = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerInfo {
        private String shopName;
    }
}
