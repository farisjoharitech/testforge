export interface SuiteScenario { id: number; scenarioId: string; description: string; itemOrder: number; }
export type SuiteExecutionMode = 'SEQUENTIAL' | 'PARALLEL';
export interface TestSuite { id: number; projectId: number; projectBusinessId: string; name: string; description?: string | null; scenarios: SuiteScenario[]; executionMode:SuiteExecutionMode; lifecycleEnabled:boolean; tags:string[]; parameterSets:Array<Record<string,string>>; extensions:string[]; createdAt: string; updatedAt: string; }
export interface TestSuiteRequest { name: string; description?: string | null; scenarioIds: number[]; executionMode:SuiteExecutionMode; lifecycleEnabled:boolean; tags:string[]; parameterSets:Array<Record<string,string>>; extensions:string[]; }
export type SuiteRunStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED';
export interface SuiteRun { id:number; testSuiteId:number; status:SuiteRunStatus; startedAt:string; completedAt?:string|null; durationMs?:number|null; total:number; passed:number; failed:number; skipped:number; errorDetails?:string|null; }
