import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import TestCaseDetailsPage from './TestCaseDetailsPage';
import { testStepApi } from '../../api/testStepApi';
import { automationApi } from '../../api/automationApi';
import { deletionImpactApi } from '../../api/deletionImpactApi';
const fixture = vi.hoisted(() => ({ action: {id:4,automationStepId:'A1',sourceTestStepId:10,stepOrder:1,actionType:'API_GET',target:'https://example.test/api',selectorExact:false}, steps:[{id:10,testStepId:'STEP-1',stepOrder:1,action:'Send request',inputValue:'hidden-secret'},{id:11,testStepId:'STEP-2',stepOrder:2,action:'Manual verification'}] }));
vi.mock('../../api/testCaseApi', () => ({ testCaseApi: { getTestCaseByBusinessId: vi.fn().mockResolvedValue({ id:1,testCaseId:'TC-1',name:'API case',scenarioId:2,scenarioBusinessId:'SC-1',automatable:true,automationType:'API',automationStatus:'NOT_AUTOMATED',priority:'MEDIUM',status:'DRAFT',testType:'FUNCTIONAL' }) } }));
vi.mock('../../api/testScenarioApi', () => ({testScenarioApi:{getTestScenario:vi.fn().mockResolvedValue({automatable:true})}}));
vi.mock('../../api/testStepApi', () => ({testStepApi:{getByTestCase:vi.fn(),getDeleteImpact:vi.fn(),deleteTestStep:vi.fn()}}));
vi.mock('../../api/automationApi', () => ({automationApi:{getScriptByTestCase:vi.fn().mockResolvedValue({id:3}),getSteps:vi.fn(),deleteStep:vi.fn()}}));
vi.mock('../../api/deletionImpactApi', () => ({deletionImpactApi:{get:vi.fn()}}));
beforeEach(() => {
 vi.clearAllMocks();
 vi.mocked(testStepApi.getByTestCase).mockResolvedValue(fixture.steps as any);
 vi.mocked(automationApi.getSteps).mockResolvedValue([fixture.action] as any);
 vi.mocked(testStepApi.getDeleteImpact).mockResolvedValue({mappedAutomationStepCount:1} as any);
 vi.mocked(automationApi.deleteStep).mockResolvedValue(undefined);
 vi.mocked(deletionImpactApi.get).mockResolvedValue({resourceType:'TEST_STEP',resourceId:10,businessId:'STEP-1',owned:{'Test Steps':1,'Automation Actions':1},preserved:{},blockers:[],canDelete:true});
});
function open(query='') {render(<MemoryRouter initialEntries={['/test-cases/TC-1'+query]}><Routes><Route path='/test-cases/:testCaseId' element={<TestCaseDetailsPage/>}/></Routes></MemoryRouter>);return userEvent.setup();}
it('shows saved API actions and opens the canonical editor through status',async()=>{
 const user=open();await user.click(await screen.findByRole('button',{name:'AUTOMATED - 1 action'}));
 expect(await screen.findByRole('dialog')).toBeInTheDocument();expect(screen.getByLabelText(/Request URL/)).toHaveValue('https://example.test/api');
 expect(screen.getByLabelText('Automation configuration')).toBeInTheDocument();
 expect(screen.queryByText(/hidden-secret/)).not.toBeInTheDocument();
});
it('deletes a Step and its owned automation through one confirmation',async()=>{
 const user=open();await screen.findByText('API REQUEST - GET');
 await user.click(screen.getByRole('button',{name:'Delete Step 1'}));
 expect(testStepApi.deleteTestStep).not.toHaveBeenCalled();
 expect(await screen.findByText('1 Automation Actions')).toBeInTheDocument();
 await user.click(screen.getByRole('button',{name:'Delete test step'}));
 await waitFor(()=>expect(testStepApi.deleteTestStep).toHaveBeenCalledWith(10));
});
it('opens a workspace deep link and retains one Create Step workflow',async()=>{
 open('?automationStep=STEP-1');expect(await screen.findByLabelText(/Request URL/)).toHaveValue('https://example.test/api');
 expect(screen.queryByText(/Automation workflow/i)).not.toBeInTheDocument();
});
