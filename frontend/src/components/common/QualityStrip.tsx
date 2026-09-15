import { Box, Chip, Stack, Typography } from '@mui/material';

interface QualityStripProps {
  automationCoveragePercentage: number;
  passRatePercentage: number;
  needsAttentionTestCases: number;
  notRunTestCases: number;
  manualTestCases?: number;
  onNeedsAttention?: () => void;
  onNotRun?: () => void;
}

function pct(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function QualityStrip({
  automationCoveragePercentage,
  passRatePercentage,
  needsAttentionTestCases,
  notRunTestCases,
  manualTestCases,
  onNeedsAttention,
  onNotRun,
}: QualityStripProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        px: 2,
        py: 1.5,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        <Typography variant="body2" fontWeight={700} sx={{ mr: 0.5 }}>Quality</Typography>
        <Chip size="small" label={`Automation ${pct(automationCoveragePercentage)}`} variant="outlined" />
        <Chip size="small" label={`Pass rate ${pct(passRatePercentage)}`} color="success" variant="outlined" />
        <Chip
          size="small"
          label={`Needs attention ${needsAttentionTestCases}`}
          color={needsAttentionTestCases > 0 ? 'error' : 'default'}
          variant="outlined"
          clickable={Boolean(onNeedsAttention)}
          onClick={onNeedsAttention}
        />
        <Chip
          size="small"
          label={`Not run ${notRunTestCases}`}
          color={notRunTestCases > 0 ? 'warning' : 'default'}
          variant="outlined"
          clickable={Boolean(onNotRun)}
          onClick={onNotRun}
        />
        {manualTestCases !== undefined && (
          <Chip size="small" label={`Manual ${manualTestCases}`} variant="outlined" />
        )}
      </Stack>
    </Box>
  );
}
