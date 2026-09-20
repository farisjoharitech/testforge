import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateTestScenarioDialog from './CreateTestScenarioDialog';
import EditTestScenarioDialog from './EditTestScenarioDialog';
import CreateTestCaseDialog from '../test-cases/CreateTestCaseDialog';
import { testScenarioApi } from '../../api/testScenarioApi';

vi.mock('../../api/testScenarioApi', () => ({
  testScenarioApi: {
    createTestScenario: vi.fn(),
    updateTestScenario: vi.fn(),
  },
}));

vi.mock('../../api/testCaseApi', () => ({
  testCaseApi: {
    createTestCase: vi.fn(),
  },
}));

describe('Scenario automation eligibility forms', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits the selected automation flag when creating a Scenario', async () => {
    vi.mocked(testScenarioApi.createTestScenario).mockResolvedValue({
      id: 1,
      scenarioId: 'SCN-1',
      requirementId: 1,
      requirementBusinessId: 'REQ-1',
      description: 'Login',
      testType: 'FUNCTIONAL',
      automatable: true,
      priority: 'MEDIUM',
      status: 'DRAFT',
      createdAt: '',
      updatedAt: '',
    });
    const user = userEvent.setup();
    render(
      <CreateTestScenarioDialog
        open
        requirementId="REQ-1"
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Scenario Description'), 'Login');
    await user.click(screen.getByRole('checkbox', { name: 'Automation Eligible' }));
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    expect(testScenarioApi.createTestScenario).toHaveBeenCalledWith(
      'REQ-1',
      expect.objectContaining({ automatable: true }),
    );
  });

  it('submits an updated Scenario automation flag', async () => {
    const scenario = {
      id: 1,
      scenarioId: 'SCN-1',
      requirementId: 1,
      requirementBusinessId: 'REQ-1',
      description: 'Login',
      testType: 'FUNCTIONAL' as const,
      automatable: true,
      priority: 'MEDIUM' as const,
      status: 'DRAFT' as const,
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(testScenarioApi.updateTestScenario).mockResolvedValue({
      ...scenario,
      automatable: false,
    });
    const user = userEvent.setup();
    render(
      <EditTestScenarioDialog
        open
        scenario={scenario}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Automation Eligible' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(testScenarioApi.updateTestScenario).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ automatable: false }),
    );
  });

  it('does not expose an independent Test Case eligibility toggle', () => {
    render(
      <CreateTestCaseDialog
        open
        scenarioId="SCN-1"
        scenarioAutomatable={false}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />,
    );

    expect(screen.queryByRole('checkbox', { name: 'Automation Eligible' }))
      .not.toBeInTheDocument();
    expect(screen.getByLabelText('Automation Type')).toBeDisabled();
  });
});
