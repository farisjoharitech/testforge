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
    testScenarioApi,
} from '../../api/testScenarioApi';

import type {
    TestScenario,
    TestScenarioPriority,
    TestScenarioStatus,
    TestType,
} from '../../types/testScenario';

interface EditTestScenarioDialogProps {
    open: boolean;
    scenario: TestScenario;
    onClose: () => void;
    onUpdated: (
        scenario: TestScenario,
    ) => void;
}

const priorities:
    TestScenarioPriority[] = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL',
];

const statuses:
    TestScenarioStatus[] = [
    'DRAFT',
    'ACTIVE',
    'APPROVED',
    'REJECTED',
    'ARCHIVED',
];

const testTypes:
    TestType[] = [
    'SMOKE',
    'SANITY',
    'REGRESSION',
    'FUNCTIONAL',
    'INTEGRATION',
    'END_TO_END',
    'POSITIVE',
    'NEGATIVE',
];

export default function EditTestScenarioDialog({
                                                   open,
                                                   scenario,
                                                   onClose,
                                                   onUpdated,
                                               }: EditTestScenarioDialogProps) {
    const [
        description,
        setDescription,
    ] = useState('');

    const [
        testType,
        setTestType,
    ] = useState<TestType>(
        'FUNCTIONAL',
    );


    const [
        priority,
        setPriority,
    ] = useState<TestScenarioPriority>(
        'MEDIUM',
    );

    const [
        status,
        setStatus,
    ] = useState<TestScenarioStatus>(
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
                scenario.description,
            );

            setTestType(
                scenario.testType,
            );


            setPriority(
                scenario.priority,
            );

            setStatus(
                scenario.status,
            );

            setError(null);
        },
        [
            open,
            scenario,
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
                    'Scenario description is required.',
                );

                return;
            }

            try {
                setSubmitting(true);
                setError(null);

                const updated =
                    await testScenarioApi
                        .updateTestScenario(
                            scenario.id,
                            {
                                description:
                                trimmed,
                                testType,
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
                        'Unable to update Test Scenario.',
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
                Edit Test Scenario
            </DialogTitle>

            <DialogContent>
                <form
                    id="edit-test-scenario-form"
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
                            Scenario ID{' '}
                            <strong>
                                {
                                    scenario.scenarioId
                                }
                            </strong>{' '}
                            cannot be changed.
                        </Alert>

                        <TextField
                            label="Scenario Description"
                            required
                            multiline
                            minRows={4}
                            value={
                                description
                            }
                            inputProps={{
                                maxLength:
                                    1000,
                            }}
                            disabled={
                                submitting
                            }
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
                            label="Test Type"
                            value={testType}
                            disabled={
                                submitting
                            }
                            onChange={(
                                event,
                            ) =>
                                setTestType(
                                    event.target
                                        .value as
                                        TestType,
                                )
                            }
                        >
                            {testTypes.map(
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
                            label="Scenario Priority"
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
                                        TestScenarioPriority,
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
                            label="Scenario Status"
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
                                        TestScenarioStatus,
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
                    form="edit-test-scenario-form"
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