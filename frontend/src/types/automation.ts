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
  | 'ASSERT_TITLE';

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