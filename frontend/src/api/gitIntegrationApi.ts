import { apiClient } from './apiClient';
import type { GitChanges, GitConfiguration, GitConfigurationRequest, GitSyncResult } from '../types/gitIntegration';
const base=(projectId:string)=>`/api/projects/${encodeURIComponent(projectId)}/git-integration`;
export const gitIntegrationApi={
  get:(projectId:string):Promise<GitConfiguration>=>apiClient.get(base(projectId)),
  save:(projectId:string,request:GitConfigurationRequest):Promise<GitConfiguration>=>apiClient.put(base(projectId),request),
  testConnection:(projectId:string):Promise<{connected:boolean;message:string}>=>apiClient.post(`${base(projectId)}/test-connection`,{}),
  changes:(projectId:string):Promise<GitChanges>=>apiClient.get(`${base(projectId)}/changes`),
  sync:(projectId:string,commitMessage:string):Promise<GitSyncResult>=>apiClient.post(`${base(projectId)}/sync`,{commitMessage}),
};
