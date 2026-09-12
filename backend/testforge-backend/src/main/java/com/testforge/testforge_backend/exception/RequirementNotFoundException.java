package com.testforge.testforge_backend.exception;

public class RequirementNotFoundException
        extends RuntimeException {

    public RequirementNotFoundException(String message) {
        super(message);
    }
}