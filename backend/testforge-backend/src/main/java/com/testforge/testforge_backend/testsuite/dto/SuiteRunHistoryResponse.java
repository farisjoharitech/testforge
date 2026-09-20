package com.testforge.testforge_backend.testsuite.dto;
import com.testforge.testforge_backend.testsuite.entity.SuiteResultStatus; import java.time.LocalDateTime;
public record SuiteRunHistoryResponse(Long id,SuiteResultStatus status,LocalDateTime startedAt,LocalDateTime completedAt,Long durationMs,int total,int passed,int failed,int skipped){}
