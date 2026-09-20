export interface DeletionImpact {
  resourceType: string;
  resourceId: number;
  businessId: string;
  owned: Record<string, number>;
  preserved: Record<string, number>;
  blockers: string[];
  canDelete: boolean;
}
