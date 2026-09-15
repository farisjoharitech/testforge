import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';

import {
    useNavigate,
} from 'react-router-dom';

import type {
    MonitoringSummary,
} from '../../types/hierarchyMonitoring';

import type {
    MonitoringDrilldownStatus,
    MonitoringScopeType,
} from '../../types/monitoringDrilldown';

interface MonitoringSummaryCardsProps {
    summary: MonitoringSummary;
    leadingMetrics?: Array<{
        label: string;
        value: number;
    }>;
    scopeType: MonitoringScopeType;
    scopeId: string;
}

function MetricCard({
                        label,
                        value,
                        suffix = '',
                        onClick,
                    }: {
    label: string;
    value: number;
    suffix?: string;
    onClick?: () => void;
}) {
    const content = (
        <CardContent>
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                variant="h5"
                sx={{
                    mt: 0.5,
                    fontWeight: 700,
                }}
            >
                {value}{suffix}
            </Typography>

            {onClick && (
                <Typography
                    variant="caption"
                    color="primary"
                >
                    View Test Cases
                </Typography>
            )}
        </CardContent>
    );

    return (
        <Card variant="outlined">
            {onClick ? (
                <CardActionArea onClick={onClick}>
                    {content}
                </CardActionArea>
            ) : content}
        </Card>
    );
}

export default function MonitoringSummaryCards({
                                                   summary,
                                                   leadingMetrics = [],
                                                   scopeType,
                                                   scopeId,
                                               }: MonitoringSummaryCardsProps) {
    const navigate = useNavigate();

    const openDrilldown = (
        status: MonitoringDrilldownStatus,
    ) => {
        navigate(
            `/monitoring/${scopeType}/${encodeURIComponent(scopeId)}/test-cases?status=${status}`,
        );
    };

    return (
        <Stack spacing={2}>
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(4, minmax(0, 1fr))',
                    },
                }}
            >
                {leadingMetrics.map((metric) => (
                    <MetricCard
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                    />
                ))}

                <MetricCard
                    label="Test Cases"
                    value={summary.totalTestCases}
                    onClick={() => openDrilldown('ALL')}
                />

                <MetricCard
                    label="Automatable"
                    value={summary.automatableTestCases}
                />

                <MetricCard
                    label="Automation Coverage"
                    value={summary.automationCoveragePercentage}
                    suffix="%"
                />

                <MetricCard
                    label="Pass Rate"
                    value={summary.passRatePercentage}
                    suffix="%"
                />
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        md: 'repeat(4, minmax(0, 1fr))',
                    },
                }}
            >
                <MetricCard
                    label="Passed"
                    value={summary.passedTestCases}
                    onClick={() => openDrilldown('PASSED')}
                />

                <MetricCard
                    label="Needs Attention"
                    value={summary.needsAttentionTestCases}
                    onClick={() => openDrilldown('NEEDS_ATTENTION')}
                />

                <MetricCard
                    label="Not Run"
                    value={summary.notRunTestCases}
                    onClick={() => openDrilldown('NOT_RUN')}
                />

                <MetricCard
                    label="Manual"
                    value={summary.manualTestCases}
                    onClick={() => openDrilldown('MANUAL')}
                />
            </Box>

            <Box>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 0.75 }}
                >
                    <Typography variant="body2">
                        Automation coverage
                    </Typography>

                    <Typography
                        variant="body2"
                        fontWeight={600}
                    >
                        {summary.automatedTestCases} / {summary.automatableTestCases}
                    </Typography>
                </Stack>

                <LinearProgress
                    variant="determinate"
                    value={Math.min(
                        100,
                        Math.max(
                            0,
                            summary.automationCoveragePercentage,
                        ),
                    )}
                />
            </Box>
        </Stack>
    );
}
