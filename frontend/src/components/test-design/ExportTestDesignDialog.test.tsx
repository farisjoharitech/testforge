import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { testDesignExportApi } from '../../api/testDesignExportApi';
import ExportTestDesignDialog from './ExportTestDesignDialog';

vi.mock('../../api/testDesignExportApi', () => ({ testDesignExportApi: { download: vi.fn() } }));

it('offers context scopes and downloads the selected module export once', async () => {
  const user = userEvent.setup();
  const createObjectURL = vi.fn(() => 'blob:test');
  const revokeObjectURL = vi.fn();
  Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
  Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
  vi.mocked(testDesignExportApi.download).mockResolvedValue({ blob: new Blob(['xlsx']), fileName: 'design.xlsx' });
  const close = vi.fn();
  render(<ExportTestDesignDialog open project={{ projectId: 'PRJ-1', name: 'Portal' }}
    testPlan={{ testPlanId: 'TP-1', name: 'Regression' }} module={{ moduleId: 'MOD-1', name: 'Login' }} onClose={close} />);

  expect(screen.getByRole('radio', { name: 'Entire Project' })).toBeChecked();
  await user.click(screen.getByRole('radio', { name: /Current Module/ }));
  await user.click(screen.getByRole('button', { name: 'Export Excel' }));

  expect(testDesignExportApi.download).toHaveBeenCalledWith('PRJ-1', 'MODULE', 'TP-1', 'MOD-1');
  expect(close).toHaveBeenCalledOnce();
});

it('only shows scopes available in the current context', () => {
  render(<ExportTestDesignDialog open project={{ projectId: 'PRJ-1', name: 'Portal' }} onClose={vi.fn()} />);
  expect(screen.getByRole('radio', { name: 'Entire Project' })).toBeInTheDocument();
  expect(screen.queryByRole('radio', { name: /Current Test Plan/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('radio', { name: /Current Module/ })).not.toBeInTheDocument();
});
