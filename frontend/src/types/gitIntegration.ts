export type GitSyncStatus = 'NOT_SYNCED' | 'SYNCED' | 'CHANGES_PENDING' | 'SYNC_FAILED';
export interface GitSyncHistory { status: GitSyncStatus; commitSha?: string | null; summary?: string | null; createdAt: string; }
export interface GitConfiguration { configured: boolean; projectId: string; repositoryUrl: string; branch: string; automationProjectPath: string; commitMessageTemplate: string; credentialConfigured: boolean; status: GitSyncStatus; lastSyncAt?: string | null; lastCommitSha?: string | null; lastErrorSummary?: string | null; recentSyncs: GitSyncHistory[]; }
export interface GitConfigurationRequest { repositoryUrl: string; branch: string; automationProjectPath: string; commitMessageTemplate: string; credentialUsername?: string; credentialToken?: string; }
export interface GitChanges { added: string[]; modified: string[]; deleted: string[]; hasChanges: boolean; }
export interface GitSyncResult { status: GitSyncStatus; message: string; commitSha?: string | null; changes: GitChanges; }
