param(
    [string]$BaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Host ""
    Write-Host "============================================================"
    Write-Host $Title
    Write-Host "============================================================"
}

function Write-Pass {
    param([Parameter(Mandatory = $true)][string]$Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Write-Info {
    param([Parameter(Mandatory = $true)][string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Warn {
    param([Parameter(Mandatory = $true)][string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Fail {
    param([Parameter(Mandatory = $true)][string]$Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Assert-True {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not $Condition) {
        throw "Assertion failed: $Message"
    }

    Write-Pass $Message
}

function Assert-NotNull {
    param(
        [Parameter(Mandatory = $false)]$Value,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if ($null -eq $Value) {
        throw "Assertion failed: $Message"
    }

    Write-Pass $Message
}

function Assert-NotEmpty {
    param(
        [Parameter(Mandatory = $false)]$Value,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if ($null -eq $Value) {
        throw "Assertion failed: $Message"
    }

    if ($Value -is [string]) {
        if ([string]::IsNullOrWhiteSpace($Value)) {
            throw "Assertion failed: $Message"
        }
    }

    Write-Pass $Message
}

function Assert-Equal {
    param(
        [Parameter(Mandatory = $false)]$Actual,
        [Parameter(Mandatory = $false)]$Expected,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if ($Actual -ne $Expected) {
        throw "Assertion failed: $Message. Expected=[$Expected] Actual=[$Actual]"
    }

    Write-Pass "$Message [$Actual]"
}

function Convert-ToJsonBody {
    param([Parameter(Mandatory = $true)][hashtable]$Body)
    return ($Body | ConvertTo-Json -Depth 20)
}

function Get-HttpErrorBody {
    param([Parameter(Mandatory = $true)]$ErrorRecord)

    if ($null -ne $ErrorRecord.ErrorDetails) {
        if (-not [string]::IsNullOrWhiteSpace($ErrorRecord.ErrorDetails.Message)) {
            return $ErrorRecord.ErrorDetails.Message
        }
    }

    try {
        $response = $ErrorRecord.Exception.Response

        if ($null -ne $response) {
            $stream = $response.GetResponseStream()

            if ($null -ne $stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                try {
                    $body = $reader.ReadToEnd()
                    if (-not [string]::IsNullOrWhiteSpace($body)) {
                        return $body
                    }
                }
                finally {
                    $reader.Dispose()
                }
            }
        }
    }
    catch {
        # Fall through to exception message.
    }

    if ($null -ne $ErrorRecord.Exception) {
        if (-not [string]::IsNullOrWhiteSpace($ErrorRecord.Exception.Message)) {
            return $ErrorRecord.Exception.Message
        }
    }

    return "No response body available."
}

function Show-ApiFailure {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $false)][string]$RequestBody,
        [Parameter(Mandatory = $true)]$ErrorRecord
    )

    Write-Host ""
    Write-Host "------------------------------------------------------------" -ForegroundColor Red
    Write-Host "$Method failed: $Path" -ForegroundColor Red
    Write-Host "------------------------------------------------------------" -ForegroundColor Red

    if (-not [string]::IsNullOrWhiteSpace($RequestBody)) {
        Write-Host ""
        Write-Host "Request body:" -ForegroundColor Yellow
        Write-Host $RequestBody
    }

    Write-Host ""
    Write-Host "Backend response:" -ForegroundColor Yellow
    Write-Host (Get-HttpErrorBody $ErrorRecord)
    Write-Host ""
}

function Invoke-TestForgeGet {
    param([Parameter(Mandatory = $true)][string]$Path)

    try {
        return Invoke-RestMethod `
            -Uri "$BaseUrl$Path" `
            -Method Get `
            -Headers @{ Accept = "application/json" }
    }
    catch {
        Show-ApiFailure -Method "GET" -Path $Path -RequestBody "" -ErrorRecord $_
        throw
    }
}

function Invoke-TestForgePost {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][hashtable]$Body
    )

    $jsonBody = Convert-ToJsonBody $Body

    try {
        return Invoke-RestMethod `
            -Uri "$BaseUrl$Path" `
            -Method Post `
            -ContentType "application/json" `
            -Headers @{ Accept = "application/json" } `
            -Body $jsonBody
    }
    catch {
        Show-ApiFailure -Method "POST" -Path $Path -RequestBody $jsonBody -ErrorRecord $_
        throw
    }
}

$runTimestamp = Get-Date -Format "yyyyMMddHHmmss"
$runId = "REG-$runTimestamp"

$testPlanBusinessId = "TP-$runId"
$requirementBusinessId = "REQ-$runId"
$scenarioBusinessId = "SCN-$runId"
$testCaseBusinessId = "TC-$runId"
$testStep1BusinessId = "STEP-$runId-01"
$testStep2BusinessId = "STEP-$runId-02"
$automationScriptBusinessId = "AUTO-$runId"
$automationStep1BusinessId = "AUTO-STEP-$runId-01"
$automationStep2BusinessId = "AUTO-STEP-$runId-02"

Write-Section "Task 36.16 - TestForge POC Regression"
Write-Info "Run ID: $runId"
Write-Info "Backend: $BaseUrl"

try {
    Write-Section "1. Backend availability"

    $dashboardBefore = Invoke-TestForgeGet "/api/dashboard/summary"
    Assert-NotNull $dashboardBefore "Dashboard API is reachable"

    $testCasesBefore = [long]$dashboardBefore.totalTestCases
    $automatableBefore = [long]$dashboardBefore.automatableTestCases
    $automatedBefore = [long]$dashboardBefore.automatedTestCases
    $scriptsBefore = [long]$dashboardBefore.totalAutomationScripts
    $generatedBefore = [long]$dashboardBefore.generatedScripts

    Write-Info "Total test cases before: $testCasesBefore"
    Write-Info "Automatable before: $automatableBefore"
    Write-Info "Automated before: $automatedBefore"
    Write-Info "Scripts before: $scriptsBefore"
    Write-Info "Generated scripts before: $generatedBefore"

    Write-Section "2. Create Test Plan"

    $testPlanRequest = @{
        testPlanId = $testPlanBusinessId
        name = "36.16 Regression Test Plan"
        version = "1.0"
        project = "TestForge"
        application = "TestForge POC"
        environment = "LOCAL"
        preparedBy = "Task 36.16 Regression"
        status = "DRAFT"
        approvalStatus = "PENDING"
    }

    $testPlan = Invoke-TestForgePost "/api/test-plans" $testPlanRequest

    Assert-NotNull $testPlan.id "Test Plan database ID returned"
    Assert-Equal $testPlan.testPlanId $testPlanBusinessId "Test Plan business ID matches"
    Assert-Equal $testPlan.status "DRAFT" "Test Plan status is DRAFT"
    Assert-Equal $testPlan.approvalStatus "PENDING" "Test Plan approval status is PENDING"

    Write-Info "Test Plan DB ID: $($testPlan.id)"

    Write-Section "3. Create Requirement"

    $requirementRequest = @{
        requirementId = $requirementBusinessId
        description = "The TestForge dashboard summary API must return successfully."
        priority = "HIGH"
        status = "ACTIVE"
        automatable = $true
    }

    $requirement = Invoke-TestForgePost "/api/test-plans/$testPlanBusinessId/requirements" $requirementRequest

    Assert-NotNull $requirement.id "Requirement database ID returned"
    Assert-Equal $requirement.requirementId $requirementBusinessId "Requirement business ID matches"
    Assert-Equal $requirement.automatable $true "Requirement is automatable"

    Write-Info "Requirement DB ID: $($requirement.id)"

    Write-Section "4. Create Test Scenario"

    $scenarioRequest = @{
        scenarioId = $scenarioBusinessId
        description = "Verify TestForge can access its dashboard summary endpoint."
        testType = "FUNCTIONAL"
        automatable = $true
        priority = "HIGH"
        status = "ACTIVE"
    }

    $scenario = Invoke-TestForgePost "/api/requirements/$requirementBusinessId/scenarios" $scenarioRequest

    Assert-NotNull $scenario.id "Scenario database ID returned"
    Assert-Equal $scenario.scenarioId $scenarioBusinessId "Scenario business ID matches"
    Assert-Equal $scenario.testType "FUNCTIONAL" "Scenario test type is FUNCTIONAL"
    Assert-Equal $scenario.automatable $true "Scenario is automatable"

    Write-Info "Scenario DB ID: $($scenario.id)"

    Write-Section "5. Create API Test Case"

    $testCaseRequest = @{
        testCaseId = $testCaseBusinessId
        name = "Dashboard summary API returns HTTP 200"
        preconditions = "TestForge backend is running."
        testData = "GET $BaseUrl/api/dashboard/summary"
        expectedResult = "Dashboard summary returns HTTP 200."
        priority = "HIGH"
        testType = "FUNCTIONAL"
        automatable = $true
        automationType = "API"
        status = "ACTIVE"
    }

    $testCase = Invoke-TestForgePost "/api/scenarios/$scenarioBusinessId/test-cases" $testCaseRequest

    Assert-NotNull $testCase.id "Test Case database ID returned"
    Assert-Equal $testCase.testCaseId $testCaseBusinessId "Test Case business ID matches"
    Assert-Equal $testCase.automatable $true "Test Case is automatable"
    Assert-Equal $testCase.automationType "API" "Automation type is API"
    Assert-Equal $testCase.automationStatus "NOT_AUTOMATED" "Initial automation status is NOT_AUTOMATED"

    $testCaseDbId = [long]$testCase.id
    Write-Info "Test Case DB ID: $testCaseDbId"

    Write-Section "6. Create Test Steps"

    $testStep1Request = @{
        testStepId = $testStep1BusinessId
        stepOrder = 1
        action = "Send GET request to dashboard summary endpoint"
        target = "$BaseUrl/api/dashboard/summary"
        inputValue = $null
        expectedResult = "Request is sent successfully"
    }

    $testStep1 = Invoke-TestForgePost "/api/test-cases/$testCaseBusinessId/steps" $testStep1Request

    Assert-NotNull $testStep1.id "Test Step 1 database ID returned"
    Assert-Equal $testStep1.testStepId $testStep1BusinessId "Test Step 1 business ID matches"

    $testStep2Request = @{
        testStepId = $testStep2BusinessId
        stepOrder = 2
        action = "Verify dashboard summary response status"
        target = "$BaseUrl/api/dashboard/summary"
        inputValue = $null
        expectedResult = "HTTP status is 200"
    }

    $testStep2 = Invoke-TestForgePost "/api/test-cases/$testCaseBusinessId/steps" $testStep2Request

    Assert-NotNull $testStep2.id "Test Step 2 database ID returned"
    Assert-Equal $testStep2.testStepId $testStep2BusinessId "Test Step 2 business ID matches"

    $testStep1DbId = [long]$testStep1.id
    $testStep2DbId = [long]$testStep2.id

    Write-Section "7. Verify Automation Eligibility"

    $eligibleCases = Invoke-TestForgeGet "/api/test-cases/automation-eligible"
    $eligibleMatch = $eligibleCases | Where-Object { $_.testCaseId -eq $testCaseBusinessId }

    Assert-NotNull $eligibleMatch "Created Test Case appears in automation-eligible list"

    Write-Section "8. Create Automation Script"

    $scriptRequest = @{
        automationScriptId = $automationScriptBusinessId
        name = "36.16 Dashboard API Regression"
    }

    $automationScript = Invoke-TestForgePost "/api/test-cases/$testCaseDbId/automation-script" $scriptRequest

    Assert-NotNull $automationScript.id "Automation Script database ID returned"
    Assert-Equal $automationScript.automationScriptId $automationScriptBusinessId "Automation Script business ID matches"

    $automationScriptDbId = [long]$automationScript.id
    Write-Info "Automation Script DB ID: $automationScriptDbId"

    Write-Section "9. Create API_GET Automation Step"

    $apiGetStepRequest = @{
        automationStepId = $automationStep1BusinessId
        sourceTestStepId = $testStep1DbId
        stepOrder = 1
        actionType = "API_GET"
        target = "$BaseUrl/api/dashboard/summary"
        selectorStrategy = $null
        selectorValue = $null
        selectorRole = $null
        selectorName = $null
        selectorExact = $false
        inputValue = $null
        expectedValue = $null
    }

    $apiGetStep = Invoke-TestForgePost "/api/automation-scripts/$automationScriptDbId/steps" $apiGetStepRequest

    Assert-NotNull $apiGetStep.id "API_GET Automation Step created"
    Assert-Equal $apiGetStep.actionType "API_GET" "First automation action is API_GET"

    Write-Section "10. Create ASSERT_API_STATUS Automation Step"

    $statusStepRequest = @{
        automationStepId = $automationStep2BusinessId
        sourceTestStepId = $testStep2DbId
        stepOrder = 2
        actionType = "ASSERT_API_STATUS"
        target = $null
        selectorStrategy = $null
        selectorValue = $null
        selectorRole = $null
        selectorName = $null
        selectorExact = $false
        inputValue = $null
        expectedValue = "200"
    }

    $statusStep = Invoke-TestForgePost "/api/automation-scripts/$automationScriptDbId/steps" $statusStepRequest

    Assert-NotNull $statusStep.id "ASSERT_API_STATUS Automation Step created"
    Assert-Equal $statusStep.actionType "ASSERT_API_STATUS" "Second automation action asserts HTTP status"

    Write-Section "11. Verify Automation Steps"

    $automationSteps = Invoke-TestForgeGet "/api/automation-scripts/$automationScriptDbId/steps"
    Assert-Equal $automationSteps.Count 2 "Automation Script contains two steps"

    Write-Section "12. Generate Playwright + Java 17 Script"

    $generated = Invoke-TestForgePost "/api/automation-scripts/$automationScriptDbId/generate" @{}

    Assert-NotEmpty $generated.source "Generated source returned"
    Assert-NotEmpty $generated.className "Generated Java class name returned"
    Assert-Equal $generated.framework "Playwright" "Generated framework is Playwright"
    Assert-Equal $generated.language "Java 17" "Generated language is Java 17"
    Assert-Equal $generated.generatedStepCount 2 "Generated source contains two automation steps"
    Assert-Equal $generated.stale $false "Freshly generated source is not stale"

    Write-Info "Generated class: $($generated.className)"

    Write-Section "13. Verify Persisted Generated Script"

    $persistedGenerated = Invoke-TestForgeGet "/api/automation-scripts/$automationScriptDbId/generated-script"

    Assert-NotEmpty $persistedGenerated.source "Persisted generated source is available"
    Assert-Equal $persistedGenerated.generatedStepCount 2 "Persisted generated script has two steps"
    Assert-Equal $persistedGenerated.stale $false "Persisted generated script is not stale"

    Write-Section "14. Verify Lifecycle After Generation"

    $testCaseAfterGeneration = Invoke-TestForgeGet "/api/test-cases/business/$testCaseBusinessId"
    Assert-Equal $testCaseAfterGeneration.automationStatus "SCRIPT_GENERATED" "Test Case status becomes SCRIPT_GENERATED"

    Write-Section "15. Execute Generated Automation"

    Write-Info "Executing persisted generated Java 17 source."
    Write-Info "This regression is API-only and should not require Chromium."

    $execution = Invoke-TestForgePost "/api/automation-scripts/$automationScriptDbId/execute" @{}

    Assert-NotEmpty $execution.executionId "Execution business ID returned"
    Assert-NotNull $execution.id "Execution database ID returned"
    Assert-Equal $execution.status "PASSED" "Generated automation execution PASSED"
    Assert-Equal $execution.exitCode 0 "Execution process exited with code 0"
    Assert-NotEmpty $execution.logOutput "Execution log is available"

    Write-Info "Execution DB ID: $($execution.id)"
    Write-Info "Execution business ID: $($execution.executionId)"

    Write-Section "16. Verify Lifecycle After Execution"

    $testCaseAfterExecution = Invoke-TestForgeGet "/api/test-cases/business/$testCaseBusinessId"
    Assert-Equal $testCaseAfterExecution.automationStatus "AUTOMATED" "Successful Test Case becomes AUTOMATED"

    Write-Section "17. Verify Latest Execution"

    $latestExecution = Invoke-TestForgeGet "/api/automation-scripts/$automationScriptDbId/executions/latest"

    Assert-Equal $latestExecution.executionId $execution.executionId "Latest execution is the regression execution"
    Assert-Equal $latestExecution.status "PASSED" "Latest execution status is PASSED"

    Write-Section "18. Verify Execution By Database ID"

    $executionById = Invoke-TestForgeGet "/api/automation-executions/$($execution.id)"

    Assert-Equal $executionById.executionId $execution.executionId "Execution lookup by database ID matches"
    Assert-Equal $executionById.status "PASSED" "Execution lookup status is PASSED"

    Write-Section "19. Verify Result Detail"

    $result = Invoke-TestForgeGet "/api/automation-results/$($execution.executionId)"

    Assert-Equal $result.executionId $execution.executionId "Result references the execution"
    Assert-Equal $result.status "PASSED" "Result status is PASSED"
    Assert-Equal $result.testCaseBusinessId $testCaseBusinessId "Result references regression Test Case"
    Assert-Equal $result.successful $true "Result successful flag is true"
    Assert-NotEmpty $result.logOutput "Result execution log is available"

    Write-Section "20. Verify Results List"

    $allResults = Invoke-TestForgeGet "/api/automation-results"
    $resultInList = $allResults | Where-Object { $_.executionId -eq $execution.executionId }

    Assert-NotNull $resultInList "Execution appears in Results list"

    Write-Section "21. Verify PASSED Results Filter"

    $passedResults = Invoke-TestForgeGet "/api/automation-results?status=PASSED"
    $passedResultMatch = $passedResults | Where-Object { $_.executionId -eq $execution.executionId }

    Assert-NotNull $passedResultMatch "Execution appears in PASSED Results filter"

    Write-Section "22. Verify Test Case Results"

    $testCaseResults = Invoke-TestForgeGet "/api/test-cases/$testCaseDbId/automation-results"
    $testCaseResultMatch = $testCaseResults | Where-Object { $_.executionId -eq $execution.executionId }

    Assert-NotNull $testCaseResultMatch "Execution appears in Test Case Results"

    Write-Section "23. Verify Automation Script Results"

    $scriptResults = Invoke-TestForgeGet "/api/automation-scripts/$automationScriptDbId/results"
    $scriptResultMatch = $scriptResults | Where-Object { $_.executionId -eq $execution.executionId }

    Assert-NotNull $scriptResultMatch "Execution appears in Automation Script Results"

    Write-Section "24. Verify Dashboard Summary"

    $dashboardAfter = Invoke-TestForgeGet "/api/dashboard/summary"

    $totalTestCasesAfter = [long]$dashboardAfter.totalTestCases
    $automatableAfter = [long]$dashboardAfter.automatableTestCases
    $automatedAfter = [long]$dashboardAfter.automatedTestCases
    $scriptsAfter = [long]$dashboardAfter.totalAutomationScripts
    $generatedAfter = [long]$dashboardAfter.generatedScripts

    Assert-True ($totalTestCasesAfter -ge ($testCasesBefore + 1)) "Dashboard Test Case total increased"
    Assert-True ($automatableAfter -ge ($automatableBefore + 1)) "Dashboard automatable total increased"
    Assert-True ($automatedAfter -ge ($automatedBefore + 1)) "Dashboard automated total increased"
    Assert-True ($scriptsAfter -ge ($scriptsBefore + 1)) "Dashboard Automation Script total increased"
    Assert-True ($generatedAfter -ge ($generatedBefore + 1)) "Dashboard generated script total increased"

    Write-Section "25. Verify Dashboard Execution Health"

    $executionSummary = Invoke-TestForgeGet "/api/dashboard/execution-status"

    $completedExecutions = [long]$executionSummary.totalExecutions
    $passedExecutions = [long]$executionSummary.passed
    $passRate = [double]$executionSummary.passRatePercentage

    Assert-True ($completedExecutions -ge 1) "Dashboard contains completed executions"
    Assert-True ($passedExecutions -ge 1) "Dashboard contains at least one PASSED execution"
    Assert-True (($passRate -ge 0) -and ($passRate -le 100)) "Dashboard pass rate is between 0 and 100"

    Write-Section "26. Verify Dashboard Automation Types"

    $automationTypes = Invoke-TestForgeGet "/api/dashboard/automation-types"

    $apiCount = [long]$automationTypes.api
    $totalAutomatable = [long]$automationTypes.totalAutomatable

    Assert-True ($apiCount -ge 1) "Dashboard contains at least one API automation"
    Assert-True ($totalAutomatable -ge 1) "Dashboard contains automatable Test Cases"

    Write-Section "27. Verify Dashboard Recent Results"

    $recentResults = Invoke-TestForgeGet "/api/dashboard/recent-results"

    Assert-True ($recentResults.Count -le 5) "Dashboard returns no more than five recent results"

    $recentResultMatch = $recentResults | Where-Object { $_.executionId -eq $execution.executionId }
    Assert-NotNull $recentResultMatch "Regression execution appears in Dashboard recent results"

    Write-Section "28. Verify Final Lifecycle State"

    $finalTestCase = Invoke-TestForgeGet "/api/test-cases/business/$testCaseBusinessId"
    Assert-Equal $finalTestCase.automationStatus "AUTOMATED" "Final automation lifecycle status is AUTOMATED"

    Write-Section "TASK 36.16 API REGRESSION PASSED"

    Write-Pass "Backend availability verified"
    Write-Pass "Test Plan created with required status and approvalStatus"
    Write-Pass "Requirement created with automatable flag"
    Write-Pass "Scenario created with test type, automatable flag, priority and status"
    Write-Pass "Test Case created"
    Write-Pass "Test Steps created using the current /steps endpoint"
    Write-Pass "Automation eligibility verified"
    Write-Pass "Automation Script created"
    Write-Pass "Automation Steps created"
    Write-Pass "Playwright + Java 17 generated"
    Write-Pass "Generated source persisted"
    Write-Pass "Generated source executed"
    Write-Pass "Execution PASSED"
    Write-Pass "Result persisted"
    Write-Pass "Results reporting verified"
    Write-Pass "Dashboard reporting verified"
    Write-Pass "Automation lifecycle reached AUTOMATED"

    Write-Host ""
    Write-Host "Regression identifiers:" -ForegroundColor Cyan
    Write-Host "Run ID:       $runId"
    Write-Host "Test Plan:    $testPlanBusinessId"
    Write-Host "Requirement:  $requirementBusinessId"
    Write-Host "Scenario:     $scenarioBusinessId"
    Write-Host "Test Case:    $testCaseBusinessId"
    Write-Host "Script:       $automationScriptBusinessId"
    Write-Host "Execution:    $($execution.executionId)"
    Write-Host ""

    Write-Host "Manual UI verification:" -ForegroundColor Cyan
    Write-Host "http://localhost:5173/test-plans"
    Write-Host "http://localhost:5173/automation"
    Write-Host "http://localhost:5173/results"
    Write-Host "http://localhost:5173/dashboard"
    Write-Host ""

    exit 0
}
catch {
    Write-Section "TASK 36.16 API REGRESSION FAILED"

    Write-Fail $_.Exception.Message

    Write-Host ""
    Write-Host "Regression identifiers for this run:" -ForegroundColor Yellow
    Write-Host "Run ID:       $runId"
    Write-Host "Test Plan:    $testPlanBusinessId"
    Write-Host "Requirement:  $requirementBusinessId"
    Write-Host "Scenario:     $scenarioBusinessId"
    Write-Host "Test Case:    $testCaseBusinessId"
    Write-Host "Script:       $automationScriptBusinessId"
    Write-Host ""

    Write-Warn "Some records may already have been created before the failure."
    Write-Warn "Fix the first failing API contract, then rerun with the next generated Run ID."
    Write-Host ""

    exit 1
}
