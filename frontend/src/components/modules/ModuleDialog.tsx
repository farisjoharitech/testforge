import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { ApiError } from '../../api/apiClient';
import { moduleApi } from '../../api/moduleApi';
import type { Module } from '../../types/module';

interface Props { open: boolean; testPlanId: string; module?: Module | null; onClose: () => void; onSaved: (module: Module) => void; }
export default function ModuleDialog({ open, testPlanId, module, onClose, onSaved }: Props) {
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setName(module?.name ?? ''); setDescription(module?.description ?? ''); setError(null); } }, [open, module]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); const normalized = name.trim();
    if (!normalized) { setError('Module name is required.'); return; }
    try { setSaving(true); setError(null); onSaved(module
      ? await moduleApi.update(module.id, { name: normalized, description: description.trim() || undefined })
      : await moduleApi.create(testPlanId, { name: normalized, description: description.trim() || undefined }));
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Unable to save Module.'); }
    finally { setSaving(false); }
  };
  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>{module ? 'Edit Module' : 'Create Module'}</DialogTitle>
    <DialogContent><Stack component="form" id="module-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField required label="Name" value={name} inputProps={{ maxLength: 255 }} onChange={(e) => setName(e.target.value)} />
      <TextField label="Description (Optional)" multiline minRows={3} value={description} inputProps={{ maxLength: 1000 }} onChange={(e) => setDescription(e.target.value)} />
    </Stack></DialogContent>
    <DialogActions><Button disabled={saving} onClick={onClose}>Cancel</Button><Button type="submit" form="module-form" variant="contained" disabled={saving}>{saving ? <CircularProgress size={18} /> : 'Save'}</Button></DialogActions>
  </Dialog>;
}
