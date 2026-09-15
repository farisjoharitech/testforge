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
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setProjects(await projectApi.getProjects());
        } catch (err) {
            console.error('Failed to load Projects:', err);
            setError(
                'Unable to load Projects. Make sure the backend is running.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadProjects();
    }, [loadProjects]);

    return (
        <Stack spacing={2.25}>
            <PageHeader
                title="Projects"
                subtitle="Group Test Plans by project and manage the testing lifecycle from a stable project boundary."
                actions={
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Refresh />}
                            disabled={loading}
                            onClick={() => void loadProjects()}
                        >
                            Refresh
                        </Button>

                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => navigate('/projects/new')}
                        >
                            Create Project
                        </Button>
                    </Stack>
                }
            />

            {error && <Alert severity="error">{error}</Alert>}

            {loading ? (
                <Card variant="outlined">
                    <CardContent>
                        <Stack
                            spacing={2}
                            sx={{
                                minHeight: 220,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CircularProgress />
                            <Typography color="text.secondary">
                                Loading Projects...
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            ) : projects.length === 0 ? (
                <Card variant="outlined">
                    <CardContent>
                        <Stack
                            spacing={1.5}
                            sx={{
                                minHeight: 220,
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h6">No Projects yet</Typography>
                            <Typography color="text.secondary">
                                Create a Project before creating new Test Plans.
                            </Typography>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => navigate('/projects/new')}
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
                            sm: 'repeat(2, minmax(0, 1fr))',
                            xl: 'repeat(3, minmax(0, 1fr))',
                        },
                        gap: 1.5,
                    }}
                >
                    {projects.map(project => (
                        <Card
                            key={project.id}
                            variant="outlined"
                            sx={{
                                height: '100%',
                                borderRadius: 2,
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: 1.75,
                                    '&:last-child': { pb: 1.75 },
                                    height: '100%',
                                }}
                            >
                                <Stack spacing={1.15} sx={{ height: '100%' }}>
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            fontWeight={800}
                                            sx={{
                                                lineHeight: 1.2,
                                                fontSize: '1.05rem',
                                            }}
                                        >
                                            {project.name}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.7rem' }}
                                        >
                                            {project.projectId}
                                        </Typography>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            minHeight: '2.5em',
                                        }}
                                    >
                                        {project.description?.trim()
                                            || 'No description provided.'}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 1,
                                            mt: 'auto',
                                        }}
                                    >
                                        <Chip
                                            size="small"
                                            label={project.status}
                                            color={getStatusColor(project.status)}
                                            variant="outlined"
                                            sx={{ height: 24 }}
                                        />

                                        <Button
                                            size="small"
                                            endIcon={<ArrowForward />}
                                            onClick={() =>
                                                navigate(
                                                    `/projects/${encodeURIComponent(
                                                        project.projectId,
                                                    )}`,
                                                )
                                            }
                                        >
                                            Open
                                        </Button>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Stack>
    );
}
