package com.testforge.testforge_backend.testsuite.service;
import com.testforge.testforge_backend.automation.dto.GeneratedScriptResponse; import com.testforge.testforge_backend.testsuite.dto.SuiteJUnitConfiguration; import com.testforge.testforge_backend.testsuite.entity.SuiteExecutionMode; import org.junit.jupiter.api.Test; import java.time.LocalDateTime; import java.util.*; import static org.junit.jupiter.api.Assertions.assertTrue;
class JUnitSuiteSourceTransformerTest {
 @Test void generatesLifecycleTagsAndStructuredParameters(){String source="""
package generated.testforge;
import org.junit.jupiter.api.Test;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
public class LoginTest {
    @Test
    void execute() throws Exception {
        Map<String, String> runtimeData = new HashMap<>();
    }
}
""";GeneratedScriptResponse generated=new GeneratedScriptResponse(1L,"AS-1",2L,"LoginTest","Java 17","Playwright",source,1,LocalDateTime.now(),false);SuiteJUnitConfiguration config=new SuiteJUnitConfiguration(SuiteExecutionMode.SEQUENTIAL,true,List.of("smoke"),List.of(Map.of("username","alice"),Map.of("username","bob")),List.of());String transformed=new JUnitSuiteSourceTransformer().apply(generated,config).source();assertTrue(transformed.contains("@org.junit.jupiter.api.BeforeAll"));assertTrue(transformed.contains("@org.junit.jupiter.api.BeforeEach"));assertTrue(transformed.contains("@org.junit.jupiter.api.AfterEach"));assertTrue(transformed.contains("@org.junit.jupiter.api.AfterAll"));assertTrue(transformed.contains("@org.junit.jupiter.api.Tag(\"smoke\")"));assertTrue(transformed.contains("@ParameterizedTest"));assertTrue(transformed.contains("@MethodSource(\"testForgeParameters\")"));assertTrue(transformed.contains("new HashMap<>(parameters)"));}
}
