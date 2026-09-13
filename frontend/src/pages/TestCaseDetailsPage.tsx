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

export default function TestCaseDetailsPage() {
  const {
    testPlanId,
    requirementId,
    scenarioId,
    testCaseId,
  } = useParams();

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Test Case ${testCaseId ?? ""}`}
        description="Manage Test Steps and automation eligibility."
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
            to:
              `/test-plans/${testPlanId}` +
              `/requirements/${requirementId}`,
          },
          {
            label:
              scenarioId ??
              "Scenario",
            to:
              `/test-plans/${testPlanId}` +
              `/requirements/${requirementId}` +
              `/scenarios/${scenarioId}`,
          },
          {
            label:
              testCaseId ??
              "Test Case",
          },
        ]}
      />

      <PagePlaceholder
        title="Test Case & Test Steps"
        description="Test Case information and its ordered Test Steps will appear here."
        nextTask="Task 36.5 / 36.6"
      />
    </Stack>
  );
}