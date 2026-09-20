import { useEffect, useRef, useState } from 'react';
import { ApiError, apiErrorMessage } from '../../api/apiClient';
import { testSuiteApi } from '../../api/testSuiteApi';
import { suiteReportingApi } from '../../api/suiteReportingApi';
import type { Project } from '../../types/project';
import type { SuiteScenario, TestSuite, TestSuiteRequest } from '../../types/testSuite';
import type { SuiteReportSummary } from '../../types/suiteReporting';

export function suiteRequest(suite: TestSuite): TestSuiteRequest {
  return { name: suite.name, description: suite.description, scenarioIds: suite.scenarios.map(s => s.id),
    executionMode: suite.executionMode, lifecycleEnabled: suite.lifecycleEnabled,
    tags: suite.tags, parameterSets: suite.parameterSets, extensions: suite.extensions };
}

export function assertSuiteProject(suite: TestSuite, project: Project) {
  if (suite.projectId !== project.id || suite.projectBusinessId !== project.projectId) {
    throw new ApiError('Test Suite belongs to another Project.', 409);
  }
}

// The workspace keys its content by Project so old selections/actions cannot cross scopes.
export function useAutomationSuites(project: Project, management = false) {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [candidates, setCandidates] = useState<SuiteScenario[]>([]);
  const [latest, setLatest] = useState<Record<number, SuiteReportSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([testSuiteApi.list(project.projectId),
      management ? testSuiteApi.candidates(project.projectId) : Promise.resolve([]),
      management ? suiteReportingApi.summaries(project.projectId) : Promise.resolve([])])
      .then(([data, scenarios, runs]) => {
        if (!active) return;
        data.forEach(s => assertSuiteProject(s, project));
        setSuites(data);
        setCandidates(scenarios);
        setLatest(Object.fromEntries(runs.filter(r => data.some(s => s.id === r.testSuiteId)).map(r => [r.testSuiteId, r])));
      }).catch(e => {
        if (active) { setSuites([]); setCandidates([]); setLatest({}); setError(apiErrorMessage(e, 'Unable to load Project automation.')); }
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [project, management, revision]);
  return { suites, setSuites, candidates, latest, setLatest, loading, error, setError, alive,
    refresh: () => setRevision(value => value + 1) };
}
