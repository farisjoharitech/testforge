import { useEffect, useState } from 'react';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Radio, RadioGroup, Stack, Typography,
} from '@mui/material';
import { apiErrorMessage } from '../../api/apiClient';
import { testDesignExportApi, type TestDesignExportScope } from '../../api/testDesignExportApi';
import type { Module } from '../../types/module';
import type { Project } from '../../types/project';
import type { TestPlan } from '../../types/testPlan';

interface Props {
  open: boolean;
  project: Pick<Project, 'projectId' | 'name'>;
  testPlan?: Pick<TestPlan, 'testPlanId' | 'name'>;
  module?: Pick<Module, 'moduleId' | 'name'>;
  onClose: () => void;
}

export default function ExportTestDesignDialog({ open, project, testPlan, module, onClose }: Props) {
  const [scope, setScope] = useState<TestDesignExportScope>('PROJECT');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setScope('PROJECT'); setError(null); }
  }, [open]);

  const exportWorkbook = async () => {
    try {
      setExporting(true);
      setError(null);
      const { blob, fileName } = await testDesignExportApi.download(
        project.projectId, scope, testPlan?.testPlanId, module?.moduleId,
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (exportError) {
      setError(apiErrorMessage(exportError, 'Test Design could not be exported.'));
    } finally {
      setExporting(false);
    }
  };

  return <Dialog open={open} onClose={exporting ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>Export Test Design</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack spacing={0.25}>
          <Typography variant="caption" color="text.secondary">Project</Typography>
          <Typography fontWeight={700}>{project.name}</Typography>
        </Stack>
        <Stack spacing={0.5}>
          <Typography fontWeight={700}>Scope</Typography>
          <RadioGroup value={scope} onChange={(event) => setScope(event.target.value as TestDesignExportScope)}>
            <FormControlLabel value="PROJECT" control={<Radio />} label="Entire Project" />
            {testPlan && <FormControlLabel value="TEST_PLAN" control={<Radio />} label={`Current Test Plan — ${testPlan.name}`} />}
            {module && <FormControlLabel value="MODULE" control={<Radio />} label={`Current Module — ${module.name}`} />}
          </RadioGroup>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          The workbook contains the current Test Design hierarchy and lightweight automation status. Execution history and automation implementation details are excluded.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={exporting}>Cancel</Button>
      <Button variant="contained" onClick={() => void exportWorkbook()} disabled={exporting}
        startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : undefined}>
        {exporting ? 'Generating Excel...' : 'Export Excel'}
      </Button>
    </DialogActions>
  </Dialog>;
}
