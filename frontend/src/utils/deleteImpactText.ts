import type { AuthoringDeleteImpact } from '../types/deleteImpact';

function part(count: number, singular: string, plural = `${singular}s`): string | null {
  if (count <= 0) return null;
  return `${count} ${count === 1 ? singular : plural}`;
}

export function buildDeleteImpactDescription(
  impact: AuthoringDeleteImpact | null,
  fallback: string,
): string {
  if (!impact) return fallback;

  const affected = [
    part(impact.scenarioCount, 'Test Scenario'),
    part(impact.testCaseCount, 'Test Case'),
    part(impact.testStepCount, 'Test Step'),
    part(impact.automationScriptCount, 'Automation Script'),
    part(impact.automationStepCount, 'Automation Step'),
    part(impact.testSetMembershipCount, 'Test Set membership', 'Test Set memberships'),
  ].filter(Boolean);

  const currentText = affected.length > 0
    ? `Current authoring impact: ${affected.join(', ')}.`
    : 'No descendant authoring records were found.';

  const historyText = impact.historicalExecutionCount > 0
    ? ` Historical execution history: ${impact.historicalExecutionCount} execution${impact.historicalExecutionCount === 1 ? '' : 's'} recorded. These historical executions are preserved by this cleanup preview and are not counted as records to delete.`
    : ' No historical executions were found.';

  return `${currentText}${historyText} Review the impact before confirming. This task adds the preview only; existing backend deletion rules still apply.`;
}
