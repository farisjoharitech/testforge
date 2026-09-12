package com.testforge.testforge_backend.exception;

public class DuplicateTestStepOrderException
        extends RuntimeException {

    public DuplicateTestStepOrderException(
            String message
    ) {
        super(message);
    }
}