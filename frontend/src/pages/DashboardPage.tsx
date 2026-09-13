import {
  Stack,
} from "@mui/material";

import {
  PageHeader,
} from "../components/common/PageHeader";

import {
  PagePlaceholder,
} from "../components/common/PagePlaceholder";

export default function DashboardPage() {
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Dashboard"
        description="Test lifecycle and automation reporting."
      />

      <PagePlaceholder
        title="Reporting Dashboard"
        description="Automation coverage, execution results and testing metrics will be added later."
        nextTask="Dashboard milestone"
      />
    </Stack>
  );
}