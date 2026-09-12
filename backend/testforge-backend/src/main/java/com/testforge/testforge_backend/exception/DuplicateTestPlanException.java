package com.testforge.testforge_backend.exception;

public class DuplicateTestPlanException extends RuntimeException {

    public DuplicateTestPlanException(String message) {
        super(message);
    }
}