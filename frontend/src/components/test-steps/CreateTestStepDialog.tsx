import TestStepDialog, { type TestStepDialogProps } from "./TestStepDialog";

type Props = Omit<TestStepDialogProps, "onSaved"> & { open: boolean; onCreated: TestStepDialogProps["onSaved"] };
export default function CreateTestStepDialog({ open, onCreated, ...props }: Props) {
  return open ? <TestStepDialog {...props} onSaved={onCreated} /> : null;
}
