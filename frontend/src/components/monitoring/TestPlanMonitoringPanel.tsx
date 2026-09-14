import {
    ArrowForward,
} from '@mui/icons-material';

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from '@mui/material';

import {
    useNavigate,
} from 'react-router-dom';

import MonitoringSummaryCards from './MonitoringSummaryCards';

import type {
    TestPlanMonitoring,
} from '../../types/hierarchyMonitoring';

interface TestPlanMonitoringPanelProps {
    monitoring: TestPlanMonitoring;
}

export default function TestPlanMonitoringPanel({
                                                    monitoring,
                                                }: TestPlanMonitoringPanelProps) {
    const navigate = useNavigate();

    return (
        <Card
            variant="outlined"
            sx={{ borderRadius: 3 }}
        >
            <CardContent>
                <Stack spacing={3}>
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Test Plan Monitoring
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Current automation health derived from each Test Case&apos;s latest completed execution.
                        </Typography>
                    </Box>

                    <MonitoringSummaryCards
                        summary={monitoring.summary}
                        leadingMetrics={[
                            {
                                label: 'Requirements',
                                value: monitoring.totalRequirements,
                            },
                            {
                                label: 'Scenarios',
                                value: monitoring.totalScenarios,
                            },
                        ]}
                    />

                    <Divider />

                    <Box>
                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ mb: 1.5 }}
                        >
                            Requirement Breakdown
                        </Typography>

                        {monitoring.requirements.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                No Requirements in this Test Plan yet.
                            </Typography>
                        ) : (
                            <Stack spacing={1.5}>
                                {monitoring.requirements.map((item) => (
                                    <Card
                                        key={item.requirementBusinessId}
                                        variant="outlined"
                                    >
                                        <CardContent>
                                            <Stack spacing={1.5}>
                                                <Stack
                                                    direction={{
                                                        xs: 'column',
                                                        md: 'row',
                                                    }}
                                                    justifyContent="space-between"
                                                    gap={1.5}
                                                >
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            fontWeight={700}
                                                            noWrap
                                                        >
                                                            {item.requirementBusinessId}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {item.description}
                                                        </Typography>
                                                    </Box>

                                                    <Button
                                                        size="small"
                                                        endIcon={<ArrowForward />}
                                                        onClick={() =>
                                                            navigate(
                                                                `/requirements/${item.requirementBusinessId}`,
                                                            )
                                                        }
                                                    >
                                                        Open Requirement
                                                    </Button>
                                                </Stack>

                                                <Stack
                                                    direction="row"
                                                    gap={1}
                                                    flexWrap="wrap"
                                                >
                                                    <Chip
                                                        size="small"
                                                        label={`${item.totalScenarios} scenarios`}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`${item.summary.totalTestCases} cases`}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`${item.summary.passedTestCases} passed`}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`${item.summary.needsAttentionTestCases} needs attention`}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`${item.summary.notRunTestCases} not run`}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`${item.summary.manualTestCases} manual`}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`${item.summary.passRatePercentage}% pass rate`}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`${item.summary.automationCoveragePercentage}% coverage`}
                                                    />
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
