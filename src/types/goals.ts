
import { GoalModification, GoalTransaction } from '@/types/finance';

export interface GoalModificationWithAmount extends GoalModification {
  amount?: number;
}
