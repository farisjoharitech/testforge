import {
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

export default function NotFoundPage() {
  const navigate =
    useNavigate();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          alignItems:
            'flex-start',
        }}
      >
        <Typography
          variant="h4"
        >
          Page Not Found
        </Typography>

        <Typography
          color="text.secondary"
        >
          The requested TestForge page does not exist.
        </Typography>

        <Button
          variant="contained"
          onClick={() =>
            navigate(
              '/test-plans',
            )
          }
        >
          Go to Test Plans
        </Button>
      </Stack>
    </Paper>
  );
}