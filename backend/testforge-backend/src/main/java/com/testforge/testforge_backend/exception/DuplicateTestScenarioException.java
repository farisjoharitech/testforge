package com.testforge.testforge_backend.exception;

public class DuplicateTestScenarioException
        extends RuntimeException {

    public DuplicateTestScenarioException(
            String message
    ) {
        super(message);
    }
}