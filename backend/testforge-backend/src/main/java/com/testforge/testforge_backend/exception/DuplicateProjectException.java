package com.testforge.testforge_backend.exception;

public class DuplicateProjectException extends RuntimeException {

    public DuplicateProjectException(
            String message
    ) {
        super(message);
    }
}
