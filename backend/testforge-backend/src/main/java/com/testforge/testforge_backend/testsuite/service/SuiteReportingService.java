package com.testforge.testforge_backend.testsuite.service;

import com.testforge.testforge_backend.testsuite.dto.*;
import com.testforge.testforge_backend.testsuite.entity.*;
import com.testforge.testforge_backend.testsuite.repository.*;
import com.testforge.testforge_backend.testsuite.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional(readOnly=true)
public class SuiteReportingService {
    private final TestSuiteRepository suites;
    private final SuiteRunRepository runs;
    private final SuiteRunPersistenceService details;

    public SuiteReportingService(TestSuiteRepository suites, SuiteRunRepository runs, SuiteRunPersistenceService details) {
        this.suites = suites;
        this.runs = runs;
        this.details = details;
    }

    public List<SuiteReportSummary> summaries(String projectId) {
        Map<Long, SuiteRun> latest = new LinkedHashMap<>();
        for (SuiteRun run : runs.findByProjectBusinessIdSnapshotOrderByStartedAtDescIdDesc(projectId)) {
            latest.putIfAbsent(run.getTestSuiteIdSnapshot(), run);
        }
        Map<Long, SuiteReportSummary> summaries = new LinkedHashMap<>();
        for (TestSuite suite : suites.findByProject_ProjectIdOrderByIdAsc(projectId)) {
            SuiteRun run = latest.get(suite.getId());
            summaries.put(suite.getId(), run == null
                    ? new SuiteReportSummary(suite.getId(), suite.getName(), null, 0, 0, 0, 0, null, null, null, null)
                    : summary(run));
        }
        // Deleted Suites still appear in Project Reporting under their original identity.
        latest.forEach((suiteId, run) -> summaries.putIfAbsent(suiteId, summary(run)));
        return List.copyOf(summaries.values());
    }

    public List<SuiteRunHistoryResponse> history(String projectId, Long suiteId) {
        List<SuiteRun> history = runs.findByProjectBusinessIdSnapshotAndTestSuiteIdSnapshotOrderByStartedAtDescIdDesc(projectId, suiteId);
        if (history.isEmpty()) {
            TestSuite suite = suites.findById(suiteId)
                    .orElseThrow(() -> new TestSuiteNotFoundException("Test Suite not found: " + suiteId));
            if (!suite.getProject().getProjectId().equals(projectId)) {
                throw new InvalidTestSuiteException("Test Suite belongs to another Project");
            }
        }
        return history.stream().map(this::history).toList();
    }

    public SuiteRunResponse detail(String projectId, Long runId) {
        SuiteRun run = runs.findByIdAndProjectBusinessIdSnapshot(runId, projectId)
                .orElseThrow(() -> new TestSuiteNotFoundException("Suite Run not found in Project: " + runId));
        return details.get(run.getId());
    }

    private SuiteReportSummary summary(SuiteRun run) {
        return new SuiteReportSummary(run.getTestSuiteIdSnapshot(), run.getTestSuiteNameSnapshot(),
                run.getStatus(), run.getTotal(), run.getPassed(), run.getFailed(), run.getSkipped(),
                run.getTotal() == 0 ? 0d : run.getPassed() * 100d / run.getTotal(),
                run.getDurationMs(), run.getStartedAt(), run.getId());
    }

    private SuiteRunHistoryResponse history(SuiteRun run) {
        return new SuiteRunHistoryResponse(run.getId(), run.getStatus(), run.getStartedAt(), run.getCompletedAt(),
                run.getDurationMs(), run.getTotal(), run.getPassed(), run.getFailed(), run.getSkipped());
    }
}
