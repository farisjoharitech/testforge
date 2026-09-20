package com.testforge.testforge_backend.testdesignexport;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
class TestDesignWorkbookWriter {
    static final List<String> HEADERS = List.of(
            "Project", "Test Plan", "Module", "Requirement ID", "Requirement",
            "Scenario ID", "Scenario", "Scenario Automatable", "Test Case ID", "Test Case",
            "Preconditions", "Test Case Test Data", "Test Case Expected Result", "Step #",
            "Test Step", "Target", "Test Data", "Expected Result", "Automation Status");

    byte[] write(String projectName, String scopeLabel, List<TestDesignExportRow> rows, LocalDateTime exportedAt) {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(200); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            workbook.setCompressTempFiles(true);
            writeDesign(workbook, projectName, rows);
            writeInformation(workbook, projectName, scopeLabel, rows, exportedAt);
            workbook.write(output);
            workbook.dispose();
            return output.toByteArray();
        } catch (IOException exception) {
            throw new TestDesignExportException("Test Design could not be exported.", exception);
        }
    }

    private void writeDesign(SXSSFWorkbook workbook, String projectName, List<TestDesignExportRow> rows) {
        Sheet sheet = workbook.createSheet("Test Design");
        CellStyle header = headerStyle(workbook);
        CellStyle body = bodyStyle(workbook);
        Row headerRow = sheet.createRow(0);
        for (int index = 0; index < HEADERS.size(); index++) {
            headerRow.createCell(index).setCellValue(HEADERS.get(index));
            headerRow.getCell(index).setCellStyle(header);
        }
        int rowNumber = 1;
        for (TestDesignExportRow source : rows) {
            Row row = sheet.createRow(rowNumber++);
            List<?> values = List.of(
                    projectName, text(source.testPlan()), text(source.module()), text(source.requirementId()),
                    text(source.requirement()), text(source.scenarioId()), text(source.scenario()),
                    source.scenarioKey() == null ? "" : source.scenarioAutomatable() ? "Yes" : "No",
                    text(source.testCaseId()), text(source.testCase()), text(source.preconditions()),
                    redact(source.testCaseData(), source.testCase()), text(source.testCaseExpectedResult()),
                    source.stepOrder() == null ? "" : source.stepOrder(), text(source.testStep()), text(source.target()),
                    redact(source.stepData(), text(source.testStep()) + " " + text(source.target())),
                    text(source.stepExpectedResult()), text(source.automationStatus()));
            for (int index = 0; index < values.size(); index++) {
                Object value = values.get(index);
                if (value instanceof Integer number) row.createCell(index).setCellValue(number);
                else row.createCell(index).setCellValue(String.valueOf(value));
                row.getCell(index).setCellStyle(body);
            }
        }
        sheet.createFreezePane(0, 1);
        sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, Math.max(0, rowNumber - 1), 0, HEADERS.size() - 1));
        int[] widths = {24, 24, 24, 16, 42, 16, 42, 18, 16, 36, 34, 34, 38, 10, 42, 28, 34, 42, 20};
        for (int index = 0; index < widths.length; index++) sheet.setColumnWidth(index, widths[index] * 256);
    }

    private void writeInformation(SXSSFWorkbook workbook, String projectName, String scopeLabel,
                                  List<TestDesignExportRow> rows, LocalDateTime exportedAt) {
        Sheet sheet = workbook.createSheet("Export Information");
        CellStyle label = headerStyle(workbook);
        int rowNumber = 0;
        rowNumber = info(sheet, rowNumber, "Project", projectName, label);
        rowNumber = info(sheet, rowNumber, "Export Scope", scopeLabel, label);
        rowNumber = info(sheet, rowNumber, "Exported At", exportedAt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), label);
        rowNumber++;
        Row summary = sheet.createRow(rowNumber++);
        summary.createCell(0).setCellValue("Summary");
        summary.getCell(0).setCellStyle(label);
        rowNumber = info(sheet, rowNumber, "Test Plans", count(rows, TestDesignExportRow::testPlanKey), label);
        rowNumber = info(sheet, rowNumber, "Modules", count(rows, TestDesignExportRow::moduleKey), label);
        rowNumber = info(sheet, rowNumber, "Requirements", count(rows, TestDesignExportRow::requirementKey), label);
        rowNumber = info(sheet, rowNumber, "Scenarios", count(rows, TestDesignExportRow::scenarioKey), label);
        rowNumber = info(sheet, rowNumber, "Test Cases", count(rows, TestDesignExportRow::testCaseKey), label);
        info(sheet, rowNumber, "Test Steps", count(rows, TestDesignExportRow::testStepKey), label);
        sheet.setColumnWidth(0, 24 * 256);
        sheet.setColumnWidth(1, 42 * 256);
    }

    private int info(Sheet sheet, int rowNumber, String key, Object value, CellStyle label) {
        Row row = sheet.createRow(rowNumber);
        row.createCell(0).setCellValue(key);
        row.getCell(0).setCellStyle(label);
        if (value instanceof Number number) row.createCell(1).setCellValue(number.doubleValue());
        else row.createCell(1).setCellValue(String.valueOf(value));
        return rowNumber + 1;
    }

    private long count(List<TestDesignExportRow> rows, java.util.function.Function<TestDesignExportRow, Long> key) {
        Set<Long> values = new HashSet<>();
        rows.stream().map(key).filter(java.util.Objects::nonNull).forEach(values::add);
        return values.size();
    }

    private CellStyle headerStyle(SXSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setVerticalAlignment(VerticalAlignment.TOP);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle bodyStyle(SXSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.TOP);
        style.setAlignment(HorizontalAlignment.LEFT);
        return style;
    }

    private static String text(String value) { return value == null ? "" : value; }

    private static String redact(String value, String context) {
        if (value == null) return "";
        String normalized = context == null ? "" : context.toLowerCase();
        String data = value.toLowerCase();
        boolean sensitiveContext = normalized.matches(".*(password|secret|token|authorization|api[ _-]?key|private[ _-]?key).*" );
        boolean containsSensitiveAssignment = data.matches("(?s).*(password|secret|token|authorization|api[ _-]?key|private[ _-]?key)[\\s\"']*[:=].*");
        return sensitiveContext || containsSensitiveAssignment
                ? "[REDACTED]" : value;
    }
}
