export type AutomationActionType =
  | 'NAVIGATE'
  | 'CLICK'
  | 'FILL'
  | 'SELECT'
  | 'CHECK'
  | 'UNCHECK'
  | 'PRESS'
  | 'WAIT'
  | 'ASSERT_VISIBLE'
  | 'ASSERT_HIDDEN'
  | 'ASSERT_TEXT'
  | 'ASSERT_VALUE'
  | 'ASSERT_URL'
  | 'ASSERT_TITLE'
  | 'API_GET'
  | 'API_POST'
  | 'API_PUT'
  | 'API_PATCH'
  | 'API_DELETE'
  | 'ASSERT_API_STATUS'
  | 'ASSERT_API_BODY_CONTAINS';

export type SelectorStrategy =
  | 'ROLE'
  | 'LABEL'
  | 'PLACEHOLDER'
  | 'TEXT'
  | 'TEST_ID'
  | 'CSS'
  | 'XPATH';

export type UiElementRole =
  | 'BUTTON'
  | 'LINK'
  | 'TEXTBOX'
  | 'CHECKBOX'
  | 'RADIO'
  | 'COMBOBOX'
  | 'OPTION'
  | 'HEADING'
  | 'IMG'
  | 'LIST'
  | 'LISTITEM'
  | 'MENU'
  | 'MENUITEM'
  | 'TAB'
  | 'TABPANEL'
  | 'DIALOG'
  | 'ALERT'
  | 'STATUS'
  | 'PROGRESSBAR';

export type AutomationExecutionStatus =
  | 'RUNNING'
  | 'PASSED'
  | 'FAILED'
  | 'TIMED_OUT'
  | 'ERROR';

export interface CreateAutomationScriptRequest {
  automationScriptId: string;
  name: string;
}

export interface AutomationScript {
  id: number;
  automationScriptId: string;
  testCaseId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationStepRequest {
  automationStepId: string;
  sourceTestStepId: number;
  stepOrder: number;
  actionType: AutomationActionType;
  target?: string | null;
  selectorStrategy?: SelectorStrategy | null;
  selectorValue?: string | null;
  selectorRole?: UiElementRole | null;
  selectorName?: string | null;
  selectorExact: boolean;
  inputValue?: string | null;
  expectedValue?: string | null;
}

export interface UpdateAutomationStepRequest {
  stepOrder: number;
  actionType: AutomationActionType;
  target?: string | null;
  selectorStrategy?: SelectorStrategy | null;
  selectorValue?: string | null;
  selectorRole?: UiElementRole | null;
  selectorName?: string | null;
  selectorExact: boolean;
  inputValue?: string | null;
  expectedValue?: string | null;
}

export interface AutomationStep {
  id: number;
  automationStepId: string;
  automationScriptId: number;
  sourceTestStepId: number;
  stepOrder: number;
  actionType: AutomationActionType;
  target?: string | null;
  selectorStrategy?: SelectorStrategy | null;
  selectorValue?: string | null;
  selectorRole?: UiElementRole | null;
  selectorName?: string | null;
  selectorExact: boolean;
  inputValue?: string | null;
  expectedValue?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedScript {
  automationScriptId: number;
  automationScriptBusinessId: string;
  testCaseId: number;
  className: string;
  language: string;
  framework: string;
  source: string;
  generatedStepCount: number;
  generatedAt: string;
  stale: boolean;
}

export interface AutomationExecution {
  id: number;
  executionId: string;
  automationScriptId: number;
  automationScriptBusinessId: string;
  testCaseId: number;
  testCaseBusinessId: string;
  status: AutomationExecutionStatus;
  generatedClassName: string;
  generatedAt?: string | null;
  exitCode?: number | null;
  logOutput?: string | null;
  errorMessage?: string | null;
  startedAt: string;
  finishedAt?: string | null;
  durationMs?: number | null;
}