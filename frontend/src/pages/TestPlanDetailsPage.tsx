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

export default function TestPlanDetailsPage() {
  const {
    testPlanId,
  } = useParams();

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Test Plan ${testPlanId ?? ""}`}
        description="Manage requirements and testing scope for this Test Plan."
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
          },
        ]}
      />

      <PagePlaceholder
        title="Test Plan Details"
        description="Requirements for this Test Plan will be managed here."
        nextTask="Task 36.2 / 36.3"
      />
    </Stack>
  );
}