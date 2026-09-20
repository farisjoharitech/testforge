import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { automationApi } from '../../api/automationApi';
vi.mock('../../api/automationApi', () => ({ automationApi: { deleteStep: vi.fn().mockResolvedValue(undefined) } }));
import TestStepDialog from './TestStepDialog';
import { testStepApi } from '../../api/testStepApi';
vi.mock('../../api/testStepApi', () => ({ testStepApi: { createTestStep: vi.fn(), updateTestStep: vi.fn() } }));
const step = { id: 1, testStepId: 'STEP-1', stepOrder: 1, action: 'Enter username', testCaseId: 2 } as any;
const automation = { id: 3, automationStepId: 'AUTO-1', sourceTestStepId: 1, stepOrder: 1, actionType: 'FILL', selectorStrategy: 'LABEL', selectorValue: 'Username', selectorExact: false, inputValue: 'user@example.com' } as any;
const props = { testCaseId: 'TC-1', scenarioAutomatable: true, automationType: 'UI' as const, suggestedAutomationOrder: 1, onClose: vi.fn(), onSaved: vi.fn() };
beforeEach(() => { vi.clearAllMocks(); vi.mocked(testStepApi.createTestStep).mockResolvedValue(step); vi.mocked(testStepApi.updateTestStep).mockResolvedValue(step); });
async function select(label: string, option: RegExp) {
 const user = userEvent.setup(); await user.click(screen.getByRole('combobox', { name: label })); await user.click(screen.getByRole('option', { name: option }));
}
it('creates a manual Step without automation for a manual Scenario', async () => {
 const user=userEvent.setup(); render(<TestStepDialog {...props} scenarioAutomatable={false} />);
 expect(screen.queryByLabelText('Automate this step')).not.toBeInTheDocument();
 await user.type(screen.getByLabelText(/Action.*description/), 'Enter username'); await user.click(screen.getByRole('button', { name: 'Create Step' }));
 await waitFor(() => expect(testStepApi.createTestStep).toHaveBeenCalledWith('TC-1', expect.objectContaining({ action: 'Enter username', automation: undefined })));
});
it('requires explicit valid automation and saves both parts in one request', async () => {
 const user=userEvent.setup(); render(<TestStepDialog {...props} />);
 await user.type(screen.getByLabelText(/Action.*description/), 'Enter username'); await user.click(screen.getByLabelText('Automate this step'));
 expect(screen.getByRole('combobox', { name: 'Automation Action' })).not.toHaveTextContent(/Fill|Click|Navigate/);
 await user.click(screen.getByRole('button', { name: 'Create Step' })); expect(testStepApi.createTestStep).not.toHaveBeenCalled();
 await select('Automation Action', /^Fill$/i);
 await user.click(screen.getByRole('button', { name: 'Create Step' })); expect(testStepApi.createTestStep).not.toHaveBeenCalled();
 await select('Selector Strategy', /Label/i); await user.type(screen.getByLabelText(/Selector Value/), 'Username'); await user.type(screen.getByLabelText(/^Input Value/), 'user@example.com');
 await user.click(screen.getByRole('button', { name: 'Create Step' }));
 await waitFor(() => expect(testStepApi.createTestStep).toHaveBeenCalledTimes(1));
 expect(testStepApi.createTestStep).toHaveBeenCalledWith('TC-1', expect.objectContaining({ automation: expect.objectContaining({ configuration: expect.objectContaining({ actionType: 'FILL', selectorValue: 'Username', inputValue: 'user@example.com' }) }) }));
}, 15000);
it('changes fields with the selected action', async () => {
 const user=userEvent.setup(); render(<TestStepDialog {...props} />); await user.click(screen.getByLabelText('Automate this step'));
 await select('Automation Action', /^Navigate$/i); expect(screen.getByLabelText(/^URL/)).toBeInTheDocument(); expect(screen.queryByRole('combobox', { name: 'Selector Strategy' })).not.toBeInTheDocument();
 await select('Automation Action', /^Click$/i); expect(screen.getByRole('combobox', { name: 'Selector Strategy' })).toBeInTheDocument(); expect(screen.queryByLabelText(/^URL/)).not.toBeInTheDocument();
 await select('Automation Action', /^Assert Text$/i); expect(screen.getByLabelText(/Expected Value/)).toBeInTheDocument();
});
it('loads and edits existing automation in the same form', async () => {
 const user=userEvent.setup(); render(<TestStepDialog {...props} testStep={step} automationStep={automation} />);
 expect(screen.getByLabelText(/^Input Value/)).toHaveValue('user@example.com'); await user.clear(screen.getByLabelText(/^Input Value/)); await user.type(screen.getByLabelText(/^Input Value/), 'changed'); await user.click(screen.getByRole('button', { name: 'Save Changes' }));
 await waitFor(() => expect(testStepApi.updateTestStep).toHaveBeenCalledWith(1, expect.objectContaining({ automation: expect.objectContaining({ expectedAutomationStepId: 3, configuration: expect.objectContaining({ inputValue: 'changed' }) }) })));
});
it('requires confirmation and removes only automation while keeping manual edits', async () => {
 const removed=vi.fn(); const user=userEvent.setup(); render(<TestStepDialog {...props} testStep={step} automationStep={automation} onAutomationRemoved={removed} />);
 expect(screen.getByText(/Locator: LABEL - Username/)).toBeInTheDocument();
 await user.click(screen.getByRole('button', { name: 'Remove Automation' }));
 expect(automationApi.deleteStep).not.toHaveBeenCalled();
 await user.click(screen.getByRole('button', { name: 'Keep automation' }));
 await user.click(screen.getByRole('button', { name: 'Remove Automation' }));
 await user.click(screen.getByRole('button', { name: 'Confirm Remove Automation' }));
 await waitFor(() => expect(removed).toHaveBeenCalledWith(3));
 expect(screen.getByLabelText('Automate this step')).not.toBeChecked();
 expect(screen.getByLabelText(/Action.*description/)).toHaveValue('Enter username');
 expect(testStepApi.updateTestStep).not.toHaveBeenCalled();
});

it('edits API requests with structured headers/query values and validates JSON bodies', async () => {
 const user=userEvent.setup(); const api={...automation, actionType:'API_GET', target:'https://example.test/api', selectorStrategy:null, selectorValue:null, inputValue:null, apiConfig:JSON.stringify({headers:{Accept:'application/json'},queryParams:{page:'1'}})};
 render(<TestStepDialog {...props} testStep={step} automationStep={api} />);
 expect(screen.getByText('API REQUEST - GET')).toBeInTheDocument();
 expect(screen.getByLabelText('Headers 1 name')).toHaveValue('Accept');
 expect(screen.getByLabelText('Query Parameters 1 value')).toHaveValue('1');
 expect(screen.queryByRole('combobox',{name:'Selector Strategy'})).not.toBeInTheDocument();
 expect(screen.queryByLabelText('Request Body')).not.toBeInTheDocument();
 await select('HTTP Method', /^POST$/);
 await select('Request Body Type', /^JSON$/);
 await user.type(screen.getByLabelText('Request Body'), 'invalid');
 await user.click(screen.getByRole('button',{name:'Save Changes'}));
 expect(screen.getByText('Request body must contain valid JSON.')).toBeInTheDocument();
 expect(testStepApi.updateTestStep).not.toHaveBeenCalled();
 await user.clear(screen.getByLabelText('Request Body')); await user.type(screen.getByLabelText('Request Body'), '{{"name":"alice"}');
 await user.click(screen.getByRole('button',{name:'Add Header'}));
 await user.type(screen.getByLabelText('Headers 2 name'),'Authorization'); await user.type(screen.getByLabelText('Headers 2 value'),'Bearer ${{authToken}');
 await user.click(screen.getByRole('button',{name:'Save Changes'}));
 await waitFor(() => expect(testStepApi.updateTestStep).toHaveBeenCalled());
 const config=vi.mocked(testStepApi.updateTestStep).mock.calls[0][1].automation!.configuration!;
 expect(config.actionType).toBe('API_POST'); expect(JSON.parse(config.apiConfig!)).toMatchObject({headers:{Accept:'application/json',Authorization:'Bearer ${authToken}'},queryParams:{page:'1'},bodyType:'JSON',body:'{"name":"alice"}'});
}, 15000);
it('switches UI/API within one Step form and validates response status', async () => {
 const user=userEvent.setup();render(<TestStepDialog {...props} testStep={step} />);
 await user.click(screen.getByLabelText('Automate this step'));
 await select('Automation Type',/^API$/);await select('Automation Action',/^Assert Api Status$/i);
 await user.type(screen.getByLabelText(/Expected HTTP Status/),'999');await user.click(screen.getByRole('button',{name:'Save Changes'}));
 expect(testStepApi.updateTestStep).not.toHaveBeenCalled();
 await user.clear(screen.getByLabelText(/Expected HTTP Status/));await user.type(screen.getByLabelText(/Expected HTTP Status/),'200');
 await user.click(screen.getByRole('button',{name:'Save Changes'}));
 await waitFor(() => expect(testStepApi.updateTestStep).toHaveBeenCalledWith(1,expect.objectContaining({automation:expect.objectContaining({configuration:expect.objectContaining({actionType:'ASSERT_API_STATUS',expectedValue:'200'})})})));
 await select('Automation Type',/^UI$/);await select('Automation Action',/^Click$/);
 expect(screen.getByRole('combobox',{name:'Selector Strategy'})).toBeInTheDocument();expect(screen.queryByLabelText(/Expected HTTP Status/)).not.toBeInTheDocument();
});
