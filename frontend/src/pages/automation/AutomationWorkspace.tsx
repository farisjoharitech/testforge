import { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Stack, Tab, Tabs, TextField } from '@mui/material';
import { Link, Navigate, useBlocker, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import { apiErrorMessage } from '../../api/apiClient';
import { PageHeader } from '../../components/common/PageHeader';
import type { Project } from '../../types/project';
import AutomationActionsPage from './AutomationActionsPage';
import AutomationManagementPage from './AutomationManagementPage';
import AutomationConfigurationPage from './AutomationConfigurationPage';
import GitIntegrationPage from './GitIntegrationPage';

export function AutomationRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/automation/management${search}`} replace />;
}

export function LegacyProjectAutomationRedirect() {
  const { projectId } = useParams();
  return <Navigate to={`/automation/management?${new URLSearchParams({ project: projectId ?? '' })}`} replace />;
}

export default function AutomationWorkspace({ section }: { section: 'management' | 'configuration' | 'ui' | 'api' | 'git' }) {
  const [dirty, setDirty] = useState(false);
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const projectId = params.get('project') ?? '';
  const project = projects.find(p => p.projectId === projectId);

  useEffect(() => {
    let active = true;
    projectApi.getProjects().then(data => { if (active) setProjects(data); })
      .catch(e => { if (active) setError(apiErrorMessage(e, 'Unable to load Projects.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const query = project ? `?${new URLSearchParams({ project: project.projectId })}` : '';
  return <Stack spacing={2.5}>
    <PageHeader title={section === 'management' ? 'Automation Management' : section === 'configuration' ? 'Automation Configuration' : section === 'git' ? 'Git Integration' : section === 'api' ? 'API Automation' : 'UI Automation'}
      description={section === 'management' ? 'Organize, run, and export Test Suites for a Project.' : section === 'configuration' ? 'Configure how your automated Test Suite runs.' : section === 'git' ? 'Review and synchronize generated automation with a Project repository.' : `Configure and review ${section.toUpperCase()} automation used by your Test Steps.`}
      actions={project && <Button component={Link} to={`/projects/${encodeURIComponent(project.projectId)}/reporting`}>Open Reporting</Button>} />
    <Tabs value={section} aria-label="Automation sections">
      <Tab value="management" label="Management" component={Link} to={`/automation/management${query}`} />
      <Tab value="ui" label="UI Automation" component={Link} to={`/automation/ui${query}`} />
      <Tab value="api" label="API Automation" component={Link} to={`/automation/api${query}`} />
      <Tab value="configuration" label="Configuration" component={Link} to={`/automation/configuration${query}`} />
      <Tab value="git" label="Git Integration" component={Link} to={`/automation/git${query}`} />
    </Tabs>
    {error && <Alert severity="error">{error}</Alert>}
    {loading ? <CircularProgress aria-label="Loading Projects" /> : <>
      <TextField select label="Project" value={project?.projectId ?? ''} sx={{ maxWidth: 480 }}
        onChange={e => setParams(e.target.value ? { project: e.target.value } : {})}>
        <MenuItem value="">Select a Project</MenuItem>
        {projects.map(p => <MenuItem key={p.id} value={p.projectId}>{p.name} ({p.projectId})</MenuItem>)}
      </TextField>
      {!project && <Alert severity={projectId ? 'warning' : 'info'}>
        {projectId ? 'This Project is unavailable. Select a Project to continue.' : projects.length ? 'Select a Project to manage its automation.' : 'No Projects are available yet. Create a Project before configuring automation.'}
      </Alert>}
      {project && (section === 'management'
        ? <AutomationManagementPage key={`management:${project.projectId}`} project={project} />
        : section === "ui" || section === "api" ? <AutomationActionsPage key={`${section}:${project.projectId}`} project={project} category={section} />
        : section === 'git' ? <GitIntegrationPage key={`git:${project.projectId}`} project={project} />
        : <AutomationConfigurationPage key={`configuration:${project.projectId}`} project={project} onDirtyChange={setDirty} />)}
    </>}
    <Dialog open={blocker.state === 'blocked'}>
      <DialogTitle>Unsaved changes</DialogTitle>
      <DialogContent>You have unsaved automation configuration changes.</DialogContent>
      <DialogActions>
        <Button onClick={() => blocker.reset?.()}>Continue Editing</Button>
        <Button color="warning" onClick={() => { setDirty(false); blocker.proceed?.(); }}>Discard Changes</Button>
      </DialogActions>
    </Dialog>
  </Stack>;
}
