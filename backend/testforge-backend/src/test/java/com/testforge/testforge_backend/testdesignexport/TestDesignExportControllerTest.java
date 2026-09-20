package com.testforge.testforge_backend.testdesignexport;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TestDesignExportControllerTest {
    @Test
    void returnsXlsxAttachment() {
        TestDesignExportService service = mock(TestDesignExportService.class);
        when(service.export("PRJ-1", TestDesignExportScope.PROJECT, null, null))
                .thenReturn(new TestDesignExportService.ExportedWorkbook(new byte[]{1, 2}, "customer-portal-test-design-2026-09-20.xlsx"));
        var response = new TestDesignExportController(service)
                .export("PRJ-1", TestDesignExportScope.PROJECT, null, null);

        assertThat(response.getHeaders().getContentType().toString())
                .isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        assertThat(response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION))
                .contains("customer-portal-test-design-2026-09-20.xlsx");
        assertThat(response.getBody()).containsExactly(1, 2);
    }
}
