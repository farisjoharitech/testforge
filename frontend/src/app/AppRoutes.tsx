import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AppShell,
} from "../components/layout/AppShell";

import AutomationBuilderPage
  from "../pages/AutomationBuilderPage";

import DashboardPage
  from "../pages/DashboardPage";

import NotFoundPage
  from "../pages/NotFoundPage";

import RequirementDetailsPage
  from "../pages/RequirementDetailsPage";

import ScenarioDetailsPage
  from "../pages/ScenarioDetailsPage";

import TestCaseDetailsPage
  from "../pages/TestCaseDetailsPage";

import TestPlanDetailsPage
  from "../pages/TestPlanDetailsPage";

import TestPlansPage
  from "../pages/TestPlansPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <AppShell />
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
          path="test-plans"
          element={
            <TestPlansPage />
          }
        />

        <Route
          path="test-plans/:testPlanId"
          element={
            <TestPlanDetailsPage />
          }
        />

        <Route
          path={
            "test-plans/:testPlanId/" +
            "requirements/:requirementId"
          }
          element={
            <RequirementDetailsPage />
          }
        />

        <Route
          path={
            "test-plans/:testPlanId/" +
            "requirements/:requirementId/" +
            "scenarios/:scenarioId"
          }
          element={
            <ScenarioDetailsPage />
          }
        />

        <Route
          path={
            "test-plans/:testPlanId/" +
            "requirements/:requirementId/" +
            "scenarios/:scenarioId/" +
            "test-cases/:testCaseId"
          }
          element={
            <TestCaseDetailsPage />
          }
        />

        <Route
          path="test-cases/:testCaseId/automation"
          element={
            <AutomationBuilderPage />
          }
        />

        <Route
          path="dashboard"
          element={
            <DashboardPage />
          }
        />

        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />
      </Route>
    </Routes>
  );
}