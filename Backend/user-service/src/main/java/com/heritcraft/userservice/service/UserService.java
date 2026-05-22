package com.heritcraft.userservice.service;

import com.heritcraft.userservice.dto.LoginRequest;
import com.heritcraft.userservice.dto.RegisterRequest;
import com.heritcraft.userservice.dto.UserResponse;
import com.heritcraft.userservice.entity.User;
import com.heritcraft.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        
        String role = request.getRole().toLowerCase();
        user.setRole(role);
        
        if ("seller".equals(role)) {
            user.setShopName(request.getShopName());
            user.setShopDescription(request.getShopDescription());
            user.setApproved(false);
        } else {
            user.setApproved(true);
        }
        
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException("User account is disabled");
        }

        if ("seller".equalsIgnoreCase(user.getRole()) && !user.isApproved()) {
            throw new RuntimeException("Seller account pending approval");
        }

        return mapToResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getSellers() {
        return userRepository.findByRole("seller").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    public UserResponse approveSeller(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"seller".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("User is not a seller");
        }
        
        user.setApproved(true);
        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    public UserResponse disableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    public UserResponse enableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getShopName(),
                user.getShopDescription(),
                user.isApproved(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
