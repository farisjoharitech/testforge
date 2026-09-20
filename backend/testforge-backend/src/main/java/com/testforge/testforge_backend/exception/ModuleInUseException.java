package com.testforge.testforge_backend.exception;

public class ModuleInUseException extends RuntimeException {
    public ModuleInUseException(String message) { super(message); }
}
