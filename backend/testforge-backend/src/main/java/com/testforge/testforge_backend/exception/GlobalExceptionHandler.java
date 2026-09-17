package com.testforge.testforge_backend.exception;

import com.testforge.testforge_backend.testset.exception.InvalidTestSetException;
import com.testforge.testforge_backend.testset.exception.TestSetNotFoundException;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(
            ProjectNotFoundException.class
    )
    public ResponseEntity<ApiError>
    handleProjectNotFound(
            ProjectNotFoundException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            DuplicateProjectException.class
    )
    public ResponseEntity<ApiError>
    handleDuplicateProject(
            DuplicateProjectException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            ProjectInUseException.class
    )
    public ResponseEntity<ApiError>
    handleProjectInUse(
            ProjectInUseException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            TestPlanNotFoundException.class
    )
    public ResponseEntity<ApiError>
    handleTestPlanNotFound(
            TestPlanNotFoundException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            RequirementNotFoundException.class
    )
    public ResponseEntity<ApiError>
    handleRequirementNotFound(
            RequirementNotFoundException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            TestScenarioNotFoundException.class
    )
    public ResponseEntity<ApiError>
    handleTestScenarioNotFound(
            TestScenarioNotFoundException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            TestCaseNotFoundException.class
    )
    public ResponseEntity<ApiError>
    handleTestCaseNotFound(
            TestCaseNotFoundException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            TestSetNotFoundException.class
    )
    public ResponseEntity<ApiError>
    handleTestSetNotFound(
            TestSetNotFoundException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            InvalidTestSetException.class
    )
    public ResponseEntity<ApiError>
    handleInvalidTestSet(
            InvalidTestSetException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            TestStepNotFoundException.class
    )
    public ResponseEntity<ApiError>
    handleTestStepNotFound(
            TestStepNotFoundException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            DuplicateTestPlanException.class
    )
    public ResponseEntity<ApiError>
    handleDuplicateTestPlan(
            DuplicateTestPlanException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            DuplicateRequirementException.class
    )
    public ResponseEntity<ApiError>
    handleDuplicateRequirement(
            DuplicateRequirementException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            DuplicateTestScenarioException.class
    )
    public ResponseEntity<ApiError>
    handleDuplicateTestScenario(
            DuplicateTestScenarioException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            DuplicateTestCaseException.class
    )
    public ResponseEntity<ApiError>
    handleDuplicateTestCase(
            DuplicateTestCaseException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            DuplicateTestStepException.class
    )
    public ResponseEntity<ApiError>
    handleDuplicateTestStep(
            DuplicateTestStepException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            DuplicateTestStepOrderException.class
    )
    public ResponseEntity<ApiError>
    handleDuplicateTestStepOrder(
            DuplicateTestStepOrderException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            InvalidTestCaseAutomationException.class
    )
    public ResponseEntity<ApiError>
    handleInvalidTestCaseAutomation(
            InvalidTestCaseAutomationException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<ApiError>
    handleValidationErrors(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {

        Map<String, String> validationErrors =
                new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(fieldError ->
                        validationErrors.put(
                                fieldError.getField(),
                                fieldError.getDefaultMessage()
                        )
                );

        return buildError(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                request,
                validationErrors
        );
    }

    @ExceptionHandler(
            HttpMessageNotReadableException.class
    )
    public ResponseEntity<ApiError>
    handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                "Invalid request body or enum value",
                request,
                null
        );
    }

    private ResponseEntity<ApiError> buildError(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, String> validationErrors) {

        ApiError error =
                new ApiError(
                        LocalDateTime.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        request.getRequestURI(),
                        validationErrors
                );

        return ResponseEntity
                .status(status)
                .body(error);
    }
}