import {
  useMemo,
  useState,
} from 'react';

import {
  ArrowBack,
  Save,
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  testPlanApi,
} from '../../api/testPlanApi';

import type {
  ApprovalStatus,
  CreateTestPlanRequest,
  TestPlanStatus,
} from '../../types/testPlan';

const DEFAULT_PROJECT_ID = 1;

const DEFAULT_APPROVAL_STATUS: ApprovalStatus =
  'PENDING';

function generateTestPlanId(): string {
  const timestamp = Date.now();

  return `TP-${timestamp}`;
}

export default function CreateTestPlanPage() {
  const navigate = useNavigate();

  const [
    name,
    setName,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    status,
    setStatus,
  ] =
    useState<TestPlanStatus>(
      'DRAFT',
    );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const trimmedName =
    name.trim();

  const nameError =
    useMemo(
      () => {
        if (!trimmedName) {
          return 'Test Plan Name is required.';
        }

        return '';
      },
      [trimmedName],
    );

  const handleSubmit =
    async (
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError(null);

      if (nameError) {
        setError(
          nameError,
        );

        return;
      }

      const request:
        CreateTestPlanRequest =
      {
        testPlanId:
          generateTestPlanId(),

        name:
          trimmedName,

        description:
          description.trim() ||
          undefined,

        projectId:
          DEFAULT_PROJECT_ID,

        status,

        approvalStatus:
          DEFAULT_APPROVAL_STATUS,
      };

      try {
        setSubmitting(
          true,
        );

        const createdTestPlan =
          await testPlanApi
            .createTestPlan(
              request,
            );

        console.log(
          'Created Test Plan:',
          createdTestPlan,
        );

        navigate(
          '/test-plans',
          {
            replace: true,

            state: {
              message:
                `Test plan "${createdTestPlan.name}" created successfully.`,
            },
          },
        );
      } catch (err) {
        console.error(
          'Failed to create test plan:',
          err,
        );

        if (
          err instanceof
          ApiError
        ) {
          if (
            err.status ===
            400
          ) {
            setError(
              err.message ||
                'Please check the form values.',
            );

            return;
          }

          if (
            err.status ===
            404
          ) {
            setError(
              'The selected project could not be found.',
            );

            return;
          }

          setError(
            err.message ||
              `Backend returned HTTP ${err.status}.`,
          );

          return;
        }

        if (
          err instanceof
          TypeError
        ) {
          setError(
            'Unable to connect to the backend. Make sure TestForge backend is running on port 8080.',
          );

          return;
        }

        setError(
          'An unexpected error occurred while creating the test plan.',
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
      }}
    >
      <Button
        startIcon={
          <ArrowBack />
        }
        disabled={
          submitting
        }
        onClick={() =>
          navigate(
            '/test-plans',
          )
        }
        sx={{
          mb: 2,
        }}
      >
        Back to Test Plans
      </Button>

      <Box
        sx={{
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          Create Test Plan
        </Typography>

        <Typography
          color="text.secondary"
        >
          Define the test
          plan that will
          contain
          requirements,
          scenarios,
          test cases and
          automation.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          onClose={() =>
            setError(null)
          }
        >
          {error}
        </Alert>
      )}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
        }}
      >
        <CardContent
          sx={{
            p: 4,
          }}
        >
          <Box
            component="form"
            onSubmit={
              handleSubmit
            }
          >
            <Stack
              spacing={3}
            >
              <TextField
                label="Test Plan Name"
                required
                fullWidth
                disabled={
                  submitting
                }
                value={name}
                onChange={(
                  event,
                ) =>
                  setName(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Example: Customer Portal Regression"
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={4}
                disabled={
                  submitting
                }
                value={
                  description
                }
                onChange={(
                  event,
                ) =>
                  setDescription(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Describe the purpose and scope of this test plan..."
              />

              <FormControl
                fullWidth
              >
                <InputLabel>
                  Status
                </InputLabel>

                <Select
                  value={
                    status
                  }
                  label="Status"
                  disabled={
                    submitting
                  }
                  onChange={(
                    event,
                  ) =>
                    setStatus(
                      event
                        .target
                        .value as TestPlanStatus,
                    )
                  }
                >
                  <MenuItem
                    value="DRAFT"
                  >
                    Draft
                  </MenuItem>

                  <MenuItem
                    value="ACTIVE"
                  >
                    Active
                  </MenuItem>

                  <MenuItem
                    value="COMPLETED"
                  >
                    Completed
                  </MenuItem>
                </Select>
              </FormControl>

              <Alert
                severity="info"
                variant="outlined"
              >
                Project ID:{' '}
                <strong>
                  {
                    DEFAULT_PROJECT_ID
                  }
                </strong>
                {' '}| Approval
                Status:{' '}
                <strong>
                  {
                    DEFAULT_APPROVAL_STATUS
                  }
                </strong>
              </Alert>

              <Box
                sx={{
                  display:
                    'flex',

                  justifyContent:
                    'flex-end',

                  gap: 2,

                  pt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  disabled={
                    submitting
                  }
                  onClick={() =>
                    navigate(
                      '/test-plans',
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    submitting
                  }
                  startIcon={
                    submitting ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <Save />
                    )
                  }
                >
                  {submitting
                    ? 'Creating...'
                    : 'Create Test Plan'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}