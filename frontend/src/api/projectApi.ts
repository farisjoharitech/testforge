import {
    apiClient,
} from './apiClient';

import type {
    CreateProjectRequest,
    Project,
    UpdateProjectRequest,
} from '../types/project';

import type {
    TestPlan,
} from '../types/testPlan';

export const projectApi = {
    getProjects(): Promise<Project[]> {
        return apiClient.get<Project[]>(
            '/api/projects',
        );
    },

    getProject(
        id: number,
    ): Promise<Project> {
        return apiClient.get<Project>(
            `/api/projects/${id}`,
        );
    },

    getProjectByBusinessId(
        projectId: string,
    ): Promise<Project> {
        return apiClient.get<Project>(
            `/api/projects/business/${encodeURIComponent(
                projectId,
            )}`,
        );
    },

    getProjectTestPlans(
        projectId: string,
    ): Promise<TestPlan[]> {
        return apiClient.get<TestPlan[]>(
            `/api/projects/${encodeURIComponent(
                projectId,
            )}/test-plans`,
        );
    },

    createProject(
        request: CreateProjectRequest,
    ): Promise<Project> {
        return apiClient.post<
            Project,
            CreateProjectRequest
        >(
            '/api/projects',
            request,
        );
    },

    updateProject(
        id: number,
        request: UpdateProjectRequest,
    ): Promise<Project> {
        return apiClient.put<
            Project,
            UpdateProjectRequest
        >(
            `/api/projects/${id}`,
            request,
        );
    },

    deleteProject(
        id: number,
    ): Promise<void> {
        return apiClient.delete<void>(
            `/api/projects/${id}`,
        );
    },
};
