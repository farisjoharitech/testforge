package com.testforge.testforge_backend.automation.exception;

import com.testforge.testforge_backend.automation.validation.AutomationValidationException;
import com.testforge.testforge_backend.common.api.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice(
        basePackages = "com.testforge.testforge_backend.automation"
)
public class AutomationExceptionHandler {

    @ExceptionHandler(
            AutomationNotFoundException.class
    )
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            AutomationNotFoundException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(
            AutomationConflictException.class
    )
    public ResponseEntity<ApiErrorResponse> handleConflict(
            AutomationConflictException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(
            AutomationValidationException.class
    )
    public ResponseEntity<ApiErrorResponse> handleAutomationValidation(
            AutomationValidationException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(
            IllegalArgumentException.class
    )
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                safeMessage(
                        exception.getMessage(),
                        "Invalid request."
                ),
                request
        );
    }

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<ApiErrorResponse> handleBeanValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {

        Map<String, String> validationErrors =
                new LinkedHashMap<>();

        for (
                FieldError fieldError :
                exception
                        .getBindingResult()
                        .getFieldErrors()
        ) {

            validationErrors.putIfAbsent(
                    fieldError.getField(),
                    safeMessage(
                            fieldError.getDefaultMessage(),
                            "Invalid value."
                    )
            );
        }

        ApiErrorResponse body =
                ApiErrorResponse.validation(
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        "Validation failed.",
                        request.getRequestURI(),
                        validationErrors
                );

        return ResponseEntity
                .status(
                        HttpStatus.BAD_REQUEST
                )
                .body(
                        body
                );
    }

    @ExceptionHandler(
            HttpMessageNotReadableException.class
    )
    public ResponseEntity<ApiErrorResponse> handleMalformedJson(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Request body is invalid or contains an unsupported value.",
                request
        );
    }

    @ExceptionHandler(
            Exception.class
    )
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
            Exception exception,
            HttpServletRequest request
    ) {

        /*
         * This handler is intentionally scoped to controllers
         * inside:
         *
         * com.testforge.testforge_backend.automation
         *
         * It must not intercept normal Test Plan, Requirement,
         * Scenario, Test Case, or Test Step exceptions.
         *
         * Do not expose stack traces, SQL messages,
         * filesystem paths, or internal implementation details
         * to API clients.
         */
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected server error occurred.",
                request
        );
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {

        ApiErrorResponse body =
                ApiErrorResponse.of(
                        status.value(),
                        status.getReasonPhrase(),
                        safeMessage(
                                message,
                                status.getReasonPhrase()
                        ),
                        request.getRequestURI()
                );

        return ResponseEntity
                .status(
                        status
                )
                .body(
                        body
                );
    }

    private String safeMessage(
            String message,
            String fallback
    ) {

        if (
                message == null
                        || message.isBlank()
        ) {

            return fallback;
        }

        return message;
    }
}