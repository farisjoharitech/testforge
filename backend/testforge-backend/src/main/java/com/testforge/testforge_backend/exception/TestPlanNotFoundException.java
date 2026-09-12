package com.testforge.testforge_backend.exception;

public class TestPlanNotFoundException extends RuntimeException {

    public TestPlanNotFoundException(String message) {
        super(message);
    }
}