import RequestParametersEditor from './RequestParametersEditor';
import {
  useEffect,
  useImperativeHandle,
  type Ref,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type {
  ApiAuthenticationType,
  ApiKeyLocation,
  AutomationActionType,
  AutomationStep,
  SelectorStrategy,
  UiElementRole,
} from '../../types/automation';

import type {
  AutomationType,
} from '../../types/testCase';

import type {
  TestStep,
} from '../../types/testStep';

export interface AutomationStepFormValues {
  automationStepId: string;

  sourceTestStepId: number;

  stepOrder: number;

  actionType: AutomationActionType;

  target: string;

  selectorStrategy:
      | SelectorStrategy
      | '';

  selectorValue: string;

  selectorRole:
      | UiElementRole
      | '';

  selectorName: string;

  selectorExact: boolean;

  inputValue: string;

  expectedValue: string;

  apiConfig: string | null;
}

export interface AutomationStepEditorHandle { submit: () => void; }

interface AutomationStepDialogProps {
  embedded?: boolean;
  submitRef?: Ref<AutomationStepEditorHandle>;
  open: boolean;

  mode:
      | 'create'
      | 'edit';

  testCaseId: string;

  automationType:
      AutomationType;

  testSteps: TestStep[];

  automationStep?:
      | AutomationStep
      | null;

  suggestedOrder: number;

  fixedSourceTestStepId?: number;

  saving?: boolean;

  error?: string | null;

  onClose: () => void;

  onSubmit: (
      values:
      AutomationStepFormValues,
  ) => void;
}

interface AutomationActionGroup {
  label: string;

  actions: AutomationActionType[];
}

const ACTION_GROUPS: AutomationActionGroup[] = [
  {
    label: 'Browser',
    actions: [
      'NAVIGATE',
      'GO_BACK',
      'GO_FORWARD',
      'RELOAD',
      'CLICK_NEW_TAB',
      'CLICK_DOWNLOAD',
    ],
  },
  {
    label: 'Interaction',
    actions: [
      'CLICK',
      'DOUBLE_CLICK',
      'HOVER',
      'FOCUS',
      'FILL',
      'CLEAR',
      'SELECT',
      'CHECK',
      'UNCHECK',
      'PRESS',
      'SET_INPUT_FILES',
    ],
  },
  {
    label: 'Wait',
    actions: [
      'WAIT',
      'WAIT_FOR_SELECTOR',
      'WAIT_FOR_URL',
      'WAIT_FOR_LOAD_STATE',
    ],
  },
  {
    label: 'Assertions',
    actions: [
      'ASSERT_VISIBLE',
      'ASSERT_HIDDEN',
      'ASSERT_TEXT',
      'ASSERT_CONTAINS_TEXT',
      'ASSERT_VALUE',
      'ASSERT_ENABLED',
      'ASSERT_DISABLED',
      'ASSERT_EDITABLE',
      'ASSERT_CHECKED',
      'ASSERT_COUNT',
      'ASSERT_URL',
      'ASSERT_TITLE',
    ],
  },
  {
    label: 'Frames / Dialog',
    actions: [
      'FRAME_CLICK',
      'FRAME_FILL',
      'ACCEPT_DIALOG',
      'DISMISS_DIALOG',
    ],
  },
  {
    label: 'Evidence',
    actions: [
      'TAKE_SCREENSHOT',
    ],
  },
  {
    label: 'API Requests',
    actions: [
      'API_GET',
      'API_POST',
      'API_PUT',
      'API_PATCH',
      'API_DELETE',
    ],
  },
  {
    label: 'API Assertions',
    actions: [
      'ASSERT_API_STATUS',
      'ASSERT_API_BODY_CONTAINS',
      'ASSERT_API_BODY_EQUALS',
      'ASSERT_API_JSON_FIELD_EQUALS',
      'ASSERT_API_HEADER',
      'EXTRACT_API_JSON_VALUE',
    ],
  },
];

const UI_ACTION_TYPES: AutomationActionType[] =
    ACTION_GROUPS
        .filter((group) =>
            !group.label.startsWith('API'),
        )
        .flatMap((group) =>
            group.actions,
        );

const API_ACTION_TYPES: AutomationActionType[] =
    ACTION_GROUPS
        .filter((group) =>
            group.label.startsWith('API'),
        )
        .flatMap((group) =>
            group.actions,
        );

const SELECTOR_STRATEGIES:
    SelectorStrategy[] = [
  'ROLE',
  'LABEL',
  'PLACEHOLDER',
  'TEXT',
  'TEST_ID',
  'CSS',
  'XPATH',
];

const UI_ROLES:
    UiElementRole[] = [
  'BUTTON',
  'LINK',
  'TEXTBOX',
  'CHECKBOX',
  'RADIO',
  'COMBOBOX',
  'OPTION',
  'HEADING',
  'IMG',
  'LIST',
  'LISTITEM',
  'MENU',
  'MENUITEM',
  'TAB',
  'TABPANEL',
  'DIALOG',
  'ALERT',
  'STATUS',
  'PROGRESSBAR',
];

const SELECTOR_REQUIRED_ACTIONS:
    AutomationActionType[] = [
  'CLICK',
  'FRAME_FILL',
  'FRAME_CLICK',
  'CLICK_NEW_TAB',
  'CLICK_DOWNLOAD',
  'DOUBLE_CLICK',
  'HOVER',
  'FOCUS',
  'FILL',
  'CLEAR',
  'SELECT',
  'CHECK',
  'UNCHECK',
  'PRESS',
  'SET_INPUT_FILES',
  'WAIT_FOR_SELECTOR',
  'ASSERT_VISIBLE',
  'ASSERT_HIDDEN',
  'ASSERT_TEXT',
  'ASSERT_CONTAINS_TEXT',
  'ASSERT_VALUE',
  'ASSERT_ENABLED',
  'ASSERT_DISABLED',
  'ASSERT_EDITABLE',
  'ASSERT_CHECKED',
  'ASSERT_COUNT',
];

const NO_SELECTOR_ACTIONS:
    AutomationActionType[] = [
  'NAVIGATE',
  'GO_BACK',
  'GO_FORWARD',
  'RELOAD',
  'DISMISS_DIALOG',
  'ACCEPT_DIALOG',
  'WAIT',
  'WAIT_FOR_URL',
  'WAIT_FOR_LOAD_STATE',
  'TAKE_SCREENSHOT',
  'ASSERT_URL',
  'ASSERT_TITLE',
  'API_GET',
  'API_POST',
  'API_PUT',
  'API_PATCH',
  'API_DELETE',
  'ASSERT_API_STATUS',
  'ASSERT_API_BODY_CONTAINS',
  'ASSERT_API_BODY_EQUALS',
  'ASSERT_API_JSON_FIELD_EQUALS',
  'ASSERT_API_HEADER',
  'EXTRACT_API_JSON_VALUE',
];

const INPUT_REQUIRED_ACTIONS:
    AutomationActionType[] = [
  'NAVIGATE',
  'FILL',
  'SELECT',
  'PRESS',
  'SET_INPUT_FILES',
  'CLICK_DOWNLOAD',
  'FRAME_FILL',
  'WAIT',
  'WAIT_FOR_URL',
  'TAKE_SCREENSHOT',
  'EXTRACT_API_JSON_VALUE',
];

const EXPECTED_REQUIRED_ACTIONS:
    AutomationActionType[] = [
  'ASSERT_TEXT',
  'ASSERT_CONTAINS_TEXT',
  'ASSERT_VALUE',
  'ASSERT_COUNT',
  'ASSERT_URL',
  'ASSERT_TITLE',
  'ASSERT_API_STATUS',
  'ASSERT_API_BODY_CONTAINS',
  'ASSERT_API_BODY_EQUALS',
  'ASSERT_API_JSON_FIELD_EQUALS',
  'ASSERT_API_HEADER',
];

const API_REQUEST_ACTIONS:
    AutomationActionType[] = [
  'API_GET',
  'API_POST',
  'API_PUT',
  'API_PATCH',
  'API_DELETE',
];

const FRAME_ACTIONS:
    AutomationActionType[] = [
  'FRAME_CLICK',
  'FRAME_FILL',
];

const API_BODY_ACTIONS:
    AutomationActionType[] = [
  'API_POST',
  'API_PUT',
  'API_PATCH',
];

function actionLabel(
    value: string,
): string {
  return value
      .split('_')
      .map(
          (part) =>
              part.charAt(0) +
              part
                  .slice(1)
                  .toLowerCase(),
      )
      .join(' ');
}

function actionDescription(
    actionType: AutomationActionType | '',
): string {
  switch (actionType) {
    case 'NAVIGATE':
      return 'Open a URL in the current page.';
    case 'GO_BACK':
      return 'Navigate back in browser history.';
    case 'GO_FORWARD':
      return 'Navigate forward in browser history.';
    case 'RELOAD':
      return 'Reload the current page.';
    case 'CLICK':
      return 'Click the selected element.';
    case 'CLICK_NEW_TAB':
      return 'Click an element and switch to the popup/new tab.';
    case 'CLICK_DOWNLOAD':
      return 'Click an element, wait for a download, and save it to the configured path.';
    case 'DOUBLE_CLICK':
      return 'Double-click the selected element.';
    case 'HOVER':
      return 'Move the pointer over the selected element.';
    case 'FOCUS':
      return 'Move focus to the selected element.';
    case 'FILL':
      return 'Replace the selected field value with the configured input.';
    case 'CLEAR':
      return 'Clear the selected input field.';
    case 'SELECT':
      return 'Select an option from the selected control.';
    case 'CHECK':
      return 'Check the selected checkbox or radio control.';
    case 'UNCHECK':
      return 'Uncheck the selected checkbox.';
    case 'PRESS':
      return 'Press a keyboard key while the selected element is focused.';
    case 'SET_INPUT_FILES':
      return 'Upload a file through the selected file input.';
    case 'WAIT':
      return 'Pause execution for the configured number of milliseconds.';
    case 'WAIT_FOR_SELECTOR':
      return 'Wait until the selected element is available.';
    case 'WAIT_FOR_URL':
      return 'Wait until the page reaches the configured URL.';
    case 'WAIT_FOR_LOAD_STATE':
      return 'Wait for the page load state.';
    case 'ASSERT_VISIBLE':
      return 'Verify that the selected element is visible.';
    case 'ASSERT_HIDDEN':
      return 'Verify that the selected element is hidden.';
    case 'ASSERT_TEXT':
      return 'Verify that the selected element text exactly matches the expected value.';
    case 'ASSERT_CONTAINS_TEXT':
      return 'Verify that the selected element contains the expected text.';
    case 'ASSERT_VALUE':
      return 'Verify that the selected element has the expected value.';
    case 'ASSERT_ENABLED':
      return 'Verify that the selected element is enabled.';
    case 'ASSERT_DISABLED':
      return 'Verify that the selected element is disabled.';
    case 'ASSERT_EDITABLE':
      return 'Verify that the selected element is editable.';
    case 'ASSERT_CHECKED':
      return 'Verify that the selected element is checked.';
    case 'ASSERT_COUNT':
      return 'Verify how many elements match the selector.';
    case 'ASSERT_URL':
      return 'Verify the current page URL.';
    case 'ASSERT_TITLE':
      return 'Verify the current page title.';
    case 'FRAME_CLICK':
      return 'Click an element inside an iframe.';
    case 'FRAME_FILL':
      return 'Fill an element inside an iframe.';
    case 'ACCEPT_DIALOG':
      return 'Automatically accept the next browser dialog.';
    case 'DISMISS_DIALOG':
      return 'Automatically dismiss the next browser dialog.';
    case 'TAKE_SCREENSHOT':
      return 'Capture a screenshot to the configured output path.';
    case 'API_GET':
      return 'Send an HTTP GET request.';
    case 'API_POST':
      return 'Send an HTTP POST request with optional headers, query parameters, authentication, and body.';
    case 'API_PUT':
      return 'Send an HTTP PUT request with optional headers, query parameters, authentication, and body.';
    case 'API_PATCH':
      return 'Send an HTTP PATCH request with optional headers, query parameters, authentication, and body.';
    case 'API_DELETE':
      return 'Send an HTTP DELETE request.';
    case 'ASSERT_API_STATUS':
      return 'Verify the status code of the most recent API response.';
    case 'ASSERT_API_BODY_CONTAINS':
      return 'Verify that the most recent API response body contains text.';
    case 'ASSERT_API_BODY_EQUALS':
      return 'Verify the complete body of the most recent API response.';
    case 'ASSERT_API_JSON_FIELD_EQUALS':
      return 'Verify a JSON field in the most recent API response.';
    case 'ASSERT_API_HEADER':
      return 'Verify a response header from the most recent API response.';
    case 'EXTRACT_API_JSON_VALUE':
      return 'Extract a JSON field from the most recent API response into a runtime variable.';
    default:
      return '';
  }
}

function inputLabel(
    actionType: AutomationActionType | '',
): string {
  switch (actionType) {
    case 'NAVIGATE':
      return 'URL';
    case 'FILL':
      return 'Input Value';
    case 'SELECT':
      return 'Option Value';
    case 'PRESS':
      return 'Keyboard Key';
    case 'SET_INPUT_FILES':
      return 'File Path';
    case 'CLICK_DOWNLOAD':
      return 'Download Output Path';
    case 'FRAME_FILL':
      return 'Input Value';
    case 'WAIT':
      return 'Wait Time (milliseconds)';
    case 'WAIT_FOR_URL':
      return 'URL to Wait For';
    case 'TAKE_SCREENSHOT':
      return 'Screenshot Output Path';
    case 'EXTRACT_API_JSON_VALUE':
      return 'Runtime Variable Name';
    default:
      return 'Input Value';
  }
}

function expectedLabel(
    actionType: AutomationActionType | '',
): string {
  switch (actionType) {
    case 'ASSERT_URL':
      return 'Expected URL';
    case 'ASSERT_TITLE':
      return 'Expected Title';
    case 'ASSERT_COUNT':
      return 'Expected Count';
    case 'ASSERT_API_STATUS':
      return 'Expected HTTP Status';
    case 'ASSERT_API_BODY_CONTAINS':
      return 'Expected Body Text';
    case 'ASSERT_API_BODY_EQUALS':
      return 'Expected Full Body';
    case 'ASSERT_API_JSON_FIELD_EQUALS':
      return 'Expected JSON Field Value';
    case 'ASSERT_API_HEADER':
      return 'Expected Header Value';
    default:
      return 'Expected Value';
  }
}

function buildAutomationStepId(
    testCaseId: string,
    order: number,
): string {
  const normalized =
      testCaseId
          .replace(
              /[^A-Za-z0-9-_]/g,
              '-',
          )
          .toUpperCase();

  return (
      `ASTEP-${normalized}-${order}`
  ).slice(0, 50);
}

export default function AutomationStepDialog({
                                               embedded = false,
                                               submitRef,
                                               open,
                                               mode,
                                               testCaseId,
                                               automationType,
                                               testSteps,
                                               automationStep,
                                               suggestedOrder,
                                               fixedSourceTestStepId,
                                               saving = false,
                                               error,
                                               onClose,
                                               onSubmit,
                                             }: AutomationStepDialogProps) {
  const [
    automationStepId,
    setAutomationStepId,
  ] = useState('');

  const [
    sourceTestStepId,
    setSourceTestStepId,
  ] =
      useState<number | ''>(
          '',
      );

  const [
    stepOrder,
    setStepOrder,
  ] =
      useState<number>(
          suggestedOrder,
      );

  const [
    actionType,
    setActionType,
  ] =
      useState<
          AutomationActionType | ''
      >('');

  const [
    target,
    setTarget,
  ] = useState('');

  const [
    selectorStrategy,
    setSelectorStrategy,
  ] =
      useState<
          SelectorStrategy | ''
      >('');

  const [
    selectorValue,
    setSelectorValue,
  ] = useState('');

  const [
    selectorRole,
    setSelectorRole,
  ] =
      useState<
          UiElementRole | ''
      >('');

  const [
    selectorName,
    setSelectorName,
  ] = useState('');

  const [
    selectorExact,
    setSelectorExact,
  ] = useState(false);

  const [
    inputValue,
    setInputValue,
  ] = useState('');

  const [
    expectedValue,
    setExpectedValue,
  ] = useState('');

  const [apiHeaders, setApiHeaders] = useState<[string, string][]>([]);
  const [apiQueryParams, setApiQueryParams] = useState<[string, string][]>([]);
  const [apiBodyType, setApiBodyType] = useState<'NONE' | 'JSON' | 'TEXT' | 'FORM'>('NONE');
  const [apiBody, setApiBody] = useState('');
  const [apiAuthType, setApiAuthType] = useState<ApiAuthenticationType>('NONE');
  const [apiBasicUsername, setApiBasicUsername] = useState('');
  const [apiBasicPasswordSecretRef, setApiBasicPasswordSecretRef] = useState('');
  const [apiBearerTokenSecretRef, setApiBearerTokenSecretRef] = useState('');
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyValueSecretRef, setApiKeyValueSecretRef] = useState('');
  const [apiKeyLocation, setApiKeyLocation] = useState<ApiKeyLocation>('HEADER');

  const [
    validationError,
    setValidationError,
  ] =
      useState<string | null>(
          null,
      );

  const [category, setCategory] = useState<'UI' | 'API'>(automationStep?.actionType.includes('API_') || automationType === 'API' ? 'API' : 'UI');
  const availableActionTypes = category === 'API' ? API_ACTION_TYPES : UI_ACTION_TYPES;

  const availableActionGroups =
      useMemo(
          () =>
              ACTION_GROUPS
                  .map((group) => ({
                    ...group,
                    actions: group.actions.filter((action) =>
                        availableActionTypes.includes(action),
                    ),
                  }))
                  .filter((group) =>
                      group.actions.length > 0,
                  ),
          [availableActionTypes],
      );

  useEffect(
      () => {
        if (!open) {
          return;
        }

        setValidationError(
            null,
        );

        if (
            mode === 'edit' &&
            automationStep
        ) {
          setAutomationStepId(
              automationStep
                  .automationStepId,
          );

          setSourceTestStepId(
              automationStep
                  .sourceTestStepId,
          );

          setStepOrder(
              automationStep
                  .stepOrder,
          );

          setActionType(
              automationStep
                  .actionType,
          );

          setTarget(
              automationStep
                  .target ??
              '',
          );

          setSelectorStrategy(
              automationStep
                  .selectorStrategy ??
              '',
          );

          setSelectorValue(
              automationStep
                  .selectorValue ??
              '',
          );

          setSelectorRole(
              automationStep
                  .selectorRole ??
              '',
          );

          setSelectorName(
              automationStep
                  .selectorName ??
              '',
          );

          setSelectorExact(
              automationStep
                  .selectorExact,
          );

          setInputValue(
              automationStep
                  .inputValue ??
              '',
          );

          setExpectedValue(
              automationStep
                  .expectedValue ??
              '',
          );

          try {
            const config = automationStep.apiConfig
                ? JSON.parse(automationStep.apiConfig)
                : {};
            setApiHeaders(Object.entries(config.headers ?? {}));
            setApiQueryParams(Object.entries(config.queryParams ?? {}));
            setApiBodyType(config.bodyType ?? 'NONE');
            setApiBody(config.body ?? '');
            setApiAuthType(config.auth?.type ?? 'NONE');
            setApiBasicUsername(config.auth?.username ?? '');
            setApiBasicPasswordSecretRef(config.auth?.passwordSecretRef ?? '');
            setApiBearerTokenSecretRef(config.auth?.tokenSecretRef ?? '');
            setApiKeyName(config.auth?.keyName ?? '');
            setApiKeyValueSecretRef(config.auth?.valueSecretRef ?? '');
            setApiKeyLocation(config.auth?.location ?? 'HEADER');
          } catch {
            setApiHeaders([]);
            setApiQueryParams([]);
            setApiBodyType('NONE');
            setApiBody('');
            setApiAuthType('NONE');
            setApiBasicUsername('');
            setApiBasicPasswordSecretRef('');
            setApiBearerTokenSecretRef('');
            setApiKeyName('');
            setApiKeyValueSecretRef('');
            setApiKeyLocation('HEADER');
          }

          return;
        }

        setAutomationStepId(
            buildAutomationStepId(
                testCaseId,
                suggestedOrder,
            ),
        );

        setSourceTestStepId(
            fixedSourceTestStepId ?? '',
        );

        setStepOrder(
            suggestedOrder,
        );

        setActionType(
            '',
        );

        setTarget(
            '',
        );

        setSelectorStrategy(
            '',
        );

        setSelectorValue(
            '',
        );

        setSelectorRole(
            '',
        );

        setSelectorName(
            '',
        );

        setSelectorExact(
            false,
        );

        setInputValue(
            '',
        );

        setExpectedValue(
            '',
        );
        setApiHeaders([]);
        setApiQueryParams([]);
        setApiBodyType('NONE');
        setApiBody('');
        setApiAuthType('NONE');
        setApiBasicUsername('');
        setApiBasicPasswordSecretRef('');
        setApiBearerTokenSecretRef('');
        setApiKeyName('');
        setApiKeyValueSecretRef('');
        setApiKeyLocation('HEADER');
      },
      [
        open,
        mode,
        automationStep,
        testCaseId,
        suggestedOrder,
        fixedSourceTestStepId,
      ],
  );

  const requiresSelector =
      useMemo(
          () =>
              actionType !== '' &&
              SELECTOR_REQUIRED_ACTIONS
                  .includes(
                      actionType,
                  ),
          [
            actionType,
          ],
      );

  const forbidsSelector =
      useMemo(
          () =>
              actionType !== '' &&
              NO_SELECTOR_ACTIONS
                  .includes(
                      actionType,
                  ),
          [
            actionType,
          ],
      );

  const requiresInput =
      actionType !== '' &&
      INPUT_REQUIRED_ACTIONS
          .includes(
              actionType,
          );

  const requiresExpected =
      actionType !== '' &&
      EXPECTED_REQUIRED_ACTIONS
          .includes(
              actionType,
          );

  const requiresTarget =
      actionType !== '' &&
      (API_REQUEST_ACTIONS
              .includes(
                  actionType,
              ) ||
          FRAME_ACTIONS
              .includes(
                  actionType,
              ) ||
          ['ASSERT_API_JSON_FIELD_EQUALS', 'ASSERT_API_HEADER', 'EXTRACT_API_JSON_VALUE']
              .includes(actionType));

  const showTargetField =
      actionType !== '' &&
      requiresTarget;

  const showApiBody =
      actionType !== '' &&
      API_BODY_ACTIONS
          .includes(
              actionType,
          );

  const selectedSourceStep =
      testSteps.find(
          (testStep) =>
              testStep.id ===
              sourceTestStepId,
      );

  const handleActionChange = (
      nextAction:
      AutomationActionType,
  ) => {
    setActionType(
        nextAction,
    );

    setValidationError(
        null,
    );

    if (
        NO_SELECTOR_ACTIONS
            .includes(
                nextAction,
            )
    ) {
      setSelectorStrategy(
          '',
      );

      setSelectorValue(
          '',
      );

      setSelectorRole(
          '',
      );

      setSelectorName(
          '',
      );

      setSelectorExact(
          false,
      );
    }

    if (
        !API_REQUEST_ACTIONS
            .includes(
                nextAction,
            ) &&
        !FRAME_ACTIONS
            .includes(
                nextAction,
            ) &&
        !['ASSERT_API_JSON_FIELD_EQUALS', 'ASSERT_API_HEADER', 'EXTRACT_API_JSON_VALUE']
            .includes(nextAction)
    ) {
      setTarget(
          '',
      );
    }

    if (
        !API_BODY_ACTIONS
            .includes(
                nextAction,
            ) &&
        !INPUT_REQUIRED_ACTIONS
            .includes(
                nextAction,
            )
    ) {
      setInputValue(
          '',
      );
    }

    if (
        !EXPECTED_REQUIRED_ACTIONS
            .includes(
                nextAction,
            )
    ) {
      setExpectedValue(
          '',
      );
    }
  };

  const handleSelectorChange = (
      strategy:
      SelectorStrategy,
  ) => {
    setSelectorStrategy(
        strategy,
    );

    if (
        strategy === 'ROLE'
    ) {
      setSelectorValue(
          '',
      );
    } else {
      setSelectorRole(
          '',
      );

      setSelectorName(
          '',
      );
    }
  };

  const handleSubmit = () => {
    const trimmedStepId =
        automationStepId.trim();

    if (
        mode === 'create' &&
        !trimmedStepId
    ) {
      setValidationError(
          'Automation Step ID is required.',
      );

      return;
    }

    if (
        trimmedStepId.length >
        50
    ) {
      setValidationError(
          'Automation Step ID must not exceed 50 characters.',
      );

      return;
    }

    if (
        sourceTestStepId ===
        ''
    ) {
      setValidationError(
          'Source Test Step is required.',
      );

      return;
    }

    if (
        !Number.isInteger(
            stepOrder,
        ) ||
        stepOrder < 1
    ) {
      setValidationError(
          'Automation step order must be greater than zero.',
      );

      return;
    }

    if (!actionType) {
      setValidationError(
          'Automation action type is required.',
      );

      return;
    }

    if (
        target.length >
        500
    ) {
      setValidationError(
          'Target must not exceed 500 characters.',
      );

      return;
    }

    if (
        selectorValue.length >
        2000
    ) {
      setValidationError(
          'Selector value must not exceed 2000 characters.',
      );

      return;
    }

    if (
        selectorName.length >
        500
    ) {
      setValidationError(
          'Selector name must not exceed 500 characters.',
      );

      return;
    }

    if (
        inputValue.length >
        4000
    ) {
      setValidationError(
          'Input value must not exceed 4000 characters.',
      );

      return;
    }

    if (
        expectedValue.length >
        4000
    ) {
      setValidationError(
          'Expected value must not exceed 4000 characters.',
      );

      return;
    }

    if (
        requiresTarget &&
        !target.trim()
    ) {
      setValidationError(
          FRAME_ACTIONS.includes(actionType)
              ? `${actionType} requires a frame selector in Target.`
              : `${actionType} requires a request URL.`,
      );

      return;
    }

    if (
        requiresSelector &&
        !selectorStrategy
    ) {
      setValidationError(
          `${actionType} requires a selector.`,
      );

      return;
    }

    if (
        forbidsSelector &&
        selectorStrategy
    ) {
      setValidationError(
          `${actionType} must not have a selector.`,
      );

      return;
    }

    if (
        selectorStrategy ===
        'ROLE'
    ) {
      if (!selectorRole) {
        setValidationError(
            'ROLE selector requires an element role.',
        );

        return;
      }

      if (
          !selectorName.trim()
      ) {
        setValidationError(
            'ROLE selector requires an accessible name.',
        );

        return;
      }
    }

    if (
        selectorStrategy &&
        selectorStrategy !==
        'ROLE' &&
        !selectorValue.trim()
    ) {
      setValidationError(
          `${selectorStrategy} selector requires a selector value.`,
      );

      return;
    }

    if (
        FRAME_ACTIONS.includes(
            actionType,
        ) &&
        selectorStrategy !== 'CSS' &&
        selectorStrategy !== 'XPATH'
    ) {
      setValidationError(
          `${actionType} currently requires a CSS or XPATH element selector.`,
      );

      return;
    }

    if (
        requiresInput &&
        !inputValue.trim()
    ) {
      setValidationError(
          `${actionType} requires an input/value.`,
      );

      return;
    }

    if (
        requiresExpected &&
        !expectedValue.trim()
    ) {
      setValidationError(
          `${actionType} requires an expected value.`,
      );

      return;
    }

    if (
        actionType ===
        'ASSERT_API_STATUS'
    ) {
      const status =
          Number(
              expectedValue,
          );

      if (
          !Number.isInteger(
              status,
          ) ||
          status < 100 ||
          status > 599
      ) {
        setValidationError(
            'Expected HTTP Status must be a valid status code between 100 and 599.',
        );

        return;
      }
    }

    if (
        actionType ===
        'ASSERT_COUNT'
    ) {
      const count =
          Number(
              expectedValue,
          );

      if (
          !Number.isInteger(
              count,
          ) ||
          count < 0
      ) {
        setValidationError(
            'ASSERT_COUNT requires a whole number of zero or greater.',
        );

        return;
      }
    }

    if (
        actionType ===
        'WAIT'
    ) {
      const milliseconds =
          Number(
              inputValue,
          );

      if (
          Number.isNaN(
              milliseconds,
          ) ||
          milliseconds < 0
      ) {
        setValidationError(
            'WAIT requires a non-negative number of milliseconds.',
        );

        return;
      }
    }

    let apiConfig: string | null = null;
    if (API_REQUEST_ACTIONS.includes(actionType)) {
      try {
        const toValues = (rows: [string, string][], label: string) => {
          const names = rows.map(([name]) => name.trim());
          if (names.some(name => !name) || new Set(names).size !== names.length) throw new Error(label + ' require unique, nonempty names.');
          return Object.fromEntries(rows.map(([, value], i) => [names[i], value]));
        };
        const headers = toValues(apiHeaders, 'Headers');
        const queryParams = toValues(apiQueryParams, 'Query parameters');
        if (Object.entries(headers).some(([name, value]) => ['authorization', 'proxy-authorization', 'x-api-key'].includes(name.toLowerCase()) && !/^(?:(?:Bearer|Basic) )?\$\{[A-Za-z_][A-Za-z0-9_.-]*}$/.test(value))) throw new Error('Use Authentication with a secret reference instead of saving credential headers.');
        if (headers === null || Array.isArray(headers) || typeof headers !== 'object') {
          throw new Error('Headers must be a JSON object.');
        }
        if (queryParams === null || Array.isArray(queryParams) || typeof queryParams !== 'object') {
          throw new Error('Query parameters must be a JSON object.');
        }
        if (apiBodyType === 'FORM' && apiBody.trim()) {
          const form = JSON.parse(apiBody);
          if (form === null || Array.isArray(form) || typeof form !== 'object') {
            throw new Error('FORM body must be a JSON object.');
          }
        }
        if (apiBodyType === 'JSON') {
          try { JSON.parse(apiBody); } catch { throw new Error('Request body must contain valid JSON.'); }
        }
        const secretRefPattern = /^\$\{[A-Z][A-Z0-9_]*}$/;
        let auth: Record<string, string> = { type: apiAuthType };

        if (apiAuthType === 'BASIC') {
          if (!apiBasicUsername.trim()) {
            throw new Error('Basic authentication requires a username.');
          }
          if (!secretRefPattern.test(apiBasicPasswordSecretRef.trim())) {
            throw new Error('Basic password must be a secret reference such as ${TESTFORGE_API_PASSWORD}.');
          }
          auth = {
            type: 'BASIC',
            username: apiBasicUsername.trim(),
            passwordSecretRef: apiBasicPasswordSecretRef.trim(),
          };
        } else if (apiAuthType === 'BEARER_TOKEN') {
          if (!secretRefPattern.test(apiBearerTokenSecretRef.trim())) {
            throw new Error('Bearer token must be a secret reference such as ${TESTFORGE_API_TOKEN}.');
          }
          auth = {
            type: 'BEARER_TOKEN',
            tokenSecretRef: apiBearerTokenSecretRef.trim(),
          };
        } else if (apiAuthType === 'API_KEY') {
          if (!apiKeyName.trim()) {
            throw new Error('API key authentication requires a key name.');
          }
          if (!secretRefPattern.test(apiKeyValueSecretRef.trim())) {
            throw new Error('API key value must be a secret reference such as ${TESTFORGE_API_KEY}.');
          }
          auth = {
            type: 'API_KEY',
            keyName: apiKeyName.trim(),
            valueSecretRef: apiKeyValueSecretRef.trim(),
            location: apiKeyLocation,
          };
        }

        apiConfig = JSON.stringify({ headers, queryParams, bodyType: apiBodyType, body: apiBody, auth });
      } catch (configError) {
        setValidationError(configError instanceof Error ? configError.message : 'Invalid API configuration.');
        return;
      }
    }

    setValidationError(
        null,
    );

    onSubmit({
      automationStepId:
      trimmedStepId,

      sourceTestStepId,

      stepOrder,

      actionType,

      target:
          target.trim(),

      selectorStrategy,

      selectorValue:
          selectorValue.trim(),

      selectorRole,

      selectorName:
          selectorName.trim(),

      selectorExact,

      inputValue:
          inputValue.trim(),

      expectedValue:
          expectedValue.trim(),

      apiConfig,
    });
  };

  useImperativeHandle(submitRef, () => ({ submit: handleSubmit }));

  const content = (
          <Stack
              spacing={2.5}
              sx={{
                pt: 1,
              }}
          >
            {(error ||
                validationError) && (
                <Alert
                    severity="error"
                >
                  {error ??
                      validationError}
                </Alert>
            )}

            <TextField select label="Automation Type" value={category} onChange={e => { setCategory(e.target.value as 'UI' | 'API'); handleActionChange('' as AutomationActionType); }}>
              <MenuItem value="UI">UI</MenuItem><MenuItem value="API">API</MenuItem>
            </TextField>
            {category === 'API' && <Alert severity="info">Assertions use the most recent API response in this Test Case, in automation order. Add a separate Test Step for each request or assertion.</Alert>}
            {embedded && <TextField label="Automation Order" type="number" required value={stepOrder}
              onChange={event => setStepOrder(Number(event.target.value))} inputProps={{ min: 1 }} />}
            {!embedded && <>
            <Stack
                direction={{
                  xs:
                      'column',

                  md:
                      'row',
                }}
                spacing={2}
            >
              <TextField
                  fullWidth
                  required
                  label="Automation Step ID"
                  value={
                    automationStepId
                  }
                  disabled={
                      mode === 'edit' ||
                      fixedSourceTestStepId !== undefined
                  }
                  onChange={(
                      event,
                  ) =>
                      setAutomationStepId(
                          event.target.value,
                      )
                  }
                  inputProps={{
                    maxLength: 50,
                  }}
                  helperText={
                    mode ===
                    'edit'
                        ? 'Automation Step ID cannot be changed after creation.'
                        : `${automationStepId.length}/50`
                  }
              />

              <TextField
                  fullWidth
                  required
                  label="Step Order"
                  type="number"
                  value={
                    stepOrder
                  }
                  onChange={(
                      event,
                  ) =>
                      setStepOrder(
                          Number(
                              event.target.value,
                          ),
                      )
                  }
                  inputProps={{
                    min: 1,
                  }}
              />
            </Stack>

            <FormControl
                fullWidth
                required
            >
              <InputLabel>
                Source Test Step
              </InputLabel>

              <Select
                  label="Source Test Step"
                  value={
                    sourceTestStepId
                  }
                  disabled={
                      mode === 'edit'
                  }
                  onChange={(
                      event,
                  ) =>
                      setSourceTestStepId(
                          Number(
                              event.target.value,
                          ),
                      )
                  }
              >
                {testSteps.map(
                    (
                        testStep,
                    ) => (
                        <MenuItem
                            key={
                              testStep.id
                            }
                            value={
                              testStep.id
                            }
                        >
                          {
                            testStep.stepOrder
                          }
                          {' — '}
                          {
                            testStep.testStepId
                          }
                          {' — '}
                          {
                            testStep.action
                          }
                        </MenuItem>
                    ),
                )}
              </Select>
            </FormControl>

            </>}

            {!embedded && selectedSourceStep && (
                <Alert
                    severity="info"
                    variant="outlined"
                >
                  <Typography
                      variant="body2"
                      fontWeight={
                        700
                      }
                  >
                    Source Test Step
                  </Typography>

                  <Typography
                      variant="body2"
                  >
                    Action:{' '}
                    {
                      selectedSourceStep.action
                    }
                  </Typography>

                  {selectedSourceStep.target && (
                      <Typography
                          variant="body2"
                      >
                        Target:{' '}
                        {
                          selectedSourceStep.target
                        }
                      </Typography>
                  )}

                  {selectedSourceStep.inputValue && (
                      <Typography
                          variant="body2"
                      >
                        Input:{' '}
                        {
                          selectedSourceStep.inputValue
                        }
                      </Typography>
                  )}

                  {selectedSourceStep.expectedResult && (
                      <Typography
                          variant="body2"
                      >
                        Expected:{' '}
                        {
                          selectedSourceStep.expectedResult
                        }
                      </Typography>
                  )}
                </Alert>
            )}

            <FormControl
                fullWidth
                required
            >
              <InputLabel>
                Automation Action
              </InputLabel>

              <Select
                  label="Automation Action"
                  inputProps={{ "aria-label": "Automation Action" }}
                  value={API_REQUEST_ACTIONS.includes(actionType) ? 'HTTP_REQUEST' : actionType}
                  onChange={(
                      event,
                  ) =>
                      handleActionChange(
                          (event.target.value === 'HTTP_REQUEST' ? 'API_GET' : event.target.value) as AutomationActionType,
                      )
                  }
              >
                {availableActionGroups.flatMap(
                    (group) => [
                      <ListSubheader
                          key={`group-${group.label}`}
                          disableSticky
                      >
                        {group.label}
                      </ListSubheader>,
                      ...group.actions.filter(value => !API_REQUEST_ACTIONS.includes(value) || value === 'API_GET').map((value) => (
                          <MenuItem
                              key={value}
                              value={value === 'API_GET' ? 'HTTP_REQUEST' : value}
                          >
                            {value === 'API_GET' ? 'HTTP Request' : actionLabel(value)}
                          </MenuItem>
                      )),
                    ],
                )}
              </Select>
            </FormControl>

            {actionType !== '' && (
                <Alert
                    severity="info"
                    variant="outlined"
                >
                  <Typography variant="body2" fontWeight={700}>
                    {actionLabel(actionType)}
                  </Typography>
                  <Typography variant="body2">
                    {actionDescription(actionType)}
                  </Typography>
                </Alert>
            )}

            {API_REQUEST_ACTIONS.includes(actionType) && <TextField select label="HTTP Method" value={actionType} onChange={e => handleActionChange(e.target.value as AutomationActionType)}>
              {API_REQUEST_ACTIONS.map(method => <MenuItem key={method} value={method}>{method.slice(4)}</MenuItem>)}
            </TextField>}
            {showTargetField && (
              <TextField
                fullWidth
                required={
                  requiresTarget
                }
                label={
                  FRAME_ACTIONS.includes(
                      actionType,
                  )
                      ? 'Frame Selector'
                      : actionType === 'ASSERT_API_JSON_FIELD_EQUALS' || actionType === 'EXTRACT_API_JSON_VALUE'
                          ? 'JSON Field Path'
                          : actionType === 'ASSERT_API_HEADER'
                              ? 'Response Header Name'
                              : requiresTarget
                                  ? 'Request URL'
                                  : 'Target / Description'
                }
                value={
                  target
                }
                onChange={(
                    event,
                ) =>
                    setTarget(
                        event
                            .target
                            .value,
                    )
                }
                inputProps={{
                  maxLength: 500,
                }}
                helperText={
                  FRAME_ACTIONS.includes(actionType)
                      ? 'CSS or XPath selector for the iframe.'
                      : actionType === 'ASSERT_API_JSON_FIELD_EQUALS' || actionType === 'EXTRACT_API_JSON_VALUE'
                          ? 'Dot-separated JSON path, for example data.order.id.'
                          : actionType === 'ASSERT_API_HEADER'
                              ? 'Response header name, for example Content-Type.'
                              : 'Use a full API URL. Test data references such as ${host} are supported; no Project API base URL is configured.'
                }
              />
            )}

            {requiresSelector && (
                <>
                  <FormControl
                      fullWidth
                      required
                  >
                    <InputLabel>
                      Selector Strategy
                    </InputLabel>

                    <Select
                        label="Selector Strategy"
                        inputProps={{ "aria-label": "Selector Strategy" }}
                        value={
                          selectorStrategy
                        }
                        onChange={(
                            event,
                        ) =>
                            handleSelectorChange(
                                event
                                    .target
                                    .value as SelectorStrategy,
                            )
                        }
                    >
                      {SELECTOR_STRATEGIES.map(
                          (
                              value,
                          ) => (
                              <MenuItem
                                  key={
                                    value
                                  }
                                  value={
                                    value
                                  }
                              >
                                {actionLabel(
                                    value,
                                )}
                              </MenuItem>
                          ),
                      )}
                    </Select>
                  </FormControl>

                  {selectorStrategy ===
                  'ROLE' ? (
                      <Stack
                          direction={{
                            xs:
                                'column',

                            md:
                                'row',
                          }}
                          spacing={2}
                      >
                        <FormControl
                            fullWidth
                            required
                        >
                          <InputLabel>
                            Element Role
                          </InputLabel>

                          <Select
                              label="Element Role"
                              value={
                                selectorRole
                              }
                              onChange={(
                                  event,
                              ) =>
                                  setSelectorRole(
                                      event
                                          .target
                                          .value as UiElementRole,
                                  )
                              }
                          >
                            {UI_ROLES.map(
                                (
                                    role,
                                ) => (
                                    <MenuItem
                                        key={
                                          role
                                        }
                                        value={
                                          role
                                        }
                                    >
                                      {actionLabel(
                                          role,
                                      )}
                                    </MenuItem>
                                ),
                            )}
                          </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            required
                            label="Accessible Name"
                            value={
                              selectorName
                            }
                            onChange={(
                                event,
                            ) =>
                                setSelectorName(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            inputProps={{
                              maxLength:
                                  500,
                            }}
                        />
                      </Stack>
                  ) : (
                      selectorStrategy && (
                          <TextField
                              fullWidth
                              required
                              label="Selector Value"
                              value={
                                selectorValue
                              }
                              onChange={(
                                  event,
                              ) =>
                                  setSelectorValue(
                                      event
                                          .target
                                          .value,
                                  )
                              }
                              inputProps={{
                                maxLength:
                                    2000,
                              }}
                              helperText={
                                selectorStrategy ===
                                'TEST_ID'
                                    ? 'Example: login-button'
                                    : selectorStrategy ===
                                    'CSS'
                                        ? 'Example: #login-button'
                                        : selectorStrategy ===
                                        'XPATH'
                                            ? 'Example: //button[@type="submit"]'
                                            : undefined
                              }
                          />
                      )
                  )}

                  <FormControlLabel
                      control={
                        <Checkbox
                            checked={
                              selectorExact
                            }
                            onChange={(
                                event,
                            ) =>
                                setSelectorExact(
                                    event
                                        .target
                                        .checked,
                                )
                            }
                        />
                      }
                      label="Exact match"
                  />
                </>
            )}

            {requiresInput && (
                <TextField
                    fullWidth
                    required
                    multiline={
                        actionType ===
                        'WAIT'
                    }
                    minRows={
                      actionType ===
                      'WAIT'
                          ? 2
                          : undefined
                    }
                    label={
                      inputLabel(
                          actionType,
                      )
                    }
                    value={
                      inputValue
                    }
                    onChange={(
                        event,
                    ) =>
                        setInputValue(
                            event
                                .target
                                .value,
                        )
                    }
                    inputProps={{
                      maxLength:
                          4000,
                    }}
                />
            )}

            {actionType !== '' && API_REQUEST_ACTIONS.includes(actionType) && (
                <Stack spacing={2}>
                  <Alert severity="info" variant="outlined">
                    Configure request headers and query parameters as JSON objects.
                    Values may reference runtime values extracted earlier using ${'{'}NAME{'}'}.
                  </Alert>

                  <FormControl fullWidth>
                    <InputLabel>Authentication</InputLabel>
                    <Select
                        value={apiAuthType}
                        label="Authentication"
                        inputProps={{ "aria-label": "Authentication" }}
                        onChange={(event) => setApiAuthType(event.target.value as ApiAuthenticationType)}
                    >
                      <MenuItem value="NONE">None</MenuItem>
                      <MenuItem value="BASIC">Basic</MenuItem>
                      <MenuItem value="BEARER_TOKEN">Bearer Token</MenuItem>
                      <MenuItem value="API_KEY">API Key</MenuItem>
                    </Select>
                  </FormControl>

                  {apiAuthType === 'BASIC' && (
                      <>
                        <TextField
                            fullWidth
                            required
                            label="Username"
                            value={apiBasicUsername}
                            onChange={(event) => setApiBasicUsername(event.target.value)}
                            helperText="Username may be stored because it is not treated as the secret."
                        />
                        <TextField
                            fullWidth
                            required
                            label="Password Secret Reference"
                            value={apiBasicPasswordSecretRef}
                            onChange={(event) => setApiBasicPasswordSecretRef(event.target.value)}
                            placeholder="${TESTFORGE_API_PASSWORD}"
                            helperText="Store only an environment-variable reference. Do not enter the real password."
                        />
                      </>
                  )}

                  {apiAuthType === 'BEARER_TOKEN' && (
                      <TextField
                          fullWidth
                          required
                          label="Bearer Token Secret Reference"
                          value={apiBearerTokenSecretRef}
                          onChange={(event) => setApiBearerTokenSecretRef(event.target.value)}
                          placeholder="${TESTFORGE_API_TOKEN}"
                          helperText="The real token is read from the execution process environment."
                      />
                  )}

                  {apiAuthType === 'API_KEY' && (
                      <>
                        <TextField
                            fullWidth
                            required
                            label="API Key Name"
                            value={apiKeyName}
                            onChange={(event) => setApiKeyName(event.target.value)}
                            placeholder="X-API-Key"
                        />
                        <TextField
                            fullWidth
                            required
                            label="API Key Secret Reference"
                            value={apiKeyValueSecretRef}
                            onChange={(event) => setApiKeyValueSecretRef(event.target.value)}
                            placeholder="${TESTFORGE_API_KEY}"
                            helperText="Store only the secret reference, never the actual API key."
                        />
                        <FormControl fullWidth>
                          <InputLabel>API Key Location</InputLabel>
                          <Select
                              value={apiKeyLocation}
                              label="API Key Location"
                              onChange={(event) => setApiKeyLocation(event.target.value as ApiKeyLocation)}
                          >
                            <MenuItem value="HEADER">Header</MenuItem>
                            <MenuItem value="QUERY">Query Parameter</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                  )}

                  <Typography variant="body2">Use Authentication for credentials. Headers and query values support Test Data references such as {"${username}"}.</Typography>
                  <RequestParametersEditor label="Headers" rows={apiHeaders} onChange={setApiHeaders} />

                  <RequestParametersEditor label="Query Parameters" rows={apiQueryParams} onChange={setApiQueryParams} />

                  {showApiBody && (
                      <>
                        <FormControl fullWidth>
                          <InputLabel>Request Body Type</InputLabel>
                          <Select
                              value={apiBodyType}
                              label="Request Body Type"
                              inputProps={{ "aria-label": "Request Body Type" }}
                              onChange={(event) => setApiBodyType(event.target.value as 'NONE' | 'JSON' | 'TEXT' | 'FORM')}
                          >
                            <MenuItem value="NONE">None</MenuItem>
                            <MenuItem value="JSON">JSON</MenuItem>
                            <MenuItem value="TEXT">Text</MenuItem>
                            <MenuItem value="FORM">Form URL Encoded</MenuItem>
                          </Select>
                        </FormControl>

                        {apiBodyType !== 'NONE' && (
                            <TextField
                                fullWidth multiline minRows={5}
                                label={apiBodyType === 'FORM' ? 'Form Fields (JSON)' : 'Request Body'}
                                value={apiBody}
                                onChange={(event) => setApiBody(event.target.value)}
                                helperText={apiBodyType === 'FORM' ? 'Example: {"username":"faris","active":"true"}' : undefined}
                            />
                        )}
                      </>
                  )}
                </Stack>
            )}

            {requiresExpected && (
                <TextField
                    fullWidth
                    required
                    multiline={
                        actionType !==
                        'ASSERT_API_STATUS'
                    }
                    minRows={
                      actionType !==
                      'ASSERT_API_STATUS'
                          ? 2
                          : undefined
                    }
                    label={
                      expectedLabel(
                          actionType,
                      )
                    }
                    value={
                      expectedValue
                    }
                    onChange={(
                        event,
                    ) =>
                        setExpectedValue(
                            event
                                .target
                                .value,
                        )
                    }
                    inputProps={{
                      maxLength:
                          4000,
                    }}
                />
            )}

            {automationType ===
                'UI_API' && (
                    <Alert
                        severity="info"
                        variant="outlined"
                    >
                      This Test Case supports both UI and API automation actions.
                      Use EXTRACT_API_JSON_VALUE to store a runtime value such as ORDER_ID,
                      then reference it in later UI or API fields as {'${ORDER_ID}'}.
                      Steps execute strictly according to Automation Step Order.
                    </Alert>
                )}
          </Stack>
  );
  if (embedded) return <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>{content}</fieldset>;

  return (
      <Dialog
          open={open}
          onClose={
            saving
                ? undefined
                : onClose
          }
          fullWidth
          maxWidth="md"
      >
        <DialogTitle>
          {mode === 'create'
              ? 'Create Automation Step'
              : 'Edit Automation Step'}
        </DialogTitle>

        <DialogContent>
          {content}
        </DialogContent>

        <DialogActions
            sx={{
              px: 3,
              pb: 3,
            }}
        >
          <Button
              disabled={
                saving
              }
              onClick={
                onClose
              }
          >
            Cancel
          </Button>

          <Button
              variant="contained"
              disabled={
                saving
              }
              onClick={
                handleSubmit
              }
              startIcon={
                saving ? (
                    <CircularProgress
                        size={
                          18
                        }
                        color="inherit"
                    />
                ) : undefined
              }
          >
            {saving
                ? 'Saving...'
                : mode ===
                'create'
                    ? 'Create Automation Step'
                    : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
  );
}
