package com.testforge.testforge_backend.exception;

import com.testforge.testforge_backend.testsuite.exception.InvalidTestSuiteException;
import com.testforge.testforge_backend.testsuite.exception.TestSuiteNotFoundException;
import com.testforge.testforge_backend.automation.exception.AutomationNotFoundException;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import com.testforge.testforge_backend.automation.validation.AutomationValidationException;
import com.testforge.testforge_backend.gitintegration.exception.GitIntegrationConflictException;
import com.testforge.testforge_backend.gitintegration.exception.GitIntegrationException;
import com.testforge.testforge_backend.testdesignexport.TestDesignExportException;

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

    @ExceptionHandler(TestDesignExportException.class)
    public ResponseEntity<ApiError> handleTestDesignExport(TestDesignExportException exception, HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, exception.getMessage(), request, null);
    }

    @ExceptionHandler(GitIntegrationException.class)
    public ResponseEntity<ApiError> handleGitIntegration(GitIntegrationException exception, HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, exception.getMessage(), request, null);
    }

    @ExceptionHandler(GitIntegrationConflictException.class)
    public ResponseEntity<ApiError> handleGitConflict(GitIntegrationConflictException exception, HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, exception.getMessage(), request, null);
    }

    // Last-resort protection for concurrent writes; normal dependency conflicts are checked by services.
    @ExceptionHandler({org.springframework.dao.DataIntegrityViolationException.class,
            org.springframework.dao.PessimisticLockingFailureException.class,
            jakarta.persistence.PessimisticLockException.class, jakarta.persistence.LockTimeoutException.class})
    public ResponseEntity<ApiError> handleConcurrentDependency(RuntimeException exception, HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT,
                "Dependencies changed or are currently in use. Refresh the dependency preview and try again.", request, null);
    }

    @ExceptionHandler(AutomationNotFoundException.class)
    public ResponseEntity<ApiError> handleAutomationNotFound(AutomationNotFoundException exception, HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, exception.getMessage(), request, null);
    }

    @ExceptionHandler({AutomationConflictException.class, AutomationValidationException.class})
    public ResponseEntity<ApiError> handleAutomationDomainError(RuntimeException exception, HttpServletRequest request) {
        HttpStatus status = exception instanceof AutomationConflictException ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
        return buildError(status, exception.getMessage(), request, null);
    }

    @ExceptionHandler(ModuleNotFoundException.class)
    public ResponseEntity<ApiError> handleModuleNotFound(ModuleNotFoundException exception, HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, exception.getMessage(), request, null);
    }

    @ExceptionHandler({ResourceInUseException.class, DuplicateModuleException.class, ModuleInUseException.class, TestPlanInUseException.class, ScenarioInUseException.class})
    public ResponseEntity<ApiError> handleModuleConflict(RuntimeException exception, HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, exception.getMessage(), request, null);
    }


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
            TestSuiteNotFoundException.class
    )
    public ResponseEntity<ApiError>
    handleTestSuiteNotFound(
            TestSuiteNotFoundException exception,
            HttpServletRequest request) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                null
        );
    }

    @ExceptionHandler(
            InvalidTestSuiteException.class
    )
    public ResponseEntity<ApiError>
    handleInvalidTestSuite(
            InvalidTestSuiteException exception,
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
