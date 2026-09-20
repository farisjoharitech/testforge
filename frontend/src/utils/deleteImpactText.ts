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
    part(impact.testSuiteMembershipCount, 'Test Suite membership', 'Test Suite memberships'),
  ].filter(Boolean);

  const currentText = affected.length > 0
    ? `Deletion is blocked by: ${affected.join(', ')}.`
    : 'No descendant test design or automation records were found.';

  const historyText = impact.historicalExecutionCount > 0
    ? ` Historical execution history: ${impact.historicalExecutionCount} execution${impact.historicalExecutionCount === 1 ? '' : 's'} recorded. Completed historical snapshots are preserved.`
    : ' No historical executions were found.';

  return `${currentText}${historyText} Test design, automation, and collection dependencies must be removed separately before deletion.`;
}
