export type AutomationActionType =
    | 'NAVIGATE'
    | 'GO_BACK'
    | 'GO_FORWARD'
    | 'RELOAD'
    | 'CLICK'
    | 'CLICK_NEW_TAB'
    | 'CLICK_DOWNLOAD'
    | 'DOUBLE_CLICK'
    | 'HOVER'
    | 'FOCUS'
    | 'FILL'
    | 'CLEAR'
    | 'SELECT'
    | 'CHECK'
    | 'UNCHECK'
    | 'PRESS'
    | 'SET_INPUT_FILES'
    | 'FRAME_CLICK'
    | 'FRAME_FILL'
    | 'ACCEPT_DIALOG'
    | 'DISMISS_DIALOG'
    | 'WAIT'
    | 'WAIT_FOR_SELECTOR'
    | 'WAIT_FOR_URL'
    | 'WAIT_FOR_LOAD_STATE'
    | 'TAKE_SCREENSHOT'
    | 'ASSERT_VISIBLE'
    | 'ASSERT_HIDDEN'
    | 'ASSERT_TEXT'
    | 'ASSERT_CONTAINS_TEXT'
    | 'ASSERT_VALUE'
    | 'ASSERT_ENABLED'
    | 'ASSERT_DISABLED'
    | 'ASSERT_EDITABLE'
    | 'ASSERT_CHECKED'
    | 'ASSERT_COUNT'
    | 'ASSERT_URL'
    | 'ASSERT_TITLE'
    | 'API_GET'
    | 'API_POST'
    | 'API_PUT'
    | 'API_PATCH'
    | 'API_DELETE'
    | 'ASSERT_API_STATUS'
    | 'ASSERT_API_BODY_CONTAINS'
    | 'ASSERT_API_BODY_EQUALS'
    | 'ASSERT_API_JSON_FIELD_EQUALS'
    | 'ASSERT_API_HEADER'
    | 'EXTRACT_API_JSON_VALUE';

export type ApiAuthenticationType =
    | 'NONE'
    | 'BASIC'
    | 'BEARER_TOKEN'
    | 'API_KEY';

export type ApiKeyLocation =
    | 'HEADER'
    | 'QUERY';

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
  apiConfig?: string | null;
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
  apiConfig?: string | null;
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
  apiConfig?: string | null;
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