import type { ReactNode } from 'react';

import {
    ArrowForward,
    Assessment,
    CheckCircle,
    Description,
    ErrorOutlineOutlined,
    Science,
    Speed,
    TimerOff,
} from '@mui/icons-material';

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';

import {
    useNavigate,
} from 'react-router-dom';

import type {
    ProjectMonitoring,
    ProjectMonitoringExecution,
    ProjectMonitoringExecutionStatus,
} from '../../types/projectMonitoring';

interface Props {
    monitoring: ProjectMonitoring;
}

interface MetricCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: ReactNode;
}

function MetricCard({
                        title,
                        value,
                        description,
                        icon,
                    }: MetricCardProps) {
    return (
        <Card
            variant="outlined"
            sx={{
                flex: '1 1 190px',
                minWidth: 0,
            }}
        >
            <CardContent>
                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={600}
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={800}
                            sx={{ mt: 0.75 }}
                        >
                            {value}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {description}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            color: 'primary.main',
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function formatPercentage(
    value: number,
): string {
    return `${value.toFixed(2)}%`;
}

function formatDate(
    value: string | null,
): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString();
}

function getStatusColor(
    status: ProjectMonitoringExecutionStatus,
): 'success' | 'error' | 'warning' {
    switch (status) {
        case 'PASSED':
            return 'success';
        case 'TIMED_OUT':
            return 'warning';
        case 'FAILED':
        case 'ERROR':
        default:
            return 'error';
    }
}

function ExecutionCard({
                           title,
                           execution,
                       }: {
    title: string;
    execution: ProjectMonitoringExecution | null;
}) {
    const navigate = useNavigate();

    return (
        <Card
            variant="outlined"
            sx={{ flex: '1 1 320px' }}
        >
            <CardContent>
                <Stack spacing={1.5}>
                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                    >
                        {title}
                    </Typography>

                    {!execution ? (
                        <Typography color="text.secondary">
                            No completed execution available.
                        </Typography>
                    ) : (
                        <>
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                            >
                                <Chip
                                    size="small"
                                    label={execution.status}
                                    color={getStatusColor(
                                        execution.status,
                                    )}
                                />

                                <Typography fontWeight={700}>
                                    {execution.testCaseName}
                                </Typography>
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {execution.testCaseBusinessId}
                                {' · '}
                                {execution.testPlanName}
                                {' · '}
                                {formatDate(execution.startedAt)}
                            </Typography>

                            <Button
                                size="small"
                                endIcon={<ArrowForward />}
                                sx={{ alignSelf: 'flex-start' }}
                                onClick={() =>
                                    navigate(
                                        `/results/${encodeURIComponent(
                                            execution.executionId,
                                        )}`,
                                    )
                                }
                            >
                                Open Result
                            </Button>
                        </>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default function ProjectMonitoringPanel({
                                                   monitoring,
                                               }: Props) {
    const navigate = useNavigate();

    return (
        <Stack spacing={3}>
            <Box>
                <Typography
                    variant="h5"
                    fontWeight={700}
                >
                    Project Monitoring
                </Typography>

                <Typography color="text.secondary">
                    Current project health based on each automatable
                    Test Case&apos;s latest completed automation execution.
                </Typography>
            </Box>

            <Stack
                direction="row"
                spacing={2}
                useFlexGap
                flexWrap="wrap"
            >
                <MetricCard
                    title="Test Plans"
                    value={monitoring.totalTestPlans}
                    description="Plans in this Project"
                    icon={<Description />}
                />

                <MetricCard
                    title="Test Cases"
                    value={monitoring.totalTestCases}
                    description={`${monitoring.automatableTestCases} automatable`}
                    icon={<Assessment />}
                />

                <MetricCard
                    title="Automation Coverage"
                    value={formatPercentage(
                        monitoring.automationCoveragePercentage,
                    )}
                    description={`${monitoring.automatedTestCases} automated`}
                    icon={<Science />}
                />

                <MetricCard
                    title="Pass Rate"
                    value={formatPercentage(
                        monitoring.passRatePercentage,
                    )}
                    description={`${monitoring.currentCompletedTestCases} current completed results`}
                    icon={<Speed />}
                />
            </Stack>

            <Stack
                direction="row"
                spacing={2}
                useFlexGap
                flexWrap="wrap"
            >
                <MetricCard
                    title="Passed"
                    value={monitoring.passedTestCases}
                    description="Current latest result"
                    icon={<CheckCircle />}
                />

                <MetricCard
                    title="Needs Attention"
                    value={monitoring.needsAttentionTestCases}
                    description={`${monitoring.failedTestCases} failed · ${monitoring.timedOutTestCases} timed out · ${monitoring.errorTestCases} errors`}
                    icon={<ErrorOutlineOutlined />}
                />

                <MetricCard
                    title="Not Run"
                    value={monitoring.notRunTestCases}
                    description="Automatable with no completed run"
                    icon={<TimerOff />}
                />

                <MetricCard
                    title="Manual"
                    value={monitoring.manualTestCases}
                    description="No automation result expected"
                    icon={<Description />}
                />
            </Stack>

            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
            >
                <ExecutionCard
                    title="Latest Passed"
                    execution={monitoring.latestPassedExecution}
                />

                <ExecutionCard
                    title="Latest Needs Attention"
                    execution={monitoring.latestNeedsAttentionExecution}
                />
            </Stack>

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Test Plan Breakdown
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Monitoring totals are derived from Test Cases
                                belonging to each Test Plan.
                            </Typography>
                        </Box>

                        {monitoring.testPlans.length === 0 ? (
                            <Typography color="text.secondary">
                                No Test Plans in this Project yet.
                            </Typography>
                        ) : (
                            <Stack
                                spacing={2}
                                divider={<Divider flexItem />}
                            >
                                {monitoring.testPlans.map(
                                    (testPlan) => (
                                        <Stack
                                            key={testPlan.testPlanId}
                                            spacing={1.25}
                                        >
                                            <Stack
                                                direction={{
                                                    xs: 'column',
                                                    sm: 'row',
                                                }}
                                                spacing={1}
                                                justifyContent="space-between"
                                            >
                                                <Box>
                                                    <Typography fontWeight={700}>
                                                        {testPlan.testPlanName}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {testPlan.testPlanBusinessId}
                                                    </Typography>
                                                </Box>

                                                <Button
                                                    size="small"
                                                    endIcon={<ArrowForward />}
                                                    onClick={() =>
                                                        navigate(
                                                            `/test-plans/${encodeURIComponent(
                                                                testPlan.testPlanBusinessId,
                                                            )}`,
                                                        )
                                                    }
                                                >
                                                    Open Test Plan
                                                </Button>
                                            </Stack>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                useFlexGap
                                                flexWrap="wrap"
                                            >
                                                <Chip
                                                    size="small"
                                                    label={`${testPlan.totalTestCases} cases`}
                                                />
                                                <Chip
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    label={`${formatPercentage(
                                                        testPlan.passRatePercentage,
                                                    )} pass rate`}
                                                />
                                                <Chip
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                    label={`${testPlan.passedTestCases} passed`}
                                                />
                                                <Chip
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    label={`${testPlan.needsAttentionTestCases} needs attention`}
                                                />
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label={`${testPlan.notRunTestCases} not run`}
                                                />
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label={`${testPlan.manualTestCases} manual`}
                                                />
                                            </Stack>

                                            <Stack spacing={0.5}>
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Automation coverage
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        fontWeight={700}
                                                    >
                                                        {formatPercentage(
                                                            testPlan.automationCoveragePercentage,
                                                        )}
                                                    </Typography>
                                                </Stack>

                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(
                                                        100,
                                                        Math.max(
                                                            0,
                                                            testPlan.automationCoveragePercentage,
                                                        ),
                                                    )}
                                                />
                                            </Stack>
                                        </Stack>
                                    ),
                                )}
                            </Stack>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Needs Attention
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Test Cases whose latest completed automation
                                result is FAILED, TIMED_OUT, or ERROR.
                            </Typography>
                        </Box>

                        {monitoring.needsAttention.length === 0 ? (
                            <Typography color="text.secondary">
                                No Test Cases currently need attention.
                            </Typography>
                        ) : (
                            <Stack
                                spacing={1.5}
                                divider={<Divider flexItem />}
                            >
                                {monitoring.needsAttention.map(
                                    (item) => (
                                        <Stack
                                            key={item.testCaseId}
                                            direction={{
                                                xs: 'column',
                                                md: 'row',
                                            }}
                                            spacing={1.5}
                                            justifyContent="space-between"
                                            alignItems={{
                                                xs: 'flex-start',
                                                md: 'center',
                                            }}
                                        >
                                            <Box>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    flexWrap="wrap"
                                                >
                                                    <Chip
                                                        size="small"
                                                        color={getStatusColor(
                                                            item.status,
                                                        )}
                                                        label={item.status}
                                                    />

                                                    <Typography fontWeight={700}>
                                                        {item.testCaseName}
                                                    </Typography>
                                                </Stack>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mt: 0.5 }}
                                                >
                                                    {item.testCaseBusinessId}
                                                    {' · '}
                                                    {item.testPlanName}
                                                    {' · '}
                                                    {item.automationType}
                                                </Typography>

                                                {item.errorMessage && (
                                                    <Typography
                                                        variant="body2"
                                                        color="error"
                                                        sx={{ mt: 0.5 }}
                                                    >
                                                        {item.errorMessage}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                            >
                                                <Button
                                                    size="small"
                                                    onClick={() =>
                                                        navigate(
                                                            `/test-cases/${encodeURIComponent(
                                                                item.testCaseBusinessId,
                                                            )}`,
                                                        )
                                                    }
                                                >
                                                    Test Case
                                                </Button>

                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() =>
                                                        navigate(
                                                            `/results/${encodeURIComponent(
                                                                item.executionId,
                                                            )}`,
                                                        )
                                                    }
                                                >
                                                    Result
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    ),
                                )}
                            </Stack>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}
