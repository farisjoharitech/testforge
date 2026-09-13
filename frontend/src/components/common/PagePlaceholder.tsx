import {
  Alert,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface PagePlaceholderProps {
  title: string;
  description: string;
  nextTask?: string;
}

export function PagePlaceholder({
  title,
  description,
  nextTask,
}: PagePlaceholderProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
      }}
    >
      <Stack spacing={2}>
        <Typography
          variant="h6"
        >
          {title}
        </Typography>

        <Typography
          color="text.secondary"
        >
          {description}
        </Typography>

        {nextTask && (
          <Alert severity="info">
            Implementation continues in{" "}
            {nextTask}.
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}