import type { CreateExpenseInput } from './financeApi';

const STORAGE_KEY = 'finance_report_app_staged_expenses';
const SEEDED_KEY = 'finance_report_app_staged_expenses_seeded';

export type StagedExpense = CreateExpenseInput & {
  id: number;
  status: 'staged';
  stagedAt: string;
};

function readStoredStagedExpenses(): StagedExpense[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StagedExpense[]) : [];
  } catch {
    return [];
  }
}

function writeStoredStagedExpenses(expenses: StagedExpense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

async function seedFromJsonIfNeeded() {
  if (localStorage.getItem(SEEDED_KEY)) {
    return;
  }

  try {
    const response = await fetch('/mock/staged-expenses.json');
    if (!response.ok) {
      localStorage.setItem(SEEDED_KEY, '1');
      return;
    }

    const seedData = (await response.json()) as StagedExpense[];
    if (Array.isArray(seedData) && readStoredStagedExpenses().length === 0) {
      writeStoredStagedExpenses(seedData);
    }
  } finally {
    localStorage.setItem(SEEDED_KEY, '1');
  }
}

export const mockExpenseStageApi = {
  async stageExpenses(data: CreateExpenseInput[]) {
    await seedFromJsonIfNeeded();

    const current = readStoredStagedExpenses();
    let nextId = current.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;

    const stagedExpenses: StagedExpense[] = data.map((row) => {
      const stagedRow: StagedExpense = {
        ...row,
        id: nextId,
        status: 'staged',
        stagedAt: new Date().toISOString(),
      };
      nextId += 1;
      return stagedRow;
    });

    writeStoredStagedExpenses([...current, ...stagedExpenses]);

    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 250);
    });

    return {
      stagedCount: stagedExpenses.length,
      totalStaged: current.length + stagedExpenses.length,
    };
  },

  async getStagedExpenses(): Promise<StagedExpense[]> {
    await seedFromJsonIfNeeded();
    return readStoredStagedExpenses();
  },
};
