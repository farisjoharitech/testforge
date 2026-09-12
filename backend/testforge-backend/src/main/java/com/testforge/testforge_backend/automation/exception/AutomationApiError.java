package com.testforge.testforge_backend.automation.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record AutomationApiError(

        LocalDateTime timestamp,

        int status,

        String error,

        String message,

        String path,

        Map<String, String> fieldErrors
) {
}