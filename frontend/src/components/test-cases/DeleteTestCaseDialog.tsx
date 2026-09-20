import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import type { AuthoringDeleteImpact } from '../../types/deleteImpact';

export default function DeleteTestCaseDialog({ open, name, impact, deleting, error, onClose, onConfirm, onRetry }: {
  open: boolean; name: string; impact: AuthoringDeleteImpact | null; deleting: boolean; error: string | null;
  onClose: () => void; onConfirm: () => void; onRetry: () => void;
}) {
  const blockers = impact?.blockingDependencies ?? [];
  return <Dialog open={open} fullWidth maxWidth="sm" onClose={deleting ? undefined : onClose}>
    <DialogTitle>Delete Test Case?</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {!impact ? error ? <Button onClick={onRetry}>Retry dependency preview</Button> : <CircularProgress aria-label="Loading deletion dependencies" /> : <>
        <Typography>You are about to permanently delete:</Typography>
        <Typography variant="h6">{name}</Typography>
        <Stack spacing={0.5}>
          <Typography fontWeight={700} color="error.main">WILL BE DELETED</Typography>
          <Typography>1 Test Case</Typography>
          <Typography>{impact.testStepCount} Test {impact.testStepCount === 1 ? 'Step' : 'Steps'}</Typography>
          <Typography>{impact.automationScriptCount} Automation {impact.automationScriptCount === 1 ? 'Script' : 'Scripts'}</Typography>
          <Typography>{impact.automationStepCount} Automation {impact.automationStepCount === 1 ? 'Action' : 'Actions'}</Typography>
        </Stack>
        <Alert severity="info"><Typography fontWeight={700}>WILL BE PRESERVED</Typography>
          {impact.historicalExecutionCount} completed historical {impact.historicalExecutionCount === 1 ? 'execution will' : 'executions will'} be preserved and remain available in Reporting.
          <Typography variant="body2">Historical Suite results and Test Case/Test Step snapshots remain available. Scenario membership in Test Suites is unchanged.</Typography>
        </Alert>
        {!!blockers.length && <Alert severity="warning"><Typography fontWeight={700}>BLOCKING DEPENDENCIES</Typography>
          {blockers.map(message => <Typography key={message}>{message}</Typography>)}
        </Alert>}
        <Typography color="text.secondary">This action cannot be undone.</Typography>
      </>}
    </Stack></DialogContent>
    <DialogActions><Button disabled={deleting} onClick={onClose}>Cancel</Button>
      <Button color="error" variant="contained" disabled={deleting || !impact || blockers.length > 0} onClick={onConfirm}>
        {deleting ? 'Deleting Test Case...' : 'Delete Test Case'}
      </Button>
    </DialogActions>
  </Dialog>;
}
