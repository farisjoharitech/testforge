import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  Save,
} from '@mui/icons-material';

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

import {
  ApiError,
} from '../../api/apiClient';

import {
  testPlanApi,
} from '../../api/testPlanApi';

import type {
  ApprovalStatus,
  TestPlan,
  TestPlanStatus,
} from '../../types/testPlan';

interface EditTestPlanDialogProps {
  open: boolean;
  testPlan: TestPlan;
  onClose: () => void;
  onUpdated: (
    testPlan: TestPlan,
  ) => void;
}

const statuses:
  TestPlanStatus[] = [
    'DRAFT',
    'ACTIVE',
    'COMPLETED',
    'ARCHIVED',
  ];

const approvalStatuses:
  ApprovalStatus[] = [
    'PENDING',
    'APPROVED',
    'REJECTED',
  ];

export default function EditTestPlanDialog({
  open,
  testPlan,
  onClose,
  onUpdated,
}: EditTestPlanDialogProps) {
  const [
    name,
    setName,
  ] = useState('');

  const [
    version,
    setVersion,
  ] = useState('');

  const [
    project,
    setProject,
  ] = useState('');

  const [
    application,
    setApplication,
  ] = useState('');

  const [
    environment,
    setEnvironment,
  ] = useState('');

  const [
    preparedBy,
    setPreparedBy,
  ] = useState('');

  const [
    status,
    setStatus,
  ] = useState<TestPlanStatus>(
    'DRAFT',
  );

  const [
    approvalStatus,
    setApprovalStatus,
  ] = useState<ApprovalStatus>(
    'PENDING',
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(
    () => {
      if (!open) {
        return;
      }

      setName(
        testPlan.name,
      );

      setVersion(
        testPlan.version ?? '',
      );

      setProject(
        testPlan.project ?? '',
      );

      setApplication(
        testPlan.application ?? '',
      );

      setEnvironment(
        testPlan.environment ?? '',
      );

      setPreparedBy(
        testPlan.preparedBy ?? '',
      );

      setStatus(
        testPlan.status,
      );

      setApprovalStatus(
        testPlan.approvalStatus,
      );

      setError(null);
    },
    [
      open,
      testPlan,
    ],
  );

  const optionalValue = (
    value: string,
  ): string | undefined => {
    const trimmed =
      value.trim();

    return trimmed ||
      undefined;
  };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const trimmedName =
        name.trim();

      if (!trimmedName) {
        setError(
          'Name is required.',
        );

        return;
      }

      if (
        trimmedName.length > 255
      ) {
        setError(
          'Name must not exceed 255 characters.',
        );

        return;
      }

      try {
        setSubmitting(true);
        setError(null);

        const updated =
          await testPlanApi
            .updateTestPlan(
              testPlan.id,
              {
                name:
                  trimmedName,

                version:
                  optionalValue(
                    version,
                  ),

                project:
                  optionalValue(
                    project,
                  ),

                application:
                  optionalValue(
                    application,
                  ),

                environment:
                  optionalValue(
                    environment,
                  ),

                preparedBy:
                  optionalValue(
                    preparedBy,
                  ),

                status,

                approvalStatus,
              },
            );

        onUpdated(updated);
      } catch (err) {
        if (
          err instanceof
          ApiError
        ) {
          setError(
            err.message,
          );
        } else {
          setError(
            'Unable to update Test Plan.',
          );
        }
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <Dialog
      open={open}
      onClose={
        submitting
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Edit Test Plan
      </DialogTitle>

      <DialogContent>
        <form
          id="edit-test-plan-form"
          onSubmit={
            handleSubmit
          }
        >
          <Stack
            spacing={3}
            sx={{
              pt: 1,
            }}
          >
            {error && (
              <Alert
                severity="error"
              >
                {error}
              </Alert>
            )}

            <Alert
              severity="info"
              variant="outlined"
            >
              Test Plan ID{' '}
              <strong>
                {
                  testPlan.testPlanId
                }
              </strong>{' '}
              cannot be changed.
            </Alert>

            <TextField
              label="Name"
              required
              value={name}
              disabled={
                submitting
              }
              inputProps={{
                maxLength: 255,
              }}
              onChange={(
                event,
              ) =>
                setName(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Version"
              value={version}
              disabled={
                submitting
              }
              inputProps={{
                maxLength: 50,
              }}
              onChange={(
                event,
              ) =>
                setVersion(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Project"
              value={project}
              disabled={
                submitting
              }
              inputProps={{
                maxLength: 255,
              }}
              onChange={(
                event,
              ) =>
                setProject(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Application"
              value={
                application
              }
              disabled={
                submitting
              }
              inputProps={{
                maxLength: 255,
              }}
              onChange={(
                event,
              ) =>
                setApplication(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Environment"
              value={
                environment
              }
              disabled={
                submitting
              }
              inputProps={{
                maxLength: 100,
              }}
              onChange={(
                event,
              ) =>
                setEnvironment(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Prepared By"
              value={
                preparedBy
              }
              disabled={
                submitting
              }
              inputProps={{
                maxLength: 255,
              }}
              onChange={(
                event,
              ) =>
                setPreparedBy(
                  event.target.value,
                )
              }
            />

            <TextField
              select
              label="Status"
              value={status}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setStatus(
                  event.target
                    .value as
                    TestPlanStatus,
                )
              }
            >
              {statuses.map(
                (
                  option,
                ) => (
                  <MenuItem
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option}
                  </MenuItem>
                ),
              )}
            </TextField>

            <TextField
              select
              label="Approval Status"
              value={
                approvalStatus
              }
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setApprovalStatus(
                  event.target
                    .value as
                    ApprovalStatus,
                )
              }
            >
              {approvalStatuses.map(
                (
                  option,
                ) => (
                  <MenuItem
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Stack>
        </form>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          disabled={
            submitting
          }
          onClick={
            onClose
          }
        >
          Cancel
        </Button>

        <Button
          type="submit"
          form="edit-test-plan-form"
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
            ? 'Saving...'
            : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}