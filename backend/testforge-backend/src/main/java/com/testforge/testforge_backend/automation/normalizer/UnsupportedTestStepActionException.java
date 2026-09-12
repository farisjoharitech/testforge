package com.testforge.testforge_backend.automation.normalizer;

public class UnsupportedTestStepActionException
        extends RuntimeException {

    public UnsupportedTestStepActionException(
            String message
    ) {
        super(message);
    }
}