import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';

export default function TestDataDialog({ data, onClose, onSave }: {
  data?: Record<string, string>; onClose: () => void; onSave: (data: Record<string, string>) => void;
}) {
  const [rows, setRows] = useState(data ? Object.entries(data) : [['', '']]);
  const [error, setError] = useState('');
  const submit = () => {
    const names = rows.map(([name]) => name.trim());
    if (!rows.length || names.some(name => !/^[A-Za-z_][A-Za-z0-9_.-]{0,99}$/.test(name))) {
      setError('Add at least one parameter. Names must start with a letter or underscore and use only letters, numbers, dots, underscores or hyphens (up to 100 characters).'); return;
    }
    if (new Set(names).size !== names.length) { setError('Each parameter must have a unique name.'); return; }
    onSave(Object.fromEntries(rows.map(([, value], index) => [names[index], value])));
  };
  return <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
    <DialogTitle>{data ? 'Edit Test Data' : 'Add Test Data'}</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      <Typography>Each data set runs the same tests with these values. Values are masked to protect sensitive data.</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {rows.map(([name, value], index) => <Stack key={index} direction="row" spacing={1} alignItems="center">
        <TextField label={`Parameter ${index + 1} name`} value={name} onChange={e => setRows(rows.map((row, i) => i === index ? [e.target.value, row[1]] : row))} />
        <TextField label={`Parameter ${index + 1} value`} type="password" autoComplete="new-password" value={value} onChange={e => setRows(rows.map((row, i) => i === index ? [row[0], e.target.value] : row))} />
        <Button aria-label={`Remove parameter ${index + 1}`} onClick={() => setRows(rows.filter((_, i) => i !== index))}>Remove</Button>
      </Stack>)}
      <Button onClick={() => setRows([...rows, ['', '']])}>Add Parameter</Button>
    </Stack></DialogContent>
    <DialogActions><Button onClick={onClose}>Cancel</Button><Button variant="contained" onClick={submit}>{data ? 'Apply Data Set' : 'Add Data Set'}</Button></DialogActions>
  </Dialog>;
}
