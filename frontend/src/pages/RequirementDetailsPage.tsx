import {
  Stack,
} from "@mui/material";

import {
  useParams,
} from "react-router-dom";

import {
  PageHeader,
} from "../components/common/PageHeader";

import {
  PagePlaceholder,
} from "../components/common/PagePlaceholder";

export default function RequirementDetailsPage() {
  const {
    testPlanId,
    requirementId,
  } = useParams();

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Requirement ${requirementId ?? ""}`}
        description="Manage Test Scenarios linked to this Requirement."
        breadcrumbs={[
          {
            label:
              "Test Plans",
            to: "/test-plans",
          },
          {
            label:
              testPlanId ??
              "Test Plan",
            to: `/test-plans/${testPlanId}`,
          },
          {
            label:
              requirementId ??
              "Requirement",
          },
        ]}
      />

      <PagePlaceholder
        title="Requirement Details"
        description="Requirement information and linked Test Scenarios will appear here."
        nextTask="Task 36.3 / 36.4"
      />
    </Stack>
  );
}