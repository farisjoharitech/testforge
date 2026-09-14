package com.testforge.testforge_backend.exception;

public class ProjectNotFoundException extends RuntimeException {

    public ProjectNotFoundException(
            String message
    ) {
        super(message);
    }
}
