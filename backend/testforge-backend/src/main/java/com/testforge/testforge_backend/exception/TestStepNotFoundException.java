package com.testforge.testforge_backend.exception;

public class TestStepNotFoundException
        extends RuntimeException {

    public TestStepNotFoundException(
            String message
    ) {
        super(message);
    }
}