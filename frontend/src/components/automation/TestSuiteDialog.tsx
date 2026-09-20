import { useState } from 'react';
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, TextField } from '@mui/material';
import type { SuiteScenario, TestSuite, TestSuiteRequest } from '../../types/testSuite';
import { suiteRequest } from '../../pages/automation/useAutomationSuites';

interface Props {
  suite: TestSuite | null;
  candidates: SuiteScenario[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (request: TestSuiteRequest) => void;
}

export default function TestSuiteDialog({ suite, candidates, saving, error, onClose, onSave }: Props) {
  const [name, setName] = useState(suite?.name ?? '');
  const [description, setDescription] = useState(suite?.description ?? '');
  const [selected, setSelected] = useState(suite?.scenarios.map(s => s.id) ?? []);
  const scenarios = [...new Map([...(suite?.scenarios ?? []), ...candidates].map(s => [s.id, s])).values()];
  const submit = () => onSave({
    ...(suite ? suiteRequest(suite) : { executionMode: 'SEQUENTIAL' as const, lifecycleEnabled: true, tags: [], parameterSets: [], extensions: [] }),
    name: name.trim(), description: description.trim() || null, scenarioIds: selected,
  });
  return <Dialog open onClose={() => { if (!saving) onClose(); }} fullWidth>
    <DialogTitle>{suite ? 'Edit' : 'Create'} Test Suite</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField required label="Name" value={name} onChange={e => setName(e.target.value)} disabled={saving} />
      <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} disabled={saving} />
      <Alert severity="info">Select Scenarios from Test Design. Execution settings are managed in Automation Configuration.</Alert>
      {!scenarios.length && <Alert severity="info">No automation-eligible Scenarios. Enable automation in Test Design first.</Alert>}
      {scenarios.map(s => <FormControlLabel key={s.id}
        control={<Checkbox checked={selected.includes(s.id)} disabled={saving} onChange={e => setSelected(v => e.target.checked ? [...v, s.id] : v.filter(id => id !== s.id))} />}
        label={`${s.scenarioId} — ${s.description}${candidates.some(c => c.id === s.id) ? '' : ' (no longer automation-eligible)'}`} />)}
    </Stack></DialogContent>
    <DialogActions><Button disabled={saving} onClick={onClose}>Cancel</Button>
      <Button variant="contained" disabled={saving || !name.trim() || !selected.length} onClick={submit}>{saving ? 'Saving…' : 'Save'}</Button>
    </DialogActions>
  </Dialog>;
}
