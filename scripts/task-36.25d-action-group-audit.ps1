param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'

function Resolve-RequiredFile {
    param(
        [Parameter(Mandatory = $true)][string[]]$Candidates,
        [Parameter(Mandatory = $true)][string]$Label
    )

    foreach ($candidate in $Candidates) {
        $path = Join-Path $ProjectRoot $candidate
        if (Test-Path $path) {
            return (Resolve-Path $path).Path
        }
    }

    throw "$Label was not found under $ProjectRoot"
}

$enumFile = Resolve-RequiredFile -Candidates @(
    'backend\testforge-backend\src\main\java\com\testforge\testforge_backend\automation\model\AutomationActionType.java',
    'src\main\java\com\testforge\testforge_backend\automation\model\AutomationActionType.java'
) -Label 'AutomationActionType.java'

$dialogFile = Resolve-RequiredFile -Candidates @(
    'src\components\automation\AutomationStepDialog.tsx',
    'frontend\src\components\automation\AutomationStepDialog.tsx'
) -Label 'AutomationStepDialog.tsx'

$enumText = Get-Content -Raw $enumFile
$dialogText = Get-Content -Raw $dialogFile

$enumBodyMatch = [regex]::Match(
    $enumText,
    'enum\s+AutomationActionType\s*\{(?<body>[\s\S]*?)\}',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)

if (-not $enumBodyMatch.Success) {
    throw 'Unable to parse AutomationActionType enum.'
}

$enumBody = $enumBodyMatch.Groups['body'].Value

# Remove Java block and line comments before parsing constants.
# This prevents comment labels such as "UI" and "API" from being
# mistaken for AutomationActionType enum values.
$enumBodyWithoutBlockComments = [regex]::Replace(
    $enumBody,
    '/\*[\s\S]*?\*/',
    ''
)

$enumBodyWithoutComments = [regex]::Replace(
    $enumBodyWithoutBlockComments,
    '//.*$',
    '',
    [System.Text.RegularExpressions.RegexOptions]::Multiline
)

$actions = $enumBodyWithoutComments.Split(',') |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -match '^[A-Z][A-Z0-9_]*$' } |
    Select-Object -Unique

if (-not $actions -or $actions.Count -eq 0) {
    throw 'No automation actions were discovered.'
}

$failures = @()

Write-Host ''
Write-Host 'Task 36.25D action-group audit' -ForegroundColor Cyan
Write-Host "Automation actions declared: $($actions.Count)"
Write-Host ''

foreach ($action in $actions) {
    $literalSingle = "'$action'"
    $literalDouble = '"' + $action + '"'

    $singleCount = ([regex]::Matches(
        $dialogText,
        [regex]::Escape($literalSingle)
    )).Count

    $doubleCount = ([regex]::Matches(
        $dialogText,
        [regex]::Escape($literalDouble)
    )).Count

    $count = $singleCount + $doubleCount

    # Actions may appear in validation arrays and helper functions as well.
    # For group membership, inspect only the ACTION_GROUPS block.
    $groupMatch = [regex]::Match(
        $dialogText,
        'const\s+ACTION_GROUPS[\s\S]*?const\s+UI_ACTION_TYPES',
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    if (-not $groupMatch.Success) {
        throw 'Unable to find ACTION_GROUPS in AutomationStepDialog.tsx.'
    }

    $groupText = $groupMatch.Value
    $groupCount = ([regex]::Matches(
        $groupText,
        [regex]::Escape($literalSingle)
    )).Count + ([regex]::Matches(
        $groupText,
        [regex]::Escape($literalDouble)
    )).Count

    $status = if ($groupCount -eq 1) { 'PASS' } else { 'FAIL' }
    $color = if ($groupCount -eq 1) { 'Green' } else { 'Red' }

    Write-Host ("{0,-36} GroupCount={1,-3} {2}" -f $action, $groupCount, $status) -ForegroundColor $color

    if ($groupCount -ne 1) {
        $failures += "$action(groupCount=$groupCount)"
    }
}

$expectedGroups = @(
    'Browser',
    'Interaction',
    'Wait',
    'Assertions',
    'Frames / Dialog',
    'Evidence',
    'API Requests',
    'API Assertions'
)

foreach ($group in $expectedGroups) {
    if (-not $dialogText.Contains("label: '$group'")) {
        $failures += "Missing group: $group"
    }
}

Write-Host ''

if ($failures.Count -gt 0) {
    Write-Host 'Action-group audit FAILED.' -ForegroundColor Red
    Write-Host ("Problems: " + ($failures -join ', ')) -ForegroundColor Red
    exit 1
}

Write-Host 'Action-group audit PASSED.' -ForegroundColor Green
exit 0
