package com.testforge.testforge_backend.exception;

public class DuplicateTestStepException
        extends RuntimeException {

    public DuplicateTestStepException(
            String message
    ) {
        super(message);
    }
}