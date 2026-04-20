package com.aups.planplus.workload;

public enum LoadStatus {
    GREEN("zelena"),
    ORANGE("narandžasta"),
    RED("crvena");

    private final String displayColor;

    LoadStatus(String displayColor) {
        this.displayColor = displayColor;
    }

    public String getDisplayColor() {
        return displayColor;
    }

    public static LoadStatus fromCount(int activeOrders) {
        if (activeOrders <= 2) return GREEN;
        if (activeOrders <= 5) return ORANGE;
        return RED;
    }
}