package com.testforge.testforge_backend.testsuite.dto;
import com.testforge.testforge_backend.testsuite.entity.SuiteExecutionMode; import jakarta.validation.constraints.*; import java.util.*;
public record TestSuiteRequest(@NotBlank @Size(max=255) String name,@Size(max=2000) String description,@NotEmpty List<@NotNull Long> scenarioIds,SuiteExecutionMode executionMode,Boolean lifecycleEnabled,List<@Pattern(regexp="[A-Za-z0-9][A-Za-z0-9._-]{0,99}") String> tags,List<Map<@Pattern(regexp="[A-Za-z_][A-Za-z0-9_.-]{0,99}") String,String>> parameterSets,List<String> extensions){}
