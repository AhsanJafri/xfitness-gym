import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { exerciseById } from '@/data/exercises';
import { addDays, todayKey, weekdayForKey } from '@/lib/dates';
import { clearLog, loadAll, saveCardio, saveHeight, saveLanguage, saveLog, saveMembership, savePlans as persistPlans, saveWeight } from '@/lib/db';
import { languagesForCountry, type Country, type Language } from '@/lib/i18n';
import { detectCountry } from '@/lib/region';
import { blankPlans, type CardioEntry, type Currency, type DayPlan, type LogEntry, type WeightEntry } from '@/lib/model';
import { rescheduleWorkoutReminders } from '@/lib/notifications';

type Snapshot = {
  heightCm: number | null;
  language: Language;
  country: Country;
  fee: number | null;
  currency: Currency;
  weights: WeightEntry[];
  plans: DayPlan[];
  logs: LogEntry[];
  cardio: CardioEntry[];
};

type Store = Snapshot & {
  hydrated: boolean;
  today: string;
  savePlans: (plans: DayPlan[]) => Promise<string>;
  toggleDone: (exerciseId: string) => void;
  setHeight: (cm: number) => Promise<void>;
  logWeight: (kg: number) => Promise<void>;
  recordCardio: (seconds: number, kind: string) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setMembership: (fee: number, currency: Currency) => Promise<void>;
};

const WorkoutContext = createContext<Store | null>(null);

export function setsDoneToday(state: Pick<Snapshot, 'logs'>, date: string, exerciseId: string): number {
  return state.logs.find((entry) => entry.date === date && entry.exerciseId === exerciseId)?.setsDone ?? 0;
}

export function dayIsSatisfied(state: Pick<Snapshot, 'plans' | 'logs'>, date: string): boolean {
  const plan = state.plans[weekdayForKey(date)];
  if (!plan || plan.rest || plan.exerciseIds.length === 0) return false;
  return plan.exerciseIds.every((id) => setsDoneToday(state, date, id) >= (exerciseById(id)?.sets ?? 1));
}

export function membershipMonth(state: Pick<Snapshot, 'plans' | 'logs'>, today = todayKey(), fee = 0) {
  const [year, month] = today.split('-').map(Number);
  const last = new Date(year, month, 0).getDate();
  const prefix = today.slice(0, 8);
  let planned = 0;
  let done = 0;
  let missed = 0;
  for (let day = 1; day <= last; day += 1) {
    const date = `${prefix}${String(day).padStart(2, '0')}`;
    const plan = state.plans[weekdayForKey(date)];
    if (!plan || plan.rest || plan.exerciseIds.length === 0) continue;
    planned += 1;
    if (dayIsSatisfied(state, date)) done += 1;
    else if (date < today) missed += 1;
  }
  const perVisit = planned > 0 ? fee / planned : 0;
  return { planned, done, missed, perVisit, wasted: missed * perVisit };
}

export function missedDays(state: Pick<Snapshot, 'plans' | 'logs'>, today = todayKey(), span = 14): string[] {
  const missed: string[] = [];
  for (let offset = 1; offset <= span; offset += 1) {
    const date = addDays(today, -offset);
    const plan = state.plans[weekdayForKey(date)];
    if (plan && !plan.rest && plan.exerciseIds.length > 0 && !dayIsSatisfied(state, date)) missed.push(date);
  }
  return missed;
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Snapshot>({
    heightCm: null,
    language: 'en',
    country: null,
    fee: null,
    currency: 'pkr',
    weights: [],
    plans: blankPlans(),
    logs: [],
    cardio: [],
  });
  const [hydrated, setHydrated] = useState(false);
  const today = todayKey();

  useEffect(() => {
    loadAll()
      .then((loaded) => {
        setState((current) => {
          const language = languagesForCountry(current.country).includes(loaded.language) ? loaded.language : 'en';
          if (language !== loaded.language) saveLanguage(language).catch(() => undefined);
          return { ...current, ...loaded, language };
        });
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
    detectCountry()
      .then((country) => {
        setState((current) => {
          const language = languagesForCountry(country).includes(current.language) ? current.language : 'en';
          if (language !== current.language) saveLanguage(language).catch(() => undefined);
          return { ...current, country, language };
        });
      })
      .catch(() => undefined);
  }, []);

  const api = useMemo<Store>(() => {
    return {
      ...state,
      hydrated,
      today,
      savePlans: async (plans) => {
        setState((current) => ({ ...current, plans }));
        await persistPlans(plans);
        return rescheduleWorkoutReminders(plans, state.language);
      },
      toggleDone: (exerciseId) => {
        const target = exerciseById(exerciseId)?.sets ?? 1;
        const existing = state.logs.find((entry) => entry.date === today && entry.exerciseId === exerciseId);
        const finished = (existing?.setsDone ?? 0) >= target;
        if (finished) {
          setState((current) => ({
            ...current,
            logs: current.logs.filter((entry) => !(entry.date === today && entry.exerciseId === exerciseId)),
          }));
          clearLog(today, exerciseId).catch(() => undefined);
          return;
        }
        const next: LogEntry = { date: today, exerciseId, setsDone: target };
        setState((current) => ({
          ...current,
          logs: [...current.logs.filter((entry) => !(entry.date === today && entry.exerciseId === exerciseId)), next],
        }));
        saveLog(next).catch(() => undefined);
      },
      setHeight: async (cm) => {
        setState((current) => ({ ...current, heightCm: cm }));
        await saveHeight(cm);
      },
      logWeight: async (kg) => {
        const entry = { date: today, kg };
        setState((current) => ({
          ...current,
          weights: [...current.weights.filter((item) => item.date !== today), entry].sort((a, b) => a.date.localeCompare(b.date)),
        }));
        await saveWeight(entry);
      },
      setLanguage: async (language) => {
        if (!languagesForCountry(state.country).includes(language)) return;
        setState((current) => ({ ...current, language }));
        await saveLanguage(language);
        await rescheduleWorkoutReminders(state.plans, language);
      },
      setMembership: async (fee, currency) => {
        setState((current) => ({ ...current, fee, currency }));
        await saveMembership(fee, currency);
      },
      recordCardio: async (seconds, kind) => {
        const id = await saveCardio({ date: today, seconds, kind });
        setState((current) => ({
          ...current,
          cardio: [{ id, date: today, seconds, kind }, ...current.cardio],
        }));
      },
    };
  }, [hydrated, state, today]);

  return <WorkoutContext.Provider value={api}>{children}</WorkoutContext.Provider>;
}

export function useWorkout(): Store {
  const value = useContext(WorkoutContext);
  if (!value) throw new Error('useWorkout must be used inside WorkoutProvider');
  return value;
}
