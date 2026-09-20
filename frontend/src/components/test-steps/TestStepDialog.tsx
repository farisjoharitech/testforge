import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { apiErrorMessage } from '../../api/apiClient';
import { automationApi } from '../../api/automationApi';
import StepAutomationSummary from './StepAutomationSummary';
import { testStepApi } from '../../api/testStepApi';
import AutomationStepDialog, { type AutomationStepEditorHandle, type AutomationStepFormValues } from '../automation/AutomationStepDialog';
import type { AutomationStep, UpdateAutomationStepRequest } from '../../types/automation';
import type { AutomationType } from '../../types/testCase';
import type { TestStep, TestStepAutomationChange } from '../../types/testStep';

export interface TestStepDialogProps {
  testCaseId: string;
  scenarioAutomatable: boolean;
  automationType: AutomationType;
  testStep?: TestStep;
  automationStep?: AutomationStep | null;
  suggestedAutomationOrder: number;
  initialSection?: "automation";
  onAutomationRemoved?: (id: number) => void;
  onClose: () => void;
  onSaved: (step: TestStep) => void;
}

export default function TestStepDialog({ testCaseId, scenarioAutomatable, automationType, testStep,
  automationStep: originalAutomation, suggestedAutomationOrder, initialSection, onAutomationRemoved, onClose, onSaved }: TestStepDialogProps) {
  const [removed, setRemoved] = useState(false);
  const automationStep = removed ? undefined : originalAutomation;
  const automationSection = useRef<HTMLDivElement>(null);
  useEffect(() => { if (initialSection === 'automation') automationSection.current?.focus(); }, [initialSection]);
  const [action, setAction] = useState(testStep?.action ?? '');
  const [target, setTarget] = useState(testStep?.target ?? '');
  const [input, setInput] = useState(testStep?.inputValue ?? '');
  const [expected, setExpected] = useState(testStep?.expectedResult ?? '');
  const [order, setOrder] = useState(testStep?.stepOrder ?? 1);
  const [automate, setAutomate] = useState(!!automationStep);

  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editor = useRef<AutomationStepEditorHandle>(null);
  const save = async (configuration?: UpdateAutomationStepRequest) => {
    const change: TestStepAutomationChange | undefined = configuration
      ? { configuration, expectedAutomationStepId: automationStep?.id }
      : undefined;
    try {
      setSaving(true); setError(null);
      const fields = { action: action.trim(), target: target.trim() || undefined,
        inputValue: input || undefined, expectedResult: expected.trim() || undefined, automation: change };
      const saved = testStep
        ? await testStepApi.updateTestStep(testStep.id, { ...fields, stepOrder: order })
        : await testStepApi.createTestStep(testCaseId, fields);
      onSaved(saved);
    } catch (e) { setError(apiErrorMessage(e, 'Unable to save Test Step.')); }
    finally { setSaving(false); }
  };
  const removeAutomation = async () => {
    if (!automationStep || saving) return;
    try {
      setSaving(true); setError(null);
      await automationApi.deleteStep(automationStep.id);
      setRemoved(true); setAutomate(false); setConfirmRemoval(false);
      onAutomationRemoved?.(automationStep.id);
    } catch (e) { setError(apiErrorMessage(e, 'Unable to remove automation.')); }
    finally { setSaving(false); }
  };
  const submit = () => {
    if (!action.trim()) { setError('Test Step action is required.'); return; }
    if (testStep && (!Number.isInteger(order) || order < 1)) { setError('Step Order must be a whole number of at least 1.'); return; }
    if (action.length > 1000 || target.length > 500 || input.length > 2000 || expected.length > 2000) {
      setError('A Test Step field exceeds its maximum length.'); return;
    }
    setError(null);
    if (scenarioAutomatable && automate) editor.current?.submit();
    else void save();
  };
  const automationSubmit = (values: AutomationStepFormValues) => void save({
    stepOrder: values.stepOrder, actionType: values.actionType, target: values.target || null,
    selectorStrategy: values.selectorStrategy || null, selectorValue: values.selectorValue || null,
    selectorRole: values.selectorRole || null, selectorName: values.selectorName || null,
    selectorExact: values.selectorExact, inputValue: values.inputValue || null,
    expectedValue: values.expectedValue || null, apiConfig: values.apiConfig,
  });
  return <Dialog open fullWidth maxWidth="md" slotProps={{ transition: { onEntered: () => { if (initialSection === "automation") automationSection.current?.focus(); } } }} onClose={() => { if (!saving) onClose(); }}>
    <DialogTitle>{testStep ? 'Edit Test Step' : 'Create Test Step'}</DialogTitle>
    <DialogContent><Stack spacing={2.5} sx={{ pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="h6">Test Step</Typography>
      {testStep && <TextField label="Step Order" type="number" required value={order} disabled={saving}
        onChange={e => setOrder(Number(e.target.value))} inputProps={{ min: 1, step: 1 }} />}
      <TextField label="Action / description" required multiline minRows={2} value={action} disabled={saving}
        onChange={e => setAction(e.target.value)} inputProps={{ maxLength: 1000 }} />
      <TextField label="Target" value={target} disabled={saving} onChange={e => setTarget(e.target.value)} inputProps={{ maxLength: 500 }} />
      <TextField label="Input / Test Data" type="password" autoComplete="new-password" value={input} disabled={saving}
        helperText="Input is masked to protect sensitive values." onChange={e => setInput(e.target.value)} inputProps={{ maxLength: 2000 }} />
      <TextField label="Expected Result" multiline minRows={2} value={expected} disabled={saving}
        onChange={e => setExpected(e.target.value)} inputProps={{ maxLength: 2000 }} />
      {(scenarioAutomatable || automationStep) && <Stack spacing={2} ref={automationSection} tabIndex={-1} aria-label="Automation configuration" sx={{ outline: "none" }}>
        <Typography variant="h6">Automation</Typography>
        <FormControlLabel label="Automate this step" control={<Switch checked={automate} disabled={saving || !scenarioAutomatable}
          onChange={e => {
            if (!e.target.checked && automationStep) setConfirmRemoval(true);
            else { setAutomate(e.target.checked); }
          }} />} />
        {automationStep && <><StepAutomationSummary step={automationStep} /><Button color="error" disabled={saving} sx={{ alignSelf: "flex-start" }} onClick={() => setConfirmRemoval(true)}>Remove Automation</Button></>}
        {confirmRemoval && <Alert severity="warning">
          Remove Automation Action? This removes only the automation mapping. The Test Step and historical results are preserved.
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setConfirmRemoval(false)}>Keep automation</Button>
            <Button color="error" disabled={saving} onClick={() => void removeAutomation()}>Confirm Remove Automation</Button>
          </Stack>
        </Alert>}
        {!scenarioAutomatable && automationStep && <Alert severity="info">This Scenario is no longer automatable. You can still view or remove its saved action.</Alert>}
        {scenarioAutomatable && automate && <AutomationStepDialog embedded submitRef={editor} open mode={automationStep ? 'edit' : 'create'}
          testCaseId={testCaseId} automationType={automationType} testSteps={[]} automationStep={automationStep}
          suggestedOrder={suggestedAutomationOrder} fixedSourceTestStepId={testStep?.id ?? -1}
          saving={saving} onClose={onClose} onSubmit={automationSubmit} />}
      </Stack>}
    </Stack></DialogContent>
    <DialogActions><Button disabled={saving} onClick={onClose}>Cancel</Button>
      <Button variant="contained" disabled={saving || confirmRemoval} onClick={submit}>{saving ? 'Saving…' : testStep ? 'Save Changes' : 'Create Step'}</Button>
    </DialogActions>
  </Dialog>;
}
