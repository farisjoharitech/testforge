package com.testforge.testforge_backend.exception;

public class TestScenarioNotFoundException
        extends RuntimeException {

    public TestScenarioNotFoundException(
            String message
    ) {
        super(message);
    }
}