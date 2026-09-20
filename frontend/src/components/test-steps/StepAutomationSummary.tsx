import { Stack, Typography } from '@mui/material';
import type { AutomationStep } from '../../types/automation';

/** Compact view of the saved model; editing stays in TestStepDialog. */
export default function StepAutomationSummary({ step }: { step: AutomationStep }) {
  let config: Record<string, any> = {};
  try { const parsed = step.apiConfig ? JSON.parse(step.apiConfig) : {}; config = parsed && typeof parsed === "object" ? parsed : {}; } catch { /* Editor validates configuration. */ }
  const request = /^API_(GET|POST|PUT|PATCH|DELETE)$/.test(step.actionType);
  const safeUrl = (value: string) => {
    // URLs may contain credentials or query secrets; show only the endpoint.
    try { const url = new URL(value); return `${url.origin}${url.pathname}${url.search ? '?[query values hidden]' : ''}`; }
    catch { return value.split('?')[0]; }
  };
  return <Stack spacing={0.5}>
    <Typography fontWeight={600}>{request ? `API REQUEST - ${step.actionType.slice(4)}` : step.actionType.replaceAll('_', ' ')}</Typography>
    {step.target && <Typography variant="body2">{request ? 'URL' : 'Target'}: {request ? safeUrl(step.target) : step.target}</Typography>}
    {step.selectorStrategy && <Typography variant="body2">Locator: {step.selectorStrategy.replaceAll('_', ' ')} - {step.selectorValue || [step.selectorRole, step.selectorName].filter(Boolean).join(' ')}{step.selectorExact ? ' (exact match)' : ''}</Typography>}
    {step.inputValue && <Typography variant="body2">{step.actionType === 'NAVIGATE' ? `URL: ${safeUrl(step.inputValue)}` : 'Input: ********'}</Typography>}
    {step.expectedValue && <Typography variant="body2">Expected: {step.actionType === 'ASSERT_API_STATUS' ? step.expectedValue : '********'}</Typography>}
    {request && <>
      {Object.keys(config.headers ?? {}).length > 0 && <Typography variant="body2">Headers: {Object.keys(config.headers).join(', ')} (values hidden)</Typography>}
      {Object.keys(config.queryParams ?? {}).length > 0 && <Typography variant="body2">Query parameters: {Object.keys(config.queryParams).join(', ')} (values hidden)</Typography>}
      {config.bodyType && config.bodyType !== 'NONE' && <Typography variant="body2">Body: {config.bodyType} (value hidden)</Typography>}
      {config.auth?.type && config.auth.type !== 'NONE' && <Typography variant="body2">Authentication: {config.auth.type.replaceAll('_', ' ')}</Typography>}
    </>}
  </Stack>;
}
