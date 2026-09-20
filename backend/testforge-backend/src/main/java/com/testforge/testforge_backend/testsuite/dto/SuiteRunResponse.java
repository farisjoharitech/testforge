package com.testforge.testforge_backend.testsuite.dto;
import com.testforge.testforge_backend.testsuite.entity.SuiteResultStatus; import java.time.*; import java.util.*;
public record SuiteRunResponse(Long id,Long projectId,String projectBusinessId,Long testSuiteId,String testSuiteName,SuiteResultStatus status,LocalDateTime startedAt,LocalDateTime completedAt,Long durationMs,int total,int passed,int failed,int skipped,String errorDetails,List<ScenarioResult> scenarios){
 public record ScenarioResult(String scenarioId,String description,SuiteResultStatus status,List<TestCaseResult> testCases){}
 public record TestCaseResult(String testCaseId,String name,SuiteResultStatus status,Long durationMs,String failureDetails,String assertionFailureDetails,String screenshotPath,String artifactDirectory,String tracePath,List<TestStepResult> steps){}
 public record TestStepResult(String testStepId,String action,Integer stepOrder,SuiteResultStatus status,String failureDetails,String screenshotPath,String artifactReference){}
}
