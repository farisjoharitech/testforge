import { useEffect, useRef, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Chip, CircularProgress, FormControlLabel, MenuItem, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import { apiErrorMessage } from '../../api/apiClient';
import { testSuiteApi } from '../../api/testSuiteApi';
import type { Project } from '../../types/project';
import type { TestSuite, TestSuiteRequest } from '../../types/testSuite';
import { assertSuiteProject, suiteRequest, useAutomationSuites } from './useAutomationSuites';
import TestDataDialog from './TestDataDialog';

export default function AutomationConfigurationPage({ project, onDirtyChange }: { project: Project; onDirtyChange: (dirty: boolean) => void }) {
  const { suites, setSuites, loading, error, setError, alive } = useAutomationSuites(project);
  const [params, setParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedId = params.get('suite');
  const suite = selectedId ? suites.find(s => String(s.id) === selectedId) : suites[0];
  const save = async (request: TestSuiteRequest) => {
    if (!suite || savingRef.current) return;
    savingRef.current = true;
    try {
      assertSuiteProject(suite, project);
      setSaving(true); setError(null); setMessage(null);
      const saved = await testSuiteApi.update(suite.id, request);
      assertSuiteProject(saved, project);
      if (alive.current) { setSuites(v => v.map(s => s.id === saved.id ? saved : s)); setMessage(`${saved.name} configuration saved.`); onDirtyChange(false); }
    } catch (e) { if (alive.current) setError(apiErrorMessage(e, 'Unable to save Suite configuration.')); }
    finally { savingRef.current = false; if (alive.current) setSaving(false); }
  };
  if (loading) return <CircularProgress aria-label="Loading Suite configuration" />;
  return <Stack spacing={3}>
    {error && <Alert severity="error">{error}</Alert>}
    {message && <Alert severity="success">{message}</Alert>}
    <TextField select label="Test Suite" value={suite?.id ?? ''} disabled={saving} sx={{ maxWidth: 480 }}
      onChange={e => { setMessage(null); setError(null); setParams({ project: project.projectId, suite: e.target.value }); }}>
      <MenuItem value="">Select a Test Suite</MenuItem>
      {suites.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
    </TextField>
    {!suite && <Alert severity={selectedId ? 'warning' : 'info'}>{selectedId ? 'This Test Suite is unavailable in the selected Project.' : 'No Test Suites exist for this Project. Create a Test Suite in Automation Management first.'}
      <Button component={Link} to={`/automation/management?project=${encodeURIComponent(project.projectId)}`}>Open Automation Management</Button>
    </Alert>}
    {suite && <SuiteConfigurationForm key={`${suite.id}:${suite.updatedAt}`} suite={suite} saving={saving} onDirtyChange={onDirtyChange} onSave={request => void save(request)} />}
    <Accordion disableGutters elevation={0}>
      <AccordionSummary expandIcon={<ExpandMore />}>Automation workflow guide</AccordionSummary>
      <AccordionDetails><Typography variant="body2">Create a Scenario in Test Design and mark it Automatable. Add Test Cases and Test Steps, and configure their automation actions inside each Step. In Automation Management, create a Suite and select automated Scenarios. Configure execution here, then return to Management to run or export for CI/CD. View results in Reporting.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>This page configures how existing automation runs. Author automation actions in Test Design.</Typography>
      </AccordionDetails>
    </Accordion>
  </Stack>;
}

function SuiteConfigurationForm({ suite, saving, onSave, onDirtyChange }: { suite: TestSuite; saving: boolean; onSave: (request: TestSuiteRequest) => void; onDirtyChange: (dirty: boolean) => void }) {
  const [mode, setMode] = useState(suite.executionMode);
  const [tags, setTags] = useState(suite.tags);
  const [tag, setTag] = useState('');
  const [parameters, setParameters] = useState(suite.parameterSets);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dirty = mode !== suite.executionMode || JSON.stringify(tags) !== JSON.stringify(suite.tags)
    || JSON.stringify(parameters) !== JSON.stringify(suite.parameterSets) || !!tag || editing !== null;
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  const addTag = () => {
    const value = tag.trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(value)) { setError('Tags must start with a letter or number and use only letters, numbers, dots, underscores or hyphens (up to 100 characters).'); return; }
    const next = [...new Set([...tags, value])];
    if (next.join(',').length > 1000) { setError('Too many tags. Remove a tag before adding another.'); return; }
    setTags(next); setTag(''); setError(null);
  };
  const submit = () => {
    if (tag.trim()) { setError('Add the pending tag or clear it before saving.'); return; }
    setError(null);
    onSave({ ...suiteRequest(suite), executionMode: mode, tags, parameterSets: parameters });
  };
  return <Stack spacing={3} component="fieldset" disabled={saving} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
    {error && <Alert severity="error">{error}</Alert>}
    <Stack spacing={1}>
      <Typography variant="h6">Execution</Typography>
      <Typography variant="body2">Choose how tests in this Suite should run.</Typography>
      <RadioGroup aria-label="Execution Mode" value={mode} onChange={e => setMode(e.target.value as typeof mode)}>
        <FormControlLabel value="SEQUENTIAL" control={<Radio />} label="Sequential" />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>Run one test at a time. Recommended when tests may share data or environment state.</Typography>
        <FormControlLabel value="PARALLEL" control={<Radio />} label="Parallel" />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>Run multiple tests simultaneously for faster execution. Each test uses isolated browser resources.</Typography>
      </RadioGroup>
    </Stack>
    <Stack spacing={1.5}>
      <Typography variant="h6">Test Data</Typography>
      <Typography variant="body2">Run the same automated test using different values, for example once for Alice and again for Bob.</Typography>
      <Typography variant="body2">{'In a Test Step automation value, use ${username} to read the username parameter from each data set. Include every referenced parameter in each set. Fixed values stay unchanged.'}</Typography>
      {!parameters.length && <Alert severity="info">No test data configured. Your tests will run once using the values configured in their Test Steps.</Alert>}
      {parameters.map((data, index) => <Stack key={index} spacing={1} sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
        <Typography fontWeight={600}>Data Set {index + 1}</Typography>
        {Object.keys(data).map(name => <Typography key={name} variant="body2">{name}: ********</Typography>)}
        <Stack direction="row" spacing={1}>
          <Button aria-label={`Edit Data Set ${index + 1}`} onClick={() => setEditing(index)}>Edit</Button>
          <Button color="error" aria-label={`Delete Data Set ${index + 1}`} onClick={() => setParameters(parameters.filter((_, i) => i !== index))}>Delete</Button>
        </Stack>
      </Stack>)}
      <Button sx={{ alignSelf: 'flex-start' }} onClick={() => setEditing(-1)}>Add Data Set</Button>
      {editing !== null && <TestDataDialog data={editing < 0 ? undefined : parameters[editing]} onClose={() => setEditing(null)} onSave={data => {
        setParameters(editing < 0 ? [...parameters, data] : parameters.map((old, i) => i === editing ? data : old)); setEditing(null);
      }} />}
    </Stack>
    <Accordion disableGutters elevation={0}>
      <AccordionSummary expandIcon={<ExpandMore />}>Advanced Settings</AccordionSummary>
      <AccordionDetails><Stack spacing={1.5}>
        <Typography variant="h6">Test Tags</Typography>
        <Typography variant="body2">Optional labels used to organize or filter automated tests. These tags apply to this whole Test Suite, including exported tests, not individual Scenarios.</Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">{tags.map(value => <Chip key={value} label={value} onDelete={saving ? undefined : () => setTags(tags.filter(t => t !== value))} />)}</Stack>
        <Stack direction="row" spacing={1}><TextField label="Add tag" value={tag} onChange={e => setTag(e.target.value)} helperText="Examples: smoke, regression, critical, login, api, ui" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} /><Button onClick={addTag}>Add Tag</Button></Stack>
      </Stack></AccordionDetails>
    </Accordion>
    <Stack spacing={0.5}>
      <Typography fontWeight={600}>Configuration Summary</Typography>
      <Typography variant="body2">Suite: {suite.name} | Execution: {mode === 'PARALLEL' ? 'Parallel' : 'Sequential'} | Test Data: {parameters.length ? `${parameters.length} data sets` : 'Step values'} | Tags: {tags.join(', ') || 'None'}</Typography>
      <Typography variant="body2" color="text.secondary">Save updates only this Suite's settings for future runs and exports. It does not start a run or change historical results.</Typography>
      {dirty && <Typography variant="caption">Unsaved changes</Typography>}
    </Stack>
    <Button variant="contained" disabled={saving || editing !== null} onClick={submit} sx={{ alignSelf: 'flex-start' }}>{saving ? 'Saving configuration...' : 'Save Configuration'}</Button>
  </Stack>;
}
