import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import AppLayout
    from '../components/layout/AppLayout';

import ProjectListPage
    from '../pages/projects/ProjectListPage';

import CreateProjectPage
    from '../pages/projects/CreateProjectPage';

import ProjectDetailsPage
    from '../pages/projects/ProjectDetailsPage';

import CreateTestPlanPage
    from '../pages/test-plans/CreateTestPlanPage';

import TestPlanDetailsPage
    from '../pages/test-plans/TestPlanDetailsPage';

import RequirementDetailsPage
    from '../pages/requirements/RequirementDetailsPage';
import ModuleDetailsPage
    from '../pages/modules/ModuleDetailsPage';
import AutomationWorkspace, { AutomationRedirect, LegacyProjectAutomationRedirect } from '../pages/automation/AutomationWorkspace';
import ProjectReportingPage from '../pages/reporting/ProjectReportingPage';

import ScenarioDetailsPage
    from '../pages/scenarios/ScenarioDetailsPage';

import TestCaseDetailsPage
    from '../pages/test-cases/TestCaseDetailsPage';

import DashboardPage
    from '../pages/dashboard/DashboardPage';

import MonitoringDrilldownPage
    from '../pages/monitoring/MonitoringDrilldownPage';

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
                            to="/projects"
                            replace
                        />
                    }
                />

                <Route
                    path="/projects"
                    element={
                        <ProjectListPage />
                    }
                />

                <Route
                    path="/projects/new"
                    element={
                        <CreateProjectPage />
                    }
                />

                <Route
                    path="/projects/:projectId"
                    element={
                        <ProjectDetailsPage />
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
                <Route path="/automation" element={<AutomationRedirect />} />
                <Route path="/automation/management" element={<AutomationWorkspace section="management" />} />
                <Route path="/automation/api" element={<AutomationWorkspace section="api" />} />
                <Route path="/automation/ui" element={<AutomationWorkspace section="ui" />} />
                <Route path="/automation/configuration" element={<AutomationWorkspace section="configuration" />} />
                <Route path="/automation/git" element={<AutomationWorkspace section="git" />} />
                <Route path="/projects/:projectId/automation" element={<LegacyProjectAutomationRedirect />} />
                <Route path="/projects/:projectId/reporting" element={<ProjectReportingPage />} />
                <Route
                    path="/modules/:moduleId"
                    element={<ModuleDetailsPage />}
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
                    path="/monitoring/:scopeType/:scopeId/test-cases"
                    element={
                        <MonitoringDrilldownPage />
                    }
                />

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
                            to="/projects"
                            replace
                        />
                    }
                />
            </Route>
        </Routes>
    );
}
