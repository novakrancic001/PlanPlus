package com.aups.planplus.auth.dto;

import com.aups.planplus.auth.model.Role;
import com.aups.planplus.auth.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private Role role;
    private String roleDisplayName;
    private boolean active;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getRole().getDisplayName(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}