import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { deletionImpactApi } from '../../api/deletionImpactApi';

vi.mock('../../api/deletionImpactApi', () => ({ deletionImpactApi: { get: vi.fn() } }));

it('shows owned cleanup and preserved history from the backend preview', async () => {
  vi.mocked(deletionImpactApi.get).mockResolvedValue({ resourceType: 'TEST_CASE', resourceId: 1, businessId: 'TC-1',
    owned: { 'Test Cases': 1, 'Test Steps': 2, 'Automation Actions': 3 }, preserved: { 'Historical executions': 4 }, blockers: [], canDelete: true });
  const confirm = vi.fn(); const user = userEvent.setup();
  render(<MemoryRouter><DeleteConfirmationDialog open title="Delete Test Case?" entityName="Login" resourceType="TEST_CASE" resourceId={1} onClose={vi.fn()} onConfirm={confirm} /></MemoryRouter>);
  expect(await screen.findByText('3 Automation Actions')).toBeInTheDocument();
  expect(screen.getByText('4 Historical executions')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Delete test case' }));
  expect(confirm).toHaveBeenCalledOnce();
});

it('turns external dependencies into an actionable blocker', async () => {
  vi.mocked(deletionImpactApi.get).mockResolvedValue({ resourceType: 'SCENARIO', resourceId: 2, businessId: 'SCN-2', owned: {}, preserved: {}, blockers: ['Used by active Test Suite: Smoke'], canDelete: false });
  render(<MemoryRouter><DeleteConfirmationDialog open title="Delete Scenario?" entityName="Login" resourceType="SCENARIO" resourceId={2} blockerActionPath="/automation/management" onClose={vi.fn()} onConfirm={vi.fn()} /></MemoryRouter>);
  expect(await screen.findByText('Used by active Test Suite: Smoke')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Manage Test Suites' })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Delete scenario' })).toBeDisabled());
});
