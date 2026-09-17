import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Api,
  AutoAwesome,
  Code,
  OpenInNew,
  PlaylistPlay,
  Refresh,
  Web,
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
  TextField,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import {
  ApiError,
} from '../../api/apiClient';

import {
  testCaseApi,
} from '../../api/testCaseApi';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import type {
  AutomationStatus,
  AutomationType,
  TestCase,
} from '../../types/testCase';

type AutomationTypeFilter =
  | 'ALL'
  | 'UI'
  | 'API'
  | 'UI_API';

type AutomationStatusFilter =
  | 'ALL'
  | AutomationStatus;

function getAutomationTypeLabel(
  automationType: AutomationType,
): string {
  switch (automationType) {
    case 'UI':
      return 'UI';

    case 'API':
      return 'API';

    case 'UI_API':
      return 'UI + API';

    case 'MANUAL':
      return 'Manual';

    default:
      return automationType;
  }
}

function getAutomationStatusLabel(
  automationStatus: AutomationStatus,
): string {
  switch (automationStatus) {
    case 'NOT_APPLICABLE':
      return 'Not Applicable';

    case 'NOT_AUTOMATED':
      return 'Not Automated';

    case 'SCRIPT_GENERATED':
      return 'Script Generated';

    case 'READY':
      return 'Ready';

    case 'RUNNING':
      return 'Running';

    case 'AUTOMATED':
      return 'Automated';

    default:
      return automationStatus;
  }
}

function getTestTypeLabel(
  testType: string,
): string {
  switch (testType) {
    case 'END_TO_END':
      return 'End To End';

    case 'SMOKE':
      return 'Smoke';

    case 'SANITY':
      return 'Sanity';

    case 'REGRESSION':
      return 'Regression';

    case 'FUNCTIONAL':
      return 'Functional';

    case 'INTEGRATION':
      return 'Integration';

    case 'POSITIVE':
      return 'Positive';

    case 'NEGATIVE':
      return 'Negative';

    default:
      return testType;
  }
}

function getAutomationTypeIcon(
  automationType: AutomationType,
) {
  switch (automationType) {
    case 'UI':
      return (
        <Web fontSize="small" />
      );

    case 'API':
      return (
        <Api fontSize="small" />
      );

    case 'UI_API':
      return (
        <Code fontSize="small" />
      );

    default:
      return (
        <AutoAwesome fontSize="small" />
      );
  }
}

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
    'Unable to load automation-eligible Test Cases.'
  );
}

export default function AutomationSelectionPage() {
  const navigate =
    useNavigate();

  const [
    testCases,
    setTestCases,
  ] = useState<TestCase[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    automationTypeFilter,
    setAutomationTypeFilter,
  ] =
    useState<AutomationTypeFilter>(
      'ALL',
    );

  const [
    automationStatusFilter,
    setAutomationStatusFilter,
  ] =
    useState<AutomationStatusFilter>(
      'ALL',
    );

  const loadEligibleTestCases =
    useCallback(
      async (
        isRefresh = false,
      ) => {
        try {
          if (isRefresh) {
            setRefreshing(
              true,
            );
          } else {
            setLoading(
              true,
            );
          }

          setError(null);

          const response =
            await testCaseApi
              .getAutomationEligible();

          /*
           * Backend already returns only
           * automatable = true.
           *
           * This defensive filter prevents
           * an invalid backend record from
           * being presented as eligible.
           */
          setTestCases(
            response.filter(
              (testCase) =>
                testCase.automatable &&
                testCase.automationType !==
                  'MANUAL' &&
                testCase.automationStatus !==
                  'NOT_APPLICABLE',
            ),
          );
        } catch (err) {
          console.error(err);

          setError(
            getErrorMessage(
              err,
            ),
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [],
    );

  useEffect(
    () => {
      void loadEligibleTestCases();
    },
    [
      loadEligibleTestCases,
    ],
  );

  const filteredTestCases =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();

        return testCases.filter(
          (testCase) => {
            if (
              automationTypeFilter !==
                'ALL' &&
              testCase.automationType !==
                automationTypeFilter
            ) {
              return false;
            }

            if (
              automationStatusFilter !==
                'ALL' &&
              testCase.automationStatus !==
                automationStatusFilter
            ) {
              return false;
            }

            if (
              normalizedSearch.length ===
              0
            ) {
              return true;
            }

            const searchableText =
              [
                testCase.testCaseId,
                testCase.name,
                testCase.scenarioBusinessId,
                testCase.testType,
                testCase.priority,
                testCase.status,
                testCase.automationType,
                testCase.automationStatus,
              ]
                .join(' ')
                .toLowerCase();

            return searchableText
              .includes(
                normalizedSearch,
              );
          },
        );
      },
      [
        testCases,
        search,
        automationTypeFilter,
        automationStatusFilter,
      ],
    );

  const uiCount =
    useMemo(
      () =>
        testCases.filter(
          (testCase) =>
            testCase.automationType ===
            'UI',
        ).length,
      [
        testCases,
      ],
    );

  const apiCount =
    useMemo(
      () =>
        testCases.filter(
          (testCase) =>
            testCase.automationType ===
            'API',
        ).length,
      [
        testCases,
      ],
    );

  const uiApiCount =
    useMemo(
      () =>
        testCases.filter(
          (testCase) =>
            testCase.automationType ===
            'UI_API',
        ).length,
      [
        testCases,
      ],
    );

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

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Automation"
        description="Select an eligible Test Case to configure automation."
        breadcrumbs={[
          {
            label:
              'Automation',
          },
        ]}
        actions={
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
          >
            <Button
              variant="contained"
              startIcon={
                <PlaylistPlay />
              }
              onClick={() =>
                navigate(
                  '/automation/multi-run',
                )
              }
            >
              Run Multiple
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <Refresh />
              }
              disabled={
                refreshing
              }
              onClick={() =>
                void loadEligibleTestCases(
                  true,
                )
              }
            >
              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </Button>
          </Stack>
        }
      />

      {error && (
        <Alert
          severity="error"
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',

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
        <Card
          variant="outlined"
        >
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Eligible Test Cases
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {testCases.length}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Web
                color="primary"
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                UI
              </Typography>
            </Stack>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {uiCount}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Api
                color="primary"
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                API
              </Typography>
            </Stack>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {apiCount}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Code
                color="primary"
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                UI + API
              </Typography>
            </Stack>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {uiApiCount}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack
            direction={{
              xs:
                'column',

              lg:
                'row',
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              label="Search Test Cases"
              placeholder="Search by Test Case ID, name, scenario..."
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
            />

            <FormControl
              sx={{
                minWidth: 200,
              }}
            >
              <InputLabel>
                Automation Type
              </InputLabel>

              <Select
                value={
                  automationTypeFilter
                }
                label="Automation Scope"
                onChange={(
                  event,
                ) =>
                  setAutomationTypeFilter(
                    event.target
                      .value as AutomationTypeFilter,
                  )
                }
              >
                <MenuItem
                  value="ALL"
                >
                  All
                </MenuItem>

                <MenuItem
                  value="UI"
                >
                  UI
                </MenuItem>

                <MenuItem
                  value="API"
                >
                  API
                </MenuItem>

                <MenuItem
                  value="UI_API"
                >
                  UI + API
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              sx={{
                minWidth: 220,
              }}
            >
              <InputLabel>
                Automation Status
              </InputLabel>

              <Select
                value={
                  automationStatusFilter
                }
                label="Automation Status"
                onChange={(
                  event,
                ) =>
                  setAutomationStatusFilter(
                    event.target
                      .value as AutomationStatusFilter,
                  )
                }
              >
                <MenuItem
                  value="ALL"
                >
                  All
                </MenuItem>

                <MenuItem
                  value="NOT_AUTOMATED"
                >
                  Not Automated
                </MenuItem>

                <MenuItem
                  value="SCRIPT_GENERATED"
                >
                  Script Generated
                </MenuItem>

                <MenuItem
                  value="READY"
                >
                  Ready
                </MenuItem>

                <MenuItem
                  value="RUNNING"
                >
                  Running
                </MenuItem>

                <MenuItem
                  value="AUTOMATED"
                >
                  Automated
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <Typography
        variant="body2"
        color="text.secondary"
      >
        Showing{' '}
        {filteredTestCases.length}{' '}
        of{' '}
        {testCases.length}{' '}
        eligible Test Cases.
      </Typography>

      {filteredTestCases.length ===
      0 ? (
        <Alert
          severity="info"
        >
          {testCases.length ===
          0
            ? 'There are currently no automation-eligible Test Cases. Mark a Test Case as automatable and select UI, API, or UI + API automation.'
            : 'No eligible Test Cases match the current search and filters.'}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {filteredTestCases.map(
            (testCase) => (
              <Card
                key={
                  testCase.id
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
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            lineHeight: 1.25,
                          }}
                        >
                          {testCase.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 0.75,
                            display: 'block',
                            fontFamily: 'monospace',
                          }}
                        >
                          {testCase.testCaseId}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{
                          alignSelf: {
                            xs:
                              'flex-start',

                            md:
                              'center',
                          },
                        }}
                      >
                        <Chip
                          icon={
                            getAutomationTypeIcon(
                              testCase.automationType,
                            )
                          }
                          label={
                            getAutomationTypeLabel(
                              testCase.automationType,
                            )
                          }
                          color="primary"
                          variant="outlined"
                        />

                        <Chip
                          label={
                            getAutomationStatusLabel(
                              testCase.automationStatus,
                            )
                          }
                          variant="outlined"
                        />

                        <Chip
                          label={
                            testCase.priority
                          }
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>

                    <Box
                      sx={{
                        display:
                          'grid',

                        gridTemplateColumns: {
                          xs:
                            '1fr',

                          md:
                            'repeat(3, minmax(0, 1fr))',
                        },

                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Test Type
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          {getTestTypeLabel(
                            testCase.testType,
                          )}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Test Case Status
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          {
                            testCase.status
                          }
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Expected Result
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace:
                              'pre-wrap',
                          }}
                        >
                          {
                            testCase.expectedResult
                          }
                        </Typography>
                      </Box>
                    </Box>

                    <Stack
                      direction={{
                        xs:
                          'column',

                        sm:
                          'row',
                      }}
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="outlined"
                        startIcon={
                          <OpenInNew />
                        }
                        onClick={() =>
                          navigate(
                            `/test-cases/${encodeURIComponent(
                              testCase.testCaseId,
                            )}`,
                          )
                        }
                      >
                        View Test Case
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={
                          <AutoAwesome />
                        }
                        onClick={() =>
                          navigate(
                            `/automation/${encodeURIComponent(
                              testCase.testCaseId,
                            )}`,
                          )
                        }
                      >
                        Configure Automation
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ),
          )}
        </Stack>
      )}
    </Stack>
  );
}