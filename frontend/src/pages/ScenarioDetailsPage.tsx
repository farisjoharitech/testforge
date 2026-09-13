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

export default function ScenarioDetailsPage() {
  const {
    testPlanId,
    requirementId,
    scenarioId,
  } = useParams();

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Test Scenario ${scenarioId ?? ""}`}
        description="Manage Test Cases linked to this Test Scenario."
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
          },
        ]}
      />

      <PagePlaceholder
        title="Test Scenario Details"
        description="Scenario information and linked Test Cases will appear here."
        nextTask="Task 36.4 / 36.5"
      />
    </Stack>
  );
}