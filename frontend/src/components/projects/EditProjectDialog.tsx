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

import type {
    Project,
    ProjectStatus,
} from '../../types/project';

import { humanizeEnumValue } from '../../utils/uiText';

interface EditProjectDialogProps {
    open: boolean;
    project: Project;
    onClose: () => void;
    onUpdated: (
        project: Project,
    ) => void;
}

const statuses:
    ProjectStatus[] = [
    'ACTIVE',
    'ON_HOLD',
    'COMPLETED',
    'ARCHIVED',
];

export default function EditProjectDialog({
                                              open,
                                              project,
                                              onClose,
                                              onUpdated,
                                          }: EditProjectDialogProps) {
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

    useEffect(
        () => {
            if (!open) {
                return;
            }

            setName(
                project.name,
            );

            setDescription(
                project.description
                ?? '',
            );

            setStatus(
                project.status,
            );

            setError(null);
        },
        [
            open,
            project,
        ],
    );

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

                const updated =
                    await projectApi
                        .updateProject(
                            project.id,
                            {
                                name:
                                trimmedName,
                                description:
                                    description.trim()
                                    || undefined,
                                status,
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
                        'Unable to update Project.',
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
            Edit Project
    </DialogTitle>

    <DialogContent>
    <form
        id="edit-project-form"
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
        Project ID{' '}
    <strong>
        {project.projectId}
    </strong>{' '}
    cannot be changed.
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
    form="edit-project-form"
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
>
    {submitting
        ? 'Saving...'
        : 'Save Changes'}
    </Button>
    </DialogActions>
    </Dialog>
);
}
