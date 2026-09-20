package com.testforge.testforge_backend.testsuite.service;

import com.testforge.testforge_backend.automation.dto.AutomationRunResponse;
import com.testforge.testforge_backend.automation.execution.*;
import com.testforge.testforge_backend.automation.service.AutomationMultiRunService;
import com.testforge.testforge_backend.testsuite.dto.SuiteRunResponse;
import com.testforge.testforge_backend.testsuite.dto.SuiteJUnitConfiguration;
import com.testforge.testforge_backend.testsuite.entity.SuiteResultStatus;
import com.testforge.testforge_backend.testsuite.entity.SuiteExecutionMode;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Consumer;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SuiteRunExecutionServiceTest {
 @Test void runsOnlyResolvedSuiteCasesAndFinalizesThroughExistingAutomationRun(){
  SuiteRunPersistenceService persistence=mock(SuiteRunPersistenceService.class); AutomationMultiRunService automation=mock(AutomationMultiRunService.class); TestSuiteService suites=mock(TestSuiteService.class); SuiteRunExecutionService service=new SuiteRunExecutionService(persistence,automation,suites);SuiteJUnitConfiguration config=new SuiteJUnitConfiguration(SuiteExecutionMode.SEQUENTIAL,true,List.of(),List.of(),List.of());when(suites.configuration(4L)).thenReturn(config);
  when(persistence.start("PRJ-1",4L)).thenReturn(new SuiteRunPersistenceService.StartResult(9L,List.of(11L,12L)));
  AutomationRunResponse running=new AutomationRunResponse(20L,"RUN-20",AutomationRunType.TEST_SUITE,AutomationRunStatus.RUNNING,2,0,0,0,LocalDateTime.now(),null,null);
  when(automation.executeTestSuiteTestCases(eq(List.of(11L,12L)),eq(config),any())).thenReturn(running);
  SuiteRunResponse response=new SuiteRunResponse(9L,1L,"PRJ-1",4L,"Suite",SuiteResultStatus.RUNNING,LocalDateTime.now(),null,null,0,0,0,0,null,List.of()); when(persistence.get(9L)).thenReturn(response);
  assertSame(response,service.execute("PRJ-1",4L)); verify(persistence).attachAutomationRun(9L,20L);
  @SuppressWarnings("unchecked") ArgumentCaptor<Consumer<AutomationRunResponse>> callback=ArgumentCaptor.forClass(Consumer.class); verify(automation).executeTestSuiteTestCases(eq(List.of(11L,12L)),eq(config),callback.capture()); callback.getValue().accept(running); verify(persistence).complete(9L,20L);
 }
 @Test void validationOrStartupFailureLeavesSuiteRunTerminal(){
  SuiteRunPersistenceService persistence=mock(SuiteRunPersistenceService.class); AutomationMultiRunService automation=mock(AutomationMultiRunService.class); TestSuiteService suites=mock(TestSuiteService.class); SuiteRunExecutionService service=new SuiteRunExecutionService(persistence,automation,suites);when(suites.configuration(4L)).thenReturn(new SuiteJUnitConfiguration(SuiteExecutionMode.SEQUENTIAL,true,List.of(),List.of(),List.of()));
  when(persistence.start("PRJ-1",4L)).thenReturn(new SuiteRunPersistenceService.StartResult(9L,List.of(11L))); when(automation.executeTestSuiteTestCases(anyList(),any(),any())).thenThrow(new IllegalStateException("runner unavailable"));
  assertThrows(IllegalStateException.class,()->service.execute("PRJ-1",4L)); verify(persistence).fail(9L,"runner unavailable");
 }
}
