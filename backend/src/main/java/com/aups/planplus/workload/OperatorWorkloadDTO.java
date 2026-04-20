package com.aups.planplus.workload;

import com.aups.planplus.auth.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OperatorWorkloadDTO {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private int activeOrders;
    private LoadStatus loadStatus;
    private String displayColor;

    public static OperatorWorkloadDTO of(User user, int activeOrders) {
        LoadStatus status = LoadStatus.fromCount(activeOrders);
        return new OperatorWorkloadDTO(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                activeOrders,
                status,
                status.getDisplayColor()
        );
    }
}