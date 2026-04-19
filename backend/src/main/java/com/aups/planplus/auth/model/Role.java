package com.aups.planplus.auth.model;

public enum Role {
    ADMIN("Administrator"),
    PLANNER("Planer"),
    OPERATOR("Operater");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}