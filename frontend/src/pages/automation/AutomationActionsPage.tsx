import { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { automationApi } from '../../api/automationApi';
import { apiErrorMessage } from '../../api/apiClient';
import type { Project } from '../../types/project';
import type { AutomationOverviewItem } from '../../types/automation';

export default function AutomationActionsPage({ project, category }: { project: Project; category: 'ui' | 'api' }) {
  const [items, setItems] = useState<AutomationOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    automationApi.overview(project.projectId).then(rows => { if (active) setItems(rows); })
      .catch(e => { if (active) setError(apiErrorMessage(e, 'Unable to load automation.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [project.projectId]);
  const rows = items.filter(row => row.actionType.includes('API_') === (category === 'api'));
  const cases = [...new Set(rows.map(row => row.testCaseId))];
  const title = category.toUpperCase();
  return <Stack spacing={2.5}>
    {loading ? <CircularProgress aria-label="Loading automation overview" /> : error ? <Alert severity="error">{error}</Alert> : <>
      <Typography>{new Set(rows.map(row => row.scenarioId)).size} Scenarios with {title} actions | {cases.length} Test Cases | {rows.length} automation actions</Typography>
      {!rows.length && <Alert severity="info">No {title} automation has been configured for this Project. Create or edit a Test Step in an automatable Scenario and choose {title} automation.
        <Button component={Link} to={`/projects/${encodeURIComponent(project.projectId)}`}>Go to Test Design</Button>
      </Alert>}
      {cases.map(id => {
        const steps = rows.filter(row => row.testCaseId === id); const first = steps[0];
        return <Stack key={id} spacing={0.5} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="h6">{first.testCaseName}</Typography>
          <Typography variant="body2">{first.scenarioId}: {first.scenarioDescription}</Typography>
          <Typography variant="body2">{steps.length} {title} actions: {steps.map(s => s.actionType.replaceAll('_', ' ')).join(', ')}</Typography>
          {!first.automatable && <Alert severity="warning">Scenario automation is disabled. Existing actions remain available to review or remove.</Alert>}
          <Button sx={{ alignSelf: 'flex-start' }} component={Link} to={`/test-cases/${encodeURIComponent(id)}?automationStep=${encodeURIComponent(first.testStepId)}`}>View Automation</Button>
        </Stack>;
      })}
      {!!rows.length && <Typography variant="body2">Configured actions are shown above. Complete Step coverage and generated script readiness are checked when running or exporting a Suite.</Typography>}
    </>}
    {category === 'api' && <Stack spacing={1}>
      <Typography variant="h6">API configuration</Typography>
      <Typography variant="body2">Configure GET, POST, PUT, PATCH or DELETE requests inside Test Steps, with headers, query parameters and supported request bodies. Use a full request URL: a saved Project-level API base URL is not currently supported.</Typography>
      <Typography variant="body2">Add response status, body, JSON field or header assertions as subsequent Steps. Assertions use the most recent API response in the same Test Case, in automation order.</Typography>
      <Typography variant="body2">Authentication supports secret references supplied to the execution environment. Use the Authentication fields rather than saving passwords or tokens in headers. This page does not store secrets.</Typography>
    </Stack>}
    <Stack spacing={1}>
      <Typography variant="h6">How {title} Automation Works</Typography>
      <Typography variant="body2">Create an automatable Scenario and a Test Case in Test Design. Create or edit a Test Step, enable automation, choose {title}, and configure its action. Add assertions as subsequent Steps. UI and API Steps can be combined in one Test Case.</Typography>
      <Typography variant="body2">Add the Scenario to a Suite in Automation Management, configure execution and test data in Configuration, then run or export the Suite. View results in Reporting.</Typography>
    </Stack>
  </Stack>;
}
