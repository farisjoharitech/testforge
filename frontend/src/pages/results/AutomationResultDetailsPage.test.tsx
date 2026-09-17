import {
  render,
  screen,
} from '@testing-library/react';

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
  AutomationResult,
} from '../../types/automationResult';

import AutomationResultDetailsPage
  from './AutomationResultDetailsPage';

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

      getArtifactUrl:
        vi.fn(
          (
            executionId: string,
            artifactType: string,
          ) =>
            `http://localhost:8080/api/automation-results/${executionId}/artifacts/${artifactType}`,
        ),
    },
  }),
);

const result:
  AutomationResult = {

    id:
      1,

    executionId:
      'EXEC-DETAIL-001',

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

    generatedAt:
      '2026-09-13T19:55:00',

    exitCode:
      0,

    logOutput:
      'BUILD SUCCESS',

    errorMessage:
      null,

    failedStepOrder:
      null,

    failedAutomationStepId:
      null,

    failedActionType:
      null,

    failureScreenshotAvailable:
      false,

    traceAvailable:
      false,

    logAvailable:
      true,

    startedAt:
      '2026-09-13T20:00:00',

    finishedAt:
      '2026-09-13T20:00:05',

    durationMs:
      5000,

    successful:
      true,
  };

function renderPage(
  executionId =
    'EXEC-DETAIL-001',
) {

  return render(
    <MemoryRouter
      initialEntries={[
        `/results/${executionId}`,
      ]}
    >
      <Routes>
        <Route
          path="/results/:executionId"
          element={
            <AutomationResultDetailsPage />
          }
        />

        <Route
          path="/results"
          element={
            <div>
              Results List
            </div>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe(
  'AutomationResultDetailsPage',
  () => {

    beforeEach(
      () => {

        vi.mocked(
          automationResultApi
            .getResult,
        ).mockReset();
      },
    );

    it(
      'renders completed result details',
      async () => {

        vi.mocked(
          automationResultApi
            .getResult,
        ).mockResolvedValue(
          result,
        );

        renderPage();

        expect(
          await screen.findByText('EXEC-DETAIL-001'),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Automation execution passed successfully.',
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
            'AUTOSCRIPT-001',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'generated.testforge.ValidLoginTest',
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'BUILD SUCCESS',
          ),
        ).toBeInTheDocument();

        expect(
          automationResultApi
            .getResult,
        ).toHaveBeenCalledWith(
          'EXEC-DETAIL-001',
        );
      },
    );

    it(
      'renders error details for failed API request',
      async () => {

        vi.mocked(
          automationResultApi
            .getResult,
        ).mockRejectedValue(
          new Error(
            'Automation execution not found',
          ),
        );

        renderPage(
          'EXEC-MISSING',
        );

        expect(
          await screen
            .findByText(
              'Automation execution not found',
            ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'button',
            {
              name:
                /back to results/i,
            },
          ),
        ).toBeInTheDocument();
      },
    );
  },
);