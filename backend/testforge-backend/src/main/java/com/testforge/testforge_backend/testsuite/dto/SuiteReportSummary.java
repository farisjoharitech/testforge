package com.testforge.testforge_backend.testsuite.dto;
import com.testforge.testforge_backend.testsuite.entity.SuiteResultStatus; import java.time.LocalDateTime;
public record SuiteReportSummary(Long testSuiteId,String suiteName,SuiteResultStatus latestStatus,int total,int passed,int failed,int skipped,Double passPercentage,Long durationMs,LocalDateTime latestExecutionTime,Long latestRunId){}
