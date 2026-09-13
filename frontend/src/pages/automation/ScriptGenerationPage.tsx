import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ArrowBack,
  ContentCopy,
  Download,
  Refresh,
  Terminal,
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ApiError,
} from '../../api/apiClient';

import {
  automationApi,
} from '../../api/automationApi';

import {
  testCaseApi,
} from '../../api/testCaseApi';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import type {
  AutomationScript,
  GeneratedScript,
} from '../../types/automation';

import type {
  TestCase,
} from '../../types/testCase';

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof ApiError
  ) {
    return error.message;
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return 'Unexpected error occurred.';
}

export default function ScriptGenerationPage() {
  const navigate =
    useNavigate();

  const {
    testCaseId,
  } = useParams<{
    testCaseId: string;
  }>();

  const [
    testCase,
    setTestCase,
  ] =
    useState<TestCase | null>(
      null,
    );

  const [
    script,
    setScript,
  ] =
    useState<AutomationScript | null>(
      null,
    );

  const [
    generated,
    setGenerated,
  ] =
    useState<GeneratedScript | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    );

  const loadData =
    useCallback(
      async () => {
        if (!testCaseId) {
          setError(
            'Test Case ID is missing.',
          );

          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const loadedTestCase =
            await testCaseApi
              .getTestCaseByBusinessId(
                testCaseId,
              );

          setTestCase(
            loadedTestCase,
          );

          const loadedScript =
            await automationApi
              .getScriptByTestCase(
                loadedTestCase.id,
              );

          setScript(
            loadedScript,
          );

          try {
            const loadedGenerated =
              await automationApi
                .getGeneratedScript(
                  loadedScript.id,
                );

            setGenerated(
              loadedGenerated,
            );
          } catch (
            generatedError
          ) {
            if (
              generatedError instanceof
                ApiError &&
              generatedError.status ===
                404
            ) {
              setGenerated(null);
            } else {
              throw generatedError;
            }
          }
        } catch (err) {
          console.error(err);

          setError(
            getErrorMessage(
              err,
            ),
          );
        } finally {
          setLoading(false);
        }
      },
      [
        testCaseId,
      ],
    );

  useEffect(
    () => {
      void loadData();
    },
    [
      loadData,
    ],
  );

  const handleGenerate =
    async () => {
      if (!script) {
        return;
      }

      try {
        setGenerating(true);
        setError(null);
        setSuccess(null);

        const result =
          await automationApi
            .generateScript(
              script.id,
            );

        setGenerated(
          result,
        );

        setSuccess(
          'Playwright Java script generated successfully.',
        );
      } catch (err) {
        console.error(err);

        setError(
          getErrorMessage(
            err,
          ),
        );
      } finally {
        setGenerating(false);
      }
    };

  const handleCopy =
    async () => {
      if (!generated) {
        return;
      }

      try {
        await navigator.clipboard
          .writeText(
            generated.source,
          );

        setSuccess(
          'Generated source copied to clipboard.',
        );
      } catch {
        setError(
          'Unable to copy generated source.',
        );
      }
    };

  const handleDownload =
    () => {
      if (!generated) {
        return;
      }

      const blob =
        new Blob(
          [
            generated.source,
          ],
          {
            type:
              'text/x-java-source;charset=utf-8',
          },
        );

      const url =
        URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          'a',
        );

      anchor.href =
        url;

      anchor.download =
        `${generated.className}.java`;

      document.body
        .appendChild(
          anchor,
        );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        url,
      );
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

  if (
    error &&
    (!testCase ||
      !script)
  ) {
    return (
      <Stack spacing={3}>
        <PageHeader
          title="Script Generation"
          description="Unable to load Script Generation."
        />

        <Alert
          severity="error"
        >
          {error}
        </Alert>

        <Box>
          <Button
            startIcon={
              <ArrowBack />
            }
            variant="outlined"
            onClick={() =>
              navigate(
                '/automation',
              )
            }
          >
            Back
          </Button>
        </Box>
      </Stack>
    );
  }

  if (
    !testCase ||
    !script ||
    !testCaseId
  ) {
    return null;
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Script Generation"
        description={`Generate Playwright Java automation for ${testCase.testCaseId}.`}
        breadcrumbs={[
          {
            label:
              'Automation',
            to:
              '/automation',
          },
          {
            label:
              testCase.testCaseId,
            to:
              `/automation/${encodeURIComponent(
                testCase.testCaseId,
              )}`,
          },
          {
            label:
              'Script Generation',
          },
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={
              <ArrowBack />
            }
            onClick={() =>
              navigate(
                `/automation/${encodeURIComponent(
                  testCase.testCaseId,
                )}`,
              )
            }
          >
            Back to Builder
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

      {success && (
        <Alert
          severity="success"
        >
          {success}
        </Alert>
      )}

      {generated?.stale && (
        <Alert
          severity="warning"
        >
          The stored generated source is
          stale because the Automation Steps
          have changed. Generate the script
          again before execution.
        </Alert>
      )}

      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{
                xs: 'column',
                md: 'row',
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                >
                  Automation Script
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {
                    script.automationScriptId
                  }
                </Typography>

                <Typography>
                  {script.name}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
              >
                <Chip
                  label="Playwright"
                  color="primary"
                  variant="outlined"
                />

                <Chip
                  label="Java 17"
                  variant="outlined"
                />

                <Chip
                  label={
                    testCase.automationType ===
                    'UI_API'
                      ? 'UI + API'
                      : testCase.automationType
                  }
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Button
              variant="contained"
              startIcon={
                generating
                  ? (
                    <CircularProgress
                      color="inherit"
                      size={18}
                    />
                  )
                  : (
                    <Terminal />
                  )
              }
              disabled={
                generating
              }
              onClick={() =>
                void handleGenerate()
              }
              sx={{
                alignSelf:
                  'flex-start',
              }}
            >
              {generating
                ? 'Generating...'
                : generated
                  ? 'Regenerate Script'
                  : 'Generate Script'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {!generated ? (
        <Alert
          severity="info"
        >
          No generated Java source exists
          yet. Click Generate Script after
          configuring the Automation Steps.
        </Alert>
      ) : (
        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{
                  xs: 'column',
                  md: 'row',
                }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    {
                      generated.className
                    }
                    .java
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {
                      generated.generatedStepCount
                    }{' '}
                    automation step(s)
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Generated:{' '}
                    {new Date(
                      generated.generatedAt,
                    ).toLocaleString()}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                >
                  <Button
                    variant="outlined"
                    startIcon={
                      <Refresh />
                    }
                    onClick={() =>
                      void handleGenerate()
                    }
                    disabled={
                      generating
                    }
                  >
                    Regenerate
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={
                      <ContentCopy />
                    }
                    onClick={() =>
                      void handleCopy()
                    }
                  >
                    Copy
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={
                      <Download />
                    }
                    onClick={
                      handleDownload
                    }
                  >
                    Download
                  </Button>
                </Stack>
              </Stack>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  bgcolor:
                    'grey.950',
                  color:
                    'grey.100',
                  borderRadius: 1,
                  overflowX: 'auto',
                  fontFamily:
                    'monospace',
                  fontSize: 13,
                  lineHeight: 1.6,
                  maxHeight: 700,
                  overflowY:
                    'auto',
                }}
              >
                {generated.source}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}