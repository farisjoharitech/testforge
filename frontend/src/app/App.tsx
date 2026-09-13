import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AppLayout
  from '../components/layout/AppLayout';

import AutomationBuilderPage
  from '../pages/automation/AutomationBuilderPage';

import AutomationSelectionPage
  from '../pages/automation/AutomationSelectionPage';

import ScriptGenerationPage
  from '../pages/automation/ScriptGenerationPage';

import RequirementDetailsPage
  from '../pages/requirements/RequirementDetailsPage';

import ScenarioDetailsPage
  from '../pages/scenarios/ScenarioDetailsPage';

import TestCaseDetailsPage
  from '../pages/test-cases/TestCaseDetailsPage';

import CreateTestPlanPage
  from '../pages/test-plans/CreateTestPlanPage';

import TestPlanDetailsPage
  from '../pages/test-plans/TestPlanDetailsPage';

import TestPlanListPage
  from '../pages/test-plans/TestPlanListPage';

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <AppLayout />
        }
      >
        <Route
          path="/"
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
      </Route>
    </Routes>
  );
}