import { AppDispatch } from '../store';
import { undoTaskAction } from '../store/slices/taskSlice';
import { showToast } from '../store/slices/uiSlice';

interface NetworkSimOptions {
  delayMs?: number;
  failureRate?: number; // e.g. 0.05 = 5% chance of simulated network failure
  actionDescription?: string;
}

/**
 * Simulates client-side network latency and optimistic UI rollback on failure
 */
export async function simulateNetworkMutation<T>(
  dispatch: AppDispatch,
  mutationFn: () => void,
  options: NetworkSimOptions = {}
): Promise<boolean> {
  const { delayMs = 400 + Math.floor(Math.random() * 400), failureRate = 0.0, actionDescription = 'Action' } = options;

  // 1. Optimistic UI Execution
  mutationFn();

  // 2. Show Optimistic Toast with Inline Undo
  dispatch(
    showToast({
      message: `${actionDescription} updated optimistically`,
      type: 'info',
      showUndo: true,
    })
  );

  // 3. Simulated Network Delay
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  // 4. Simulated Network Error Check
  if (Math.random() < failureRate) {
    // Rollback state mutation
    dispatch(undoTaskAction());
    dispatch(
      showToast({
        message: `Network Sync Error: ${actionDescription} failed. Mutation rolled back!`,
        type: 'error',
      })
    );
    return false;
  }

  return true;
}
