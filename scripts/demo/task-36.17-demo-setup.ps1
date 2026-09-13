param(
    [string]$BaseUrl = "http://localhost:8080",
    [switch]$SkipExecution
)

$ErrorActionPreference = "Stop"

# ============================================================
# Task 36.17
# TestForge Controlled Demo Data Setup
#
# Goals:
# - Stable demo business IDs
# - Idempotent get-or-create behavior
# - API / UI / UI_API / MANUAL demo coverage
# - One real Playwright + Java 17 generated script
# - One real PASSED execution
# - Meaningful Results and Dashboard data
#
# Windows PowerShell 5.1 compatible.
# ============================================================


# ============================================================
# Stable Demo IDs
# ============================================================

$TestPlanId = "TP-DEMO-001"

$AutomatedRequirementId = "REQ-DEMO-001"
$ManualRequirementId = "REQ-DEMO-002"

$ApiScenarioId = "SCN-DEMO-API-001"
$UiScenarioId = "SCN-DEMO-UI-001"
$UiApiScenarioId = "SCN-DEMO-UIAPI-001"
$ManualScenarioId = "SCN-DEMO-MANUAL-001"

$ApiTestCaseId = "TC-DEMO-API-001"
$UiTestCaseId = "TC-DEMO-UI-001"
$UiApiTestCaseId = "TC-DEMO-UIAPI-001"
$ManualTestCaseId = "TC-DEMO-MANUAL-001"

$ApiStep1Id = "STEP-DEMO-API-001"
$ApiStep2Id = "STEP-DEMO-API-002"

$UiStep1Id = "STEP-DEMO-UI-001"
$UiStep2Id = "STEP-DEMO-UI-002"

$UiApiStep1Id = "STEP-DEMO-UIAPI-001"
$UiApiStep2Id = "STEP-DEMO-UIAPI-002"

$ManualStep1Id = "STEP-DEMO-MANUAL-001"
$ManualStep2Id = "STEP-DEMO-MANUAL-002"

$AutomationScriptId = "AUTO-DEMO-API-001"

$AutomationStep1Id = "AUTO-STEP-DEMO-API-001"
$AutomationStep2Id = "AUTO-STEP-DEMO-API-002"


# ============================================================
# Console Helpers
# ============================================================

function Write-Section {
    param(
        [string]$Title
    )

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor DarkGray
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor DarkGray
}


function Write-Pass {
    param(
        [string]$Message
    )

    Write-Host "[PASS] $Message" -ForegroundColor Green
}


function Write-Info {
    param(
        [string]$Message
    )

    Write-Host "[INFO] $Message" -ForegroundColor Gray
}


function Write-Warn {
    param(
        [string]$Message
    )

    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}


function Write-Fail {
    param(
        [string]$Message
    )

    Write-Host "[FAIL] $Message" -ForegroundColor Red
}


# ============================================================
# JSON / HTTP Helpers
# ============================================================

function Convert-ToJsonBody {
    param(
        [object]$Body
    )

    return ($Body | ConvertTo-Json -Depth 20)
}


function Get-HttpStatusCode {
    param(
        [System.Management.Automation.ErrorRecord]$ErrorRecord
    )

    try {
        $response = $ErrorRecord.Exception.Response

        if ($null -eq $response) {
            return $null
        }

        if ($null -ne $response.StatusCode) {
            return [int]$response.StatusCode
        }
    }
    catch {
        return $null
    }

    return $null
}


function Get-HttpErrorBody {
    param(
        [System.Management.Automation.ErrorRecord]$ErrorRecord
    )

    # Windows PowerShell often places the HTTP response body here.
    if ($null -ne $ErrorRecord.ErrorDetails) {
        $details = $ErrorRecord.ErrorDetails.Message

        if (-not [string]::IsNullOrWhiteSpace($details)) {
            return $details
        }
    }

    # Fallback to the WebResponse body when available.
    try {
        $response = $ErrorRecord.Exception.Response

        if ($null -ne $response) {
            $stream = $response.GetResponseStream()

            if ($null -ne $stream) {
                $reader = New-Object -TypeName System.IO.StreamReader -ArgumentList $stream

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
        # Ignore secondary failure while trying to read HTTP error body.
    }

    return $ErrorRecord.Exception.Message
}


function Invoke-TestForgeGet {
    param(
        [string]$Path
    )

    $uri = "$BaseUrl$Path"

    return Invoke-RestMethod `
        -Uri $uri `
        -Method Get `
        -Headers @{
            Accept = "application/json"
        }
}


function Invoke-TestForgeGetOptional {
    param(
        [string]$Path
    )

    try {
        return Invoke-TestForgeGet -Path $Path
    }
    catch {
        $statusCode = Get-HttpStatusCode -ErrorRecord $_

        if ($statusCode -eq 404) {
            return $null
        }

        $errorBody = Get-HttpErrorBody -ErrorRecord $_

        throw "GET $Path failed. $errorBody"
    }
}


function Invoke-TestForgePost {
    param(
        [string]$Path,
        [object]$Body
    )

    $uri = "$BaseUrl$Path"
    $json = Convert-ToJsonBody -Body $Body

    return Invoke-RestMethod `
        -Uri $uri `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{
            Accept = "application/json"
        } `
        -Body $json
}


function Invoke-TestForgePostNoBody {
    param(
        [string]$Path
    )

    $uri = "$BaseUrl$Path"

    return Invoke-RestMethod `
        -Uri $uri `
        -Method Post `
        -Headers @{
            Accept = "application/json"
        }
}


# ============================================================
# Assertions
# ============================================================

function Assert-Equal {
    param(
        [object]$Actual,
        [object]$Expected,
        [string]$Message
    )

    if ($Actual -ne $Expected) {
        throw (
            "Assertion failed: " +
            $Message +
            ". Expected=[" +
            $Expected +
            "] Actual=[" +
            $Actual +
            "]"
        )
    }

    Write-Pass "$Message [$Actual]"
}


function Assert-NotNull {
    param(
        [object]$Value,
        [string]$Message
    )

    if ($null -eq $Value) {
        throw "Assertion failed: $Message"
    }

    Write-Pass $Message
}


function Assert-NotEmpty {
    param(
        [object]$Value,
        [string]$Message
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


# ============================================================
# Test Plan
# ============================================================

function Get-OrCreateTestPlan {

    $existing = Invoke-TestForgeGetOptional `
        -Path "/api/test-plans/business/$TestPlanId"

    if ($null -ne $existing) {
        Write-Info "Using existing Test Plan $TestPlanId"
        return $existing
    }

    $request = @{
        testPlanId = $TestPlanId
        name = "TestForge POC Demo Release"
        version = "1.0"
        project = "TestForge"
        application = "TestForge Test Management Platform"
        environment = "LOCAL DEMO"
        preparedBy = "TestForge Demo Setup"
        status = "ACTIVE"
        approvalStatus = "APPROVED"
    }

    $created = Invoke-TestForgePost `
        -Path "/api/test-plans" `
        -Body $request

    Write-Pass "Created demo Test Plan"

    return $created
}


# ============================================================
# Requirement
# ============================================================

function Get-OrCreateRequirement {
    param(
        [string]$RequirementId,
        [string]$Description,
        [string]$Priority,
        [string]$Status,
        [bool]$Automatable
    )

    $existing = Invoke-TestForgeGetOptional `
        -Path "/api/requirements/business/$RequirementId"

    if ($null -ne $existing) {
        Write-Info "Using existing Requirement $RequirementId"
        return $existing
    }

    $request = @{
        requirementId = $RequirementId
        description = $Description
        priority = $Priority
        status = $Status
        automatable = $Automatable
    }

    $created = Invoke-TestForgePost `
        -Path "/api/test-plans/$TestPlanId/requirements" `
        -Body $request

    Write-Pass "Created Requirement $RequirementId"

    return $created
}


# ============================================================
# Scenario
# ============================================================

function Get-OrCreateScenario {
    param(
        [string]$RequirementId,
        [string]$ScenarioId,
        [string]$Description,
        [string]$TestType,
        [bool]$Automatable,
        [string]$Priority,
        [string]$Status
    )

    $existing = Invoke-TestForgeGetOptional `
        -Path "/api/scenarios/business/$ScenarioId"

    if ($null -ne $existing) {
        Write-Info "Using existing Scenario $ScenarioId"
        return $existing
    }

    $request = @{
        scenarioId = $ScenarioId
        description = $Description
        testType = $TestType
        automatable = $Automatable
        priority = $Priority
        status = $Status
    }

    $created = Invoke-TestForgePost `
        -Path "/api/requirements/$RequirementId/scenarios" `
        -Body $request

    Write-Pass "Created Scenario $ScenarioId"

    return $created
}


# ============================================================
# Test Case
# ============================================================

function Get-OrCreateTestCase {
    param(
        [string]$ScenarioId,
        [string]$TestCaseId,
        [string]$Name,
        [string]$Preconditions,
        [string]$TestData,
        [string]$ExpectedResult,
        [string]$Priority,
        [string]$TestType,
        [bool]$Automatable,
        [string]$AutomationType,
        [string]$Status
    )

    $existing = Invoke-TestForgeGetOptional `
        -Path "/api/test-cases/business/$TestCaseId"

    if ($null -ne $existing) {
        Write-Info "Using existing Test Case $TestCaseId"
        return $existing
    }

    $request = @{
        testCaseId = $TestCaseId
        name = $Name
        preconditions = $Preconditions
        testData = $TestData
        expectedResult = $ExpectedResult
        priority = $Priority
        testType = $TestType
        automatable = $Automatable
        automationType = $AutomationType
        status = $Status
    }

    $created = Invoke-TestForgePost `
        -Path "/api/scenarios/$ScenarioId/test-cases" `
        -Body $request

    Write-Pass "Created Test Case $TestCaseId"

    return $created
}


# ============================================================
# Test Step
# ============================================================

function Get-OrCreateTestStep {
    param(
        [string]$TestCaseId,
        [string]$TestStepId,
        [int]$StepOrder,
        [string]$Action,
        [AllowNull()]
        [string]$Target,
        [AllowNull()]
        [string]$InputValue,
        [AllowNull()]
        [string]$ExpectedResult
    )

    $existing = Invoke-TestForgeGetOptional `
        -Path "/api/test-steps/business/$TestStepId"

    if ($null -ne $existing) {
        Write-Info "Using existing Test Step $TestStepId"
        return $existing
    }

    $request = @{
        testStepId = $TestStepId
        stepOrder = $StepOrder
        action = $Action
        target = $Target
        inputValue = $InputValue
        expectedResult = $ExpectedResult
    }

    $created = Invoke-TestForgePost `
        -Path "/api/test-cases/$TestCaseId/steps" `
        -Body $request

    Write-Pass "Created Test Step $TestStepId"

    return $created
}


# ============================================================
# Automation Script
# ============================================================

function Get-OrCreateAutomationScript {
    param(
        [long]$TestCaseDatabaseId
    )

    $existing = Invoke-TestForgeGetOptional `
        -Path "/api/test-cases/$TestCaseDatabaseId/automation-script"

    if ($null -ne $existing) {
        Write-Info "Using existing Automation Script $($existing.automationScriptId)"
        return $existing
    }

    $request = @{
        automationScriptId = $AutomationScriptId
        name = "Demo Dashboard API Automation"
    }

    $created = Invoke-TestForgePost `
        -Path "/api/test-cases/$TestCaseDatabaseId/automation-script" `
        -Body $request

    Write-Pass "Created demo Automation Script"

    return $created
}


# ============================================================
# Automation Step
# ============================================================

function Get-OrCreateAutomationStep {
    param(
        [long]$AutomationScriptDatabaseId,
        [string]$AutomationStepId,
        [long]$SourceTestStepId,
        [int]$StepOrder,
        [string]$ActionType,
        [AllowNull()]
        [string]$Target,
        [AllowNull()]
        [string]$ExpectedValue
    )

    $currentSteps = Invoke-TestForgeGet `
        -Path "/api/automation-scripts/$AutomationScriptDatabaseId/steps"

    $currentSteps = @($currentSteps)

    $existing = $currentSteps |
        Where-Object {
            $_.automationStepId -eq $AutomationStepId
        } |
        Select-Object -First 1

    if ($null -ne $existing) {
        Write-Info "Using existing Automation Step $AutomationStepId"
        return $existing
    }

    $request = @{
        automationStepId = $AutomationStepId
        sourceTestStepId = $SourceTestStepId
        stepOrder = $StepOrder
        actionType = $ActionType
        target = $Target
        selectorStrategy = $null
        selectorValue = $null
        selectorRole = $null
        selectorName = $null
        selectorExact = $false
        inputValue = $null
        expectedValue = $ExpectedValue
    }

    $created = Invoke-TestForgePost `
        -Path "/api/automation-scripts/$AutomationScriptDatabaseId/steps" `
        -Body $request

    Write-Pass "Created Automation Step $AutomationStepId"

    return $created
}


# ============================================================
# Main
# ============================================================

try {

    Write-Section "TASK 36.17 - TESTFORGE CONTROLLED DEMO SETUP"

    Write-Info "Backend: $BaseUrl"
    Write-Info "Demo Test Plan: $TestPlanId"


    # ========================================================
    # 0. Backend Availability
    # ========================================================

    Write-Section "0. Backend Availability"

    $dashboardBefore = Invoke-TestForgeGet `
        -Path "/api/dashboard/summary"

    Assert-NotNull `
        -Value $dashboardBefore `
        -Message "TestForge backend is reachable"


    # ========================================================
    # 1. Test Plan
    # ========================================================

    Write-Section "1. Demo Test Plan"

    $testPlan = Get-OrCreateTestPlan

    Assert-Equal `
        -Actual $testPlan.testPlanId `
        -Expected $TestPlanId `
        -Message "Demo Test Plan business ID"

    Assert-Equal `
        -Actual $testPlan.status `
        -Expected "ACTIVE" `
        -Message "Demo Test Plan status"

    Assert-Equal `
        -Actual $testPlan.approvalStatus `
        -Expected "APPROVED" `
        -Message "Demo Test Plan approval status"


    # ========================================================
    # 2. Requirements
    # ========================================================

    Write-Section "2. Demo Requirements"

    $automatedRequirement = Get-OrCreateRequirement `
        -RequirementId $AutomatedRequirementId `
        -Description "TestForge core quality workflows must support repeatable automated validation across API, UI, and combined UI + API testing." `
        -Priority "CRITICAL" `
        -Status "APPROVED" `
        -Automatable $true

    $manualRequirement = Get-OrCreateRequirement `
        -RequirementId $ManualRequirementId `
        -Description "Release readiness must include a manual governance and review checkpoint." `
        -Priority "MEDIUM" `
        -Status "APPROVED" `
        -Automatable $false

    Assert-Equal `
        -Actual $automatedRequirement.requirementId `
        -Expected $AutomatedRequirementId `
        -Message "Automated Requirement business ID"

    Assert-Equal `
        -Actual $manualRequirement.requirementId `
        -Expected $ManualRequirementId `
        -Message "Manual Requirement business ID"


    # ========================================================
    # 3. Scenarios
    # ========================================================

    Write-Section "3. Demo Test Scenarios"

    $apiScenario = Get-OrCreateScenario `
        -RequirementId $AutomatedRequirementId `
        -ScenarioId $ApiScenarioId `
        -Description "Verify the TestForge Dashboard Summary API is available and returns a successful HTTP response." `
        -TestType "FUNCTIONAL" `
        -Automatable $true `
        -Priority "CRITICAL" `
        -Status "APPROVED"

    $uiScenario = Get-OrCreateScenario `
        -RequirementId $AutomatedRequirementId `
        -ScenarioId $UiScenarioId `
        -Description "Verify a QA user can access the Test Plans workspace through the TestForge web interface." `
        -TestType "END_TO_END" `
        -Automatable $true `
        -Priority "HIGH" `
        -Status "APPROVED"

    $uiApiScenario = Get-OrCreateScenario `
        -RequirementId $AutomatedRequirementId `
        -ScenarioId $UiApiScenarioId `
        -Description "Verify TestForge can combine backend API validation with user-interface reporting validation." `
        -TestType "INTEGRATION" `
        -Automatable $true `
        -Priority "HIGH" `
        -Status "APPROVED"

    $manualScenario = Get-OrCreateScenario `
        -RequirementId $ManualRequirementId `
        -ScenarioId $ManualScenarioId `
        -Description "Verify release readiness is manually reviewed before final POC handover." `
        -TestType "SANITY" `
        -Automatable $false `
        -Priority "MEDIUM" `
        -Status "APPROVED"

    Assert-Equal `
        -Actual $apiScenario.scenarioId `
        -Expected $ApiScenarioId `
        -Message "API Scenario business ID"

    Assert-Equal `
        -Actual $uiScenario.scenarioId `
        -Expected $UiScenarioId `
        -Message "UI Scenario business ID"

    Assert-Equal `
        -Actual $uiApiScenario.scenarioId `
        -Expected $UiApiScenarioId `
        -Message "UI + API Scenario business ID"

    Assert-Equal `
        -Actual $manualScenario.scenarioId `
        -Expected $ManualScenarioId `
        -Message "Manual Scenario business ID"


    # ========================================================
    # 4. Test Cases
    # ========================================================

    Write-Section "4. Demo Test Cases"

    $apiTestCase = Get-OrCreateTestCase `
        -ScenarioId $ApiScenarioId `
        -TestCaseId $ApiTestCaseId `
        -Name "Dashboard summary API returns HTTP 200" `
        -Preconditions "TestForge backend is running at $BaseUrl." `
        -TestData "GET $BaseUrl/api/dashboard/summary" `
        -ExpectedResult "Dashboard summary API returns HTTP status 200." `
        -Priority "CRITICAL" `
        -TestType "FUNCTIONAL" `
        -Automatable $true `
        -AutomationType "API" `
        -Status "ACTIVE"

    $uiTestCase = Get-OrCreateTestCase `
        -ScenarioId $UiScenarioId `
        -TestCaseId $UiTestCaseId `
        -Name "QA user opens the Test Plans workspace" `
        -Preconditions "TestForge frontend is running at http://localhost:5173." `
        -TestData "Test Plans navigation" `
        -ExpectedResult "The Test Plans page loads successfully and displays the Test Plan workspace." `
        -Priority "HIGH" `
        -TestType "END_TO_END" `
        -Automatable $true `
        -AutomationType "UI" `
        -Status "ACTIVE"

    $uiApiTestCase = Get-OrCreateTestCase `
        -ScenarioId $UiApiScenarioId `
        -TestCaseId $UiApiTestCaseId `
        -Name "Dashboard UI reflects backend reporting data" `
        -Preconditions "TestForge frontend and backend are running." `
        -TestData "Dashboard Summary API and Dashboard page" `
        -ExpectedResult "Backend reporting data is available and the Dashboard page presents reporting information." `
        -Priority "HIGH" `
        -TestType "INTEGRATION" `
        -Automatable $true `
        -AutomationType "UI_API" `
        -Status "ACTIVE"

    $manualTestCase = Get-OrCreateTestCase `
        -ScenarioId $ManualScenarioId `
        -TestCaseId $ManualTestCaseId `
        -Name "Reviewer confirms POC release readiness" `
        -Preconditions "Regression testing has completed." `
        -TestData "POC release checklist" `
        -ExpectedResult "Reviewer confirms that the POC is ready for demonstration and handover." `
        -Priority "MEDIUM" `
        -TestType "SANITY" `
        -Automatable $false `
        -AutomationType "MANUAL" `
        -Status "ACTIVE"

    Assert-Equal `
        -Actual $apiTestCase.automationType `
        -Expected "API" `
        -Message "API Test Case automation type"

    Assert-Equal `
        -Actual $uiTestCase.automationType `
        -Expected "UI" `
        -Message "UI Test Case automation type"

    Assert-Equal `
        -Actual $uiApiTestCase.automationType `
        -Expected "UI_API" `
        -Message "UI + API Test Case automation type"

    Assert-Equal `
        -Actual $manualTestCase.automationType `
        -Expected "MANUAL" `
        -Message "Manual Test Case automation type"


    # ========================================================
    # 5. Initial lifecycle state
    # ========================================================

    Write-Section "5. Verify Initial Automation Lifecycle"

    if ($apiTestCase.automationStatus -eq "AUTOMATED") {
        Write-Info "API Test Case is already AUTOMATED from a previous demo run."
    }
    elseif ($apiTestCase.automationStatus -eq "SCRIPT_GENERATED") {
        Write-Info "API Test Case already has a generated script."
    }
    else {
        Assert-Equal `
            -Actual $apiTestCase.automationStatus `
            -Expected "NOT_AUTOMATED" `
            -Message "API Test Case initial lifecycle"
    }

    Assert-Equal `
        -Actual $uiTestCase.automationStatus `
        -Expected "NOT_AUTOMATED" `
        -Message "UI Test Case lifecycle"

    Assert-Equal `
        -Actual $uiApiTestCase.automationStatus `
        -Expected "NOT_AUTOMATED" `
        -Message "UI + API Test Case lifecycle"

    Assert-Equal `
        -Actual $manualTestCase.automationStatus `
        -Expected "NOT_APPLICABLE" `
        -Message "Manual Test Case lifecycle"


    # ========================================================
    # 6. Test Steps
    # ========================================================

    Write-Section "6. Demo Test Steps"

    # API Steps

    $apiStep1 = Get-OrCreateTestStep `
        -TestCaseId $ApiTestCaseId `
        -TestStepId $ApiStep1Id `
        -StepOrder 1 `
        -Action "Send GET request to the Dashboard Summary API" `
        -Target "$BaseUrl/api/dashboard/summary" `
        -InputValue $null `
        -ExpectedResult "The API responds successfully."

    $apiStep2 = Get-OrCreateTestStep `
        -TestCaseId $ApiTestCaseId `
        -TestStepId $ApiStep2Id `
        -StepOrder 2 `
        -Action "Validate the Dashboard Summary HTTP response status" `
        -Target "$BaseUrl/api/dashboard/summary" `
        -InputValue $null `
        -ExpectedResult "HTTP status is 200"


    # UI Steps

    $uiStep1 = Get-OrCreateTestStep `
        -TestCaseId $UiTestCaseId `
        -TestStepId $UiStep1Id `
        -StepOrder 1 `
        -Action "Open the TestForge Test Plans page" `
        -Target "http://localhost:5173/test-plans" `
        -InputValue $null `
        -ExpectedResult "The Test Plans page loads."

    $uiStep2 = Get-OrCreateTestStep `
        -TestCaseId $UiTestCaseId `
        -TestStepId $UiStep2Id `
        -StepOrder 2 `
        -Action "Verify the Test Plans workspace is visible" `
        -Target "Test Plans workspace" `
        -InputValue $null `
        -ExpectedResult "The QA user can view Test Plan information."


    # UI + API Steps

    $uiApiStep1 = Get-OrCreateTestStep `
        -TestCaseId $UiApiTestCaseId `
        -TestStepId $UiApiStep1Id `
        -StepOrder 1 `
        -Action "Retrieve dashboard summary data through the API" `
        -Target "$BaseUrl/api/dashboard/summary" `
        -InputValue $null `
        -ExpectedResult "Dashboard summary data is returned."

    $uiApiStep2 = Get-OrCreateTestStep `
        -TestCaseId $UiApiTestCaseId `
        -TestStepId $UiApiStep2Id `
        -StepOrder 2 `
        -Action "Open the TestForge Dashboard page" `
        -Target "http://localhost:5173/dashboard" `
        -InputValue $null `
        -ExpectedResult "Dashboard reporting information is displayed."


    # Manual Steps

    $manualStep1 = Get-OrCreateTestStep `
        -TestCaseId $ManualTestCaseId `
        -TestStepId $ManualStep1Id `
        -StepOrder 1 `
        -Action "Review the completed POC regression checklist" `
        -Target "POC release checklist" `
        -InputValue $null `
        -ExpectedResult "All required regression items are reviewed."

    $manualStep2 = Get-OrCreateTestStep `
        -TestCaseId $ManualTestCaseId `
        -TestStepId $ManualStep2Id `
        -StepOrder 2 `
        -Action "Confirm release readiness" `
        -Target "POC handover approval" `
        -InputValue $null `
        -ExpectedResult "Reviewer confirms readiness for demo and handover."

    Assert-NotNull `
        -Value $apiStep1.id `
        -Message "API Test Step 1 database ID"

    Assert-NotNull `
        -Value $apiStep2.id `
        -Message "API Test Step 2 database ID"


    # ========================================================
    # 7. Automation Script
    # ========================================================

    Write-Section "7. Flagship API Automation Script"

    $apiTestCaseCurrent = Invoke-TestForgeGet `
        -Path "/api/test-cases/business/$ApiTestCaseId"

    Assert-NotNull `
        -Value $apiTestCaseCurrent.id `
        -Message "API Test Case database ID is available"

    $automationScript = Get-OrCreateAutomationScript `
        -TestCaseDatabaseId $apiTestCaseCurrent.id

    Assert-NotNull `
        -Value $automationScript.id `
        -Message "Automation Script database ID is available"

    Assert-Equal `
        -Actual $automationScript.automationScriptId `
        -Expected $AutomationScriptId `
        -Message "Automation Script business ID"

    Write-Info "Automation Script DB ID: $($automationScript.id)"


    # ========================================================
    # 8. Automation Steps
    # ========================================================

    Write-Section "8. Flagship Automation Steps"

    $apiStep1Current = Invoke-TestForgeGet `
        -Path "/api/test-steps/business/$ApiStep1Id"

    $apiStep2Current = Invoke-TestForgeGet `
        -Path "/api/test-steps/business/$ApiStep2Id"

    Assert-NotNull `
        -Value $apiStep1Current.id `
        -Message "Source Test Step 1 database ID"

    Assert-NotNull `
        -Value $apiStep2Current.id `
        -Message "Source Test Step 2 database ID"

    $automationStep1 = Get-OrCreateAutomationStep `
        -AutomationScriptDatabaseId $automationScript.id `
        -AutomationStepId $AutomationStep1Id `
        -SourceTestStepId $apiStep1Current.id `
        -StepOrder 1 `
        -ActionType "API_GET" `
        -Target "$BaseUrl/api/dashboard/summary" `
        -ExpectedValue $null

    $automationStep2 = Get-OrCreateAutomationStep `
        -AutomationScriptDatabaseId $automationScript.id `
        -AutomationStepId $AutomationStep2Id `
        -SourceTestStepId $apiStep2Current.id `
        -StepOrder 2 `
        -ActionType "ASSERT_API_STATUS" `
        -Target $null `
        -ExpectedValue "200"

    $automationSteps = Invoke-TestForgeGet `
        -Path "/api/automation-scripts/$($automationScript.id)/steps"

    $automationSteps = @($automationSteps)

    Assert-Equal `
        -Actual $automationSteps.Count `
        -Expected 2 `
        -Message "Demo Automation Script contains two steps"


    # ========================================================
    # 9. Generate
    # ========================================================

    Write-Section "9. Generate Playwright + Java 17 Script"

    $generated = Invoke-TestForgePostNoBody `
        -Path "/api/automation-scripts/$($automationScript.id)/generate"

    Assert-NotEmpty `
        -Value $generated.source `
        -Message "Generated source is available"

    Assert-NotEmpty `
        -Value $generated.className `
        -Message "Generated Java class name is available"

    Assert-Equal `
        -Actual $generated.framework `
        -Expected "Playwright" `
        -Message "Generated framework"

    Assert-Equal `
        -Actual $generated.language `
        -Expected "Java 17" `
        -Message "Generated language"

    Assert-Equal `
        -Actual $generated.generatedStepCount `
        -Expected 2 `
        -Message "Generated step count"

    Assert-Equal `
        -Actual $generated.stale `
        -Expected $false `
        -Message "Generated script is fresh"

    Write-Info "Generated class: $($generated.className)"


    # ========================================================
    # 10. Verify generated lifecycle
    # ========================================================

    Write-Section "10. Verify Lifecycle After Generation"

    $apiTestCaseAfterGeneration = Invoke-TestForgeGet `
        -Path "/api/test-cases/business/$ApiTestCaseId"

    Assert-Equal `
        -Actual $apiTestCaseAfterGeneration.automationStatus `
        -Expected "SCRIPT_GENERATED" `
        -Message "API Test Case lifecycle after generation"


    # ========================================================
    # 11. Execute
    # ========================================================

    if ($SkipExecution) {

        Write-Section "11. Execute Flagship Automation"

        Write-Warn "Execution skipped because -SkipExecution was supplied."
    }
    else {

        Write-Section "11. Execute Flagship Automation"

        Write-Info "Executing persisted generated Java 17 source."
        Write-Info "This demo automation is API-only and should not require Chromium."

        $execution = Invoke-TestForgePostNoBody `
            -Path "/api/automation-scripts/$($automationScript.id)/execute"

        Assert-NotNull `
            -Value $execution.id `
            -Message "Execution database ID returned"

        Assert-NotEmpty `
            -Value $execution.executionId `
            -Message "Execution business ID returned"

        Write-Info "Execution DB ID: $($execution.id)"
        Write-Info "Execution ID: $($execution.executionId)"
        Write-Info "Execution status: $($execution.status)"
        Write-Info "Execution duration: $($execution.durationMs) ms"

        if ($execution.status -ne "PASSED") {

            Write-Host ""
            Write-Host "Execution error:" -ForegroundColor Yellow

            if (-not [string]::IsNullOrWhiteSpace($execution.errorMessage)) {
                Write-Host $execution.errorMessage
            }
            else {
                Write-Host "No execution error message returned."
            }

            Write-Host ""
            Write-Host "Execution log:" -ForegroundColor Yellow

            if (-not [string]::IsNullOrWhiteSpace($execution.logOutput)) {
                Write-Host $execution.logOutput
            }
            else {
                Write-Host "No execution log returned."
            }

            Write-Host ""
        }

        Assert-Equal `
            -Actual $execution.status `
            -Expected "PASSED" `
            -Message "Demo automation execution"

        Assert-Equal `
            -Actual $execution.exitCode `
            -Expected 0 `
            -Message "Demo execution process exit code"

        Assert-NotEmpty `
            -Value $execution.logOutput `
            -Message "Demo execution log is available"


        # ====================================================
        # 12. Result
        # ====================================================

        Write-Section "12. Verify Demo Result"

        $result = Invoke-TestForgeGet `
            -Path "/api/automation-results/$($execution.executionId)"

        Assert-Equal `
            -Actual $result.executionId `
            -Expected $execution.executionId `
            -Message "Result references demo execution"

        Assert-Equal `
            -Actual $result.status `
            -Expected "PASSED" `
            -Message "Demo Result status"

        Assert-Equal `
            -Actual $result.successful `
            -Expected $true `
            -Message "Demo Result successful flag"

        Assert-Equal `
            -Actual $result.testCaseBusinessId `
            -Expected $ApiTestCaseId `
            -Message "Demo Result Test Case"

        Assert-NotEmpty `
            -Value $result.logOutput `
            -Message "Demo Result execution log"


        # ====================================================
        # 13. Final lifecycle
        # ====================================================

        Write-Section "13. Verify Final API Test Case Lifecycle"

        $apiTestCaseFinal = Invoke-TestForgeGet `
            -Path "/api/test-cases/business/$ApiTestCaseId"

        Assert-Equal `
            -Actual $apiTestCaseFinal.automationStatus `
            -Expected "AUTOMATED" `
            -Message "Flagship API Test Case lifecycle"
    }


    # ========================================================
    # 14. Automation Eligibility
    # ========================================================

    Write-Section "14. Verify Automation Selection Data"

    $eligibleCases = Invoke-TestForgeGet `
        -Path "/api/test-cases/automation-eligible"

    $eligibleCases = @($eligibleCases)

    $apiEligible = $eligibleCases |
        Where-Object {
            $_.testCaseId -eq $ApiTestCaseId
        } |
        Select-Object -First 1

    $uiEligible = $eligibleCases |
        Where-Object {
            $_.testCaseId -eq $UiTestCaseId
        } |
        Select-Object -First 1

    $uiApiEligible = $eligibleCases |
        Where-Object {
            $_.testCaseId -eq $UiApiTestCaseId
        } |
        Select-Object -First 1

    Assert-NotNull `
        -Value $apiEligible `
        -Message "API Test Case appears in automation selection"

    Assert-NotNull `
        -Value $uiEligible `
        -Message "UI Test Case appears in automation selection"

    Assert-NotNull `
        -Value $uiApiEligible `
        -Message "UI + API Test Case appears in automation selection"


    # ========================================================
    # 15. Dashboard
    # ========================================================

    Write-Section "15. Demo Dashboard Verification"

    $summary = Invoke-TestForgeGet `
        -Path "/api/dashboard/summary"

    $executionStatus = Invoke-TestForgeGet `
        -Path "/api/dashboard/execution-status"

    $automationTypes = Invoke-TestForgeGet `
        -Path "/api/dashboard/automation-types"

    $recentResults = Invoke-TestForgeGet `
        -Path "/api/dashboard/recent-results"

    $recentResults = @($recentResults)

    Assert-NotNull `
        -Value $summary `
        -Message "Dashboard summary is available"

    Assert-NotNull `
        -Value $executionStatus `
        -Message "Dashboard execution health is available"

    Assert-NotNull `
        -Value $automationTypes `
        -Message "Dashboard automation type summary is available"

    if ($automationTypes.api -lt 1) {
        throw "Dashboard should contain at least one API automation Test Case."
    }

    Write-Pass "Dashboard contains API automation coverage"

    if ($automationTypes.ui -lt 1) {
        throw "Dashboard should contain at least one UI automation Test Case."
    }

    Write-Pass "Dashboard contains UI automation coverage"

    if ($automationTypes.uiApi -lt 1) {
        throw "Dashboard should contain at least one UI + API automation Test Case."
    }

    Write-Pass "Dashboard contains UI + API automation coverage"

    if (-not $SkipExecution) {

        if ($executionStatus.passed -lt 1) {
            throw "Dashboard should contain at least one PASSED execution."
        }

        Write-Pass "Dashboard contains at least one PASSED execution"

        $recentDemoExecution = $recentResults |
            Where-Object {
                $_.testCaseBusinessId -eq $ApiTestCaseId
            } |
            Select-Object -First 1

        if ($null -ne $recentDemoExecution) {
            Write-Pass "Flagship demo execution appears in Dashboard recent results"
        }
        else {
            Write-Warn "Flagship execution is not inside the latest five results. This is acceptable when other executions are newer."
        }
    }


    # ========================================================
    # 16. Verify persisted generated source
    # ========================================================

    Write-Section "16. Verify Persisted Generated Script"

    $persistedGenerated = Invoke-TestForgeGet `
        -Path "/api/automation-scripts/$($automationScript.id)/generated-script"

    Assert-NotEmpty `
        -Value $persistedGenerated.source `
        -Message "Persisted generated source is available"

    Assert-Equal `
        -Actual $persistedGenerated.framework `
        -Expected "Playwright" `
        -Message "Persisted generated framework"

    Assert-Equal `
        -Actual $persistedGenerated.language `
        -Expected "Java 17" `
        -Message "Persisted generated language"

    Assert-Equal `
        -Actual $persistedGenerated.generatedStepCount `
        -Expected 2 `
        -Message "Persisted generated step count"

    Assert-Equal `
        -Actual $persistedGenerated.stale `
        -Expected $false `
        -Message "Persisted generated script is not stale"


    # ========================================================
    # Complete
    # ========================================================

    Write-Section "TASK 36.17 DEMO DATA READY"

    Write-Pass "Controlled Test Plan is ready"
    Write-Pass "Automated Requirement is ready"
    Write-Pass "Manual Requirement is ready"
    Write-Pass "API Scenario is ready"
    Write-Pass "UI Scenario is ready"
    Write-Pass "UI + API Scenario is ready"
    Write-Pass "Manual Scenario is ready"
    Write-Pass "API Test Case is ready"
    Write-Pass "UI Test Case is ready"
    Write-Pass "UI + API Test Case is ready"
    Write-Pass "Manual Test Case is ready"
    Write-Pass "Demo Test Steps are ready"
    Write-Pass "Demo Automation Script is ready"
    Write-Pass "Playwright + Java 17 generated source is ready"

    if (-not $SkipExecution) {
        Write-Pass "Flagship demo automation executed successfully"
        Write-Pass "PASSED demo Result is available"
        Write-Pass "Flagship API Test Case reached AUTOMATED"
    }

    Write-Host ""
    Write-Host "Demo identifiers:" -ForegroundColor Cyan
    Write-Host "Test Plan:       $TestPlanId"
    Write-Host "Requirement:     $AutomatedRequirementId"
    Write-Host "API Scenario:    $ApiScenarioId"
    Write-Host "API Test Case:   $ApiTestCaseId"
    Write-Host "UI Test Case:    $UiTestCaseId"
    Write-Host "UI + API Case:   $UiApiTestCaseId"
    Write-Host "Manual Case:     $ManualTestCaseId"
    Write-Host "Automation:      $AutomationScriptId"

    if (-not $SkipExecution) {
        Write-Host "Execution:       $($execution.executionId)"
    }

    Write-Host ""
    Write-Host "Current Dashboard:" -ForegroundColor Cyan
    Write-Host "Total Test Cases:       $($summary.totalTestCases)"
    Write-Host "Automatable:            $($summary.automatableTestCases)"
    Write-Host "Automated:              $($summary.automatedTestCases)"
    Write-Host "Automation Coverage:    $($summary.automationCoveragePercentage)%"
    Write-Host "Automation Scripts:     $($summary.totalAutomationScripts)"
    Write-Host "Generated Scripts:      $($summary.generatedScripts)"
    Write-Host "PASSED Executions:      $($executionStatus.passed)"
    Write-Host "FAILED Executions:      $($executionStatus.failed)"
    Write-Host "Pass Rate:              $($executionStatus.passRatePercentage)%"
    Write-Host "API Test Cases:         $($automationTypes.api)"
    Write-Host "UI Test Cases:          $($automationTypes.ui)"
    Write-Host "UI + API Test Cases:    $($automationTypes.uiApi)"

    Write-Host ""
    Write-Host "Demo pages:" -ForegroundColor Cyan
    Write-Host "http://localhost:5173/dashboard"
    Write-Host "http://localhost:5173/test-plans"
    Write-Host "http://localhost:5173/automation"
    Write-Host "http://localhost:5173/results"

    Write-Host ""
    Write-Host "Recommended demo flow:" -ForegroundColor Cyan
    Write-Host "Dashboard"
    Write-Host "  -> Test Plan"
    Write-Host "  -> Requirement"
    Write-Host "  -> Scenario"
    Write-Host "  -> Test Case"
    Write-Host "  -> Test Steps"
    Write-Host "  -> Automation Builder"
    Write-Host "  -> Script Generation"
    Write-Host "  -> Execution"
    Write-Host "  -> Results"
    Write-Host "  -> Dashboard"

    Write-Host ""
    Write-Host "Task 36.17 completed successfully." -ForegroundColor Green
}
catch {

    Write-Section "TASK 36.17 DEMO SETUP FAILED"

    $errorBody = Get-HttpErrorBody -ErrorRecord $_

    Write-Fail $_.Exception.Message

    if (-not [string]::IsNullOrWhiteSpace($errorBody)) {

        if ($errorBody -ne $_.Exception.Message) {
            Write-Host ""
            Write-Host "Backend response:" -ForegroundColor Yellow
            Write-Host $errorBody
        }
    }

    Write-Host ""
    Write-Host "Demo identifiers:" -ForegroundColor Yellow
    Write-Host "Test Plan:       $TestPlanId"
    Write-Host "Requirement:     $AutomatedRequirementId"
    Write-Host "API Scenario:    $ApiScenarioId"
    Write-Host "API Test Case:   $ApiTestCaseId"
    Write-Host "Automation:      $AutomationScriptId"

    exit 1
}