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
  projectId: string;
  name: string;
  version?: string;
  application?: string;
  environment?: string;
  preparedBy?: string;
  status: TestPlanStatus;
  approvalStatus: ApprovalStatus;
}

export interface UpdateTestPlanRequest {
  projectId: string;
  name: string;
  version?: string;
  application?: string;
  environment?: string;
  preparedBy?: string;
  status: TestPlanStatus;
  approvalStatus: ApprovalStatus;
}

export interface TestPlan {
  id: number;
  testPlanId: string;
  projectId: number;
  projectBusinessId: string;
  projectName: string;
  name: string;
  version?: string | null;
  application?: string | null;
  environment?: string | null;
  preparedBy?: string | null;
  status: TestPlanStatus;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}
