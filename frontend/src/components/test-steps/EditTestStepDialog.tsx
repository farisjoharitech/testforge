import TestStepDialog, { type TestStepDialogProps } from "./TestStepDialog";

type Props = Omit<TestStepDialogProps, "onSaved"> & { open: boolean; onUpdated: TestStepDialogProps["onSaved"] };
export default function EditTestStepDialog({ open, onUpdated, ...props }: Props) {
  return open ? <TestStepDialog {...props} onSaved={onUpdated} /> : null;
}
