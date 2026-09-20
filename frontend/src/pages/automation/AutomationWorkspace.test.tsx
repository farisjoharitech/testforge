import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { automationApi } from '../../api/automationApi';
vi.mock('../../api/automationApi', () => ({ automationApi: { overview: vi.fn() } }));
import App from '../../app/App';
import { projectApi } from '../../api/projectApi';
import { testSuiteApi } from '../../api/testSuiteApi';
import { suiteReportingApi } from '../../api/suiteReportingApi';
import type { Project } from '../../types/project';
import type { TestSuite } from '../../types/testSuite';

vi.mock('../../api/projectApi', () => ({ projectApi: { getProjects: vi.fn(), getProjectByBusinessId: vi.fn() } }));
vi.mock('../../api/testSuiteApi', () => ({ testSuiteApi: {
  list: vi.fn(), candidates: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), run: vi.fn(), export: vi.fn(),
} }));
vi.mock('../../api/suiteReportingApi', () => ({ suiteReportingApi: { summaries: vi.fn(), detail: vi.fn() } }));
vi.mock('../projects/ProjectListPage', () => ({ default: () => <div>Canonical Project list</div> }));

const projectA: Project = { id: 1, projectId: 'PRJ-A', name: 'Alpha', status: 'ACTIVE', createdAt: '', updatedAt: '' };
const projectB: Project = { ...projectA, id: 2, projectId: 'PRJ-B', name: 'Beta' };
const suiteA: TestSuite = { id: 11, projectId: 1, projectBusinessId: 'PRJ-A', name: 'Alpha suite', description: 'Original description',
  scenarios: [{ id: 21, scenarioId: 'SCN-A', description: 'Alpha scenario', itemOrder: 1 }],
  executionMode: 'PARALLEL', lifecycleEnabled: false, tags: ['smoke'], parameterSets: [{ username: 'alice' }],
  extensions: [], createdAt: '', updatedAt: 'original' };
const suiteB: TestSuite = { ...suiteA, id: 12, projectId: 2, projectBusinessId: 'PRJ-B', name: 'Beta suite',
  scenarios: [{ id: 22, scenarioId: 'SCN-B', description: 'Beta scenario', itemOrder: 1 }] };

function Location() { const l = useLocation(); return <output data-testid="location">{l.pathname}{l.search}</output>; }
function open(path: string) {
  render(<RouterProvider router={createMemoryRouter([{ path: "*", element: <><App /><Location /></> }], { initialEntries: [path] })} />);
  return userEvent.setup();
}
async function selectProject(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(await screen.findByRole('combobox', { name: 'Project' }));
  await user.click(await screen.findByRole('option', { name }));
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(projectApi.getProjects).mockResolvedValue([projectA, projectB]);
  vi.mocked(projectApi.getProjectByBusinessId).mockImplementation(async id => id === 'PRJ-A' ? projectA : projectB);
  vi.mocked(testSuiteApi.list).mockImplementation(async id => id === 'PRJ-A' ? [suiteA] : [suiteB]);
  vi.mocked(testSuiteApi.candidates).mockImplementation(async id => id === 'PRJ-A' ? suiteA.scenarios : suiteB.scenarios);
  vi.mocked(suiteReportingApi.summaries).mockResolvedValue([]);
  vi.mocked(testSuiteApi.update).mockImplementation(async (id, request) => ({
    ...(id === suiteA.id ? suiteA : suiteB), ...request, updatedAt: 'saved',
  }));
});

describe('top-level Automation workspace', () => {
  it('opens Management from top-level navigation while Projects remains canonical', async () => {
    const user = open('/projects');
    expect(screen.getByText('Canonical Project list')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Automation' }));
    expect(await screen.findByRole('heading', { name: 'Automation Management' })).toBeInTheDocument();
    await selectProject(user, 'Alpha (PRJ-A)');
    expect(await screen.findByText('Alpha suite')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Configuration' }));
    expect(await screen.findByRole('heading', { name: 'Automation Configuration' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/automation/configuration?project=PRJ-A');
    await user.click(screen.getByRole('button', { name: 'Projects' }));
    expect(await screen.findByText('Canonical Project list')).toBeInTheDocument();
  });

  it('redirects old Project automation URLs to the single Management workflow', async () => {
    open('/projects/PRJ-A/automation');
    expect(await screen.findByText('Alpha suite')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/automation/management?project=PRJ-A');
  });

  it('scopes Project switching and ignores an old in-flight response', async () => {
    let resolveOld!: (value: TestSuite[]) => void;
    vi.mocked(testSuiteApi.list).mockImplementation(id => id === 'PRJ-A'
      ? new Promise(resolve => { resolveOld = resolve; }) : Promise.resolve([suiteB]));
    const user = open('/automation?project=PRJ-A');
    await waitFor(() => expect(testSuiteApi.list).toHaveBeenCalledWith('PRJ-A'));
    await selectProject(user, 'Beta (PRJ-B)');
    expect(await screen.findByText('Beta suite')).toBeInTheDocument();
    await act(async () => { resolveOld([suiteA]); });
    expect(screen.queryByText('Alpha suite')).not.toBeInTheDocument();
    expect(testSuiteApi.candidates).toHaveBeenCalledWith('PRJ-B');
    expect(suiteReportingApi.summaries).toHaveBeenCalledWith('PRJ-B');
  });

  it('rejects cross-project data and Suite IDs without exposing their actions', async () => {
    vi.mocked(testSuiteApi.list).mockResolvedValue([suiteB]);
    open('/automation/management?project=PRJ-A');
    expect(await screen.findByText('Test Suite belongs to another Project.')).toBeInTheDocument();
    expect(screen.queryByText('Beta suite')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Run Suite' })).not.toBeInTheDocument();
    expect(testSuiteApi.run).not.toHaveBeenCalled();
  });

  it('does not load or edit a Suite outside the selected Project', async () => {
    open('/automation/configuration?project=PRJ-A&suite=12');
    expect(await screen.findByText('This Test Suite is unavailable in the selected Project.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Configuration' })).not.toBeInTheDocument();
    expect(testSuiteApi.update).not.toHaveBeenCalled();
  });

  it('saves Suite settings while retaining membership, identity, and other settings', async () => {
    const user = open('/automation/configuration?project=PRJ-A&suite=11');
    await user.click(await screen.findByRole('button', { name: 'Advanced Settings' }));
    const tags = screen.getByRole('textbox', { name: 'Add tag' });
    await user.type(tags, 'regression'); await user.click(screen.getByRole('button', { name: 'Add Tag' }));
    await user.click(screen.getByRole('button', { name: 'Save Configuration' }));
    await waitFor(() => expect(testSuiteApi.update).toHaveBeenCalledWith(11, {
      name: suiteA.name, description: suiteA.description, scenarioIds: [21], executionMode: 'PARALLEL',
      lifecycleEnabled: false, tags: ['smoke', 'regression'], parameterSets: [{ username: 'alice' }], extensions: [],
    }));
    expect(await screen.findByText('Alpha suite configuration saved.')).toBeInTheDocument();
  });

  it('preserves execution configuration when editing Suite membership/details', async () => {
    const user = open('/automation/management?project=PRJ-A');
    await user.click(await screen.findByRole('button', { name: 'Edit Suite' }));
    const dialog = screen.getByRole('dialog');
    const name = within(dialog).getByRole('textbox', { name: /Name/ });
    await user.clear(name); await user.type(name, 'Renamed');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(testSuiteApi.update).toHaveBeenCalledWith(11, expect.objectContaining({
      name: 'Renamed', scenarioIds: [21], executionMode: 'PARALLEL', lifecycleEnabled: false,
      tags: ['smoke'], parameterSets: [{ username: 'alice' }], extensions: [],
    })));
  });

  it('reuses Project-scoped Suite run and CI/CD export actions', async () => {
    vi.mocked(testSuiteApi.run).mockResolvedValue({ id: 100, testSuiteId: 11, status: 'PASSED',
      startedAt: '2026-09-19T12:00:00', total: 1, passed: 1, failed: 0, skipped: 0 });
    vi.mocked(testSuiteApi.export).mockResolvedValue({ blob: new Blob(['zip']), fileName: 'suite.zip' });
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:suite') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const user = open('/automation/management?project=PRJ-A');
    await user.click(await screen.findByRole('button', { name: 'Run Suite' }));
    expect(testSuiteApi.run).toHaveBeenCalledWith('PRJ-A', 11);
    expect(await screen.findByText('PASSED')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Export for CI/CD' }));
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(testSuiteApi.export).toHaveBeenCalledWith('PRJ-A', 11);
    expect(screen.getByRole('link', { name: 'Open Reporting' })).toHaveAttribute('href', '/projects/PRJ-A/reporting');
  });
});

describe('QA configuration workflow', () => {
  it('loads saved settings and switches between execution modes', async () => {
    const user = open('/automation/configuration?project=PRJ-A');
    expect(await screen.findByRole('radio', { name: 'Parallel' })).toBeChecked();
    expect(screen.queryByLabelText('Generate JUnit lifecycle hooks')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Parameter sets (JSON)')).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Sequential' }));
    await user.click(screen.getByRole('button', { name: 'Save Configuration' }));
    await waitFor(() => expect(testSuiteApi.update).toHaveBeenCalledWith(11, expect.objectContaining({ executionMode: 'SEQUENTIAL' })));
    expect(await screen.findByText('Alpha suite configuration saved.')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Parallel' }));
    await user.click(screen.getByRole('button', { name: 'Save Configuration' }));
    await waitFor(() => expect(testSuiteApi.update).toHaveBeenLastCalledWith(11, expect.objectContaining({ executionMode: 'PARALLEL' })));
  });

  it('adds, edits, validates, and deletes visual data sets without JSON', async () => {
    const user = open('/automation/configuration?project=PRJ-A');
    await user.click(await screen.findByRole('button', { name: 'Add Data Set' }));
    let dialog = within(screen.getByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Add Data Set' }));
    expect(dialog.getByText(/Add at least one parameter/)).toBeInTheDocument();
    await user.type(dialog.getByLabelText('Parameter 1 name'), 'username');
    await user.type(dialog.getByLabelText('Parameter 1 value'), 'bob');
    await user.click(dialog.getByRole('button', { name: 'Add Parameter' }));
    await user.type(dialog.getByLabelText('Parameter 2 name'), 'password');
    await user.type(dialog.getByLabelText('Parameter 2 value'), 'secret');
    await user.click(dialog.getByRole('button', { name: 'Add Data Set' }));
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit Data Set 2' }));
    dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByLabelText('Parameter 1 value')).toHaveValue('bob');
    await user.clear(dialog.getByLabelText('Parameter 1 value')); await user.type(dialog.getByLabelText('Parameter 1 value'), 'charlie');
    await user.click(dialog.getByRole('button', { name: 'Remove parameter 2' }));
    await user.click(dialog.getByRole('button', { name: 'Apply Data Set' }));
    await user.click(screen.getByRole('button', { name: 'Delete Data Set 1' }));
    await user.click(screen.getByRole('button', { name: 'Save Configuration' }));
    await waitFor(() => expect(testSuiteApi.update).toHaveBeenCalledWith(11, expect.objectContaining({ parameterSets: [{ username: 'charlie' }] })));
  });

  it('validates tags and protects unsaved Project, Suite and page changes', async () => {
    const second = { ...suiteA, id: 13, name: 'Second suite', executionMode: 'SEQUENTIAL' as const, parameterSets: [], tags: [] };
    vi.mocked(testSuiteApi.list).mockImplementation(async id => id === 'PRJ-A' ? [suiteA, second] : [suiteB]);
    const user = open('/automation/configuration?project=PRJ-A');
    await user.click(await screen.findByRole('button', { name: 'Advanced Settings' }));
    await user.type(screen.getByLabelText('Add tag'), 'bad tag');
    await user.click(screen.getByRole('button', { name: 'Add Tag' }));
    expect(screen.getByText(/Tags must start/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save Configuration' }));
    expect(testSuiteApi.update).not.toHaveBeenCalled();
    await selectProject(user, 'Beta (PRJ-B)');
    expect(screen.getByText('You have unsaved automation configuration changes.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue Editing' }));
    expect(screen.getByLabelText('Add tag')).toHaveValue('bad tag');
    await user.click(await screen.findByRole('combobox', { name: 'Test Suite' }));
    await user.click(screen.getByRole('option', { name: 'Second suite' }));
    await user.click(screen.getByRole('button', { name: 'Discard Changes' }));
    expect(await screen.findByRole('radio', { name: 'Sequential' })).toBeChecked();
    expect(screen.getByText(/No test data configured/)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Parallel' }));
    await user.click(screen.getByRole('tab', { name: 'Management' }));
    await user.click(screen.getByRole('button', { name: 'Continue Editing' }));
    expect(await screen.findByRole('heading', { name: 'Automation Configuration' })).toBeInTheDocument();
    await selectProject(user, 'Beta (PRJ-B)');
    await user.click(screen.getByRole('button', { name: 'Discard Changes' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('project=PRJ-B'));
    expect(await screen.findByRole('combobox', { name: 'Test Suite' })).toHaveTextContent('Beta suite');
    expect(screen.getByTestId('location')).not.toHaveTextContent('suite=13');
  }, 15000);

  it('handles no Projects', async () => {
    vi.mocked(projectApi.getProjects).mockResolvedValue([]);
    open('/automation/configuration');
    expect(await screen.findByText(/No Projects are available yet/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Configuration' })).not.toBeInTheDocument();
  });
  it('handles no Suites and shows workflow guidance', async () => {
    vi.mocked(testSuiteApi.list).mockResolvedValue([]);
    const user = open('/automation/configuration?project=PRJ-A');
    expect(await screen.findByText(/No Test Suites exist for this Project/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Automation Management' })).toHaveAttribute('href', '/automation/management?project=PRJ-A');
    await user.click(screen.getByRole('button', { name: 'Automation workflow guide' }));
    expect(screen.getByText(/Author automation actions in Test Design/)).toBeVisible();
  });
});

 it('discovers existing API and UI actions in Project-scoped workspaces', async () => {
   vi.mocked(automationApi.overview).mockImplementation(async id => id === 'PRJ-A' ? [
     {scenarioId:'SC-1',scenarioDescription:'Dashboard API',testCaseId:'TC-1',testCaseName:'Dashboard checks',testStepId:'STEP-1',stepOrder:1,actionType:'API_GET',automatable:true},
     {scenarioId:'SC-1',scenarioDescription:'Dashboard API',testCaseId:'TC-1',testCaseName:'Dashboard checks',testStepId:'STEP-2',stepOrder:2,actionType:'CLICK',automatable:true}
   ] : []);
   const user=open('/automation/api?project=PRJ-A');
   expect(await screen.findByText('Dashboard checks')).toBeInTheDocument();
   expect(screen.getByRole('tab',{name:'UI Automation'})).toBeInTheDocument();
   expect(screen.getByRole('tab',{name:'Git Integration'})).toHaveAttribute('href','/automation/git?project=PRJ-A');
   expect(screen.getByRole('link',{name:'View Automation'})).toHaveAttribute('href','/test-cases/TC-1?automationStep=STEP-1');
   expect(screen.queryByRole('textbox',{name:'API Base URL'})).not.toBeInTheDocument();
   await user.click(screen.getByRole('tab',{name:'UI Automation'}));
   expect(await screen.findByText(/1 UI actions: CLICK/)).toBeInTheDocument();
   await user.click(screen.getByRole('tab',{name:'API Automation'}));
   await selectProject(user,'Beta (PRJ-B)');
   expect(await screen.findByText(/No API automation has been configured/)).toBeInTheDocument();
   expect(screen.queryByText('Dashboard checks')).not.toBeInTheDocument();
   expect(automationApi.overview).toHaveBeenCalledWith('PRJ-B');
 });
