import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    Add,
    ArrowForward,
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
    Stack,
    Typography,
} from '@mui/material';

import {
    useNavigate,
} from 'react-router-dom';

import {
    projectApi,
} from '../../api/projectApi';

import {
    PageHeader,
} from '../../components/common/PageHeader';

import type {
    Project,
} from '../../types/project';

function getStatusColor(
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

export default function ProjectListPage() {
    const navigate =
        useNavigate();

    const [
        projects,
        setProjects,
    ] = useState<Project[]>(
        [],
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    const loadProjects =
        useCallback(
            async () => {
                try {
                    setLoading(true);
                    setError(null);

                    setProjects(
                        await projectApi
                            .getProjects(),
                    );
                } catch (err) {
                    console.error(
                        'Failed to load Projects:',
                        err,
                    );

                    setError(
                        'Unable to load Projects. Make sure the backend is running.',
                    );
                } finally {
                    setLoading(false);
                }
            },
            [],
        );

    useEffect(
        () => {
            void loadProjects();
        },
        [loadProjects],
    );

    return (
        <Stack
            spacing={3}
        >
            <PageHeader
                title="Projects"
                subtitle="Group Test Plans by project and manage the testing lifecycle from a stable project boundary."
                actions={
                    <Stack
                        direction="row"
                        spacing={1}
                    >
                        <Button
                            variant="outlined"
                            startIcon={
                                <Refresh />
                            }
                            disabled={
                                loading
                            }
                            onClick={() =>
                                void loadProjects()
                            }
                        >
                            Refresh
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={
                                <Add />
                            }
                            onClick={() =>
                                navigate(
                                    '/projects/new',
                                )
                            }
                        >
                            Create Project
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

            {loading ? (
                <Card
                    variant="outlined"
                >
                    <CardContent>
                        <Stack
                            spacing={2}
                            sx={{
                                minHeight: 280,
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
                                Loading Projects...
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            ) : projects.length ===
            0 ? (
                <Card
                    variant="outlined"
                >
                    <CardContent>
                        <Stack
                            spacing={2}
                            sx={{
                                minHeight: 280,
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
                                No Projects yet
                            </Typography>

                            <Typography
                                color="text.secondary"
                            >
                                Create a Project before creating new Test Plans.
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={
                                    <Add />
                                }
                                onClick={() =>
                                    navigate(
                                        '/projects/new',
                                    )
                                }
                            >
                                Create Project
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            lg: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 2,
                    }}
                >
                    {projects.map(
                        project => (
                            <Card
                                key={
                                    project.id
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
                                                {project.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {project.projectId}
                                            </Typography>
                                        </Box>

                                        <Typography
                                            color="text.secondary"
                                        >
                                            {project.description?.trim()
                                                || 'No description provided.'}
                                        </Typography>

                                        <Chip
                                            label={
                                                project.status
                                            }
                                            color={getStatusColor(
                                                project.status,
                                            )}
                                            variant="outlined"
                                            sx={{
                                                alignSelf:
                                                    'flex-start',
                                            }}
                                        />

                                        <Button
                                            endIcon={
                                                <ArrowForward />
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/projects/${encodeURIComponent(
                                                        project.projectId,
                                                    )}`,
                                                )
                                            }
                                        >
                                            Open Project
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ),
                    )}
                </Box>
            )}
        </Stack>
    );
}
