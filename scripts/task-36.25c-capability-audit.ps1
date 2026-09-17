param(
    [string]$ProjectRoot = "."
)

$ErrorActionPreference = "Stop"

function Resolve-ExistingPath {
    param([string[]]$Candidates)

    foreach ($candidate in $Candidates) {
        $fullPath = Join-Path $ProjectRoot $candidate
        if (Test-Path $fullPath) {
            return (Resolve-Path $fullPath).Path
        }
    }

    throw "Could not find any expected path: $($Candidates -join ', ')"
}

$enumPath = Resolve-ExistingPath @(
    "backend/testforge-backend/src/main/java/com/testforge/testforge_backend/automation/model/AutomationActionType.java",
    "src/main/java/com/testforge/testforge_backend/automation/model/AutomationActionType.java"
)

$validatorPath = Resolve-ExistingPath @(
    "backend/testforge-backend/src/main/java/com/testforge/testforge_backend/automation/validation/AutomationActionValidator.java",
    "src/main/java/com/testforge/testforge_backend/automation/validation/AutomationActionValidator.java"
)

$generatorPath = Resolve-ExistingPath @(
    "backend/testforge-backend/src/main/java/com/testforge/testforge_backend/automation/generation/PlaywrightJavaGenerator.java",
    "src/main/java/com/testforge/testforge_backend/automation/generation/PlaywrightJavaGenerator.java"
)

$dialogPath = Resolve-ExistingPath @(
    "src/components/automation/AutomationStepDialog.tsx",
    "frontend/src/components/automation/AutomationStepDialog.tsx"
)

$enumText = Get-Content $enumPath -Raw
$validatorText = Get-Content $validatorPath -Raw
$generatorText = Get-Content $generatorPath -Raw
$dialogText = Get-Content $dialogPath -Raw

$enumBody = [regex]::Match(
    $enumText,
    'enum\s+AutomationActionType\s*\{(?<body>[\s\S]*?)\}'
).Groups['body'].Value

$enumBody = [regex]::Replace(
    $enumBody,
    '/\*[\s\S]*?\*/|//.*',
    ''
)

$actions = [regex]::Matches(
    $enumBody,
    '\b[A-Z][A-Z0-9_]+\b'
) | ForEach-Object { $_.Value } | Sort-Object -Unique

if ($actions.Count -eq 0) {
    throw "No AutomationActionType values were found."
}

$failures = @()

Write-Host "Task 36.25C capability audit" -ForegroundColor Cyan
Write-Host "Actions declared: $($actions.Count)"
Write-Host ""

foreach ($action in $actions) {
    $escapedAction = [regex]::Escape($action)

    # Avoid fragile quote escaping in Windows PowerShell 5.1.
    # The frontend action values are string literals, so support either
    # single-quoted or double-quoted TypeScript values.
    $ui =
        $dialogText.Contains("'$action'") -or
        $dialogText.Contains('"' + $action + '"')

    $wordPattern = '\b' + $escapedAction + '\b'

    $validator = [regex]::IsMatch(
        $validatorText,
        $wordPattern
    )

    $generator = [regex]::IsMatch(
        $generatorText,
        $wordPattern
    )

    $status = if ($ui -and $validator -and $generator) { "PASS" } else { "FAIL" }

    Write-Host ("{0,-34} UI={1,-5} Validator={2,-5} Generator={3,-5} {4}" -f `
        $action, $ui, $validator, $generator, $status)

    if ($status -eq "FAIL") {
        $failures += $action
    }
}

Write-Host ""

if ($failures.Count -gt 0) {
    Write-Host "Capability audit FAILED." -ForegroundColor Red
    Write-Host "Missing coverage: $($failures -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "Capability audit PASSED." -ForegroundColor Green
exit 0
