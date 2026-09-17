import {
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
} from 'react-router-dom';

import {
    ApiError,
} from '../../api/apiClient';

import {
    projectApi,
} from '../../api/projectApi';

import {
    PageHeader,
} from '../../components/common/PageHeader';

import type {
    ProjectStatus,
} from '../../types/project';

import { humanizeEnumValue } from '../../utils/uiText';

const statuses:
    ProjectStatus[] = [
    'ACTIVE',
    'ON_HOLD',
    'COMPLETED',
    'ARCHIVED',
];

export default function CreateProjectPage() {
    const navigate =
        useNavigate();

    const [
        name,
        setName,
    ] = useState('');

    const [
        description,
        setDescription,
    ] = useState('');

    const [
        status,
        setStatus,
    ] = useState<ProjectStatus>(
        'ACTIVE',
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
                    'Project name is required.',
                );
                return;
            }

            try {
                setSubmitting(true);
                setError(null);

                const created =
                    await projectApi
                        .createProject({
                            name:
                            trimmedName,
                            description:
                                description.trim()
                                || undefined,
                            status,
                        });

                navigate(
                    `/projects/${encodeURIComponent(
                        created.projectId,
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
                        'Unable to create Project.',
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
                title="Create Project"
                subtitle="Create the top-level container that groups Test Plans."
                actions={
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
                }
            />

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
                                Project ID is generated automatically by the backend.
                            </Alert>

                            <TextField
                                label="Project Name"
                                required
                                value={name}
                                disabled={
                                    submitting
                                }
                                inputProps={{
                                    maxLength: 255,
                                }}
                                helperText="Required. Use a short, recognizable Project name."
                                onChange={
                                    event =>
                                        setName(
                                            event.target.value,
                                        )
                                }
                            />

                            <TextField
                                label="Project Description (Optional)"
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
                                helperText="Optional. Describe the product, service, or initiative covered by this Project."
                                onChange={
                                    event =>
                                        setDescription(
                                            event.target.value,
                                        )
                                }
                            />

                            <TextField
                                select
                                label="Project Status"
                                value={status}
                                disabled={
                                    submitting
                                }
                                onChange={
                                    event =>
                                        setStatus(
                                            (event.target.value as ProjectStatus),
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

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={
                                    submitting
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
                                    : 'Create Project'}
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
        </Stack>
    );
}
