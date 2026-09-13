export type TestPlanStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ARCHIVED';

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface CreateTestPlanRequest {
  testPlanId: string;
  name: string;
  version?: string;
  project?: string;
  application?: string;
  environment?: string;
  preparedBy?: string;
  status: TestPlanStatus;
  approvalStatus: ApprovalStatus;
}

export interface UpdateTestPlanRequest {
  name: string;
  version?: string;
  project?: string;
  application?: string;
  environment?: string;
  preparedBy?: string;
  status: TestPlanStatus;
  approvalStatus: ApprovalStatus;
}

export interface TestPlan {
  id: number;
  testPlanId: string;
  name: string;
  version?: string | null;
  project?: string | null;
  application?: string | null;
  environment?: string | null;
  preparedBy?: string | null;
  status: TestPlanStatus;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}