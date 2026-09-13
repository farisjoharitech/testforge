import {
  render,
  screen,
} from '@testing-library/react';

import {
  MemoryRouter,
} from 'react-router-dom';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  dashboardApi,
} from '../../api/dashboardApi';

import type {
  AutomationTypeSummary,
  DashboardSummary,
  ExecutionStatusSummary,
  RecentExecution,
} from '../../types/dashboard';

import DashboardPage
  from './DashboardPage';

vi.mock(
  '../../api/dashboardApi',
  () => ({
    dashboardApi: {
      getSummary:
        vi.fn(),

      getExecutionStatus:
        vi.fn(),

      getAutomationTypes:
        vi.fn(),

      getRecentResults:
        vi.fn(),
    },
  }),
);

const summary:
  DashboardSummary = {

    totalTestCases:
      10,

    automatableTestCases:
      6,

    automatedTestCases:
      2,

    automationCoveragePercentage:
      33.33,

    totalAutomationScripts:
      4,

    generatedScripts:
      3,
  };

const executionStatus:
  ExecutionStatusSummary = {

    totalExecutions:
      8,

    passed:
      4,

    failed:
      2,

    timedOut:
      1,

    errors:
      1,

    passRatePercentage:
      50,
  };

const automationTypes:
  AutomationTypeSummary = {

    ui:
      3,

    api:
      2,

    uiApi:
      1,

    totalAutomatable:
      6,
  };

const recentResult:
  RecentExecution = {

    executionId:
      'EXEC-RECENT-001',

    testCaseId:
      10,

    testCaseBusinessId:
      'TC-LOGIN-001',

    testCaseName:
      'Valid Login',

    automationScriptBusinessId:
      'AUTOSCRIPT-001',

    status:
      'PASSED',

    startedAt:
      '2026-09-13T21:00:00',

    finishedAt:
      '2026-09-13T21:00:08',

    durationMs:
      8000,
  };

function renderPage() {

  return render(
    <MemoryRouter
      initialEntries={[
        '/dashboard',
      ]}
    >
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe(
  'DashboardPage',
  () => {

    beforeEach(
      () => {

        vi.mocked(
          dashboardApi
            .getSummary,
        ).mockReset();

        vi.mocked(
          dashboardApi
            .getExecutionStatus,
        ).mockReset();

        vi.mocked(
          dashboardApi
            .getAutomationTypes,
        ).mockReset();

        vi.mocked(
          dashboardApi
            .getRecentResults,
        ).mockReset();
      },
    );

    it(
      'renders dashboard metrics and recent results',
      async () => {

        vi.mocked(
          dashboardApi
            .getSummary,
        ).mockResolvedValue(
          summary,
        );

        vi.mocked(
          dashboardApi
            .getExecutionStatus,
        ).mockResolvedValue(
          executionStatus,
        );

        vi.mocked(
          dashboardApi
            .getAutomationTypes,
        ).mockResolvedValue(
          automationTypes,
        );

        vi.mocked(
          dashboardApi
            .getRecentResults,
        ).mockResolvedValue(
          [
            recentResult,
          ],
        );

        renderPage();

        expect(
          await screen
            .findByText(
              'EXEC-RECENT-001',
            ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Total Test Cases',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Automatable',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Automated',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getAllByText(
            '33.33%',
          ).length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          screen.getByText(
            'Completed Executions',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Pass Rate',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            '50.00%',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'TC-LOGIN-001',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Valid Login',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'PASSED',
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'calls all dashboard endpoints',
      async () => {

        vi.mocked(
          dashboardApi
            .getSummary,
        ).mockResolvedValue(
          summary,
        );

        vi.mocked(
          dashboardApi
            .getExecutionStatus,
        ).mockResolvedValue(
          executionStatus,
        );

        vi.mocked(
          dashboardApi
            .getAutomationTypes,
        ).mockResolvedValue(
          automationTypes,
        );

        vi.mocked(
          dashboardApi
            .getRecentResults,
        ).mockResolvedValue(
          [],
        );

        renderPage();

        await screen.findByText(
          'No completed automation executions yet.',
        );

        expect(
          dashboardApi
            .getSummary,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          dashboardApi
            .getExecutionStatus,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          dashboardApi
            .getAutomationTypes,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          dashboardApi
            .getRecentResults,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );

    it(
      'renders empty dashboard values safely',
      async () => {

        vi.mocked(
          dashboardApi
            .getSummary,
        ).mockResolvedValue({
          totalTestCases:
            0,

          automatableTestCases:
            0,

          automatedTestCases:
            0,

          automationCoveragePercentage:
            0,

          totalAutomationScripts:
            0,

          generatedScripts:
            0,
        });

        vi.mocked(
          dashboardApi
            .getExecutionStatus,
        ).mockResolvedValue({
          totalExecutions:
            0,

          passed:
            0,

          failed:
            0,

          timedOut:
            0,

          errors:
            0,

          passRatePercentage:
            0,
        });

        vi.mocked(
          dashboardApi
            .getAutomationTypes,
        ).mockResolvedValue({
          ui:
            0,

          api:
            0,

          uiApi:
            0,

          totalAutomatable:
            0,
        });

        vi.mocked(
          dashboardApi
            .getRecentResults,
        ).mockResolvedValue(
          [],
        );

        renderPage();

        expect(
          await screen
            .findByText(
              'No completed automation executions yet.',
            ),
        ).toBeInTheDocument();

        expect(
          screen.getAllByText(
            '0.00%',
          ).length,
        ).toBeGreaterThanOrEqual(
          2,
        );

        expect(
          screen.getByText(
            /0 automated of 0 automatable test cases/i,
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'renders dashboard API errors',
      async () => {

        vi.mocked(
          dashboardApi
            .getSummary,
        ).mockRejectedValue(
          new Error(
            'Dashboard API unavailable',
          ),
        );

        vi.mocked(
          dashboardApi
            .getExecutionStatus,
        ).mockResolvedValue(
          executionStatus,
        );

        vi.mocked(
          dashboardApi
            .getAutomationTypes,
        ).mockResolvedValue(
          automationTypes,
        );

        vi.mocked(
          dashboardApi
            .getRecentResults,
        ).mockResolvedValue(
          [],
        );

        renderPage();

        expect(
          await screen
            .findByText(
              'Dashboard API unavailable',
            ),
        ).toBeInTheDocument();
      },
    );
  },
);