package com.testforge.testforge_backend.testsuite.service;

import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.testsuite.entity.*;
import com.testforge.testforge_backend.testsuite.repository.*;
import com.testforge.testforge_backend.testsuite.exception.InvalidTestSuiteException;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SuiteReportingServiceTest {
 @Test void projectSummaryUsesNewestPersistedRun(){TestSuiteRepository suites=mock(TestSuiteRepository.class);SuiteRunRepository runs=mock(SuiteRunRepository.class);SuiteRunPersistenceService details=mock(SuiteRunPersistenceService.class);SuiteReportingService service=new SuiteReportingService(suites,runs,details);TestSuite suite=mock(TestSuite.class);SuiteRun newest=mock(SuiteRun.class);when(suite.getId()).thenReturn(3L);when(suite.getName()).thenReturn("Regression");when(newest.getTestSuiteIdSnapshot()).thenReturn(3L);when(newest.getTestSuiteNameSnapshot()).thenReturn("Regression");when(newest.getId()).thenReturn(8L);when(newest.getStatus()).thenReturn(SuiteResultStatus.PASSED);when(newest.getTotal()).thenReturn(4);when(newest.getPassed()).thenReturn(3);when(newest.getFailed()).thenReturn(1);when(newest.getStartedAt()).thenReturn(LocalDateTime.now());when(suites.findByProject_ProjectIdOrderByIdAsc("PRJ-1")).thenReturn(List.of(suite));when(runs.findByProjectBusinessIdSnapshotOrderByStartedAtDescIdDesc("PRJ-1")).thenReturn(List.of(newest));var result=service.summaries("PRJ-1").get(0);assertEquals(75d,result.passPercentage());assertEquals(8L,result.latestRunId());}
 @Test void historyRemainsNewestFirst(){TestSuiteRepository suites=mock(TestSuiteRepository.class);SuiteRunRepository runs=mock(SuiteRunRepository.class);SuiteReportingService service=new SuiteReportingService(suites,runs,mock(SuiteRunPersistenceService.class));TestSuite suite=mock(TestSuite.class);Project project=mock(Project.class);when(project.getProjectId()).thenReturn("PRJ-1");when(suite.getProject()).thenReturn(project);when(suites.findById(3L)).thenReturn(Optional.of(suite));SuiteRun first=mock(SuiteRun.class),second=mock(SuiteRun.class);when(first.getId()).thenReturn(9L);when(second.getId()).thenReturn(8L);when(runs.findByProjectBusinessIdSnapshotAndTestSuiteIdSnapshotOrderByStartedAtDescIdDesc("PRJ-1",3L)).thenReturn(List.of(first,second));var result=service.history("PRJ-1",3L);assertEquals(List.of(9L,8L),result.stream().map(r->r.id()).toList());}
 @Test void rejectsCrossProjectHistory(){TestSuiteRepository suites=mock(TestSuiteRepository.class);TestSuite suite=mock(TestSuite.class);Project project=mock(Project.class);when(project.getProjectId()).thenReturn("PRJ-2");when(suite.getProject()).thenReturn(project);when(suites.findById(3L)).thenReturn(Optional.of(suite));SuiteReportingService service=new SuiteReportingService(suites,mock(SuiteRunRepository.class),mock(SuiteRunPersistenceService.class));assertThrows(InvalidTestSuiteException.class,()->service.history("PRJ-1",3L));}
}
