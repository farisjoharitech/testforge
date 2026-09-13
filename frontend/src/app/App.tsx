import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AppLayout
  from '../components/layout/AppLayout';

import TestPlanListPage
  from '../pages/test-plans/TestPlanListPage';

import CreateTestPlanPage
  from '../pages/test-plans/CreateTestPlanPage';

import TestPlanDetailsPage
  from '../pages/test-plans/TestPlanDetailsPage';

import RequirementDetailsPage
  from '../pages/requirements/RequirementDetailsPage';

import ScenarioDetailsPage
  from '../pages/scenarios/ScenarioDetailsPage';

import TestCaseDetailsPage
  from '../pages/test-cases/TestCaseDetailsPage';

import AutomationSelectionPage
  from '../pages/automation/AutomationSelectionPage';

import AutomationBuilderPage
  from '../pages/automation/AutomationBuilderPage';

import ScriptGenerationPage
  from '../pages/automation/ScriptGenerationPage';

import AutomationExecutionPage
  from '../pages/automation/AutomationExecutionPage';

import AutomationResultsPage
  from '../pages/results/AutomationResultsPage';

import AutomationResultDetailsPage
  from '../pages/results/AutomationResultDetailsPage';

import DashboardPage
  from '../pages/dashboard/DashboardPage';

export default function App() {

  return (
    <Routes>

      <Route
        element={
          <AppLayout />
        }
      >

        <Route
          index
          element={
            <Navigate
              to="/test-plans"
              replace
            />
          }
        />

        <Route
          path="/test-plans"
          element={
            <TestPlanListPage />
          }
        />

        <Route
          path="/test-plans/new"
          element={
            <CreateTestPlanPage />
          }
        />

        <Route
          path="/test-plans/:testPlanId"
          element={
            <TestPlanDetailsPage />
          }
        />

        <Route
          path="/requirements/:requirementId"
          element={
            <RequirementDetailsPage />
          }
        />

        <Route
          path="/scenarios/:scenarioId"
          element={
            <ScenarioDetailsPage />
          }
        />

        <Route
          path="/test-cases/:testCaseId"
          element={
            <TestCaseDetailsPage />
          }
        />

        <Route
          path="/automation"
          element={
            <AutomationSelectionPage />
          }
        />

        <Route
          path="/automation/:testCaseId"
          element={
            <AutomationBuilderPage />
          }
        />

        <Route
          path="/automation/:testCaseId/script"
          element={
            <ScriptGenerationPage />
          }
        />

        <Route
          path="/automation/:testCaseId/execute"
          element={
            <AutomationExecutionPage />
          }
        />

        <Route
          path="/results"
          element={
            <AutomationResultsPage />
          }
        />

        <Route
          path="/results/:executionId"
          element={
            <AutomationResultDetailsPage />
          }
        />

        {/*
         * ===============================================
         * TASK 36.13 — DASHBOARD
         * ===============================================
         */}

        <Route
          path="/dashboard"
          element={
            <DashboardPage />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/test-plans"
              replace
            />
          }
        />

      </Route>

    </Routes>
  );
}