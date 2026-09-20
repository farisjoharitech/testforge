package com.testforge.testforge_backend.testsuite.dto; import com.testforge.testforge_backend.testsuite.entity.SuiteExecutionMode; import java.util.*;
public record SuiteJUnitConfiguration(SuiteExecutionMode executionMode,boolean lifecycleEnabled,List<String> tags,List<Map<String,String>> parameterSets,List<String> extensions){}
