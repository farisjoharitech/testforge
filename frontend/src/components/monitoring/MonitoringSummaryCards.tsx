import {
    Box,
    Card,
    CardContent,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';

import type {
    MonitoringSummary,
} from '../../types/hierarchyMonitoring';

interface MonitoringSummaryCardsProps {
    summary: MonitoringSummary;
    leadingMetrics?: Array<{
        label: string;
        value: number;
    }>;
}

function MetricCard({
                        label,
                        value,
                        suffix = '',
                    }: {
    label: string;
    value: number;
    suffix?: string;
}) {
    return (
        <Card variant="outlined">
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
            </CardContent>
        </Card>
    );
}

export default function MonitoringSummaryCards({
                                                   summary,
                                                   leadingMetrics = [],
                                               }: MonitoringSummaryCardsProps) {
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
                />

                <MetricCard
                    label="Needs Attention"
                    value={summary.needsAttentionTestCases}
                />

                <MetricCard
                    label="Not Run"
                    value={summary.notRunTestCases}
                />

                <MetricCard
                    label="Manual"
                    value={summary.manualTestCases}
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
