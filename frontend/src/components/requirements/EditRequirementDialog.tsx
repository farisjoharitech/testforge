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
  requirementApi,
} from '../../api/requirementApi';

import type {
  Requirement,
  RequirementPriority,
  RequirementStatus,
} from '../../types/requirement';

interface EditRequirementDialogProps {
  open: boolean;
  requirement: Requirement;
  onClose: () => void;
  onUpdated: (
      requirement: Requirement,
  ) => void;
}

const priorities:
    RequirementPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

const statuses:
    RequirementStatus[] = [
  'DRAFT',
  'ACTIVE',
  'APPROVED',
  'REJECTED',
  'ARCHIVED',
];

export default function EditRequirementDialog({
                                                open,
                                                requirement,
                                                onClose,
                                                onUpdated,
                                              }: EditRequirementDialogProps) {
  const [
    description,
    setDescription,
  ] = useState('');

  const [
    priority,
    setPriority,
  ] = useState<RequirementPriority>(
      'MEDIUM',
  );

  const [
    status,
    setStatus,
  ] = useState<RequirementStatus>(
      'DRAFT',
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

        setDescription(
            requirement.description,
        );

        setPriority(
            requirement.priority,
        );

        setStatus(
            requirement.status,
        );


        setError(null);
      },
      [
        open,
        requirement,
      ],
  );

  const handleSubmit =
      async (
          event:
          FormEvent<HTMLFormElement>,
      ) => {
        event.preventDefault();

        const trimmed =
            description.trim();

        if (!trimmed) {
          setError(
              'Description is required.',
          );

          return;
        }

        if (
            trimmed.length > 1000
        ) {
          setError(
              'Description must not exceed 1000 characters.',
          );

          return;
        }

        try {
          setSubmitting(true);
          setError(null);

          const updated =
              await requirementApi
                  .updateRequirement(
                      requirement.id,
                      {
                        description:
                        trimmed,
                        priority,
                        status,
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
                'Unable to update Requirement.',
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
          Edit Requirement
        </DialogTitle>

        <DialogContent>
          <form
              id="edit-requirement-form"
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
                Requirement ID{' '}
                <strong>
                  {
                    requirement.requirementId
                  }
                </strong>{' '}
                cannot be changed.
              </Alert>

              <TextField
                  label="Description"
                  required
                  multiline
                  minRows={4}
                  value={
                    description
                  }
                  disabled={
                    submitting
                  }
                  inputProps={{
                    maxLength:
                        1000,
                  }}
                  onChange={(
                      event,
                  ) =>
                      setDescription(
                          event.target.value,
                      )
                  }
              />

              <TextField
                  select
                  label="Priority"
                  value={priority}
                  disabled={
                    submitting
                  }
                  onChange={(
                      event,
                  ) =>
                      setPriority(
                          event.target
                              .value as
                              RequirementPriority,
                      )
                  }
              >
                {priorities.map(
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
                              RequirementStatus,
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
              form="edit-requirement-form"
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