import {
  useEffect,
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
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type {
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
}

interface AutomationStepDialogProps {
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

  saving?: boolean;

  error?: string | null;

  onClose: () => void;

  onSubmit: (
      values:
      AutomationStepFormValues,
  ) => void;
}

const UI_ACTION_TYPES:
    AutomationActionType[] = [
  'NAVIGATE',
  'GO_BACK',
  'GO_FORWARD',
  'RELOAD',
  'CLICK',
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
  'FRAME_CLICK',
  'FRAME_FILL',
  'ACCEPT_DIALOG',
  'DISMISS_DIALOG',
  'WAIT',
  'WAIT_FOR_SELECTOR',
  'WAIT_FOR_URL',
  'WAIT_FOR_LOAD_STATE',
  'TAKE_SCREENSHOT',
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
];

const API_ACTION_TYPES:
    AutomationActionType[] = [
  'API_GET',
  'API_POST',
  'API_PUT',
  'API_PATCH',
  'API_DELETE',
  'ASSERT_API_STATUS',
  'ASSERT_API_BODY_CONTAINS',
];

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
                                               open,
                                               mode,
                                               testCaseId,
                                               automationType,
                                               testSteps,
                                               automationStep,
                                               suggestedOrder,
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

  const [
    validationError,
    setValidationError,
  ] =
      useState<string | null>(
          null,
      );

  const availableActionTypes =
      useMemo(
          () => {
            if (
                automationType ===
                'API'
            ) {
              return API_ACTION_TYPES;
            }

            if (
                automationType ===
                'UI_API'
            ) {
              return [
                ...UI_ACTION_TYPES,
                ...API_ACTION_TYPES,
              ];
            }

            return UI_ACTION_TYPES;
          },
          [
            automationType,
          ],
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

          return;
        }

        setAutomationStepId(
            buildAutomationStepId(
                testCaseId,
                suggestedOrder,
            ),
        );

        setSourceTestStepId(
            '',
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
      },
      [
        open,
        mode,
        automationStep,
        testCaseId,
        suggestedOrder,
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
              ));

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
            )
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
    });
  };

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
              ? 'Add Automation Step'
              : 'Edit Automation Step'}
        </DialogTitle>

        <DialogContent>
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
                      mode === 'edit'
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

            {selectedSourceStep && (
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
                  value={
                    actionType
                  }
                  onChange={(
                      event,
                  ) =>
                      handleActionChange(
                          event
                              .target
                              .value as AutomationActionType,
                      )
                  }
              >
                {availableActionTypes.map(
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
                  requiresTarget
                      ? 'Full API endpoint URL.'
                      : 'Optional descriptive target.'
                }
            />

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
                      label="Exact selector match"
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

            {showApiBody && (
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Request Body"
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
                    helperText="Optional request body. JSON text can be entered directly."
                />
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
                      This Test Case supports both
                      UI and API automation actions.
                      Steps are executed according
                      to Automation Step Order.
                    </Alert>
                )}
          </Stack>
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
                    ? 'Add Step'
                    : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
  );
}