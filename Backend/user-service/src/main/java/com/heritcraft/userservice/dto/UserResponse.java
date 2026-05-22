package com.heritcraft.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String shopName;
    private String shopDescription;
    private boolean approved;
    private boolean active;
    private LocalDateTime createdAt;
}
