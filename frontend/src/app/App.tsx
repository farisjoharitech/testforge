import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout';

import CreateTestPlanPage from '../pages/test-plans/CreateTestPlanPage';

import TestPlanDetailsPage from '../pages/test-plans/TestPlanDetailsPage';

import TestPlanListPage from '../pages/test-plans/TestPlanListPage';

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
      </Route>
    </Routes>
  );
}