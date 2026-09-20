package com.testforge.testforge_backend.testdesignexport;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TestDesignWorkbookWriterTest {
    @Test
    void writesFlattenedHierarchyOrderedStepsAndInformationWithoutSensitiveData() throws Exception {
        TestDesignExportRow stepOne = row(1L, 1, "Enter password", "password field", "secret-value", "INCOMPLETE");
        TestDesignExportRow stepTwo = row(2L, 2, "Submit login", "button", null, "INCOMPLETE");

        byte[] content = new TestDesignWorkbookWriter().write(
                "Customer Portal", "Entire Project", List.of(stepOne, stepTwo), LocalDateTime.of(2026, 9, 20, 23, 0));

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(content))) {
            assertThat(workbook.getNumberOfSheets()).isEqualTo(2);
            assertThat(workbook.getSheetName(0)).isEqualTo("Test Design");
            assertThat(workbook.getSheetName(1)).isEqualTo("Export Information");
            var design = workbook.getSheet("Test Design");
            assertThat(design.getRow(0).getCell(4).getStringCellValue()).isEqualTo("Requirement");
            assertThat(design.getRow(1).getCell(4).getStringCellValue()).isEqualTo("Authenticated users can sign in");
            assertThat(design.getRow(1).getCell(7).getStringCellValue()).isEqualTo("Yes");
            assertThat(design.getRow(1).getCell(13).getNumericCellValue()).isEqualTo(1);
            assertThat(design.getRow(2).getCell(13).getNumericCellValue()).isEqualTo(2);
            assertThat(design.getRow(1).getCell(16).getStringCellValue()).isEqualTo("[REDACTED]");
            assertThat(workbook.getSheet("Export Information").getRow(1).getCell(1).getStringCellValue())
                    .isEqualTo("Entire Project");
        }
    }

    @Test
    void representsTestCaseWithoutSteps() throws Exception {
        TestDesignExportRow emptyCase = row(null, null, null, null, null, "MANUAL");
        byte[] content = new TestDesignWorkbookWriter().write(
                "Project", "Entire Project", List.of(emptyCase), LocalDateTime.now());
        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(content))) {
            var row = workbook.getSheet("Test Design").getRow(1);
            assertThat(row.getCell(8).getStringCellValue()).isEqualTo("TC-001");
            assertThat(row.getCell(13).getStringCellValue()).isEmpty();
            assertThat(row.getCell(14).getStringCellValue()).isEmpty();
        }
    }

    private TestDesignExportRow row(Long stepKey, Integer order, String action, String target,
                                    String input, String status) {
        return new TestDesignExportRow(1L, "Regression", 2L, "Login", 3L, "REQ-001",
                "Authenticated users can sign in", 4L, "SCN-001", "Successful login", true,
                5L, "TC-001", "Valid login", "User exists", "username=alice",
                "Dashboard shown", status, stepKey, order, action, target, input, "Success");
    }
}
