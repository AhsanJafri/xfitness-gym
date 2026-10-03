import * as SQLite from 'expo-sqlite';
import { isLanguage, type Language } from '@/lib/i18n';
import { blankPlans, type CardioEntry, type Currency, type DayPlan, type LogEntry, type WeightEntry } from '@/lib/model';

let database: SQLite.SQLiteDatabase | null = null;

async function databaseHandle(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  const opened = await SQLite.openDatabaseAsync('xfactory.db');
  await opened.execAsync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      height_cm REAL
    );
    CREATE TABLE IF NOT EXISTS weights (
      date TEXT PRIMARY KEY,
      kg REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS plans (
      weekday INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      rest INTEGER NOT NULL,
      remind INTEGER NOT NULL,
      hour INTEGER NOT NULL,
      minute INTEGER NOT NULL,
      exercise_ids TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS logs (
      date TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      done INTEGER NOT NULL,
      PRIMARY KEY (date, exercise_id)
    );
    CREATE TABLE IF NOT EXISTS cardio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      seconds INTEGER NOT NULL,
      kind TEXT NOT NULL
    );
  `);
  const columns = await opened.getAllAsync<{ name: string }>('PRAGMA table_info(profile)');
  if (!columns.some((column) => column.name === 'language')) {
    await opened.execAsync("ALTER TABLE profile ADD COLUMN language TEXT NOT NULL DEFAULT 'en'");
  }
  if (!columns.some((column) => column.name === 'fee')) {
    await opened.execAsync('ALTER TABLE profile ADD COLUMN fee REAL');
  }
  if (!columns.some((column) => column.name === 'currency')) {
    await opened.execAsync("ALTER TABLE profile ADD COLUMN currency TEXT NOT NULL DEFAULT 'pkr'");
  }
  const count = await opened.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM plans');
  if (!count?.n) {
    for (const plan of blankPlans()) {
      await writePlan(opened, plan);
    }
    await opened.runAsync('INSERT OR IGNORE INTO profile (id, height_cm) VALUES (1, NULL)');
  }
  database = opened;
  return opened;
}

async function writePlan(db: SQLite.SQLiteDatabase, plan: DayPlan) {
  await db.runAsync(
    `INSERT INTO plans (weekday, title, rest, remind, hour, minute, exercise_ids)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(weekday) DO UPDATE SET
       title = excluded.title,
       rest = excluded.rest,
       remind = excluded.remind,
       hour = excluded.hour,
       minute = excluded.minute,
       exercise_ids = excluded.exercise_ids`,
    plan.weekday,
    plan.title,
    plan.rest ? 1 : 0,
    plan.remind ? 1 : 0,
    plan.hour,
    plan.minute,
    JSON.stringify(plan.exerciseIds),
  );
}

export async function loadAll(): Promise<{
  heightCm: number | null;
  language: Language;
  fee: number | null;
  currency: Currency;
  weights: WeightEntry[];
  plans: DayPlan[];
  logs: LogEntry[];
  cardio: CardioEntry[];
}> {
  const db = await databaseHandle();
  const profile = await db.getFirstAsync<{ height_cm: number | null; language: string | null; fee: number | null; currency: string | null }>(
    'SELECT height_cm, language, fee, currency FROM profile WHERE id = 1',
  );
  const weights = await db.getAllAsync<{ date: string; kg: number }>('SELECT date, kg FROM weights ORDER BY date ASC');
  const planRows = await db.getAllAsync<{
    weekday: number;
    title: string;
    rest: number;
    remind: number;
    hour: number;
    minute: number;
    exercise_ids: string;
  }>('SELECT * FROM plans ORDER BY weekday ASC');
  const logRows = await db.getAllAsync<{ date: string; exercise_id: string; done: number }>(
    'SELECT date, exercise_id, done FROM logs',
  );
  const cardio = await db.getAllAsync<CardioEntry>('SELECT id, date, seconds, kind FROM cardio ORDER BY id DESC');
  const plans = blankPlans();
  for (const row of planRows) {
    plans[row.weekday] = {
      weekday: row.weekday,
      title: row.title,
      rest: row.rest === 1,
      remind: row.remind === 1,
      hour: row.hour,
      minute: row.minute,
      exerciseIds: JSON.parse(row.exercise_ids) as string[],
    };
  }
  return {
    heightCm: profile?.height_cm ?? null,
    language: isLanguage(profile?.language) ? profile.language : 'en',
    fee: profile?.fee ?? null,
    currency: profile?.currency === 'inr' || profile?.currency === 'usd' ? profile.currency : 'pkr',
    weights,
    plans,
    logs: logRows.map((row) => ({ date: row.date, exerciseId: row.exercise_id, setsDone: row.done })),
    cardio,
  };
}

export async function savePlans(plans: DayPlan[]) {
  const db = await databaseHandle();
  for (const plan of plans) await writePlan(db, plan);
}

export async function saveLog(entry: LogEntry) {
  const db = await databaseHandle();
  await db.runAsync(
    `INSERT INTO logs (date, exercise_id, done) VALUES (?, ?, ?)
     ON CONFLICT(date, exercise_id) DO UPDATE SET done = excluded.done`,
    entry.date,
    entry.exerciseId,
    entry.setsDone,
  );
}

export async function clearLog(date: string, exerciseId: string) {
  const db = await databaseHandle();
  await db.runAsync('DELETE FROM logs WHERE date = ? AND exercise_id = ?', date, exerciseId);
}

export async function saveLanguage(language: Language) {
  const db = await databaseHandle();
  await db.runAsync(
    'INSERT INTO profile (id, height_cm, language) VALUES (1, NULL, ?) ON CONFLICT(id) DO UPDATE SET language = excluded.language',
    language,
  );
}

export async function saveMembership(fee: number, currency: Currency) {
  const db = await databaseHandle();
  await db.runAsync(
    'INSERT INTO profile (id, height_cm, fee, currency) VALUES (1, NULL, ?, ?) ON CONFLICT(id) DO UPDATE SET fee = excluded.fee, currency = excluded.currency',
    fee,
    currency,
  );
}

export async function saveHeight(heightCm: number) {
  const db = await databaseHandle();
  await db.runAsync('INSERT INTO profile (id, height_cm) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET height_cm = excluded.height_cm', heightCm);
}

export async function saveCardio(entry: { date: string; seconds: number; kind: string }): Promise<number> {
  const db = await databaseHandle();
  const result = await db.runAsync(
    'INSERT INTO cardio (date, seconds, kind) VALUES (?, ?, ?)',
    entry.date,
    entry.seconds,
    entry.kind,
  );
  return result.lastInsertRowId;
}

export async function saveWeight(entry: WeightEntry) {
  const db = await databaseHandle();
  await db.runAsync(
    'INSERT INTO weights (date, kg) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET kg = excluded.kg',
    entry.date,
    entry.kg,
  );
}
