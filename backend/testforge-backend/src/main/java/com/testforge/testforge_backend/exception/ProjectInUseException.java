package com.testforge.testforge_backend.exception;

public class ProjectInUseException extends RuntimeException {

    public ProjectInUseException(
            String message
    ) {
        super(message);
    }
}
