import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import DeleteTestCaseDialog from './DeleteTestCaseDialog';

const impact = {
  entityType: 'TEST_CASE' as const, entityId: 1, businessId: 'TC-1', scenarioCount: 0, testCaseCount: 0,
  testStepCount: 2, automationScriptCount: 1, automationStepCount: 2, testSuiteMembershipCount: 0,
  historicalExecutionCount: 1, historicalExecutionsPreserved: true, blockingDependencies: [],
};

it('separates active cleanup from preserved history and enables confirmed deletion', async () => {
  const confirm = vi.fn(); const user = userEvent.setup();
  render(<DeleteTestCaseDialog open name="Dashboard summary API returns HTTP 200" impact={impact}
    deleting={false} error={null} onClose={vi.fn()} onConfirm={confirm} onRetry={vi.fn()} />);
  expect(screen.getByText('WILL BE DELETED')).toBeInTheDocument();
  expect(screen.getByText('2 Test Steps')).toBeInTheDocument();
  expect(screen.getByText('1 Automation Script')).toBeInTheDocument();
  expect(screen.getByText('2 Automation Actions')).toBeInTheDocument();
  expect(screen.getByText(/1 completed historical execution will be preserved/)).toBeInTheDocument();
  expect(screen.queryByText('BLOCKING DEPENDENCIES')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Delete Test Case' }));
  expect(confirm).toHaveBeenCalledOnce();
});

it('shows genuine blockers and disables deletion', () => {
  render(<DeleteTestCaseDialog open name="Case" impact={{ ...impact, blockingDependencies: ['An automation execution is running.'] }}
    deleting={false} error={null} onClose={vi.fn()} onConfirm={vi.fn()} onRetry={vi.fn()} />);
  expect(screen.getByText('BLOCKING DEPENDENCIES')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Delete Test Case' })).toBeDisabled();
});

it('does not allow deletion when dependency preview fails', async () => {
  const retry = vi.fn(); const user = userEvent.setup();
  render(<DeleteTestCaseDialog open name="Case" impact={null} deleting={false} error="Preview failed"
    onClose={vi.fn()} onConfirm={vi.fn()} onRetry={retry} />);
  expect(screen.getByRole('button', { name: 'Delete Test Case' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Retry dependency preview' }));
  expect(retry).toHaveBeenCalledOnce();
});
