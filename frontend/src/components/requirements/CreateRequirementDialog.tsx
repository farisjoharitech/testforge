import {
    useEffect,
    useState,
    type FormEvent,
} from 'react';

import {
    Add,
} from '@mui/icons-material';

import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
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

interface CreateRequirementDialogProps {
    open: boolean;
    testPlanId?: string;
    moduleId?: string;

    onClose: () => void;

    onCreated: (
        requirement: Requirement,
    ) => void;
}

export default function CreateRequirementDialog({
                                                    open,
                                                    testPlanId,
                                                    moduleId,
                                                    onClose,
                                                    onCreated,
                                                }: CreateRequirementDialogProps) {
    const [
        description,
        setDescription,
    ] = useState('');

    const [
        priority,
        setPriority,
    ] =
        useState<RequirementPriority>(
            'MEDIUM',
        );

    const [
        status,
        setStatus,
    ] =
        useState<RequirementStatus>(
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

    const resetForm = () => {
        setDescription('');
        setPriority('MEDIUM');
        setStatus('DRAFT');
        setError(null);
    };

    useEffect(
        () => {
            if (open) {
                resetForm();
            }
        },
        [open],
    );

    const handleClose = () => {
        if (submitting) {
            return;
        }

        resetForm();
        onClose();
    };

    const handleSubmit =
        async (
            event:
            FormEvent<HTMLFormElement>,
        ) => {
            event.preventDefault();

            setError(null);

            const trimmedDescription =
                description.trim();

            if (!trimmedDescription) {
                setError(
                    'Requirement description is required.',
                );

                return;
            }

            if (
                trimmedDescription.length >
                1000
            ) {
                setError(
                    'Description must not exceed 1000 characters.',
                );

                return;
            }

            try {
                setSubmitting(true);

                const createdRequirement =
                    await (moduleId
                        ? requirementApi.createRequirementForModule(moduleId, {
                            description: trimmedDescription,
                            priority,
                            status,
                        })
                        : requirementApi.createRequirement(
                            testPlanId!,
                            {
                                description:
                                trimmedDescription,

                                priority,

                                status,

                            },
                        ));

                resetForm();

                onCreated(
                    createdRequirement,
                );
            } catch (err) {
                console.error(
                    'Failed to create requirement:',
                    err,
                );

                if (
                    err instanceof
                    ApiError
                ) {
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
                        'Unable to connect to the backend.',
                    );

                    return;
                }

                setError(
                    'An unexpected error occurred while creating the requirement.',
                );
            } finally {
                setSubmitting(false);
            }
        };

    return (
        <Dialog
            open={open}
            onClose={
                handleClose
            }
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Create Requirement
            </DialogTitle>

            <DialogContent>
                <form
                    id="create-requirement-form"
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
                                onClose={() =>
                                    setError(null)
                                }
                            >
                                {error}
                            </Alert>
                        )}

                        <TextField
                            label="Requirement Description"
                            required
                            fullWidth
                            multiline
                            minRows={4}
                            value={
                                description
                            }
                            disabled={
                                submitting
                            }
                            inputProps={{
                                maxLength: 1000,
                            }}
                            placeholder="Describe the behavior, capability, or constraint that must be verified."
                            helperText="Required. Keep the requirement specific enough to design Test Scenarios against it."
                            onChange={(
                                event,
                            ) =>
                                setDescription(
                                    event.target
                                        .value,
                                )
                            }
                        />

                        <FormControl
                            fullWidth
                        >
                            <InputLabel>
                                Priority
                            </InputLabel>

                            <Select
                                value={
                                    priority
                                }
                                label="Requirement Priority"
                                disabled={
                                    submitting
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setPriority(
                                        event.target
                                            .value as RequirementPriority,
                                    )
                                }
                            >
                                <MenuItem
                                    value="LOW"
                                >
                                    Low
                                </MenuItem>

                                <MenuItem
                                    value="MEDIUM"
                                >
                                    Medium
                                </MenuItem>

                                <MenuItem
                                    value="HIGH"
                                >
                                    High
                                </MenuItem>

                                <MenuItem
                                    value="CRITICAL"
                                >
                                    Critical
                                </MenuItem>
                            </Select>
                        </FormControl>

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
                                label="Requirement Status"
                                disabled={
                                    submitting
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setStatus(
                                        event.target
                                            .value as RequirementStatus,
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
                                    value="APPROVED"
                                >
                                    Approved
                                </MenuItem>

                                <MenuItem
                                    value="REJECTED"
                                >
                                    Rejected
                                </MenuItem>

                                <MenuItem
                                    value="ARCHIVED"
                                >
                                    Archived
                                </MenuItem>
                            </Select>
                        </FormControl>


                        <Alert
                            severity="info"
                            variant="outlined"
                        >
                            Requirement will
                            be created under
                            Test Plan{' '}
                            <strong>
                                {testPlanId}
                            </strong>
                            .
                        </Alert>
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
                        handleClose
                    }
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    form="create-requirement-form"
                    variant="contained"
                    startIcon={
                        submitting ? (
                            <CircularProgress
                                size={18}
                                color="inherit"
                            />
                        ) : (
                            <Add />
                        )
                    }
                    disabled={
                        submitting
                    }
                >
                    {submitting
                        ? 'Creating...'
                        : 'Create Requirement'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
