import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ArrowBack,
  ContentCopy,
  Download,
  PlayArrow,
  Refresh,
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
  AutomationStep,
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

function downloadTextFile(
  fileName: string,
  content: string,
) {
  const blob =
    new Blob(
      [
        content,
      ],
      {
        type:
          'text/plain;charset=utf-8',
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
    fileName;

  document.body.appendChild(
    anchor,
  );

  anchor.click();

  document.body.removeChild(
    anchor,
  );

  URL.revokeObjectURL(
    url,
  );
}

export default function ScriptGenerationPage() {
  const navigate =
    useNavigate();

  const {
    testCaseId,
  } =
    useParams<{
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
    automationSteps,
    setAutomationSteps,
  ] =
    useState<AutomationStep[]>(
      [],
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
  ] =
    useState(true);

  const [
    generating,
    setGenerating,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null,
    );

  const loadPage =
    useCallback(
      async () => {
        if (
          !testCaseId
        ) {
          setError(
            'Test Case ID is missing.',
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

          setSuccessMessage(
            null,
          );

          /*
           * Route uses the Test Case
           * business ID.
           *
           * Example:
           *
           * /automation/TC-LOGIN-001/script
           */
          const loadedTestCase =
            await testCaseApi
              .getTestCaseByBusinessId(
                testCaseId,
              );

          setTestCase(
            loadedTestCase,
          );

          /*
           * Automation API requires the
           * numeric database Test Case ID.
           */
          const loadedScript =
            await automationApi
              .getScriptByTestCase(
                loadedTestCase.id,
              );

          setScript(
            loadedScript,
          );

          const loadedSteps =
            await automationApi
              .getSteps(
                loadedScript.id,
              );

          const sortedSteps =
            [
              ...loadedSteps,
            ].sort(
              (
                first,
                second,
              ) =>
                first.stepOrder -
                second.stepOrder,
            );

          setAutomationSteps(
            sortedSteps,
          );

          /*
           * Generated source may not exist
           * yet.
           *
           * A 404 here is normal.
           */
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
              setGenerated(
                null,
              );
            } else {
              throw generatedError;
            }
          }
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
        testCaseId,
      ],
    );

  useEffect(
    () => {
      void loadPage();
    },
    [
      loadPage,
    ],
  );

  const handleGenerate =
    async () => {
      if (
        !script
      ) {
        return;
      }

      try {
        setGenerating(
          true,
        );

        setError(
          null,
        );

        setSuccessMessage(
          null,
        );

        const generatedScript =
          await automationApi
            .generateScript(
              script.id,
            );

        setGenerated(
          generatedScript,
        );

        /*
         * Reload Test Case because the
         * backend may change:
         *
         * automationStatus
         *      →
         * SCRIPT_GENERATED
         */
        if (
          testCaseId
        ) {
          const refreshedTestCase =
            await testCaseApi
              .getTestCaseByBusinessId(
                testCaseId,
              );

          setTestCase(
            refreshedTestCase,
          );
        }

        setSuccessMessage(
          'Automation script generated successfully.',
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
        setGenerating(
          false,
        );
      }
    };

  const handleCopy =
    async () => {
      if (
        !generated
      ) {
        return;
      }

      try {
        await navigator.clipboard
          .writeText(
            generated.source,
          );

        setError(
          null,
        );

        setSuccessMessage(
          'Generated Java source copied to clipboard.',
        );
      } catch (err) {
        console.error(
          err,
        );

        setSuccessMessage(
          null,
        );

        setError(
          'Unable to copy generated source to the clipboard.',
        );
      }
    };

  const handleDownload =
    () => {
      if (
        !generated
      ) {
        return;
      }

      downloadTextFile(
        `${generated.className}.java`,
        generated.source,
      );

      setError(
        null,
      );

      setSuccessMessage(
        `${generated.className}.java downloaded.`,
      );
    };

  const handleRunAutomation =
    () => {
      if (
        !testCase ||
        !generated ||
        generated.stale
      ) {
        return;
      }

      navigate(
        `/automation/${encodeURIComponent(
          testCase.testCaseId,
        )}/execute`,
      );
    };

  if (
    loading
  ) {
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
    !testCase ||
    !script ||
    !testCaseId
  ) {
    return (
      <Stack spacing={3}>
        <PageHeader
          title="Script Generation"
          description="Unable to load Automation Script."
        />

        <Alert
          severity="error"
        >
          {error ??
            'Automation Script could not be loaded.'}
        </Alert>

        <Box>
          <Button
            variant="outlined"
            startIcon={
              <ArrowBack />
            }
            onClick={() =>
              navigate(
                '/automation',
              )
            }
          >
            Back to Automation
          </Button>
        </Box>
      </Stack>
    );
  }

  const canGenerate =
    automationSteps.length > 0;

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

      {successMessage && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccessMessage(
              null,
            )
          }
        >
          {successMessage}
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
                  Test Case
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {
                    testCase.testCaseId
                  }
                  {' — '}
                  {
                    testCase.name
                  }
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
              >
                <Chip
                  label={
                    testCase.testType
                  }
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

                <Chip
                  label={
                    testCase.automationStatus
                  }
                  color={
                    testCase.automationStatus ===
                    'AUTOMATED'
                      ? 'success'
                      : testCase.automationStatus ===
                          'RUNNING'
                        ? 'primary'
                        : 'default'
                  }
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Divider />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs:
                    '1fr',
                  sm:
                    'repeat(2, minmax(0, 1fr))',
                  md:
                    'repeat(4, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Automation Script
                </Typography>

                <Typography
                  fontWeight={600}
                >
                  {
                    script.automationScriptId
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Script Name
                </Typography>

                <Typography>
                  {
                    script.name
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Automation Steps
                </Typography>

                <Typography>
                  {
                    automationSteps.length
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Framework
                </Typography>

                <Typography>
                  Playwright + Java
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {!canGenerate && (
        <Alert
          severity="warning"
        >
          This Automation Script does not
          contain any Automation Steps.
          Return to the Automation Builder
          and add at least one step before
          generating Java source.
        </Alert>
      )}

      {!generated ? (
        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack
              spacing={3}
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                >
                  Generate Java Automation
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  TestForge will convert
                  the configured Automation
                  Steps into executable
                  Playwright Java source.
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={
                  generating
                    ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    )
                    : (
                      <Refresh />
                    )
                }
                disabled={
                  generating ||
                  !canGenerate
                }
                onClick={() =>
                  void handleGenerate()
                }
              >
                {generating
                  ? 'Generating...'
                  : 'Generate Script'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <>
          {generated.stale && (
            <Alert
              severity="warning"
            >
              The generated source is
              stale because the Automation
              Script or its Automation
              Steps changed after the last
              generation. Regenerate the
              script before execution.
            </Alert>
          )}

          {!generated.stale && (
            <Alert
              severity="success"
            >
              The generated Java source is
              current and ready for
              execution.
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
                    lg: 'row',
                  }}
                  justifyContent="space-between"
                  alignItems={{
                    xs:
                      'stretch',
                    lg:
                      'flex-start',
                  }}
                  spacing={2}
                >
                  <Box>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                    >
                      Generated Class
                    </Typography>

                    <Typography
                      variant="h6"
                      fontFamily="monospace"
                      fontWeight={700}
                    >
                      {
                        generated.className
                      }
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Button
                      variant="outlined"
                      startIcon={
                        generating
                          ? (
                            <CircularProgress
                              size={18}
                            />
                          )
                          : (
                            <Refresh />
                          )
                      }
                      disabled={
                        generating ||
                        !canGenerate
                      }
                      onClick={() =>
                        void handleGenerate()
                      }
                    >
                      {generating
                        ? 'Regenerating...'
                        : 'Regenerate'}
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

                    {/*
                     * Task 36.11
                     *
                     * Only current generated
                     * source may be executed.
                     */}
                    <Button
                      variant="contained"
                      startIcon={
                        <PlayArrow />
                      }
                      disabled={
                        generated.stale
                      }
                      onClick={
                        handleRunAutomation
                      }
                    >
                      Run Automation
                    </Button>
                  </Stack>
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
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Language
                    </Typography>

                    <Typography>
                      {
                        generated.language
                      }
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Framework
                    </Typography>

                    <Typography>
                      {
                        generated.framework
                      }
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Generated Steps
                    </Typography>

                    <Typography>
                      {
                        generated.generatedStepCount
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
                      {new Date(
                        generated.generatedAt,
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                  >
                    Source Status
                  </Typography>

                  <Chip
                    size="small"
                    label={
                      generated.stale
                        ? 'STALE'
                        : 'CURRENT'
                    }
                    color={
                      generated.stale
                        ? 'warning'
                        : 'success'
                    }
                  />
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
                    border:
                      '1px solid',
                    borderColor:
                      'divider',
                    fontFamily:
                      'monospace',
                    fontSize: 12,
                    lineHeight: 1.55,
                    maxHeight: 700,
                    overflow: 'auto',
                    whiteSpace:
                      'pre',
                  }}
                >
                  {
                    generated.source
                  }
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}