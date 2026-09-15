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
    RequirementMonitoring,
} from '../../types/hierarchyMonitoring';

interface RequirementMonitoringPanelProps {
    monitoring: RequirementMonitoring;
}

function testTypeLabel(value: string): string {
    return value
        .split('_')
        .map((part) =>
            part.charAt(0) +
            part.slice(1).toLowerCase()
        )
        .join(' ');
}

export default function RequirementMonitoringPanel({
                                                       monitoring,
                                                   }: RequirementMonitoringPanelProps) {
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
                            Requirement Monitoring
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Current execution and automation summary across this Requirement&apos;s Test Scenarios.
                        </Typography>
                    </Box>

                    <MonitoringSummaryCards
                        summary={monitoring.summary}
                        scopeType="requirement"
                        scopeId={monitoring.requirementBusinessId}
                        leadingMetrics={[
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
                            Scenario Breakdown
                        </Typography>

                        {monitoring.scenarios.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                No Test Scenarios in this Requirement yet.
                            </Typography>
                        ) : (
                            <Stack spacing={1.5}>
                                {monitoring.scenarios.map((item) => (
                                    <Card
                                        key={item.scenarioBusinessId}
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
                                                        <Stack
                                                            direction="row"
                                                            gap={1}
                                                            alignItems="center"
                                                            flexWrap="wrap"
                                                        >
                                                            <Typography fontWeight={700}>
                                                                {item.scenarioBusinessId}
                                                            </Typography>

                                                            <Chip
                                                                size="small"
                                                                label={testTypeLabel(item.testType)}
                                                            />
                                                        </Stack>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ mt: 0.5 }}
                                                        >
                                                            {item.description}
                                                        </Typography>
                                                    </Box>

                                                    <Button
                                                        size="small"
                                                        endIcon={<ArrowForward />}
                                                        onClick={() =>
                                                            navigate(
                                                                `/scenarios/${item.scenarioBusinessId}`,
                                                            )
                                                        }
                                                    >
                                                        Open Scenario
                                                    </Button>
                                                </Stack>

                                                <Stack
                                                    direction="row"
                                                    gap={1}
                                                    flexWrap="wrap"
                                                >
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
