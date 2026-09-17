import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Assessment,
  CheckCircle,
  ErrorOutlineOutlined,
  FolderCopy,
  Refresh,
  Science,
  Speed,
  Visibility,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { PageHeader } from '../../components/common/PageHeader';
import type {
  DashboardSummary,
  ExecutionStatusSummary,
  PortfolioDashboard,
  RecentAutomationRun,
} from '../../types/dashboard';
import type { AutomationRunStatus } from '../../types/automation';

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
}

function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%', flex: 1, minWidth: 200 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>{title}</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{description}</Typography>
          </Box>
          <Box sx={{ color: 'primary.main', mt: 0.5 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function formatPercent(value: number) { return `${value.toFixed(1)}%`; }
function formatDate(value?: string | null) { return value ? new Date(value).toLocaleString() : '—'; }
function humanize(value: string) {
  return value.toLowerCase().split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
function runColor(status: AutomationRunStatus): 'success' | 'error' | 'warning' | 'info' | 'default' {
  if (status === 'PASSED') return 'success';
  if (status === 'FAILED' || status === 'ERROR') return 'error';
  if (status === 'PARTIAL' || status === 'TIMED_OUT') return 'warning';
  if (status === 'RUNNING') return 'info';
  return 'default';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [execution, setExecution] = useState<ExecutionStatusSummary | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [loadedSummary, loadedExecution, loadedPortfolio] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getExecutionStatus(),
        dashboardApi.getPortfolio(),
      ]);
      setSummary(loadedSummary);
      setExecution(loadedExecution);
      setPortfolio(loadedPortfolio);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load portfolio dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading && !portfolio) {
    return <Stack alignItems="center" sx={{ py: 10 }} spacing={2}><CircularProgress /><Typography>Loading portfolio dashboard…</Typography></Stack>;
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="QA Portfolio Dashboard"
        description="Global view of project health, automation coverage, execution quality, plans needing attention, and recent automation runs."
        actions={<Button variant="outlined" startIcon={<Refresh />} onClick={() => void load()} disabled={loading}>Refresh</Button>}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
        <MetricCard title="Projects" value={portfolio?.totalProjects ?? 0} description="Projects in the QA portfolio" icon={<FolderCopy />} />
        <MetricCard title="Test Plans" value={portfolio?.totalTestPlans ?? 0} description="Plans across all projects" icon={<Assessment />} />
        <MetricCard title="Automation Coverage" value={formatPercent(summary?.automationCoveragePercentage ?? 0)} description={`${summary?.automatedTestCases ?? 0} of ${summary?.automatableTestCases ?? 0} eligible Test Cases automated`} icon={<Science />} />
        <MetricCard title="Pass Rate" value={formatPercent(execution?.passRatePercentage ?? 0)} description={`${execution?.passed ?? 0} passed of ${execution?.totalExecutions ?? 0} completed executions`} icon={<CheckCircle />} />
        <MetricCard title="Needs Attention" value={portfolio?.projectsNeedingAttention ?? 0} description={`${portfolio?.testPlansNeedingAttention ?? 0} Test Plans have failures/errors/timeouts or unrun coverage`} icon={<ErrorOutlineOutlined />} />
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={800}>Project Health</Typography>
              <Typography variant="body2" color="text.secondary">Projects are ordered by current Test Cases needing attention.</Typography>
            </Box>
            {!portfolio?.projects.length ? <Alert severity="info">No projects are available yet.</Alert> : (
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Project</TableCell><TableCell align="right">Plans</TableCell><TableCell align="right">Test Cases</TableCell>
                    <TableCell>Automation Coverage</TableCell><TableCell>Pass Rate</TableCell><TableCell align="right">Needs Attention</TableCell><TableCell align="right">Not Run</TableCell><TableCell />
                  </TableRow></TableHead>
                  <TableBody>{portfolio.projects.map(project => (
                    <TableRow key={project.projectId} hover>
                      <TableCell><Typography fontWeight={700}>{project.projectName}</Typography><Typography variant="caption" color="text.secondary">{project.projectId}</Typography></TableCell>
                      <TableCell align="right">{project.totalTestPlans}</TableCell><TableCell align="right">{project.totalTestCases}</TableCell>
                      <TableCell sx={{ minWidth: 160 }}><Typography variant="caption">{formatPercent(project.automationCoveragePercentage)}</Typography><LinearProgress variant="determinate" value={project.automationCoveragePercentage} sx={{ mt: 0.5, height: 7, borderRadius: 5 }} /></TableCell>
                      <TableCell sx={{ minWidth: 140 }}><Typography variant="caption">{formatPercent(project.passRatePercentage)}</Typography><LinearProgress variant="determinate" value={project.passRatePercentage} sx={{ mt: 0.5, height: 7, borderRadius: 5 }} /></TableCell>
                      <TableCell align="right"><Chip size="small" color={project.needsAttentionTestCases > 0 ? 'error' : 'success'} label={project.needsAttentionTestCases} /></TableCell>
                      <TableCell align="right">{project.notRunTestCases}</TableCell>
                      <TableCell align="right"><Button size="small" startIcon={<Visibility />} onClick={() => navigate(`/projects/${project.projectId}`)}>Open</Button></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} alignItems="stretch">
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box><Typography variant="h6" fontWeight={800}>Test Plans Needing Attention</Typography><Typography variant="body2" color="text.secondary">Plans with failing/error/timeout Test Cases or automation-eligible Test Cases that have not run.</Typography></Box>
              {!portfolio?.testPlansNeedingAttentionList.length ? <Alert severity="success">No Test Plans currently need attention.</Alert> : (
                <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Test Plan</TableCell><TableCell align="right">Attention</TableCell><TableCell align="right">Not Run</TableCell><TableCell align="right">Coverage</TableCell><TableCell /></TableRow></TableHead>
                <TableBody>{portfolio.testPlansNeedingAttentionList.map(plan => <TableRow key={plan.testPlanId} hover>
                  <TableCell><Typography fontWeight={700}>{plan.testPlanName}</Typography><Typography variant="caption" color="text.secondary">{plan.projectName} • {plan.testPlanBusinessId}</Typography></TableCell>
                  <TableCell align="right"><Chip size="small" color={plan.needsAttentionTestCases ? 'error' : 'default'} label={plan.needsAttentionTestCases} /></TableCell>
                  <TableCell align="right">{plan.notRunTestCases}</TableCell><TableCell align="right">{formatPercent(plan.automationCoveragePercentage)}</TableCell>
                  <TableCell align="right"><Button size="small" onClick={() => navigate(`/test-plans/${plan.testPlanBusinessId}`)}>Open</Button></TableCell>
                </TableRow>)}</TableBody></Table></TableContainer>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box><Typography variant="h6" fontWeight={800}>Recent Automation Runs</Typography><Typography variant="body2" color="text.secondary">Latest parent runs across single, multi, Scenario, Test Plan, and Test Set execution.</Typography></Box>
              {!portfolio?.recentRuns.length ? <Alert severity="info">No Automation Runs have been created yet.</Alert> : (
                <Stack spacing={1.25}>{portfolio.recentRuns.map((run: RecentAutomationRun) => (
                  <Box key={run.id} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                      <Box><Typography fontWeight={700}>{run.runId}</Typography><Typography variant="caption" color="text.secondary">{humanize(run.runType)} • {formatDate(run.startedAt)}</Typography></Box>
                      <Stack direction="row" spacing={1} alignItems="center"><Chip size="small" color={runColor(run.status)} label={humanize(run.status)} /><Button size="small" startIcon={<Speed />} onClick={() => navigate(`/automation/runs/${run.id}`)}>Open</Button></Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{run.completedExecutions}/{run.totalExecutions} completed • {run.passedExecutions} passed • {run.failedExecutions} failed</Typography>
                  </Box>
                ))}</Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
}
