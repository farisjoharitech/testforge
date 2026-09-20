# Safe-deletion audit

Audited the running PostgreSQL database (26 foreign keys, Flyway V26), all migrations,
JPA associations, repositories, and DELETE endpoints. V27 implements the original audit;
V28 corrects the Suite history relationship described below.
Existing work in the workspace was preserved.

## Deletion decisions

Each row lists all direct inbound FKs. Expected conflicts are checked by services
before removal and use the existing structured API error with HTTP 409.

| Source entity | Direct references | Behavior |
| --- | --- | --- |
| Project | Test Plans, Modules, Test Suites, Suite Runs | Block each dependency, including the independent Suite Run project FK. |
| Test Plan | Modules, Test Sets | Block. Existing guards retained and regression tested. |
| Module | Requirements | Block. Existing guard retained and regression tested. |
| Requirement | Scenarios | Block; removed destructive hierarchy cleanup. |
| Scenario | Test Cases, Suite memberships | Block; removed destructive hierarchy cleanup. Automation belongs to descendant Test Cases, so the child guard protects it. |
| Test Case | Test Steps, Automation Scripts, Test Set memberships, Automation Executions | Confirmed deletion explicitly removes owned Automation Actions, Automation Scripts and Test Steps in one transaction. Block Test Set membership, external automation mappings and in-progress executions/Suite Runs. Scenario membership in Test Suites survives; future readiness uses remaining Cases. Completed executions and Suite snapshots survive. |
| Test Step | Automation Steps | Block mapped automation; never silently remove it. Unmapped steps may be removed. |
| Test Suite | Scenario memberships, Suite Runs | Delete the live configuration and owned memberships. V28 makes the run link nullable with SET NULL; all runs and hierarchical snapshots survive and remain accessible under their Project. Scenarios survive. |
| Test Set | Test Set items | Existing explicit collection removal deletes only owned memberships. Cases survive. Test Sets remain supported and are not obsolete. |
| Automation Step | None | Existing explicit automation-removal endpoint may delete the configuration. Source Test Steps and snapshots survive. |
| Automation Script | Automation Steps, Automation Executions | No independent delete endpoint. Confirmed Test Case deletion removes its owned script after its actions; historical execution links become null using V19. |
| Automation Run | Automation Executions, Suite Runs | No delete endpoint/service operation. History remains protected. |
| Automation Execution | Suite Test Case Results | No delete endpoint/service operation. Result link has existing SET NULL behavior. |
| Suite Run | Scenario Results | No delete endpoint/service operation. Restrictive FK retained. |
| Scenario Result | Test Case Results | No delete endpoint/service operation. Restrictive FK retained. |
| Test Case Result | Test Step Results | No delete endpoint/service operation. Restrictive FK retained. |
| Test Step Result | None | No delete endpoint/service operation. |

Suite result source IDs are scalar snapshot metadata without FKs to source design.
Reporting reads persisted snapshot fields. Automation results likewise fall back
to V19 snapshot fields when their source reference is null. No source deletion
cascades into history, and independent completed snapshots do not prevent deletion.
Metadata and business-ID sequences have no additional FK relationships or deletion endpoints.

Suite Runs capture their original Suite ID/name, Project business ID/name, and execution
configuration when created. V28 backfills older runs from the metadata available at
migration time; edits made before snapshots existed cannot be reconstructed. Reporting
uses snapshot IDs/names for summaries, history and details, including deleted Suites.
The independent mandatory Project reference is retained. No frontend contract changes
are required.

## Schema findings

- Requirement → Test Plan was already removed by applied V26 after the Module migration.
- Test Case eligibility had already been migrated to Scenario by V20, but the unused
  duplicate column and writes remained. V27 drops that column; Scenario eligibility
  remains authoritative, including later edits. Obsolete Java writes were removed.
- V27 replaces the destructive source-side cascades for Automation Step → Test Step,
  Test Set → Test Plan, and Test Set item → Test Case with restrictive FKs.
- Owned Test Set membership cleanup and historical SET NULL constraints remain.
- No existing migration was edited; no broad cascade or exception-driven deletion was added.

## Files changed for this task

Paths below are relative to `backend/testforge-backend/src` unless otherwise stated.

- `main/java/com/testforge/testforge_backend/service/`: `ProjectService.java`,
  `RequirementService.java`, `TestScenarioService.java`, `TestCaseService.java`, `TestStepService.java`.
- `main/java/com/testforge/testforge_backend/cleanup/service/AuthoringCascadeDeleteService.java` removed.
- `main/java/com/testforge/testforge_backend/domain/TestCase.java`.
- `main/java/com/testforge/testforge_backend/exception/`: `ResourceInUseException.java`, `GlobalExceptionHandler.java`.
- `main/java/com/testforge/testforge_backend/repository/`: `AutomationExecutionRepository.java`, `AutomationStepRepository.java`.
- `main/java/com/testforge/testforge_backend/testsuite/`: `repository/TestSuiteRepository.java`,
  `repository/SuiteRunRepository.java`, `service/TestSuiteService.java`.
- `main/resources/db/migration/V27__enforce_safe_authoring_deletion.sql`.
- `test/java/com/testforge/testforge_backend/service/`: `SafeDeletionIntegrationTest.java`,
  `TestStepServiceTest.java`, `TestCaseAutomationServiceTest.java`, `TestScenarioAutomationServiceTest.java`.
- Test fixtures updated solely to remove obsolete Test Case eligibility writes:
  `automation/integration/AutomationIntegrationTest.java`,
  `automation/service/AutomationScenarioRunServiceTest.java`,
  `automation/service/AutomationTestPlanRunServiceTest.java`,
  `automation/service/AutomationTestSetRunServiceTest.java`,
  `projectmonitoring/service/ProjectMonitoringServiceTest.java`,
  `monitoringdrilldown/service/MonitoringDrilldownServiceTest.java`,
  `testset/service/TestSetServiceTest.java` (under `test/java/com/testforge/testforge_backend/`).
- Frontend: `frontend/src/pages/projects/ProjectDetailsPage.tsx`,
  `frontend/src/pages/test-plans/TestPlanDetailsPage.tsx`,
  `frontend/src/pages/requirements/RequirementDetailsPage.tsx`,
  `frontend/src/pages/scenarios/ScenarioDetailsPage.tsx`,
  `frontend/src/pages/test-cases/TestCaseDetailsPage.tsx`, `frontend/src/utils/deleteImpactText.ts`.
- This audit: `docs/safe-deletion-audit.md`.

## Original audit validation

- `./mvnw clean test`: 229 tests, zero failures/errors/skips. Includes 18 new
  PostgreSQL integration cases exercising real services, controllers, structured
  409 responses, restrictive dependencies, allowed deletes with JPA flush, owned
  memberships and snapshot preservation; fixtures roll back. Also added the mapped
  Test Step unit regression and replaced its former cascading-deletion expectation.
- `npm run build` (Windows `npm.cmd`): passed; existing bundle-size advisory only.
- Both commands required sandbox escalation for local tool/cache access. No blockers.
- No commit.

## Suite history correction (V28)

Changed only the Suite Run entity/repository, Suite deletion/persistence/reporting
services, V28 migration, related reporting/deletion tests, and this audit.
The former Suite history blocking test now verifies deletion preserves multiple
runs, configuration/name snapshots and the full result hierarchy, with readable
Project Reporting summaries, history and details. A transactional migration test
also verifies backfill and deletion against actual V24/V25/V28 SQL.

`./mvnw clean test`: 230 tests passed, zero failures/errors/skips. Frontend unchanged;
no frontend build run for this correction. No blockers or commit.
