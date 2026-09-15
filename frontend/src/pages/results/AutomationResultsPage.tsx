import {
  useCallback,
  useEffect,
  useState,
} from 'react';

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
  Refresh,
  Visibility,
} from '@mui/icons-material';

import {
  useNavigate,
} from 'react-router-dom';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import {
  automationResultApi,
} from '../../api/automationResultApi';

import type {
  AutomationResultStatus,
  AutomationResultSummary,
} from '../../types/automationResult';

type StatusFilter =
  | 'ALL'
  | AutomationResultStatus;

function formatDateTime(
  value: string | null | undefined,
): string {
  if (!value) {
    return '-';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}

function formatDuration(
  durationMs: number | null | undefined,
): string {
  if (
    durationMs === null
    || durationMs === undefined
  ) {
    return '-';
  }

  if (
    durationMs < 1000
  ) {
    return `${durationMs} ms`;
  }

  return `${(
    durationMs / 1000
  ).toFixed(2)} s`;
}

function getStatusColor(
  status: AutomationResultStatus,
):
  | 'success'
  | 'error'
  | 'warning'
  | 'default' {
  switch (status) {
    case 'PASSED':
      return 'success';

    case 'FAILED':
      return 'error';

    case 'TIMED_OUT':
      return 'warning';

    case 'ERROR':
      return 'error';

    default:
      return 'default';
  }
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return 'Failed to load automation results.';
}

export default function AutomationResultsPage() {
  const navigate =
    useNavigate();

  const [
    results,
    setResults,
  ] =
    useState<
      AutomationResultSummary[]
    >([]);

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      'ALL',
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const loadResults =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const status =
            statusFilter === 'ALL'
              ? undefined
              : statusFilter;

          const data =
            await automationResultApi
              .getAllResults(
                status,
              );

          setResults(
            data,
          );
        } catch (
          loadError
        ) {
          console.error(
            loadError,
          );

          setError(
            getErrorMessage(
              loadError,
            ),
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        statusFilter,
      ],
    );

  useEffect(
    () => {
      void loadResults();
    },
    [
      loadResults,
    ],
  );

  return (
    <Stack
      spacing={3}
    >
      <PageHeader
        title="Automation Results"
        subtitle="View completed Playwright automation executions and their results."
        actions={
          <Button
            variant="outlined"
            startIcon={
              <Refresh />
            }
            onClick={
              () => {
                void loadResults();
              }
            }
            disabled={
              loading
            }
          >
            Refresh
          </Button>
        }
      />

      {
        error
        && (
          <Alert
            severity="error"
          >
            {error}
          </Alert>
        )
      }

      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            spacing={2}
            sx={{
              alignItems: {
                xs: 'stretch',
                md: 'center',
              },
              justifyContent:
                'space-between',
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Execution History
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {results.length}{' '}
                {
                  results.length === 1
                    ? 'result'
                    : 'results'
                }
              </Typography>
            </Box>

            <FormControl
              size="small"
              sx={{
                minWidth:
                  180,
              }}
            >
              <InputLabel
                id="result-status-filter-label"
              >
                Status
              </InputLabel>

              <Select
                labelId="result-status-filter-label"
                id="result-status-filter"
                value={
                  statusFilter
                }
                label="Status"
                onChange={
                  (event) => {
                    const nextStatus =
                      event.target.value as StatusFilter;

                    setStatusFilter(
                      nextStatus,
                    );
                  }
                }
              >
                <MenuItem
                  value="ALL"
                >
                  All Results
                </MenuItem>

                <MenuItem
                  value="PASSED"
                >
                  Passed
                </MenuItem>

                <MenuItem
                  value="FAILED"
                >
                  Failed
                </MenuItem>

                <MenuItem
                  value="TIMED_OUT"
                >
                  Timed Out
                </MenuItem>

                <MenuItem
                  value="ERROR"
                >
                  Error
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {
        loading
        && (
          <Box
            sx={{
              display:
                'flex',
              justifyContent:
                'center',
              py:
                6,
            }}
          >
            <CircularProgress />
          </Box>
        )
      }

      {
        !loading
        && results.length === 0
        && (
          <Card
            variant="outlined"
          >
            <CardContent
              sx={{
                textAlign:
                  'center',
                py:
                  6,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
              >
                No results found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Completed executions will appear here after
                an automation run finishes.
              </Typography>
            </CardContent>
          </Card>
        )
      }

      {
        !loading
        && results.length > 0
        && (
          <Card
            variant="outlined"
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Test Case
                    </TableCell>

                    <TableCell>
                      Execution
                    </TableCell>

                    <TableCell>
                      Status
                    </TableCell>

                    <TableCell>
                      Started
                    </TableCell>

                    <TableCell>
                      Duration
                    </TableCell>

                    <TableCell>
                      Exit Code
                    </TableCell>

                    <TableCell
                      align="right"
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {
                    results.map(
                      (result) => (
                        <TableRow
                          key={
                            result.executionId
                          }
                          hover
                        >
                          <TableCell>
                            <Typography
                              variant="body1"
                              fontWeight={700}
                            >
                              {result.testCaseName}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontFamily="monospace"
                            >
                              {result.testCaseBusinessId}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontFamily="monospace"
                              sx={{
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {result.executionId}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                result.status
                              }
                              color={
                                getStatusColor(
                                  result.status,
                                )
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                            >
                              {
                                formatDateTime(
                                  result.startedAt,
                                )
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                            >
                              {
                                formatDuration(
                                  result.durationMs,
                                )
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              fontFamily="monospace"
                            >
                              {
                                result.exitCode
                                  ?? '-'
                              }
                            </Typography>
                          </TableCell>

                          <TableCell
                            align="right"
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                <Visibility />
                              }
                              onClick={
                                () => {
                                  navigate(
                                    `/results/${result.executionId}`,
                                  );
                                }
                              }
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )
      }
    </Stack>
  );
}