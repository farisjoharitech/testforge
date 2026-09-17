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
  projectApi,
} from '../../api/projectApi';

import {
  testPlanApi,
} from '../../api/testPlanApi';

import type {
  Project,
} from '../../types/project';

import type {
  ApprovalStatus,
  TestPlan,
  TestPlanStatus,
} from '../../types/testPlan';

import { humanizeEnumValue } from '../../utils/uiText';

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
    projects,
    setProjects,
  ] = useState<Project[]>(
      [],
  );

  const [
    projectsLoading,
    setProjectsLoading,
  ] = useState(false);

  const [
    projectId,
    setProjectId,
  ] = useState('');

  const [
    name,
    setName,
  ] = useState('');

  const [
    version,
    setVersion,
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

        setProjectId(
            testPlan.projectBusinessId,
        );

        setName(
            testPlan.name,
        );

        setVersion(
            testPlan.version
            ?? '',
        );

        setApplication(
            testPlan.application
            ?? '',
        );

        setEnvironment(
            testPlan.environment
            ?? '',
        );

        setPreparedBy(
            testPlan.preparedBy
            ?? '',
        );

        setStatus(
            testPlan.status,
        );

        setApprovalStatus(
            testPlan.approvalStatus,
        );

        setError(null);

        setProjectsLoading(
            true,
        );

        void projectApi
            .getProjects()
            .then(
                response =>
                    setProjects(
                        response,
                    ),
            )
            .catch(
                err => {
                  console.error(
                      'Failed to load Projects:',
                      err,
                  );

                  setError(
                      'Unable to load Projects.',
                  );
                },
            )
            .finally(
                () =>
                    setProjectsLoading(
                        false,
                    ),
            );
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

    return trimmed
        || undefined;
  };

  const handleSubmit =
      async (
          event:
          FormEvent<HTMLFormElement>,
      ) => {
        event.preventDefault();

        if (!projectId) {
          setError(
              'Project is required.',
          );
          return;
        }

        const trimmedName =
            name.trim();

        if (!trimmedName) {
          setError(
              'Test Plan name is required.',
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
                        projectId,
                        name:
                        trimmedName,
                        version:
                            optionalValue(
                                version,
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

          onUpdated(
              updated,
          );
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
                  {testPlan.testPlanId}
                </strong>{' '}
                cannot be changed.
              </Alert>

              <TextField
                  select
                  required
                  label="Project"
                  value={
                    projectId
                  }
                  disabled={
                      submitting
                      || projectsLoading
                  }
                  onChange={
                    event =>
                        setProjectId(
                            event.target.value,
                        )
                  }
              >
                {projects.map(
                    project => (
                        <MenuItem
                            key={
                              project.projectId
                            }
                            value={
                              project.projectId
                            }
                        >
                          {project.name}{' '}
                          ({project.projectId})
                        </MenuItem>
                    ),
                )}
              </TextField>

              <TextField
                  label="Test Plan Name"
                  required
                  value={name}
                  disabled={
                    submitting
                  }
                  inputProps={{
                    maxLength: 255,
                  }}
                  onChange={
                    event =>
                        setName(
                            event.target.value,
                        )
                  }
              />

              <TextField
                  label="Version (Optional)"
                  value={version}
                  disabled={
                    submitting
                  }
                  inputProps={{
                    maxLength: 50,
                  }}
                  onChange={
                    event =>
                        setVersion(
                            event.target.value,
                        )
                  }
              />

              <TextField
                  label="Application (Optional)"
                  value={
                    application
                  }
                  disabled={
                    submitting
                  }
                  inputProps={{
                    maxLength: 255,
                  }}
                  onChange={
                    event =>
                        setApplication(
                            event.target.value,
                        )
                  }
              />

              <TextField
                  label="Environment (Optional)"
                  value={
                    environment
                  }
                  disabled={
                    submitting
                  }
                  inputProps={{
                    maxLength: 100,
                  }}
                  onChange={
                    event =>
                        setEnvironment(
                            event.target.value,
                        )
                  }
              />

              <TextField
                  label="Prepared By (Optional)"
                  value={
                    preparedBy
                  }
                  disabled={
                    submitting
                  }
                  inputProps={{
                    maxLength: 255,
                  }}
                  onChange={
                    event =>
                        setPreparedBy(
                            event.target.value,
                        )
                  }
              />

              <TextField
                  select
                  label="Test Plan Status"
                  value={status}
                  disabled={
                    submitting
                  }
                  onChange={
                    event =>
                        setStatus(
                            (event.target.value as TestPlanStatus),
                        )
                  }
              >
                {statuses.map(
                    option => (
                        <MenuItem
                            key={
                              option
                            }
                            value={
                              option
                            }
                        >
                          {humanizeEnumValue(option)}
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
                  onChange={
                    event =>
                        setApprovalStatus(
                            (event.target.value as ApprovalStatus),
                        )
                  }
              >
                {approvalStatuses.map(
                    option => (
                        <MenuItem
                            key={
                              option
                            }
                            value={
                              option
                            }
                        >
                          {humanizeEnumValue(option)}
                        </MenuItem>
                    ),
                )}
              </TextField>
            </Stack>
          </form>
        </DialogContent>

        <DialogActions>
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
                  || projectsLoading
              }
              startIcon={
                submitting
                    ? (
                        <CircularProgress
                            size={18}
                            color="inherit"
                        />
                    )
                    : (
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
