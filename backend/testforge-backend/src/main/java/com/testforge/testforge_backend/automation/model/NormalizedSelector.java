package com.testforge.testforge_backend.automation.model;

public class NormalizedSelector {

    private SelectorStrategy strategy;

    private String value;

    private UiElementRole role;

    private String name;

    private boolean exact;

    public NormalizedSelector() {
    }

    public NormalizedSelector(
            SelectorStrategy strategy,
            String value,
            UiElementRole role,
            String name,
            boolean exact) {

        this.strategy = strategy;
        this.value = value;
        this.role = role;
        this.name = name;
        this.exact = exact;
    }

    public SelectorStrategy getStrategy() {
        return strategy;
    }

    public void setStrategy(
            SelectorStrategy strategy
    ) {
        this.strategy = strategy;
    }

    public String getValue() {
        return value;
    }

    public void setValue(
            String value
    ) {
        this.value = value;
    }

    public UiElementRole getRole() {
        return role;
    }

    public void setRole(
            UiElementRole role
    ) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name = name;
    }

    public boolean isExact() {
        return exact;
    }

    public void setExact(
            boolean exact
    ) {
        this.exact = exact;
    }
}