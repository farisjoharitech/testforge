import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    ArrowBack,
    Refresh,
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
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import {
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router-dom';

import {
    monitoringDrilldownApi,
} from '../../api/monitoringDrilldownApi';

import {
    PageHeader,
} from '../../components/common/PageHeader';

import type {
    MonitoringDrilldown,
    MonitoringDrilldownStatus,
    MonitoringScopeType,
} from '../../types/monitoringDrilldown';

const FILTERS: Array<{
    value: MonitoringDrilldownStatus;
    label: string;
}> = [
    { value: 'ALL', label: 'All Test Cases' },
    { value: 'PASSED', label: 'Passed' },
    { value: 'NEEDS_ATTENTION', label: 'Needs Attention' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'TIMED_OUT', label: 'Timed Out' },
    { value: 'ERROR', label: 'Error' },
    { value: 'NOT_RUN', label: 'Not Run' },
    { value: 'MANUAL', label: 'Manual' },
];

function isScopeType(
    value: string | undefined,
): value is MonitoringScopeType {
    return value === 'project'
        || value === 'test-plan'
        || value === 'requirement';
}

function isFilter(
    value: string | null,
): value is MonitoringDrilldownStatus {
    return FILTERS.some(
        (filter) => filter.value === value,
    );
}

function filterLabel(
    value: MonitoringDrilldownStatus,
): string {
    return FILTERS.find(
        (filter) => filter.value === value,
    )?.label ?? value;
}

function resultColor(
    status: string,
): 'success' | 'error' | 'warning' | 'default' {
    switch (status) {
        case 'PASSED':
            return 'success';
        case 'FAILED':
        case 'ERROR':
            return 'error';
        case 'TIMED_OUT':
        case 'NOT_RUN':
            return 'warning';
        default:
            return 'default';
    }
}

function formatDate(
    value: string | null,
): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString();
}

function formatDuration(
    value: number | null,
): string {
    if (value === null) {
        return '—';
    }

    return value < 1000
        ? `${value} ms`
        : `${(value / 1000).toFixed(2)} s`;
}

function getBackPath(
    scopeType: MonitoringScopeType,
    scopeId: string,
): string {
    switch (scopeType) {
        case 'project':
            return `/projects/${encodeURIComponent(scopeId)}`;
        case 'test-plan':
            return `/test-plans/${encodeURIComponent(scopeId)}`;
        case 'requirement':
            return `/requirements/${encodeURIComponent(scopeId)}`;
    }
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Failed to load monitoring drill-down.';
}

export default function MonitoringDrilldownPage() {
    const navigate = useNavigate();
    const params = useParams<{
        scopeType: string;
        scopeId: string;
    }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const scopeType = isScopeType(params.scopeType)
        ? params.scopeType
        : null;
    const scopeId = params.scopeId ?? '';

    const status = useMemo<MonitoringDrilldownStatus>(() => {
        const requested = searchParams.get('status');
        return isFilter(requested) ? requested : 'ALL';
    }, [searchParams]);

    const [data, setData] = useState<MonitoringDrilldown | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!scopeType || !scopeId) {
            setError('Invalid monitoring scope.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await monitoringDrilldownApi.getTestCases(
                scopeType,
                scopeId,
                status,
            );
            setData(response);
        } catch (loadError) {
            console.error(loadError);
            setError(getErrorMessage(loadError));
        } finally {
            setLoading(false);
        }
    }, [scopeId, scopeType, status]);

    useEffect(() => {
        void load();
    }, [load]);

    if (!scopeType || !scopeId) {
        return (
            <Alert severity="error">
                Invalid monitoring drill-down URL.
            </Alert>
        );
    }

    return (
        <Stack spacing={3}>
            <PageHeader
                title="Monitoring Drill-down"
                subtitle="Inspect the exact Test Cases behind the current monitoring status."
                actions={
                    <Stack direction="row" spacing={1}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(getBackPath(scopeType, scopeId))}
                        >
                            Back to Monitoring
                        </Button>

                        <Button
                            startIcon={<Refresh />}
                            onClick={() => void load()}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Stack>
                }
            />

            {error && (
                <Alert severity="error">
                    {error}
                </Alert>
            )}

            <Card variant="outlined">
                <CardContent>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        alignItems={{ md: 'center' }}
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                {data?.scopeName ?? scopeId}
                            </Typography>
                            <Typography color="text.secondary">
                                {data?.scopeBusinessId ?? scopeId}
                                {' · '}
                                {filterLabel(status)}
                                {' · '}
                                {data?.totalCount ?? 0} Test Case(s)
                            </Typography>
                        </Box>

                        <FormControl sx={{ minWidth: 220 }}>
                            <InputLabel id="monitoring-status-filter-label">
                                Current Result
                            </InputLabel>
                            <Select
                                labelId="monitoring-status-filter-label"
                                label="Current Result"
                                value={status}
                                onChange={(event) => {
                                    setSearchParams({
                                        status: event.target.value,
                                    });
                                }}
                            >
                                {FILTERS.map((filter) => (
                                    <MenuItem
                                        key={filter.value}
                                        value={filter.value}
                                    >
                                        {filter.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </CardContent>
            </Card>

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        py: 6,
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : data && data.testCases.length > 0 ? (
                <TableContainer component={Card} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Current Result</TableCell>
                                <TableCell>Test Case</TableCell>
                                <TableCell>Hierarchy</TableCell>
                                <TableCell>Automation</TableCell>
                                <TableCell>Latest Completed Run</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {data.testCases.map((testCase) => (
                                <TableRow key={testCase.testCaseId} hover>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={filterLabel(testCase.currentResult)}
                                            color={resultColor(testCase.currentResult)}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Typography fontWeight={700}>
                                            {testCase.testCaseName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {testCase.testCaseBusinessId}
                                            {' · '}
                                            {testCase.priority}
                                            {' · '}
                                            {testCase.testType}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">
                                            {testCase.testPlanName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {testCase.requirementBusinessId}
                                            {' · '}
                                            {testCase.scenarioBusinessId}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">
                                            {testCase.automationType}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {testCase.automationStatus}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        {testCase.executionId ? (
                                            <>
                                                <Typography variant="body2">
                                                    {formatDate(testCase.startedAt)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDuration(testCase.durationMs)}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography color="text.secondary">
                                                No completed automation run
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            justifyContent="flex-end"
                                        >
                                            <Button
                                                size="small"
                                                startIcon={<Visibility />}
                                                onClick={() => navigate(
                                                    `/test-cases/${encodeURIComponent(testCase.testCaseBusinessId)}`,
                                                )}
                                            >
                                                Test Case
                                            </Button>

                                            {testCase.executionId && (
                                                <Button
                                                    size="small"
                                                    onClick={() => navigate(
                                                        `/results/${encodeURIComponent(testCase.executionId!)}`,
                                                    )}
                                                >
                                                    Result
                                                </Button>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Alert severity="info">
                    No Test Cases match the selected current result.
                </Alert>
            )}
        </Stack>
    );
}
