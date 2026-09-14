export type RequirementPriority =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL';

export type RequirementStatus =
    | 'DRAFT'
    | 'ACTIVE'
    | 'APPROVED'
    | 'REJECTED'
    | 'ARCHIVED';

export interface CreateRequirementRequest {
  requirementId: string;
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
}

export interface UpdateRequirementRequest {
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
}

export interface Requirement {
  id: number;
  requirementId: string;
  testPlanId: number;
  testPlanBusinessId: string;
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
}