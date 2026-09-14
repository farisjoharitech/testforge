import {
    useEffect,
    useState,
    type FormEvent,
} from 'react';

import {
    ArrowBack,
    Save,
} from '@mui/icons-material';

import {
    Alert,
    Button,
    Card,
    CardContent,
    CircularProgress,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';

import {
    useNavigate,
    useSearchParams,
} from 'react-router-dom';

import {
    ApiError,
} from '../../api/apiClient';

import {
    projectApi,
} from '../../api/projectApi';

import {
    testPlanApi,
} from '../../api/testPlanApi';

import {
    PageHeader,
} from '../../components/common/PageHeader';

import type {
    Project,
} from '../../types/project';

import type {
    ApprovalStatus,
    TestPlanStatus,
} from '../../types/testPlan';

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

export default function CreateTestPlanPage() {
    const navigate =
        useNavigate();

    const [
        searchParams,
    ] = useSearchParams();

    const [
        projects,
        setProjects,
    ] = useState<Project[]>(
        [],
    );

    const [
        projectsLoading,
        setProjectsLoading,
    ] = useState(true);

    const [
        projectId,
        setProjectId,
    ] = useState(
        searchParams.get(
            'projectId',
        ) ?? '',
    );

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
            let active = true;

            void projectApi
                .getProjects()
                .then(
                    response => {
                        if (!active) {
                            return;
                        }

                        setProjects(
                            response,
                        );

                        setProjectId(
                            current => {
                                if (
                                    current
                                    && response.some(
                                        project =>
                                            project.projectId
                                            === current,
                                    )
                                ) {
                                    return current;
                                }

                                return response[0]
                                        ?.projectId
                                    ?? '';
                            },
                        );
                    },
                )
                .catch(
                    err => {
                        console.error(
                            'Failed to load Projects:',
                            err,
                        );

                        if (active) {
                            setError(
                                'Unable to load Projects.',
                            );
                        }
                    },
                )
                .finally(
                    () => {
                        if (active) {
                            setProjectsLoading(
                                false,
                            );
                        }
                    },
                );

            return () => {
                active = false;
            };
        },
        [],
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
                    'Name is required.',
                );
                return;
            }

            try {
                setSubmitting(true);
                setError(null);

                const created =
                    await testPlanApi
                        .createTestPlan({
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
                        });

                navigate(
                    `/test-plans/${encodeURIComponent(
                        created.testPlanId,
                    )}`,
                    {
                        replace: true,
                    },
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
                        'Unable to create Test Plan.',
                    );
                }
            } finally {
                setSubmitting(false);
            }
        };

    return (
        <Stack
            spacing={3}
        >
            <PageHeader
                title="Create Test Plan"
                subtitle="Create a Test Plan inside a Project."
                actions={
                    <Button
                        startIcon={
                            <ArrowBack />
                        }
                        onClick={() =>
                            navigate(
                                '/test-plans',
                            )
                        }
                    >
                        Back to Test Plans
                    </Button>
                }
            />

            {projects.length ===
                0
                && !projectsLoading && (
                    <Alert
                        severity="warning"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() =>
                                    navigate(
                                        '/projects/new',
                                    )
                                }
                            >
                                Create Project
                            </Button>
                        }
                    >
                        A Project is required before you can create a Test Plan.
                    </Alert>
                )}

            <Card
                variant="outlined"
            >
                <CardContent>
                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >
                        <Stack
                            spacing={3}
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
                                Test Plan ID is generated automatically by the backend.
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
                                    || projects.length
                                    === 0
                                }
                                onChange={
                                    event =>
                                        setProjectId(
                                            event.target.value,
                                        )
                                }
                                helperText={
                                    projectsLoading
                                        ? 'Loading Projects...'
                                        : 'Every Test Plan belongs to one Project.'
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
                                label="Name"
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
                                label="Version"
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
                                onChange={
                                    event =>
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
                                onChange={
                                    event =>
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
                                onChange={
                                    event =>
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
                                            {option}
                                        </MenuItem>
                                    ),
                                )}
                            </TextField>

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={
                                    submitting
                                    || projectsLoading
                                    || projects.length
                                    === 0
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
                                sx={{
                                    alignSelf:
                                        'flex-start',
                                }}
                            >
                                {submitting
                                    ? 'Creating...'
                                    : 'Create Test Plan'}
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
        </Stack>
    );
}
