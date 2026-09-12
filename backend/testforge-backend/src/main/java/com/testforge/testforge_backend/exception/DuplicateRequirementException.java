package com.testforge.testforge_backend.exception;

public class DuplicateRequirementException
        extends RuntimeException {

    public DuplicateRequirementException(String message) {
        super(message);
    }
}