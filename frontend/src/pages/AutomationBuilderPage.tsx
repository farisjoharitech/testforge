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

export default function AutomationBuilderPage() {
  const {
    testCaseId,
  } = useParams();

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Automation Builder"
        description="Configure automation explicitly from selected Test Steps."
        breadcrumbs={[
          {
            label:
              "Test Plans",
            to: "/test-plans",
          },
          {
            label:
              `Test Case ${testCaseId ?? ""}`,
          },
          {
            label:
              "Automation",
          },
        ]}
      />

      <PagePlaceholder
        title="Automation Builder"
        description="Selected Test Steps will be converted into explicitly authored Automation Steps here. TestForge will not guess actions or selectors."
        nextTask="Task 36.7 / 36.8"
      />
    </Stack>
  );
}