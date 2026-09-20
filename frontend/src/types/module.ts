export interface CreateModuleRequest { moduleId?: string; name: string; description?: string; }
export interface UpdateModuleRequest { name: string; description?: string; }
export interface Module {
  id: number; moduleId: string; projectId: number; projectBusinessId: string;
  projectName: string; testPlanId: number; testPlanBusinessId: string; testPlanName: string;
  name: string; description?: string | null;
  createdAt: string; updatedAt: string;
}
