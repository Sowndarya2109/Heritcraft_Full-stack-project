package com.heritcraft.productservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double price;

    private Double oldPrice;
    
    @Column(nullable = false)
    private Integer stock;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long sellerId;

    private String sellerName;
    private String sellerShopName;

    private Double averageRating = 0.0;
    private Integer numReviews = 0;

    private Integer offer = 0; // Discount percentage

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductMedia> media = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_sizes", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "size")
    private List<String> sizes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_weights", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "weight")
    private List<String> weights = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        calculateOffer();
    }

    @PreUpdate
    protected void onUpdate() {
        calculateOffer();
    }

    public void calculateOffer() {
        if (oldPrice != null && oldPrice > price && oldPrice > 0) {
            double discount = ((oldPrice - price) / oldPrice) * 100;
            this.offer = (int) Math.round(discount);
        } else {
            this.offer = 0;
        }
    }

    // Helper method to synchronize relationship
    public void addMedia(ProductMedia m) {
        media.add(m);
        m.setProduct(this);
    }
}
