import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    Add,
    ArrowBack,
    ArrowForward,
    Delete,
    Edit,
    Refresh,
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
    projectApi,
} from '../../api/projectApi';

import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';

import {
    PageHeader,
} from '../../components/common/PageHeader';

import EditProjectDialog from '../../components/projects/EditProjectDialog';
import ProjectMonitoringPanel from '../../components/projects/ProjectMonitoringPanel';

import type {
    Project,
} from '../../types/project';

import type {
    ProjectMonitoring,
} from '../../types/projectMonitoring';

import type {
    TestPlan,
} from '../../types/testPlan';

function getProjectStatusColor(
    status: string,
):
    | 'default'
    | 'primary'
    | 'success'
    | 'warning' {
    switch (status) {
        case 'ACTIVE':
            return 'success';

        case 'ON_HOLD':
            return 'warning';

        case 'COMPLETED':
            return 'primary';

        default:
            return 'default';
    }
}

function getTestPlanStatusColor(
    status: string,
):
    | 'default'
    | 'primary'
    | 'success'
    | 'warning' {
    switch (status) {
        case 'ACTIVE':
            return 'success';

        case 'COMPLETED':
            return 'primary';

        case 'DRAFT':
            return 'warning';

        default:
            return 'default';
    }
}

export default function ProjectDetailsPage() {
    const navigate =
        useNavigate();

    const {
        projectId,
    } = useParams<{
        projectId: string;
    }>();

    const [
        project,
        setProject,
    ] = useState<
        Project | null
    >(null);

    const [
        testPlans,
        setTestPlans,
    ] = useState<
        TestPlan[]
    >([]);

    const [
        monitoring,
        setMonitoring,
    ] = useState<
        ProjectMonitoring | null
    >(null);

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
        successMessage,
        setSuccessMessage,
    ] = useState<
        string | null
    >(null);

    const [
        editOpen,
        setEditOpen,
    ] = useState(false);

    const [
        deleteOpen,
        setDeleteOpen,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const [
        deleteError,
        setDeleteError,
    ] = useState<
        string | null
    >(null);

    const loadPage =
        useCallback(
            async (
                refresh = false,
            ) => {
                if (!projectId) {
                    setError(
                        'Project ID is missing.',
                    );
                    setLoading(false);
                    return;
                }

                try {
                    if (refresh) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }

                    setError(null);

                    const [
                        projectResponse,
                        testPlanResponse,
                        monitoringResponse,
                    ] =
                        await Promise.all([
                            projectApi
                                .getProjectByBusinessId(
                                    projectId,
                                ),
                            projectApi
                                .getProjectTestPlans(
                                    projectId,
                                ),
                            projectApi
                                .getProjectMonitoring(
                                    projectId,
                                ),
                        ]);

                    setProject(
                        projectResponse,
                    );

                    setTestPlans(
                        testPlanResponse,
                    );

                    setMonitoring(
                        monitoringResponse,
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
                            'Unable to load Project details.',
                        );
                    }
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            },
            [projectId],
        );

    useEffect(
        () => {
            void loadPage();
        },
        [loadPage],
    );

    const handleDelete =
        async () => {
            if (!project) {
                return;
            }

            try {
                setDeleting(true);
                setDeleteError(null);

                await projectApi
                    .deleteProject(
                        project.id,
                    );

                navigate(
                    '/projects',
                );
            } catch (err) {
                if (
                    err instanceof
                    ApiError
                ) {
                    setDeleteError(
                        err.message,
                    );
                } else {
                    setDeleteError(
                        'Unable to delete Project.',
                    );
                }
            } finally {
                setDeleting(false);
            }
        };

    if (
        loading
        && !project
    ) {
        return (
            <Stack
                spacing={2}
                sx={{
                    minHeight: 320,
                    alignItems:
                        'center',
                    justifyContent:
                        'center',
                }}
            >
                <CircularProgress />
                <Typography
                    color="text.secondary"
                >
                    Loading Project...
                </Typography>
            </Stack>
        );
    }

    if (
        !project
    ) {
        return (
            <Stack
                spacing={2}
            >
                <Alert
                    severity="error"
                >
                    {error
                        || 'Project not found.'}
                </Alert>

                <Button
                    startIcon={
                        <ArrowBack />
                    }
                    onClick={() =>
                        navigate(
                            '/projects',
                        )
                    }
                >
                    Back to Projects
                </Button>
            </Stack>
        );
    }

    return (
        <Stack
            spacing={3}
        >
            <PageHeader
                title={project.name}
                subtitle={`${project.projectId} · Project workspace`}
                actions={
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            flexWrap:
                                'wrap',
                        }}
                    >
                        <Button
                            startIcon={
                                <ArrowBack />
                            }
                            onClick={() =>
                                navigate(
                                    '/projects',
                                )
                            }
                        >
                            Projects
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
                                void loadPage(
                                    true,
                                )
                            }
                        >
                            Refresh
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={
                                <Edit />
                            }
                            onClick={() =>
                                setEditOpen(
                                    true,
                                )
                            }
                        >
                            Edit
                        </Button>

                        <Button
                            color="error"
                            variant="outlined"
                            startIcon={
                                <Delete />
                            }
                            onClick={() =>
                                setDeleteOpen(
                                    true,
                                )
                            }
                        >
                            Delete
                        </Button>
                    </Stack>
                }
            />

            {successMessage && (
                <Alert
                    severity="success"
                    onClose={() =>
                        setSuccessMessage(
                            null,
                        )
                    }
                >
                    {successMessage}
                </Alert>
            )}

            {error && (
                <Alert
                    severity="error"
                >
                    {error}
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
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={2}
                            sx={{
                                justifyContent:
                                    'space-between',
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="overline"
                                    color="text.secondary"
                                >
                                    Project
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {project.name}
                                </Typography>
                            </Box>

                            <Chip
                                label={
                                    project.status
                                }
                                color={getProjectStatusColor(
                                    project.status,
                                )}
                                variant="outlined"
                                sx={{
                                    alignSelf: {
                                        xs: 'flex-start',
                                        sm: 'center',
                                    },
                                }}
                            />
                        </Stack>

                        <Typography
                            color="text.secondary"
                            sx={{
                                whiteSpace:
                                    'pre-wrap',
                            }}
                        >
                            {project.description?.trim()
                                || 'No description provided.'}
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>

            {monitoring && (
                <ProjectMonitoringPanel
                    monitoring={
                        monitoring
                    }
                />
            )}

            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row',
                }}
                spacing={2}
                sx={{
                    justifyContent:
                        'space-between',
                    alignItems: {
                        xs: 'stretch',
                        sm: 'center',
                    },
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        fontWeight={700}
                    >
                        Test Plans
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        {testPlans.length}{' '}
                        Test Plan
                        {testPlans.length === 1
                            ? ''
                            : 's'}{' '}
                        in this Project.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={
                        <Add />
                    }
                    onClick={() =>
                        navigate(
                            `/test-plans/new?projectId=${encodeURIComponent(
                                project.projectId,
                            )}`,
                        )
                    }
                >
                    Create Test Plan
                </Button>
            </Stack>

            {testPlans.length ===
            0 ? (
                <Card
                    variant="outlined"
                >
                    <CardContent>
                        <Stack
                            spacing={2}
                            sx={{
                                minHeight: 220,
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                textAlign:
                                    'center',
                            }}
                        >
                            <Typography
                                variant="h6"
                            >
                                No Test Plans yet
                            </Typography>

                            <Typography
                                color="text.secondary"
                            >
                                Create the first Test Plan for this Project.
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={
                                    <Add />
                                }
                                onClick={() =>
                                    navigate(
                                        `/test-plans/new?projectId=${encodeURIComponent(
                                            project.projectId,
                                        )}`,
                                    )
                                }
                            >
                                Create Test Plan
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            ) : (
                <Stack
                    spacing={2}
                >
                    {testPlans.map(
                        testPlan => (
                            <Card
                                key={
                                    testPlan.id
                                }
                                variant="outlined"
                            >
                                <CardContent>
                                    <Stack
                                        spacing={2}
                                    >
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                            >
                                                {testPlan.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {testPlan.testPlanId}
                                            </Typography>
                                        </Box>

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{
                                                flexWrap:
                                                    'wrap',
                                            }}
                                        >
                                            <Chip
                                                label={
                                                    testPlan.status
                                                }
                                                color={getTestPlanStatusColor(
                                                    testPlan.status,
                                                )}
                                                variant="outlined"
                                            />

                                            <Chip
                                                label={
                                                    testPlan.approvalStatus
                                                }
                                                variant="outlined"
                                            />
                                        </Stack>

                                        <Divider />

                                        <Button
                                            endIcon={
                                                <ArrowForward />
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/test-plans/${encodeURIComponent(
                                                        testPlan.testPlanId,
                                                    )}`,
                                                )
                                            }
                                        >
                                            Open Test Plan
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ),
                    )}
                </Stack>
            )}

            <EditProjectDialog
                open={editOpen}
                project={project}
                onClose={() =>
                    setEditOpen(
                        false,
                    )
                }
                onUpdated={
                    updated => {
                        setProject(
                            updated,
                        );
                        setEditOpen(
                            false,
                        );
                        setSuccessMessage(
                            `Project "${updated.name}" updated successfully.`,
                        );
                    }
                }
            />

            <DeleteConfirmationDialog
                open={deleteOpen}
                title="Delete Project?"
                entityName={
                    project.name
                }
                description="A Project cannot be deleted while Test Plans still reference it. Move or delete those Test Plans first."
                deleting={
                    deleting
                }
                error={
                    deleteError
                }
                onClose={() => {
                    if (deleting) {
                        return;
                    }

                    setDeleteOpen(
                        false,
                    );

                    setDeleteError(
                        null,
                    );
                }}
                onConfirm={() =>
                    void handleDelete()
                }
            />
        </Stack>
    );
}
