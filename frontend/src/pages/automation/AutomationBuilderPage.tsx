import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Add,
  ArrowBack,
  AutoAwesome,
  Code,
  Delete,
  Edit,
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
  testStepApi,
} from '../../api/testStepApi';

import AutomationStepDialog, {
  type AutomationStepFormValues,
} from '../../components/automation/AutomationStepDialog';

import CreateAutomationScriptDialog from '../../components/automation/CreateAutomationScriptDialog';

import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import type {
  AutomationScript,
  AutomationStep,
  CreateAutomationStepRequest,
  UpdateAutomationStepRequest,
} from '../../types/automation';

import type {
  TestCase,
} from '../../types/testCase';

import type {
  TestStep,
} from '../../types/testStep';

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

  return (
    'Unexpected error occurred.'
  );
}

function formatValue(
  value:
    | string
    | number
    | null
    | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—';
  }

  return String(
    value,
  );
}

function actionLabel(
  value: string,
): string {
  return value
    .split('_')
    .map(
      (part) =>
        part.charAt(0) +
        part
          .slice(1)
          .toLowerCase(),
    )
    .join(' ');
}

function automationTypeLabel(
  automationType:
    TestCase['automationType'],
): string {
  if (
    automationType ===
    'UI_API'
  ) {
    return 'UI + API';
  }

  return automationType;
}

function isApiAction(
  actionType:
    AutomationStep['actionType'],
): boolean {
  return [
    'API_GET',
    'API_POST',
    'API_PUT',
    'API_PATCH',
    'API_DELETE',
    'ASSERT_API_STATUS',
    'ASSERT_API_BODY_CONTAINS',
  ].includes(
    actionType,
  );
}

export default function AutomationBuilderPage() {
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
    useState<
      TestCase | null
    >(null);

  const [
    testSteps,
    setTestSteps,
  ] =
    useState<
      TestStep[]
    >([]);

  const [
    script,
    setScript,
  ] =
    useState<
      AutomationScript | null
    >(null);

  const [
    automationSteps,
    setAutomationSteps,
  ] =
    useState<
      AutomationStep[]
    >([]);

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
    useState<
      string | null
    >(null);

  const [
    scriptDialogOpen,
    setScriptDialogOpen,
  ] =
    useState(
      false,
    );

  const [
    creatingScript,
    setCreatingScript,
  ] =
    useState(
      false,
    );

  const [
    scriptError,
    setScriptError,
  ] =
    useState<
      string | null
    >(null);

  const [
    stepDialogOpen,
    setStepDialogOpen,
  ] =
    useState(
      false,
    );

  const [
    stepDialogMode,
    setStepDialogMode,
  ] =
    useState<
      | 'create'
      | 'edit'
    >(
      'create',
    );

  const [
    selectedAutomationStep,
    setSelectedAutomationStep,
  ] =
    useState<
      AutomationStep | null
    >(null);

  const [
    savingStep,
    setSavingStep,
  ] =
    useState(
      false,
    );

  const [
    stepError,
    setStepError,
  ] =
    useState<
      string | null
    >(null);

  const [
    deletingStep,
    setDeletingStep,
  ] =
    useState(
      false,
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<
      AutomationStep | null
    >(null);

  const [
    deleteError,
    setDeleteError,
  ] =
    useState<
      string | null
    >(null);

  const loadBuilder =
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

          const [
            loadedTestCase,
            loadedTestSteps,
          ] =
            await Promise.all([
              testCaseApi
                .getTestCaseByBusinessId(
                  testCaseId,
                ),

              testStepApi
                .getByTestCase(
                  testCaseId,
                ),
            ]);

          setTestCase(
            loadedTestCase,
          );

          setTestSteps(
            [
              ...loadedTestSteps,
            ].sort(
              (
                a,
                b,
              ) =>
                a.stepOrder -
                b.stepOrder,
            ),
          );

          try {
            const loadedScript =
              await automationApi
                .getScriptByTestCase(
                  loadedTestCase.id,
                );

            setScript(
              loadedScript,
            );

            const loadedAutomationSteps =
              await automationApi
                .getSteps(
                  loadedScript.id,
                );

            setAutomationSteps(
              [
                ...loadedAutomationSteps,
              ].sort(
                (
                  a,
                  b,
                ) =>
                  a.stepOrder -
                  b.stepOrder,
              ),
            );
          } catch (
            scriptLoadError
          ) {
            if (
              scriptLoadError instanceof
                ApiError &&
              scriptLoadError.status ===
                404
            ) {
              setScript(
                null,
              );

              setAutomationSteps(
                [],
              );
            } else {
              throw scriptLoadError;
            }
          }
        } catch (
          err
        ) {
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
      void loadBuilder();
    },
    [
      loadBuilder,
    ],
  );

  const suggestedOrder =
    useMemo(
      () => {
        if (
          automationSteps.length ===
          0
        ) {
          return 1;
        }

        return (
          Math.max(
            ...automationSteps.map(
              (
                step,
              ) =>
                step.stepOrder,
            ),
          ) + 1
        );
      },
      [
        automationSteps,
      ],
    );

  const sourceStepMap =
    useMemo(
      () =>
        new Map(
          testSteps.map(
            (
              testStep,
            ) => [
              testStep.id,
              testStep,
            ],
          ),
        ),
      [
        testSteps,
      ],
    );

  const mappedSourceCount =
    useMemo(
      () =>
        new Set(
          automationSteps.map(
            (
              step,
            ) =>
              step.sourceTestStepId,
          ),
        ).size,
      [
        automationSteps,
      ],
    );

  const uiAutomationStepCount =
    useMemo(
      () =>
        automationSteps.filter(
          (
            step,
          ) =>
            !isApiAction(
              step.actionType,
            ),
        ).length,
      [
        automationSteps,
      ],
    );

  const apiAutomationStepCount =
    useMemo(
      () =>
        automationSteps.filter(
          (
            step,
          ) =>
            isApiAction(
              step.actionType,
            ),
        ).length,
      [
        automationSteps,
      ],
    );

  const handleCreateScript =
    async (
      request: {
        automationScriptId:
          string;

        name:
          string;
      },
    ) => {
      if (
        !testCase
      ) {
        return;
      }

      try {
        setCreatingScript(
          true,
        );

        setScriptError(
          null,
        );

        const created =
          await automationApi
            .createScript(
              testCase.id,
              request,
            );

        setScript(
          created,
        );

        setAutomationSteps(
          [],
        );

        setScriptDialogOpen(
          false,
        );
      } catch (
        err
      ) {
        console.error(
          err,
        );

        setScriptError(
          getErrorMessage(
            err,
          ),
        );
      } finally {
        setCreatingScript(
          false,
        );
      }
    };

  const openCreateStep =
    () => {
      setSelectedAutomationStep(
        null,
      );

      setStepDialogMode(
        'create',
      );

      setStepError(
        null,
      );

      setStepDialogOpen(
        true,
      );
    };

  const openEditStep =
    (
      automationStep:
        AutomationStep,
    ) => {
      setSelectedAutomationStep(
        automationStep,
      );

      setStepDialogMode(
        'edit',
      );

      setStepError(
        null,
      );

      setStepDialogOpen(
        true,
      );
    };

  const handleStepSubmit =
    async (
      values:
        AutomationStepFormValues,
    ) => {
      if (
        !script
      ) {
        return;
      }

      try {
        setSavingStep(
          true,
        );

        setStepError(
          null,
        );

        if (
          stepDialogMode ===
          'create'
        ) {
          const request:
          CreateAutomationStepRequest =
            {
              automationStepId:
                values.automationStepId,

              sourceTestStepId:
                values.sourceTestStepId,

              stepOrder:
                values.stepOrder,

              actionType:
                values.actionType,

              target:
                values.target ||
                null,

              selectorStrategy:
                values.selectorStrategy ||
                null,

              selectorValue:
                values.selectorValue ||
                null,

              selectorRole:
                values.selectorRole ||
                null,

              selectorName:
                values.selectorName ||
                null,

              selectorExact:
                values.selectorExact,

              inputValue:
                values.inputValue ||
                null,

              expectedValue:
                values.expectedValue ||
                null,
            };

          const created =
            await automationApi
              .createStep(
                script.id,
                request,
              );

          setAutomationSteps(
            (
              current,
            ) =>
              [
                ...current,
                created,
              ].sort(
                (
                  a,
                  b,
                ) =>
                  a.stepOrder -
                  b.stepOrder,
              ),
          );
        } else {
          if (
            !selectedAutomationStep
          ) {
            return;
          }

          const request:
          UpdateAutomationStepRequest =
            {
              stepOrder:
                values.stepOrder,

              actionType:
                values.actionType,

              target:
                values.target ||
                null,

              selectorStrategy:
                values.selectorStrategy ||
                null,

              selectorValue:
                values.selectorValue ||
                null,

              selectorRole:
                values.selectorRole ||
                null,

              selectorName:
                values.selectorName ||
                null,

              selectorExact:
                values.selectorExact,

              inputValue:
                values.inputValue ||
                null,

              expectedValue:
                values.expectedValue ||
                null,
            };

          const updated =
            await automationApi
              .updateStep(
                selectedAutomationStep.id,
                request,
              );

          setAutomationSteps(
            (
              current,
            ) =>
              current
                .map(
                  (
                    step,
                  ) =>
                    step.id ===
                    updated.id
                      ? updated
                      : step,
                )
                .sort(
                  (
                    a,
                    b,
                  ) =>
                    a.stepOrder -
                    b.stepOrder,
                ),
          );
        }

        setStepDialogOpen(
          false,
        );

        setSelectedAutomationStep(
          null,
        );
      } catch (
        err
      ) {
        console.error(
          err,
        );

        setStepError(
          getErrorMessage(
            err,
          ),
        );
      } finally {
        setSavingStep(
          false,
        );
      }
    };

  const handleDeleteStep =
    async () => {
      if (
        !deleteTarget
      ) {
        return;
      }

      try {
        setDeletingStep(
          true,
        );

        setDeleteError(
          null,
        );

        await automationApi
          .deleteStep(
            deleteTarget.id,
          );

        setAutomationSteps(
          (
            current,
          ) =>
            current.filter(
              (
                step,
              ) =>
                step.id !==
                deleteTarget.id,
            ),
        );

        setDeleteTarget(
          null,
        );
      } catch (
        err
      ) {
        console.error(
          err,
        );

        setDeleteError(
          getErrorMessage(
            err,
          ),
        );
      } finally {
        setDeletingStep(
          false,
        );
      }
    };

  if (
    loading
  ) {
    return (
      <Box
        sx={{
          minHeight:
            320,

          display:
            'flex',

          alignItems:
            'center',

          justifyContent:
            'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (
    error ||
    !testCase ||
    !testCaseId
  ) {
    return (
      <Stack
        spacing={3}
      >
        <PageHeader
          title="Automation Builder"
          description="Unable to load Automation Builder."
        />

        <Alert
          severity="error"
        >
          {error ??
            'Test Case could not be loaded.'}
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

  const automationSupported =
    testCase.automatable &&
    testCase.automationType !==
      'MANUAL';

  return (
    <Stack
      spacing={3}
    >
      <PageHeader
        title="Automation Builder"
        description={`Configure Automation Steps for ${testCase.testCaseId}.`}
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
                '/automation',
              )
            }
          >
            Back
          </Button>
        }
      />

      {!automationSupported && (
        <Alert
          severity="warning"
        >
          This Test Case is not currently
          eligible for automation. Set
          Automatable to Yes and choose UI,
          API, or UI + API first.
        </Alert>
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

                md:
                  'row',
              }}
              spacing={2}
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={
                    700
                  }
                >
                  {
                    testCase.testCaseId
                  }
                  {' — '}
                  {
                    testCase.name
                  }
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Scenario:{' '}
                  {
                    testCase.scenarioBusinessId
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
                    automationTypeLabel(
                      testCase.automationType,
                    )
                  }
                  color="primary"
                  variant="outlined"
                />

                <Chip
                  label={
                    testCase.automationStatus
                  }
                  variant="outlined"
                />

                <Chip
                  label={
                    testCase.testType
                  }
                  variant="outlined"
                />
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
                    'repeat(5, minmax(0, 1fr))',
                },

                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Source Test Steps
                </Typography>

                <Typography
                  variant="h6"
                >
                  {
                    testSteps.length
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Mapped Source Steps
                </Typography>

                <Typography
                  variant="h6"
                >
                  {
                    mappedSourceCount
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

                <Typography
                  variant="h6"
                >
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
                  UI Actions
                </Typography>

                <Typography
                  variant="h6"
                >
                  {
                    uiAutomationStepCount
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  API Actions
                </Typography>

                <Typography
                  variant="h6"
                >
                  {
                    apiAutomationStepCount
                  }
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {!script ? (
        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack
              spacing={2}
              alignItems="center"
              sx={{
                py: 4,
              }}
            >
              <AutoAwesome
                color="primary"
                sx={{
                  fontSize:
                    48,
                }}
              />

              <Typography
                variant="h6"
                fontWeight={
                  700
                }
              >
                No Automation Script
              </Typography>

              <Typography
                color="text.secondary"
                textAlign="center"
                sx={{
                  maxWidth:
                    650,
                }}
              >
                Create the Automation
                Script container before
                adding Automation Steps.
                One Automation Script is
                allowed for each Test Case.
              </Typography>

              <Button
                variant="contained"
                startIcon={
                  <Add />
                }
                disabled={
                  !automationSupported
                }
                onClick={() => {
                  setScriptError(
                    null,
                  );

                  setScriptDialogOpen(
                    true,
                  );
                }}
              >
                Create Automation Script
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card
            variant="outlined"
          >
            <CardContent>
              <Stack
                direction={{
                  xs:
                    'column',

                  md:
                    'row',
                }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{
                  xs:
                    'flex-start',

                  md:
                    'center',
                }}
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
                    fontWeight={
                      700
                    }
                  >
                    {
                      script.automationScriptId
                    }
                  </Typography>

                  <Typography>
                    {
                      script.name
                    }
                  </Typography>
                </Box>

                <Stack
                  direction={{
                    xs:
                      'column',

                    sm:
                      'row',
                  }}
                  spacing={1}
                >
                  <Button
                    variant="outlined"
                    startIcon={
                      <Code />
                    }
                    disabled={
                      automationSteps.length ===
                      0
                    }
                    onClick={() =>
                      navigate(
                        `/automation/${encodeURIComponent(
                          testCase.testCaseId,
                        )}/script`,
                      )
                    }
                  >
                    Script Generation
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={
                      <Add />
                    }
                    disabled={
                      testSteps.length ===
                      0
                    }
                    onClick={
                      openCreateStep
                    }
                  >
                    Add Automation Step
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {testSteps.length ===
            0 && (
            <Alert
              severity="warning"
            >
              This Test Case has no Test
              Steps. Create Test Steps
              before creating Automation
              Steps.
            </Alert>
          )}

          {testCase.automationType ===
            'UI_API' && (
            <Alert
              severity="info"
              variant="outlined"
            >
              UI + API automation can mix
              browser actions and API
              request/assertion actions in
              the same Automation Script.
              Execution follows Automation
              Step Order.
            </Alert>
          )}

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
              spacing={1}
              justifyContent="space-between"
              alignItems={{
                xs:
                  'flex-start',

                sm:
                  'center',
              }}
            >
              <Typography
                variant="h6"
                fontWeight={
                  700
                }
              >
                Automation Steps
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {
                  automationSteps.length
                }{' '}
                configured
              </Typography>
            </Stack>

            {automationSteps.length ===
            0 ? (
              <Alert
                severity="info"
              >
                No Automation Steps have
                been configured yet.
              </Alert>
            ) : (
              automationSteps.map(
                (
                  automationStep,
                ) => {
                  const sourceStep =
                    sourceStepMap.get(
                      automationStep
                        .sourceTestStepId,
                    );

                  const apiAction =
                    isApiAction(
                      automationStep.actionType,
                    );

                  return (
                    <Card
                      key={
                        automationStep.id
                      }
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

                              md:
                                'row',
                            }}
                            spacing={2}
                            justifyContent="space-between"
                          >
                            <Box>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                useFlexGap
                                flexWrap="wrap"
                              >
                                <Typography
                                  variant="h6"
                                  fontWeight={
                                    700
                                  }
                                >
                                  Step{' '}
                                  {
                                    automationStep.stepOrder
                                  }
                                  {' — '}
                                  {actionLabel(
                                    automationStep.actionType,
                                  )}
                                </Typography>

                                <Chip
                                  size="small"
                                  label={
                                    apiAction
                                      ? 'API'
                                      : 'UI'
                                  }
                                  color={
                                    apiAction
                                      ? 'secondary'
                                      : 'primary'
                                  }
                                  variant="outlined"
                                />
                              </Stack>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {
                                  automationStep.automationStepId
                                }
                              </Typography>
                            </Box>

                            <Stack
                              direction="row"
                              spacing={1}
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={
                                  <Edit />
                                }
                                onClick={() =>
                                  openEditStep(
                                    automationStep,
                                  )
                                }
                              >
                                Edit
                              </Button>

                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={
                                  <Delete />
                                }
                                onClick={() => {
                                  setDeleteError(
                                    null,
                                  );

                                  setDeleteTarget(
                                    automationStep,
                                  );
                                }}
                              >
                                Delete
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

                                md:
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
                                Source Test Step
                              </Typography>

                              <Typography
                                variant="body2"
                                fontWeight={
                                  600
                                }
                              >
                                {sourceStep
                                  ? `${sourceStep.testStepId} (#${sourceStep.stepOrder})`
                                  : automationStep.sourceTestStepId}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Action
                              </Typography>

                              <Typography
                                variant="body2"
                              >
                                {actionLabel(
                                  automationStep.actionType,
                                )}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {apiAction
                                  ? 'Request URL / Target'
                                  : 'Target'}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace:
                                    'pre-wrap',

                                  overflowWrap:
                                    'anywhere',
                                }}
                              >
                                {formatValue(
                                  automationStep.target,
                                )}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Selector
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  overflowWrap:
                                    'anywhere',
                                }}
                              >
                                {automationStep.selectorStrategy
                                  ? automationStep.selectorStrategy ===
                                    'ROLE'
                                    ? `${automationStep.selectorRole ?? '—'} / ${automationStep.selectorName ?? '—'}`
                                    : `${automationStep.selectorStrategy}: ${automationStep.selectorValue ?? '—'}`
                                  : '—'}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {apiAction
                                  ? 'Request Body / Input'
                                  : 'Input'}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace:
                                    'pre-wrap',

                                  overflowWrap:
                                    'anywhere',
                                }}
                              >
                                {formatValue(
                                  automationStep.inputValue,
                                )}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Expected
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace:
                                    'pre-wrap',

                                  overflowWrap:
                                    'anywhere',
                                }}
                              >
                                {formatValue(
                                  automationStep.expectedValue,
                                )}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Exact Match
                              </Typography>

                              <Typography
                                variant="body2"
                              >
                                {
                                  automationStep.selectorExact
                                    ? 'Yes'
                                    : 'No'
                                }
                              </Typography>
                            </Box>
                          </Box>

                          {sourceStep && (
                            <Alert
                              severity="info"
                              variant="outlined"
                            >
                              <Typography
                                variant="body2"
                              >
                                <strong>
                                  Original Test Step:
                                </strong>{' '}
                                {
                                  sourceStep.action
                                }
                              </Typography>

                              {sourceStep.target && (
                                <Typography
                                  variant="body2"
                                >
                                  <strong>
                                    Target:
                                  </strong>{' '}
                                  {
                                    sourceStep.target
                                  }
                                </Typography>
                              )}

                              {sourceStep.inputValue && (
                                <Typography
                                  variant="body2"
                                >
                                  <strong>
                                    Input:
                                  </strong>{' '}
                                  {
                                    sourceStep.inputValue
                                  }
                                </Typography>
                              )}

                              {sourceStep.expectedResult && (
                                <Typography
                                  variant="body2"
                                >
                                  <strong>
                                    Expected:
                                  </strong>{' '}
                                  {
                                    sourceStep.expectedResult
                                  }
                                </Typography>
                              )}
                            </Alert>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                },
              )
            )}
          </Stack>
        </>
      )}

      <CreateAutomationScriptDialog
        open={
          scriptDialogOpen
        }
        testCase={
          testCase
        }
        creating={
          creatingScript
        }
        error={
          scriptError
        }
        onClose={() => {
          if (
            !creatingScript
          ) {
            setScriptDialogOpen(
              false,
            );
          }
        }}
        onCreate={
          handleCreateScript
        }
      />

      <AutomationStepDialog
        open={
          stepDialogOpen
        }
        mode={
          stepDialogMode
        }
        testCaseId={
          testCase.testCaseId
        }
        automationType={
          testCase.automationType
        }
        testSteps={
          testSteps
        }
        automationStep={
          selectedAutomationStep
        }
        suggestedOrder={
          suggestedOrder
        }
        saving={
          savingStep
        }
        error={
          stepError
        }
        onClose={() => {
          if (
            !savingStep
          ) {
            setStepDialogOpen(
              false,
            );

            setSelectedAutomationStep(
              null,
            );
          }
        }}
        onSubmit={
          handleStepSubmit
        }
      />

      <DeleteConfirmationDialog
        open={
          deleteTarget !==
          null
        }
        title="Delete Automation Step"
        entityName={
          deleteTarget
            ? `${deleteTarget.automationStepId} — ${actionLabel(
                deleteTarget.actionType,
              )}`
            : ''
        }
        description="Deleting this Automation Step removes only the automation configuration. The original Test Step is not deleted."
        deleting={
          deletingStep
        }
        error={
          deleteError
        }
        onClose={() => {
          if (
            !deletingStep
          ) {
            setDeleteTarget(
              null,
            );

            setDeleteError(
              null,
            );
          }
        }}
        onConfirm={() =>
          void handleDeleteStep()
        }
      />
    </Stack>
  );
}