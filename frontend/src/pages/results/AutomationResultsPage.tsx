import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
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

import type {
  SelectChangeEvent,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import {
  automationResultApi,
} from '../../api/automationResultApi';

import type {
  AutomationResultStatus,
  AutomationResultSummary,
} from '../../types/automationResult';

import {
  PageHeader,
} from '../../components/common/PageHeader';

type ResultFilter =
  | 'ALL'
  | AutomationResultStatus;

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

function formatDate(
  value:
    | string
    | null,
): string {

  if (!value) {
    return '—';
  }

  return new Date(
    value,
  ).toLocaleString();
}

function formatDuration(
  durationMs:
    | number
    | null,
): string {

  if (
    durationMs === null
    || durationMs === undefined
  ) {
    return '—';
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  const seconds =
    durationMs / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(
      2,
    )} s`;
  }

  const minutes =
    Math.floor(
      seconds / 60,
    );

  const remainingSeconds =
    Math.round(
      seconds % 60,
    );

  return `${minutes}m ${remainingSeconds}s`;
}

function getErrorMessage(
  error: unknown,
): string {

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to load automation results.';
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
    >(
      [],
    );

  const [
    filter,
    setFilter,
  ] =
    useState<ResultFilter>(
      'ALL',
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const loadResults =
    useCallback(
      async () => {

        try {

          setLoading(
            true,
          );

          setError(
            null,
          );

          const loaded =
            await automationResultApi
              .getAllResults(
                filter === 'ALL'
                  ? undefined
                  : filter,
              );

          setResults(
            loaded,
          );

        } catch (err) {

          console.error(
            err,
          );

          setError(
            getErrorMessage(
              err,
            ),
          );

        } finally {

          setLoading(
            false,
          );
        }
      },
      [
        filter,
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

  const handleFilterChange =
    (
      event: SelectChangeEvent,
    ) => {

      setFilter(
        event.target
          .value as ResultFilter,
      );
    };

  return (
    <Stack
      spacing={3}
    >
      <PageHeader
        title="Automation Results"
        description="View completed Playwright automation executions and their results."
        actions={
          <Button
            variant="outlined"
            startIcon={
              <Refresh />
            }
            disabled={
              loading
            }
            onClick={() =>
              void loadResults()
            }
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert
          severity="error"
        >
          {error}
        </Alert>
      )}

      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack
            direction={{
              xs:
                'column',
              sm:
                'row',
            }}
            spacing={2}
            alignItems={{
              xs:
                'stretch',
              sm:
                'center',
            }}
            justifyContent="space-between"
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
                {
                  results.length
                }
                {' '}
                result
                {
                  results.length === 1
                    ? ''
                    : 's'
                }
              </Typography>
            </Box>

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>
                Status
              </InputLabel>

              <Select
                label="Status"
                value={
                  filter
                }
                onChange={
                  handleFilterChange
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

      {loading ? (
        <Box
          sx={{
            minHeight: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : results.length === 0 ? (
        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack
              spacing={1}
              alignItems="center"
              sx={{
                py: 6,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
              >
                No results found
              </Typography>

              <Typography
                color="text.secondary"
                textAlign="center"
              >
                Run an automation script
                first. Completed executions
                will appear here.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <TableContainer
          component={
            Card
          }
          variant="outlined"
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Execution
                </TableCell>

                <TableCell>
                  Test Case
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
              {results.map(
                result => (
                  <TableRow
                    key={
                      result.executionId
                    }
                    hover
                  >
                    <TableCell>
                      <Stack
                        spacing={0.5}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          fontFamily="monospace"
                        >
                          {
                            result.executionId
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            result
                              .automationScriptBusinessId
                          }
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack
                        spacing={0.5}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {
                            result.testCaseBusinessId
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            result.testCaseName
                          }
                        </Typography>
                      </Stack>
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
                      {
                        formatDate(
                          result.startedAt,
                        )
                      }
                    </TableCell>

                    <TableCell>
                      {
                        formatDuration(
                          result.durationMs,
                        )
                      }
                    </TableCell>

                    <TableCell>
                      {
                        result.exitCode
                        ?? '—'
                      }
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
                        onClick={() =>
                          navigate(
                            `/results/${encodeURIComponent(
                              result.executionId,
                            )}`,
                          )
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}