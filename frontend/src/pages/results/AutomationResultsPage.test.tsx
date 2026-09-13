import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import userEvent
  from '@testing-library/user-event';

import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  automationResultApi,
} from '../../api/automationResultApi';

import type {
  AutomationResultSummary,
} from '../../types/automationResult';

import AutomationResultsPage
  from './AutomationResultsPage';

vi.mock(
  '../../api/automationResultApi',
  () => ({
    automationResultApi: {
      getAllResults:
        vi.fn(),

      getResult:
        vi.fn(),

      getResultsByScript:
        vi.fn(),

      getResultsByTestCase:
        vi.fn(),
    },
  }),
);

const passedResult:
  AutomationResultSummary = {

    id:
      1,

    executionId:
      'EXEC-PASSED-001',

    automationScriptId:
      15,

    automationScriptBusinessId:
      'AUTOSCRIPT-001',

    testCaseId:
      10,

    testCaseBusinessId:
      'TC-LOGIN-001',

    testCaseName:
      'Valid Login',

    status:
      'PASSED',

    generatedClassName:
      'generated.testforge.ValidLoginTest',

    exitCode:
      0,

    startedAt:
      '2026-09-13T20:00:00',

    finishedAt:
      '2026-09-13T20:00:05',

    durationMs:
      5000,

    successful:
      true,
  };

const failedResult:
  AutomationResultSummary = {

    id:
      2,

    executionId:
      'EXEC-FAILED-001',

    automationScriptId:
      16,

    automationScriptBusinessId:
      'AUTOSCRIPT-002',

    testCaseId:
      11,

    testCaseBusinessId:
      'TC-LOGIN-002',

    testCaseName:
      'Invalid Login',

    status:
      'FAILED',

    generatedClassName:
      'generated.testforge.InvalidLoginTest',

    exitCode:
      1,

    startedAt:
      '2026-09-13T20:05:00',

    finishedAt:
      '2026-09-13T20:05:04',

    durationMs:
      4000,

    successful:
      false,
  };

function renderPage() {

  return render(
    <MemoryRouter
      initialEntries={[
        '/results',
      ]}
    >
      <Routes>
        <Route
          path="/results"
          element={
            <AutomationResultsPage />
          }
        />

        <Route
          path="/results/:executionId"
          element={
            <div>
              Result Details Route
            </div>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe(
  'AutomationResultsPage',
  () => {

    beforeEach(
      () => {

        vi.mocked(
          automationResultApi
            .getAllResults,
        ).mockReset();
      },
    );

    it(
      'renders completed automation results',
      async () => {

        vi.mocked(
          automationResultApi
            .getAllResults,
        ).mockResolvedValue(
          [
            passedResult,
            failedResult,
          ],
        );

        renderPage();

        expect(
          await screen
            .findByText(
              'EXEC-PASSED-001',
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
            'EXEC-FAILED-001',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            '2 results',
          ),
        ).toBeInTheDocument();

        expect(
          automationResultApi
            .getAllResults,
        ).toHaveBeenCalledWith(
          undefined,
        );
      },
    );

    it(
      'navigates to result details when View is clicked',
      async () => {

        const user =
          userEvent.setup();

        vi.mocked(
          automationResultApi
            .getAllResults,
        ).mockResolvedValue(
          [
            passedResult,
          ],
        );

        renderPage();

        await screen.findByText(
          'EXEC-PASSED-001',
        );

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                /view/i,
            },
          ),
        );

        expect(
          await screen
            .findByText(
              'Result Details Route',
            ),
        ).toBeInTheDocument();
      },
    );

    it(
      'requests filtered results when status changes',
      async () => {

        const user =
          userEvent.setup();

        vi.mocked(
          automationResultApi
            .getAllResults,
        )
          .mockResolvedValueOnce(
            [
              passedResult,
              failedResult,
            ],
          )
          .mockResolvedValueOnce(
            [
              failedResult,
            ],
          );

        renderPage();

        await screen.findByText(
          'EXEC-PASSED-001',
        );

        await user.click(
          screen.getByRole(
            'combobox',
            {
              name:
                /status/i,
            },
          ),
        );

        await user.click(
          screen.getByRole(
            'option',
            {
              name:
                'Failed',
            },
          ),
        );

        await waitFor(
          () => {

            expect(
              automationResultApi
                .getAllResults,
            ).toHaveBeenLastCalledWith(
              'FAILED',
            );
          },
        );

        expect(
          await screen
            .findByText(
              'EXEC-FAILED-001',
            ),
        ).toBeInTheDocument();
      },
    );

    it(
      'shows empty state when there are no results',
      async () => {

        vi.mocked(
          automationResultApi
            .getAllResults,
        ).mockResolvedValue(
          [],
        );

        renderPage();

        expect(
          await screen
            .findByText(
              'No results found',
            ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            /completed executions will appear here/i,
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'shows API errors',
      async () => {

        vi.mocked(
          automationResultApi
            .getAllResults,
        ).mockRejectedValue(
          new Error(
            'Unable to reach Results API',
          ),
        );

        renderPage();

        expect(
          await screen
            .findByText(
              'Unable to reach Results API',
            ),
        ).toBeInTheDocument();
      },
    );
  },
);