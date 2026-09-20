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
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
} from '@mui/material';

import {
    ApiError,
} from '../../api/apiClient';

import {
    testScenarioApi,
} from '../../api/testScenarioApi';

import type {
    TestScenario,
    TestScenarioPriority,
    TestScenarioStatus,
    TestType,
} from '../../types/testScenario';

interface CreateTestScenarioDialogProps {
    open: boolean;

    requirementId: string;

    onClose: () => void;

    onCreated: (
        testScenario:
        TestScenario,
    ) => void;
}

export default function CreateTestScenarioDialog({
                                                     open,
                                                     requirementId,
                                                     onClose,
                                                     onCreated,
                                                 }: CreateTestScenarioDialogProps) {
    const [
        description,
        setDescription,
    ] = useState('');

    const [
        testType,
        setTestType,
    ] =
        useState<TestType>(
            'FUNCTIONAL',
        );


    const [
        priority,
        setPriority,
    ] =
        useState<TestScenarioPriority>(
            'MEDIUM',
        );

    const [
        automatable,
        setAutomatable,
    ] = useState(false);

    const [
        status,
        setStatus,
    ] =
        useState<TestScenarioStatus>(
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

    const resetForm =
        () => {
            setDescription('');

            setTestType(
                'FUNCTIONAL',
            );


            setPriority(
                'MEDIUM',
            );

            setAutomatable(false);

            setStatus(
                'DRAFT',
            );

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

    const handleClose =
        () => {
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
                    'Scenario description is required.',
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
                setSubmitting(
                    true,
                );

                const created =
                    await testScenarioApi
                        .createTestScenario(
                            requirementId,
                            {
                                description:
                                trimmedDescription,

                                testType,

                                automatable,


                                priority,

                                status,
                            },
                        );

                resetForm();

                onCreated(
                    created,
                );
            } catch (err) {
                console.error(
                    'Failed to create Test Scenario:',
                    err,
                );

                if (
                    err instanceof
                    ApiError
                ) {
                    if (
                        err.status ===
                        409
                    ) {
                        setError(
                            err.message ||
                            'Scenario ID already exists.',
                        );

                        return;
                    }

                    if (
                        err.status ===
                        400
                    ) {
                        setError(
                            err.message ||
                            'Please check the Scenario values.',
                        );

                        return;
                    }

                    if (
                        err.status ===
                        404
                    ) {
                        setError(
                            err.message ||
                            'Requirement could not be found.',
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
                        'Unable to connect to the backend. Make sure TestForge backend is running.',
                    );

                    return;
                }

                setError(
                    'An unexpected error occurred while creating the Test Scenario.',
                );
            } finally {
                setSubmitting(
                    false,
                );
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
                Create Test Scenario
            </DialogTitle>

            <DialogContent>
                <form
                    id="create-test-scenario-form"
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
                            label="Scenario Description"
                            required
                            fullWidth
                            multiline
                            minRows={4}
                            disabled={
                                submitting
                            }
                            value={
                                description
                            }
                            inputProps={{
                                maxLength:
                                    1000,
                            }}
                            placeholder="Example: Verify successful login using valid credentials."
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
                                Test Type
                            </InputLabel>

                            <Select
                                label="Test Type"
                                value={
                                    testType
                                }
                                disabled={
                                    submitting
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setTestType(
                                        event.target
                                            .value as TestType,
                                    )
                                }
                            >
                                <MenuItem
                                    value="SMOKE"
                                >
                                    Smoke
                                </MenuItem>

                                <MenuItem
                                    value="SANITY"
                                >
                                    Sanity
                                </MenuItem>

                                <MenuItem
                                    value="REGRESSION"
                                >
                                    Regression
                                </MenuItem>

                                <MenuItem
                                    value="FUNCTIONAL"
                                >
                                    Functional
                                </MenuItem>

                                <MenuItem
                                    value="INTEGRATION"
                                >
                                    Integration
                                </MenuItem>

                                <MenuItem
                                    value="END_TO_END"
                                >
                                    End To End
                                </MenuItem>

                                <MenuItem
                                    value="POSITIVE"
                                >
                                    Positive
                                </MenuItem>

                                <MenuItem
                                    value="NEGATIVE"
                                >
                                    Negative
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={automatable}
                                    disabled={submitting}
                                    onChange={event =>
                                        setAutomatable(event.target.checked)
                                    }
                                />
                            }
                            label="Automation Eligible"
                        />

                        <FormControl
                            fullWidth
                        >
                            <InputLabel>
                                Priority
                            </InputLabel>

                            <Select
                                label="Scenario Priority"
                                value={
                                    priority
                                }
                                disabled={
                                    submitting
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setPriority(
                                        event.target
                                            .value as TestScenarioPriority,
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
                                label="Scenario Status"
                                value={
                                    status
                                }
                                disabled={
                                    submitting
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setStatus(
                                        event.target
                                            .value as TestScenarioStatus,
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
                            Test Scenario will
                            be created under
                            Requirement{' '}
                            <strong>
                                {requirementId}
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
                    form="create-test-scenario-form"
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
                            <Add />
                        )
                    }
                >
                    {submitting
                        ? 'Creating...'
                        : 'Create Test Scenario'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
