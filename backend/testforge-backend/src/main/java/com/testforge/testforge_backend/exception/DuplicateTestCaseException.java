package com.testforge.testforge_backend.exception;

public class DuplicateTestCaseException
        extends RuntimeException {

    public DuplicateTestCaseException(
            String message
    ) {
        super(message);
    }
}