export type ProjectStatus =
    | 'ACTIVE'
    | 'ON_HOLD'
    | 'COMPLETED'
    | 'ARCHIVED';

export interface CreateProjectRequest {
    projectId?: string;
    name: string;
    description?: string;
    status: ProjectStatus;
}

export interface UpdateProjectRequest {
    name: string;
    description?: string;
    status: ProjectStatus;
}

export interface Project {
    id: number;
    projectId: string;
    name: string;
    description?: string | null;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
}
