import AddIcon
  from "@mui/icons-material/Add";

import {
  Button,
  Stack,
} from "@mui/material";

import {
  PageHeader,
} from "../components/common/PageHeader";

import {
  PagePlaceholder,
} from "../components/common/PagePlaceholder";

export default function TestPlansPage() {
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Test Plans"
        description="Create and manage TestForge test plans."
        actions={
          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            disabled
          >
            Create Test Plan
          </Button>
        }
      />

      <PagePlaceholder
        title="Test Plan Management"
        description="This will become the starting point for the complete testing lifecycle."
        nextTask="Task 36.2"
      />
    </Stack>
  );
}