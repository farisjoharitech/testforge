import {
  Delete,
} from '@mui/icons-material';

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deletionImpactApi } from '../../api/deletionImpactApi';
import { apiErrorMessage } from '../../api/apiClient';
import type { DeletionImpact } from '../../types/deletionImpact';

interface DeleteConfirmationDialogProps {
  open: boolean;
  title: string;
  entityName: string;
  description?: string;
  deleting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  resourceType?: 'PROJECT' | 'TEST_PLAN' | 'MODULE' | 'REQUIREMENT' | 'SCENARIO' | 'TEST_CASE' | 'TEST_STEP' | 'TEST_SUITE';
  resourceId?: number;
  requireNameConfirmation?: boolean;
  blockerActionPath?: string;
}

export default function DeleteConfirmationDialog({
  open,
  title,
  entityName,
  description,
  deleting = false,
  error,
  onClose,
  onConfirm,
  resourceType,
  resourceId,
  requireNameConfirmation = false,
  blockerActionPath,
}: DeleteConfirmationDialogProps) {
  const [impact, setImpact] = useState<DeletionImpact | null>(null);
  const [impactError, setImpactError] = useState<string | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  useEffect(() => {
    if (!open) { setImpact(null); setImpactError(null); setConfirmation(''); return; }
    if (!resourceType || resourceId == null) return;
    let active = true; setLoadingImpact(true); setImpactError(null);
    void deletionImpactApi.get(resourceType, resourceId).then(value => { if (active) setImpact(value); })
      .catch(err => { if (active) setImpactError(apiErrorMessage(err, 'Unable to analyze deletion impact.')); })
      .finally(() => { if (active) setLoadingImpact(false); });
    return () => { active = false; };
  }, [open, resourceId, resourceType]);
  const blockers = impact?.blockers ?? [];
  const owned = Object.entries(impact?.owned ?? {}).filter(([, count]) => count > 0);
  const preserved = Object.entries(impact?.preserved ?? {}).filter(([, count]) => count > 0);
  const ready = (!resourceType || !!impact) && !loadingImpact && !impactError && blockers.length === 0
    && (!requireNameConfirmation || confirmation === entityName);
  return (
    <Dialog
      open={open}
      onClose={
        deleting
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {title}
      </DialogTitle>

      <DialogContent>
        <Stack
          spacing={2}
          sx={{
            pt: 1,
          }}
        >
          {error && (
            <Alert
              severity="error"
            >
              {error}
            </Alert>
          )}
          {impactError && <Alert severity="error">{impactError}</Alert>}

          <Typography>
            You are about to
            permanently delete:
          </Typography>

          <Typography
            variant="h6"
            fontWeight={700}
          >
            {entityName}
          </Typography>

          {loadingImpact && <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={18} /><Typography>Analyzing deletion impact...</Typography></Stack>}

          {!!owned.length && <Stack spacing={0.5}>
            <Typography fontWeight={700} color="error.main">WILL BE DELETED</Typography>
            {owned.map(([name, count]) => <Typography key={name}>{count} {name}</Typography>)}
          </Stack>}

          {!!preserved.length && <Alert severity="info" variant="outlined">
            <Typography fontWeight={700}>WILL BE PRESERVED</Typography>
            {preserved.map(([name, count]) => <Typography key={name}>{count} {name}</Typography>)}
            <Typography variant="body2">Historical reporting snapshots remain available.</Typography>
          </Alert>}

          {!!blockers.length && <Alert severity="warning"><Typography fontWeight={700}>BLOCKING DEPENDENCIES</Typography>{blockers.map(item => <Typography key={item}>{item}</Typography>)}</Alert>}

          {description && !resourceType && (
            <Alert
              severity="warning"
              variant="outlined"
            >
              {description}
            </Alert>
          )}

          {requireNameConfirmation && <TextField label={`Type ${entityName} to confirm`} value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" />}

          <Typography
            color="text.secondary"
          >
            This action cannot be
            undone.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          disabled={deleting}
          onClick={onClose}
        >
          Cancel
        </Button>

        {!!blockers.length && blockerActionPath && <Button component={Link} to={blockerActionPath} variant="contained">Manage Test Suites</Button>}

        <Button
          color="error"
          variant="contained"
          disabled={deleting || !ready}
          startIcon={
            deleting ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <Delete />
            )
          }
          onClick={onConfirm}
        >
          {deleting
            ? 'Deleting...'
            : `Delete${resourceType ? ` ${resourceType.toLowerCase().replace('_', ' ')}` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
