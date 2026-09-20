import { Button, Stack, TextField, Typography } from '@mui/material';

export default function RequestParametersEditor({ label, rows, onChange }: {
  label: string; rows: [string, string][]; onChange: (rows: [string, string][]) => void;
}) {
  return <Stack spacing={1}>
    <Typography fontWeight={600}>{label}</Typography>
    {rows.map(([name, value], index) => <Stack key={index} direction="row" spacing={1}>
      <TextField label={`${label} ${index + 1} name`} value={name} onChange={e => onChange(rows.map((row, i) => i === index ? [e.target.value, row[1]] : row))} />
      <TextField label={`${label} ${index + 1} value`} value={value} type={/authorization|password|token|secret|api.?key/i.test(name) ? 'password' : 'text'} onChange={e => onChange(rows.map((row, i) => i === index ? [row[0], e.target.value] : row))} />
      <Button aria-label={`Remove ${label} ${index + 1}`} onClick={() => onChange(rows.filter((_, i) => i !== index))}>Remove</Button>
    </Stack>)}
    <Button sx={{ alignSelf: 'flex-start' }} onClick={() => onChange([...rows, ['', '']])}>{label === 'Headers' ? 'Add Header' : 'Add Parameter'}</Button>
  </Stack>;
}
