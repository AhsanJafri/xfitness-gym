import { WEEKDAY_LABELS } from '@/lib/dates';

export type DayPlan = {
  weekday: number;
  title: string;
  exerciseIds: string[];
  rest: boolean;
  remind: boolean;
  hour: number;
  minute: number;
};

export type LogEntry = {
  date: string;
  exerciseId: string;
  setsDone: number;
};

export type WeightEntry = {
  date: string;
  kg: number;
};

export type Currency = 'pkr' | 'inr' | 'usd';

export type CardioEntry = {
  id: number;
  date: string;
  seconds: number;
  kind: string;
};

export function blankPlans(): DayPlan[] {
  return WEEKDAY_LABELS.map((title, weekday) => ({
    weekday,
    title: 'Train',
    exerciseIds: [],
    rest: weekday === 0,
    remind: weekday !== 0,
    hour: 7,
    minute: 0,
  }));
}
