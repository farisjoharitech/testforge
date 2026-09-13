import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ArrowBack,
  ContentCopy,
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  automationResultApi,
} from '../../api/automationResultApi';

import type {
  AutomationResult,
  AutomationResultStatus,
} from '../../types/automationResult';

import {
  PageHeader,
} from '../../components/common/PageHeader';

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

  return 'Unable to load automation result.';
}

export default function AutomationResultDetailsPage() {

  const navigate =
    useNavigate();

  const {
    executionId,
  } =
    useParams<{
      executionId: string;
    }>();

  const [
    result,
    setResult,
  ] =
    useState<
      AutomationResult | null
    >(
      null,
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

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  const loadResult =
    useCallback(
      async () => {

        if (!executionId) {

          setError(
            'Execution ID is missing.',
          );

          setLoading(
            false,
          );

          return;
        }

        try {

          setLoading(
            true,
          );

          setError(
            null,
          );

          const loaded =
            await automationResultApi
              .getResult(
                executionId,
              );

          setResult(
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
        executionId,
      ],
    );

  useEffect(
    () => {

      void loadResult();
    },
    [
      loadResult,
    ],
  );

  const handleCopyLog =
    async () => {

      if (
        !result?.logOutput
      ) {
        return;
      }

      try {

        await navigator.clipboard
          .writeText(
            result.logOutput,
          );

        setCopied(
          true,
        );

        window.setTimeout(
          () =>
            setCopied(
              false,
            ),
          2000,
        );

      } catch {

        setError(
          'Unable to copy execution log.',
        );
      }
    };

  if (loading) {

    return (
      <Box
        sx={{
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!result) {

    return (
      <Stack
        spacing={3}
      >
        <PageHeader
          title="Automation Result"
          description="Unable to load result."
        />

        <Alert
          severity="error"
        >
          {
            error
            ?? 'Automation result was not found.'
          }
        </Alert>

        <Box>
          <Button
            startIcon={
              <ArrowBack />
            }
            variant="outlined"
            onClick={() =>
              navigate(
                '/results',
              )
            }
          >
            Back to Results
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack
      spacing={3}
    >
      <PageHeader
        title="Automation Result"
        description={
          result.executionId
        }
        actions={
          <Button
            variant="outlined"
            startIcon={
              <ArrowBack />
            }
            onClick={() =>
              navigate(
                '/results',
              )
            }
          >
            Back to Results
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

      {result.status ===
        'PASSED' && (
        <Alert
          severity="success"
        >
          Automation execution passed successfully.
        </Alert>
      )}

      {result.status ===
        'FAILED' && (
        <Alert
          severity="error"
        >
          Automation execution completed but one or more test assertions failed.
        </Alert>
      )}

      {result.status ===
        'TIMED_OUT' && (
        <Alert
          severity="warning"
        >
          Automation execution exceeded the configured execution timeout.
        </Alert>
      )}

      {result.status ===
        'ERROR' && (
        <Alert
          severity="error"
        >
          Automation execution encountered an execution or infrastructure error.
        </Alert>
      )}

      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack
            spacing={3}
          >
            <Stack
              direction={{
                xs:
                  'column',
                md:
                  'row',
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                >
                  Result
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  fontFamily="monospace"
                >
                  {
                    result.executionId
                  }
                </Typography>
              </Box>

              <Chip
                label={
                  result.status
                }
                color={
                  getStatusColor(
                    result.status,
                  )
                }
                sx={{
                  alignSelf:
                    'flex-start',
                }}
              />
            </Stack>

            <Divider />

            <Box
              sx={{
                display:
                  'grid',
                gridTemplateColumns: {
                  xs:
                    '1fr',
                  sm:
                    'repeat(2, minmax(0, 1fr))',
                  lg:
                    'repeat(4, minmax(0, 1fr))',
                },
                gap: 3,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Test Case
                </Typography>

                <Typography
                  fontWeight={700}
                >
                  {
                    result.testCaseBusinessId
                  }
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {
                    result.testCaseName
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Automation Script
                </Typography>

                <Typography
                  fontWeight={700}
                >
                  {
                    result.automationScriptBusinessId
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Generated Class
                </Typography>

                <Typography
                  fontFamily="monospace"
                >
                  {
                    result.generatedClassName
                    ?? '—'
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Exit Code
                </Typography>

                <Typography>
                  {
                    result.exitCode
                    ?? '—'
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Generated At
                </Typography>

                <Typography>
                  {
                    formatDate(
                      result.generatedAt,
                    )
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Started At
                </Typography>

                <Typography>
                  {
                    formatDate(
                      result.startedAt,
                    )
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Finished At
                </Typography>

                <Typography>
                  {
                    formatDate(
                      result.finishedAt,
                    )
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Duration
                </Typography>

                <Typography>
                  {
                    formatDuration(
                      result.durationMs,
                    )
                  }
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {result.errorMessage && (
        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack
              spacing={2}
            >
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Error
              </Typography>

              <Alert
                severity="error"
              >
                {
                  result.errorMessage
                }
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack
            spacing={2}
          >
            <Stack
              direction={{
                xs:
                  'column',
                sm:
                  'row',
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Execution Log
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Maven, JUnit and Playwright output captured during execution.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={
                  <ContentCopy />
                }
                disabled={
                  !result.logOutput
                }
                onClick={() =>
                  void handleCopyLog()
                }
              >
                {
                  copied
                    ? 'Copied'
                    : 'Copy Log'
                }
              </Button>
            </Stack>

            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                minHeight: 200,
                maxHeight: 650,
                overflow:
                  'auto',
                borderRadius: 1,
                bgcolor:
                  'grey.950',
                color:
                  'grey.100',
                fontFamily:
                  'monospace',
                fontSize: 12,
                lineHeight: 1.55,
                whiteSpace:
                  'pre-wrap',
                overflowWrap:
                  'anywhere',
              }}
            >
              {
                result.logOutput
                || 'No execution log was captured.'
              }
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}