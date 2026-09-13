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
  description?: string;
  projectId: number;
  status?: TestPlanStatus;
  approvalStatus: ApprovalStatus;
  ownerId?: number;
  startDate?: string;
}

export interface TestPlan {
  id?: number;
  testPlanId: string;

  name: string;
  description?: string | null;

  projectId?: number;
  status?: TestPlanStatus | string;
  approvalStatus?: ApprovalStatus | string;

  ownerId?: number | null;
  startDate?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];

  totalElements?: number;
  totalPages?: number;

  size?: number;
  number?: number;

  first?: boolean;
  last?: boolean;
}